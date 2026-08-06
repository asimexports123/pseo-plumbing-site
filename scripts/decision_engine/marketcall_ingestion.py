#!/usr/bin/env python3
"""
Marketcall Ingestion (read-only adapter layer).

Purpose
-------
Bridge the Decision Engine to `scripts/analytics/marketcall_client.py` so
real call/revenue outcomes can flow into `page_profile.PageDecisionRecord`
without duplicating any API polling, auth, or pagination logic.

This module is deliberately read-only and adapter-only:
    - It does not modify Marketcall data.
    - It does not invent page-level attribution (Marketcall records lack a
      page/URL field in the confirmed API contract).
    - It surfaces campaign-level totals, a state breakdown, and explicit
      `attribution_level` / `attribution_uncertainty_note` fields so no
      downstream consumer mistakes campaign aggregates for per-page facts.

Inputs
------
- Optional `start_date` and `end_date` as 'YYYY-MM-DD' strings. Defaults to
  the trailing 30 days ending today (UTC).
- Optional `campaign_id` override; otherwise `scripts/analytics.config.CAMPAIGN_ID`
  is used.
- Optional `client` override for tests / dependency injection.

Outputs
-------
`load_marketcall_metrics(...)` returns a JSON-safe dict:
    {
        'attribution_level': 'campaign',
        'attribution_uncertainty_note': str,
        'campaign_id': int|None,
        'currency': str,
        'date_from': str,
        'date_to': str,
        'calls': int,
        'qualified_calls': int,     # approved/billable calls (state_en == 'approved')
        'approved_calls': int,      # same set as qualified_calls in this contract
        'revenue': float,
        'payout': float,
        'revenue_per_approved_call': float|None,
        'revenue_per_call': float|None,
        'approval_rate': float|None,
        'average_duration': float,
        'total_duration': int,
        'state_counts': dict,
        'source': 'marketcall_api',
        'fetched_at': str,
    }
or `None` if the adapter is not enabled, not configured, or the API call
fails (logged, never swallowed silently).

When Marketcall only provides campaign-level data, `attribution_level` is
'campaign' and the `attribution_uncertainty_note` explains that per-page
attribution is not available. No per-page numbers are fabricated.

Mathematics used
----------------
Simple aggregates: sum, count, mean. `approval_rate` is
`approved_calls / calls` when `calls > 0`. `revenue_per_approved_call` is
`revenue / approved_calls` when `approved_calls > 0`.

Computational complexity
------------------------
O(n) in the number of call records returned by the API.
"""
from __future__ import annotations

import logging
import sys
from collections import Counter
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from types import SimpleNamespace

from . import config
from .logging_utils import log

# Lazily import the existing Marketcall client so this package remains
# importable even in environments without scripts/analytics/ dependencies
# or a configured MARKETCALL_API_KEY.
ANALYTICS_DIR = Path(__file__).resolve().parents[2] / 'scripts' / 'analytics'
DEFAULT_LOOKBACK_DAYS = 30

# In the confirmed Marketcall API contract (see marketcall_client.py),
# 'approved' is the only billable/qualified state reported for this account.
APPROVED_STATE_EN = 'approved'


def _import_marketcall_client():
    """Import scripts/analytics/marketcall_client.py lazily."""
    if str(ANALYTICS_DIR) not in sys.path:
        sys.path.insert(0, str(ANALYTICS_DIR))
    import marketcall_client
    return marketcall_client


def _default_date_range(start_date=None, end_date=None):
    """Return (start, end) ISO date strings. Defaults to trailing 30 days."""
    if end_date is None:
        end = date.today()
    else:
        end = datetime.strptime(end_date, '%Y-%m-%d').date()
    if start_date is None:
        start = end - timedelta(days=DEFAULT_LOOKBACK_DAYS)
    else:
        start = datetime.strptime(start_date, '%Y-%m-%d').date()
    if start > end:
        raise ValueError(f'start_date {start} must not be after end_date {end}')
    return start.isoformat(), end.isoformat()


def _safe_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def _detect_currency(calls):
    """Return the most common non-empty currency code, defaulting to 'usd'."""
    currencies = [c.get('currency') for c in calls if c.get('currency')]
    if not currencies:
        return 'usd'
    return Counter(currencies).most_common(1)[0][0]


def _summarize_calls(calls, campaign_id, start_date, end_date, fetched_at):
    """Compute the Marketcall metrics dict from a list of call records."""
    total_calls = len(calls)
    approved_count = sum(1 for c in calls if c.get('state_en') == APPROVED_STATE_EN)
    # In this account's API contract, the only qualified/billable state is
    # 'approved'. The 'qualified_calls' field is kept for downstream
    # consumers that expect both concepts; it equals approved_calls today.
    qualified_count = approved_count

    revenue = sum(_safe_float(c.get('price')) for c in calls)
    total_duration = sum(int(c.get('duration') or 0) for c in calls)
    state_counts = dict(Counter(c.get('state_en', 'unknown') for c in calls))

    return {
        'attribution_level': 'campaign',
        'attribution_uncertainty_note': (
            'Marketcall records contain no page/URL field in the confirmed API '
            'contract. All figures are campaign-level aggregates and cannot be '
            'reliably attributed to individual pages.'
        ),
        'campaign_id': campaign_id,
        'currency': _detect_currency(calls),
        'date_from': start_date,
        'date_to': end_date,
        'calls': total_calls,
        'qualified_calls': qualified_count,
        'approved_calls': approved_count,
        'revenue': round(revenue, 4),
        'payout': round(revenue, 4),
        'revenue_per_approved_call': round(revenue / approved_count, 4) if approved_count else None,
        'revenue_per_call': round(revenue / total_calls, 4) if total_calls else None,
        'approval_rate': approved_count / total_calls if total_calls else None,
        'average_duration': round(total_duration / total_calls, 2) if total_calls else 0.0,
        'total_duration': total_duration,
        'state_counts': state_counts,
        'source': 'marketcall_api',
        'fetched_at': fetched_at,
    }


def load_marketcall_metrics(start_date=None, end_date=None, campaign_id=None, client=None):
    """
    Load campaign-level Marketcall metrics for the date window.

    Returns `None` if the feature flag is off, the analytics client cannot be
    imported, or the API call fails. All failures are logged, never swallowed
    into empty metrics.
    """
    if not config.is_enabled('marketcall'):
        log(logging.INFO, 'marketcall_ingestion_skipped',
            reason='DECISION_ENGINE_ENABLE_MARKETCALL not set')
        return None

    start, end = _default_date_range(start_date, end_date)

    try:
        marketcall_client = client or _import_marketcall_client()
    except ImportError as e:
        log(logging.WARNING, 'marketcall_ingestion_import_failed', error=str(e))
        return None

    try:
        calls = marketcall_client.fetch_calls(start, end, campaign_id=campaign_id)
    except Exception as e:
        # MarketcallConfigError / MarketcallAPIError / network errors are
        # surfaced as warnings, not swallowed into empty data.
        log(logging.WARNING, 'marketcall_ingestion_fetch_failed',
            error=str(e), error_type=type(e).__name__)
        return None

    if not calls:
        log(logging.INFO, 'marketcall_ingestion_empty', start=start, end=end)
        return None

    fetched_at = datetime.now(timezone.utc).isoformat()
    campaign_id = campaign_id or getattr(marketcall_client, 'CAMPAIGN_ID', None)

    metrics = _summarize_calls(calls, campaign_id, start, end, fetched_at)
    log(logging.INFO, 'marketcall_ingestion_loaded',
        calls=metrics['calls'], approved=metrics['approved_calls'],
        revenue=metrics['revenue'], campaign_id=campaign_id,
        start=start, end=end)
    return metrics
