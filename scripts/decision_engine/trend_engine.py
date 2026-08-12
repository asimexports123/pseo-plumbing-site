"""
Historical Trend Engine.

Purpose
-------
Turn the per-page-per-day snapshots persisted by `decision_store.py` into
period-over-period comparisons (previous snapshot, day-over-day,
week-over-week, month-over-month, quarter-over-quarter) across every
category `page_profile.PageDecisionRecord` already carries: SEO
(`gsc_metrics`), behavior (`ga4_metrics`), calls (`marketcall_metrics`,
campaign-level per its own documented attribution caveat), and the
Decision Engine's own outputs (`opportunity_score`, `bayesian_posterior`,
`business_value_score`, `recommendations`). This module performs no new
measurement and never fabricates a value: a metric absent from a stored
snapshot stays absent in the resulting delta (see `compute_delta`).

Inputs
------
- `page_id` (str): looked up via `decision_store.get_history`, so it
  should already be normalized the same way `page_profile.normalize_page_id`
  normalizes it (decision_store does this again internally regardless).
- `as_of_date` (str 'YYYY-MM-DD', optional): treat this date as "today" for
  the comparison instead of the absolute latest stored snapshot — lets a
  caller ask "what did the trend look like as of last Tuesday" without
  needing a separate historical index.
- `conn` (optional sqlite3.Connection): forwarded to every
  `decision_store` call, exactly like every function in that module,
  primarily so tests can point at an isolated temp database.

Outputs
-------
`compute_page_trends(page_id, ...)` returns:
    {
        'page_id': str,
        'current_snapshot_date': str,
        'comparisons': {
            'vs_previous_snapshot': <comparison dict or None>,
            'day_over_day': <comparison dict or None>,
            'week_over_week': <comparison dict or None>,
            'month_over_month': <comparison dict or None>,
            'quarter_over_quarter': <comparison dict or None>,
        },
    }
or `None` if the page has no stored history at all.

Each non-None comparison dict is:
    {
        'baseline_date': str,
        'seo': {<metric>: <delta>, ...} | None,
        'behavior': {<metric>: <delta>, ...} | None,
        'calls': {<metric>: <delta>, ...} | None,
        'decision_engine': {...},
    }
where each `<delta>` is the output of `compute_delta`:
    {'current': v1, 'previous': v0, 'absolute_change': v1-v0,
     'pct_change': (v1-v0)/v0*100 or None, 'direction': 'up'|'down'|'flat'}

A comparison is `None` when no snapshot exists on or before the target
baseline date (e.g. a page with less than a quarter of history has no
`quarter_over_quarter` comparison) — this is reported, never guessed.

`rank_pages_by_metric_change` / `compute_portfolio_trends` are portfolio-
wide helpers built on top of `compute_page_trends` for leaderboard-style
consumers (business_intelligence.py, api.py).

Mathematics used
-----------------
Simple period-over-period deltas (absolute and percent change). No
statistical model here — that lives upstream in bayesian_engine /
montecarlo_engine; this module only diffs already-computed snapshots.
"Nearest snapshot on or before the target date" is used instead of exact
date matching because snapshot cadence is not guaranteed to be daily (a
7-day-ago comparison must still work if the last snapshot 7+ days ago was
actually 9 days ago).

Computational complexity
-------------------------
`compute_page_trends`: O(h) in the number of stored snapshots for that
page (one linear scan per baseline period). `rank_pages_by_metric_change`/
`compute_portfolio_trends`: O(p * h) for p pages.

Future extensions
------------------
- Trend direction classification (`classify_direction`) uses a flat
  stability threshold; could be replaced with a statistical significance
  test (e.g. comparing CI overlap from `bayesian_posterior`) once that is
  a validated product requirement.
"""
import logging
from datetime import datetime, timedelta

from . import decision_store
from .logging_utils import traced, log

PERIOD_DAYS = {
    'day_over_day': 1,
    'week_over_week': 7,
    'month_over_month': 30,
    'quarter_over_quarter': 90,
}

DEFAULT_STABILITY_THRESHOLD_PCT = 1.0
_EPSILON = 1e-9


def _parse_date(date_str):
    return datetime.strptime(date_str, '%Y-%m-%d')


def _is_numeric(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def compute_delta(current_value, previous_value):
    """
    Diff two scalar values. Never fabricates a percent change when the
    previous value is 0 or either value is missing (returns None for
    `pct_change` in that case instead of dividing by zero or inventing a
    number).
    """
    if current_value is None or previous_value is None:
        return {
            'current': current_value, 'previous': previous_value,
            'absolute_change': None, 'pct_change': None, 'direction': 'unknown',
        }
    absolute_change = current_value - previous_value
    pct_change = (absolute_change / previous_value * 100.0) if previous_value != 0 else None
    if absolute_change > _EPSILON:
        direction = 'up'
    elif absolute_change < -_EPSILON:
        direction = 'down'
    else:
        direction = 'flat'
    return {
        'current': current_value, 'previous': previous_value,
        'absolute_change': absolute_change, 'pct_change': pct_change,
        'direction': direction,
    }


def classify_direction(delta, stability_threshold_pct=DEFAULT_STABILITY_THRESHOLD_PCT):
    """
    Collapse a `compute_delta` result into 'improving' / 'declining' /
    'stable' / 'unknown', using `pct_change` magnitude against
    `stability_threshold_pct` (a change smaller than this, in percent, is
    considered noise/stable rather than a real trend). Caller decides
    which sign counts as "improving" for a given metric (e.g. clicks up
    is improving, avg_position up is declining) via `higher_is_better`.
    """
    if delta is None or delta.get('pct_change') is None:
        return 'unknown'
    pct = delta['pct_change']
    if abs(pct) < stability_threshold_pct:
        return 'stable'
    return 'improving' if pct > 0 else 'declining'


def _diff_metric_dict(current_dict, previous_dict):
    """
    Diff every numeric key present in either dict. Non-numeric keys
    (e.g. 'attribution_level', page identifiers, booleans like
    'is_orphan') are skipped — this is a metrics diff, not a full record
    diff. Returns None if both inputs are None/empty (metric category
    simply was not available for either snapshot).
    """
    current_dict = current_dict or {}
    previous_dict = previous_dict or {}
    if not current_dict and not previous_dict:
        return None
    keys = {
        k for k, v in current_dict.items() if _is_numeric(v)
    } | {
        k for k, v in previous_dict.items() if _is_numeric(v)
    }
    if not keys:
        return None
    return {k: compute_delta(current_dict.get(k), previous_dict.get(k)) for k in sorted(keys)}


def _diff_decision_engine(current, baseline):
    result = {}
    cur_opp = current.opportunity_score or {}
    base_opp = baseline.opportunity_score or {}
    for key in ('opportunity_gap_score', 'performance_score'):
        if key in cur_opp or key in base_opp:
            result[key] = compute_delta(cur_opp.get(key), base_opp.get(key))

    result['business_value_score'] = compute_delta(current.business_value_score, baseline.business_value_score)

    cur_post = current.bayesian_posterior or {}
    base_post = baseline.bayesian_posterior or {}
    posterior_keys = [k for k in ('mean', 'ci_low', 'ci_high', 'n_obs') if k in cur_post or k in base_post]
    if posterior_keys:
        result['bayesian_posterior'] = {
            k: compute_delta(cur_post.get(k), base_post.get(k)) for k in posterior_keys
        }

    cur_recs = current.recommendations or []
    base_recs = baseline.recommendations or []
    result['recommendation_count'] = compute_delta(len(cur_recs), len(base_recs))
    cur_actions = {r.get('action') for r in cur_recs if isinstance(r, dict) and r.get('action')}
    base_actions = {r.get('action') for r in base_recs if isinstance(r, dict) and r.get('action')}
    result['new_recommended_actions'] = sorted(cur_actions - base_actions)
    result['resolved_recommended_actions'] = sorted(base_actions - cur_actions)
    return result


def _compare_records(current, baseline):
    if baseline is None:
        return None
    return {
        'baseline_date': baseline.snapshot_date,
        'seo': _diff_metric_dict(current.gsc_metrics, baseline.gsc_metrics),
        'behavior': _diff_metric_dict(current.ga4_metrics, baseline.ga4_metrics),
        'calls': _diff_metric_dict(current.marketcall_metrics, baseline.marketcall_metrics),
        'decision_engine': _diff_decision_engine(current, baseline),
    }


def _find_snapshot_on_or_before(records, target_dt):
    """`records` must already be ascending by snapshot_date. Returns the
    latest one whose date is <= target_dt, or None if none qualifies."""
    result = None
    for record in records:
        if _parse_date(record.snapshot_date) <= target_dt:
            result = record
        else:
            break
    return result


@traced('trend_engine')
def compute_page_trends(page_id, as_of_date=None, conn=None):
    """
    Build the full set of period-over-period comparisons for one page.
    Returns None if the page has no stored history at all (never
    fabricates a trend from nothing).
    """
    history = decision_store.get_history(page_id, end_date=as_of_date, conn=conn)
    if not history:
        return None

    current = history[-1]
    current_dt = _parse_date(current.snapshot_date)
    prior_records = history[:-1]
    previous_snapshot = prior_records[-1] if prior_records else None

    comparisons = {'vs_previous_snapshot': _compare_records(current, previous_snapshot)}
    for label, days in PERIOD_DAYS.items():
        target_dt = current_dt - timedelta(days=days)
        baseline = _find_snapshot_on_or_before(prior_records, target_dt)
        comparisons[label] = _compare_records(current, baseline)

    return {
        'page_id': page_id,
        'current_snapshot_date': current.snapshot_date,
        'comparisons': comparisons,
    }


def _get_nested(d, dotted_path):
    value = d
    for part in dotted_path.split('.'):
        if not isinstance(value, dict):
            return None
        value = value.get(part)
    return value


@traced('trend_engine')
def rank_pages_by_metric_change(
    metric_path, period='week_over_week', page_ids=None, as_of_date=None,
    top_n=10, ascending=False, conn=None,
):
    """
    Rank pages by absolute change of a dotted metric path inside a
    `compute_page_trends` comparison dict, e.g. 'seo.clicks',
    'decision_engine.business_value_score'. `ascending=False` (default)
    surfaces the biggest positive movers first ("top improving" when
    higher is better for that metric); `ascending=True` surfaces the
    biggest negative movers first ("top declining"). Pages with no usable
    delta for this metric/period are skipped, not scored as zero.
    """
    if period not in PERIOD_DAYS and period != 'vs_previous_snapshot':
        raise ValueError(f'Unknown period: {period!r}. Known: vs_previous_snapshot, {list(PERIOD_DAYS)}')
    page_ids = page_ids if page_ids is not None else decision_store.get_all_page_ids(conn=conn)

    ranked = []
    for page_id in page_ids:
        trends = compute_page_trends(page_id, as_of_date=as_of_date, conn=conn)
        if not trends:
            continue
        comparison = trends['comparisons'].get(period)
        if not comparison:
            continue
        delta = _get_nested(comparison, metric_path)
        if not delta or delta.get('absolute_change') is None:
            continue
        ranked.append({
            'page_id': page_id,
            'current': delta['current'],
            'previous': delta['previous'],
            'absolute_change': delta['absolute_change'],
            'pct_change': delta['pct_change'],
            'baseline_date': comparison['baseline_date'],
        })

    ranked.sort(key=lambda item: item['absolute_change'], reverse=not ascending)
    return ranked[:top_n]


@traced('trend_engine')
def compute_portfolio_trends(page_ids=None, as_of_date=None, conn=None):
    """Trends for every tracked page (or a caller-supplied subset), keyed
    by page_id. Pages with no history are omitted, not None-padded."""
    page_ids = page_ids if page_ids is not None else decision_store.get_all_page_ids(conn=conn)
    result = {}
    for page_id in page_ids:
        trends = compute_page_trends(page_id, as_of_date=as_of_date, conn=conn)
        if trends:
            result[page_id] = trends
    log(logging.INFO, 'trend_engine_portfolio_computed', n_pages=len(result))
    return result
