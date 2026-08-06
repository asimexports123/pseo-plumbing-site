#!/usr/bin/env python3
"""
GA4 Ingestion (read-only adapter layer).

Purpose
-------
Bridge the Decision Engine to the *existing*, unmodified
`scripts/analytics/ga4_client.py` so real per-page engagement/conversion
outcomes can flow into `page_profile.PageDecisionRecord.ga4_metrics`
without duplicating any authentication, API client, or pagination logic.
This module follows the exact same shape as `marketcall_ingestion.py`
(lazy import of the existing analytics client, a documented date-range
default, one summarization pass, feature-flag gated, failures logged and
returned as `None`/`{}` rather than swallowed) and the same
read-only/adapter-only contract as `data_ingestion.py`.

Authentication
---------------
Reuses the exact credential path already wired in
`scripts/analytics/config.py` / `ga4_client.py` (the same service account
used for Google Search Console, `gsc-reporter@yohomefixanalytics.iam.
gserviceaccount.com`, already granted Viewer access on GA4 property
546859196 -- see `GA4_PROPERTY_ID` in `.env`). No new credential file or
auth flow is introduced here; this module only calls functions that
already exist in `ga4_client.py`.

Attribution
-----------
GA4's `landingPage` dimension is the session's entry page, which *is*
page-level ground truth for sessions/engagement/conversions attributed to
that page (the same interpretation GA4's own UI uses) -- so per-page GA4
evidence is constructed via `attribution_engine.evidence_from_ga4_page`,
analogous to how GSC's `page` dimension is used. Event-level metrics
(e.g. `call_click` counts) reported *by* landing page are still tied to
the session's entry page, not necessarily the exact page the click fired
on if the visitor navigated first; this nuance is documented in the
returned dict's `attribution_note` field and callers are expected to
treat call-click-by-landing-page as "calls attributed to sessions that
started on this page", not "calls proven to have fired on this exact
page's DOM". No page-level fact is ever fabricated when GA4 has no rows
for a given page: that page's entry is simply absent from the returned
dict (see `page_profile.py`'s own "never fabricated" convention).

Inputs
------
- Optional `start_date` / `end_date` ('YYYY-MM-DD'). Defaults to the
  trailing 30 days ending today (UTC) -- same default window as
  `marketcall_ingestion.py`, for parity when both sources feed one report.
- Optional `phone_click_events` (default `('call_click',)`): the GA4 event
  name(s) that represent a phone/call click, matching the event name
  already emitted by the site (see `ga4_client.fetch_call_click_events`).
- Optional `client` override for tests / dependency injection.

Outputs
-------
`load_ga4_page_metrics(...)` returns a dict: `page_id -> metrics dict`, or
`None` if the adapter is not enabled, GA4 is not configured
(`GA4_PROPERTY_ID` unset), the analytics client cannot be imported, or the
API call fails (logged, never swallowed silently into fabricated zeros).
Returns `{}` (a valid, successful empty result) if GA4 is reachable but
returns zero rows for the window.

Each page's metrics dict:
    {
        'attribution_level': 'page',
        'attribution_note': str,
        'source': 'ga4_api',
        'date_from': str, 'date_to': str,
        'sessions': int, 'engaged_sessions': int,
        'engagement_rate': float|None,
        'average_engagement_time_seconds': float|None,
        'users': int, 'new_users': int,
        'conversions': float,
        'phone_click_events': int,          # 0 if GA4 reported no rows for
                                             # this page + these event names
                                             # (a real observed zero, not a
                                             # missing/fabricated value --
                                             # see "Mathematics used")
        'fetched_at': str,
    }
`page_id` is the URL path only (query string/fragment stripped), matching
the format `report_core._gsc_url_to_path` already produces for GSC pages,
so GA4 and GSC metrics for the same logical page share one dict key
throughout the rest of this package (page_profile.py, attribution_engine.py).

Mathematics used
-----------------
`average_engagement_time_seconds` = `userEngagementDuration / sessions`
when `sessions > 0` (GA4 reports duration in seconds already, no unit
conversion needed). `phone_click_events` for a page that appears in the
engagement report but not in the event-count report is `0` -- a real,
directly-observed absence of that event for that page within the window,
not a placeholder for missing data (the page's presence in the engagement
report proves GA4 *did* return data for it).

Computational complexity
-------------------------
O(n + e) in the number of landing-page rows (n) and event rows (e)
returned by the two GA4 API calls this module makes per invocation.

Future extensions
------------------
- Configurable `phone_click_events`/CTA event names via env var, once more
  than one event name is confirmed in production GA4 data (today only
  `call_click` is confirmed emitted by the site).
- A `sessionDefaultChannelGroup` or `sessionSource`/`sessionMedium`
  breakdown per page, if channel-level (not just page-level) attribution
  is ever needed by recommendation_engine.py.
"""
from __future__ import annotations

import logging
import sys
from collections import defaultdict
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlsplit

from . import config
from .logging_utils import log

ANALYTICS_DIR = Path(__file__).resolve().parents[2] / 'scripts' / 'analytics'
DEFAULT_LOOKBACK_DAYS = 30
DEFAULT_PHONE_CLICK_EVENTS = ('call_click',)

ATTRIBUTION_NOTE = (
    "GA4's landingPage dimension is the session's entry page; sessions, "
    "engagement, and conversions are correctly page-level for that page. "
    "Event counts (e.g. phone_click_events) reported by landing page "
    "reflect events from sessions that started on this page, not proof "
    "the event fired on this exact page if the visitor navigated first."
)


def _import_ga4_client():
    """Import scripts/analytics/ga4_client.py lazily, exactly like
    marketcall_ingestion._import_marketcall_client()."""
    if str(ANALYTICS_DIR) not in sys.path:
        sys.path.insert(0, str(ANALYTICS_DIR))
    import ga4_client
    return ga4_client


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


def _landing_page_to_path(landing_page):
    """
    Normalize a GA4 landingPage dimension value to a bare URL path (strip
    query string/fragment, and any scheme+host if GA4 ever returns a full
    URL), matching the same page-id format GSC pages already use
    throughout this package.
    """
    if not landing_page:
        return landing_page
    parsed = urlsplit(landing_page)
    path = parsed.path or landing_page
    return path


def _safe_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def _safe_int(value):
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return 0


def _summarize_engagement_rows(rows):
    """dict: page_id -> partial metrics dict, from fetch_landing_page_engagement rows."""
    by_page = {}
    for row in rows:
        page_id = _landing_page_to_path(row.dimension_values[0].value)
        if not page_id:
            continue
        sessions, engaged_sessions, engagement_rate, engagement_duration, users, new_users, conversions = (
            m.value for m in row.metric_values
        )
        sessions_i = _safe_int(sessions)
        entry = {
            'sessions': sessions_i,
            'engaged_sessions': _safe_int(engaged_sessions),
            'engagement_rate': _safe_float(engagement_rate) if engagement_rate not in (None, '') else None,
            'average_engagement_time_seconds': (
                round(_safe_float(engagement_duration) / sessions_i, 2) if sessions_i else None
            ),
            'users': _safe_int(users),
            'new_users': _safe_int(new_users),
            'conversions': _safe_float(conversions),
        }
        # A single landingPage value should not repeat within one GA4
        # response, but if it ever does, sum the additive metrics rather
        # than silently overwrite (never drop observed data).
        if page_id in by_page:
            existing = by_page[page_id]
            entry['sessions'] += existing['sessions']
            entry['engaged_sessions'] += existing['engaged_sessions']
            entry['users'] += existing['users']
            entry['new_users'] += existing['new_users']
            entry['conversions'] += existing['conversions']
        by_page[page_id] = entry
    return by_page


def _summarize_event_rows(rows, event_names):
    """dict: page_id -> total eventCount across the given event_names."""
    by_page = defaultdict(int)
    wanted = set(event_names)
    for row in rows:
        page_id = _landing_page_to_path(row.dimension_values[0].value)
        event_name = row.dimension_values[1].value
        if not page_id or event_name not in wanted:
            continue
        by_page[page_id] += _safe_int(row.metric_values[0].value)
    return dict(by_page)


def load_ga4_page_metrics(start_date=None, end_date=None,
                           phone_click_events=DEFAULT_PHONE_CLICK_EVENTS, client=None):
    """
    Load per-page GA4 engagement/conversion/phone-click metrics for the
    date window.

    Returns `None` if the feature flag is off, GA4 is not configured, the
    analytics client cannot be imported, or an API call fails. Returns `{}`
    if GA4 is reachable but the window has zero landing-page rows. All
    failures are logged, never swallowed into fabricated per-page data.
    """
    if not config.is_enabled('ga4'):
        log(logging.INFO, 'ga4_ingestion_skipped', reason='DECISION_ENGINE_ENABLE_GA4 not set')
        return None

    start, end = _default_date_range(start_date, end_date)

    try:
        ga4_client = client or _import_ga4_client()
    except ImportError as e:
        log(logging.WARNING, 'ga4_ingestion_import_failed', error=str(e))
        return None

    if not getattr(ga4_client, 'GA4_PROPERTY_ID', None):
        log(logging.WARNING, 'ga4_ingestion_not_configured', reason='GA4_PROPERTY_ID not set')
        return None

    try:
        engagement_rows = ga4_client.fetch_landing_page_engagement(start, end)
        event_rows = ga4_client.fetch_events_by_landing_page(start, end, phone_click_events)
    except Exception as e:
        log(logging.WARNING, 'ga4_ingestion_fetch_failed', error=str(e), error_type=type(e).__name__)
        return None

    if not engagement_rows:
        log(logging.INFO, 'ga4_ingestion_empty', start=start, end=end)
        return {}

    engagement_by_page = _summarize_engagement_rows(engagement_rows)
    phone_clicks_by_page = _summarize_event_rows(event_rows, phone_click_events)
    fetched_at = datetime.now(timezone.utc).isoformat()

    metrics_by_page = {}
    for page_id, engagement in engagement_by_page.items():
        metrics_by_page[page_id] = {
            'attribution_level': 'page',
            'attribution_note': ATTRIBUTION_NOTE,
            'source': 'ga4_api',
            'date_from': start,
            'date_to': end,
            **engagement,
            # A page present in the engagement report but absent from the
            # event report genuinely had zero matching events in this
            # window -- a real observed zero, not a missing value.
            'phone_click_events': phone_clicks_by_page.get(page_id, 0),
            'fetched_at': fetched_at,
        }

    log(logging.INFO, 'ga4_ingestion_loaded', n_pages=len(metrics_by_page), start=start, end=end)
    return metrics_by_page
