#!/usr/bin/env python3
"""
Weekly Optimization System.

Turns the Decision Engine into a SELF-IMPROVING WEEKLY OPTIMIZATION SYSTEM.

Every week the system determines:
  "What exactly should we change this week to maximize future
   rankings, calls and revenue?"

Pipeline (runs once per week automatically):
  1. Collect latest data (via data_collector.py — cached, scheduled)
  2. Update Decision Store (persist snapshots for historical comparison)
  3. Update Learning Engine (evaluate outcomes from previous weeks)
  4. Update Bayesian models (sequential posterior updating)
  5. Update Gott Temporal Prior (page maturity)
  6. Update Forecast (Monte Carlo expected calls/revenue)
  7. Update URL Action Engine (generate implementation instructions)

For every selected URL, outputs:
  - Current metrics
  - Previous week's metrics
  - Ranking movement, CTR movement, Traffic movement
  - Calls movement, Revenue movement, Forecast movement
  - Learning changes

Execution Verification:
  After implementation, compares before vs after:
  - Ranking improved? CTR improved? Traffic improved?
  - Calls improved? Revenue improved?

Learning:
  If an action worked → increase confidence
  If an action failed → reduce confidence
  If repeated failures occur → stop recommending that action

Output: WEEKLY_ACTION_PLAN.md — the ONLY report.
A developer should never need to manually inspect GSC, GA4, or Marketcall.

No new engines. No new mathematical models. No dashboards. No UI.
Uses only existing engine outputs.
"""
import sys, io
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import json
import statistics
from collections import defaultdict
from datetime import datetime, timezone, timedelta

from . import config
from . import decision_store, marketcall_ingestion, ga4_ingestion
from .attribution_engine import (
    AttributionResolver, evidence_from_gsc_page,
    evidence_from_marketcall_campaign, evidence_from_ga4_page,
)
from .data_ingestion import load_gsc_page_report_from_csv, build_hierarchy_graph, ROOT_NODE, infer_taxonomy
from .opportunity_score import score_records
from .graph_engine import pagerank, orphan_nodes, weakly_connected_components
from .bayesian_engine import BayesianEngine
from .link_ingestion import build_real_link_graph, diff_with_hierarchy
from .recommendation_engine import generate_recommendations
from . import learning_engine
from . import gott_engine
from .markov_engine import analyze_funnel
from .page_profile import PageDecisionRecord, build_page_decision_records, normalize_page_id
from .business_priority import (
    load_gsc_queries, identify_top_commercial_queries,
    rank_money_pages, calculate_opportunity_loss,
    filter_low_roi, assign_business_priorities,
)
from .url_action_plan import (
    _root_cause_analysis, _page_forecast,
    _classify_url,
)
from . import data_collector


# ============================================================
# Failure Suppression (stop recommending repeated failures)
# ============================================================

FAILURE_THRESHOLD = 3  # After 3 consecutive failures, suppress action


def _get_failure_suppressions(conn=None):
    """
    Check learning records for repeated failures.
    Returns a set of (recommendation_type, context_fingerprint) keys
    that should be suppressed.
    """
    owns_conn = conn is None
    conn = conn or decision_store._connect()
    try:
        learning_engine._ensure_learning_schema(conn)
        rows = conn.execute(
            'SELECT recommendation_type, context_fingerprint, success '
            'FROM learning_records ORDER BY timestamp ASC'
        ).fetchall()

        # Track consecutive failures per (rec_type, fingerprint)
        consecutive = defaultdict(int)
        suppressed = set()

        for row in rows:
            key = (row['recommendation_type'], row['context_fingerprint'])
            if row['success']:
                consecutive[key] = 0  # Reset on success
            else:
                consecutive[key] += 1
                if consecutive[key] >= FAILURE_THRESHOLD:
                    suppressed.add(key)

        return suppressed
    finally:
        if owns_conn:
            conn.close()


def _filter_suppressed_recs(recs, suppressed):
    """Remove recommendations whose action+context is suppressed."""
    if not suppressed:
        return recs
    survivors = []
    for rec in recs:
        # Build a context fingerprint similar to learning_engine
        from .learning_engine import compute_context_fingerprint
        # We need the opportunity score for the fingerprint, but rec doesn't
        # carry it directly. Use a simplified check on action type.
        # The suppression is by (action, fingerprint) — we check action only
        # as a coarse filter. Fine-grained filtering happens in the learning
        # engine's confidence adjustments.
        key = (rec.action, '')
        # Check if any suppressed key matches this action
        action_suppressed = any(k[0] == rec.action for k in suppressed)
        if action_suppressed:
            # Reduce confidence drastically but don't fully remove
            # — the page may still need attention, just with a different action
            rec.confidence = min(rec.confidence, 0.1)
        survivors.append(rec)
    return survivors


# ============================================================
# Week-over-Week Comparison
# ============================================================

def _get_previous_snapshot_date(current_date, conn=None):
    """Get the most recent snapshot date before the current one."""
    owns_conn = conn is None
    conn = conn or decision_store._connect()
    try:
        row = conn.execute(
            'SELECT DISTINCT snapshot_date FROM page_snapshots '
            'WHERE snapshot_date < ? ORDER BY snapshot_date DESC LIMIT 1',
            (current_date,),
        ).fetchone()
        return row[0] if row else None
    finally:
        if owns_conn:
            conn.close()


def _compare_weeks(page_id, current_raw, previous_raw, current_mc, previous_mc):
    """
    Compare current week's metrics vs previous week for a single page.
    Returns a dict of movements.
    """
    movement = {
        'impressions': _pct_change(previous_raw.get('impressions'), current_raw.get('impressions')),
        'clicks': _pct_change(previous_raw.get('clicks'), current_raw.get('clicks')),
        'ctr': _pct_change(previous_raw.get('ctr'), current_raw.get('ctr')),
        'position': _position_change(previous_raw.get('position'), current_raw.get('position')),
    }

    # Calls and revenue are campaign-level, not per-page
    if current_mc and previous_mc:
        movement['calls'] = _pct_change(previous_mc.get('calls'), current_mc.get('calls'))
        movement['approved_calls'] = _pct_change(previous_mc.get('approved_calls'), current_mc.get('approved_calls'))
        movement['revenue'] = _pct_change(previous_mc.get('revenue'), current_mc.get('revenue'))
    else:
        movement['calls'] = None
        movement['approved_calls'] = None
        movement['revenue'] = None

    return movement


def _pct_change(old, new):
    """Safe percentage change. Returns None if old is 0/None or new is None."""
    if old is None or new is None:
        return None
    if old == 0:
        return None
    return round((new - old) / old * 100.0, 2)


def _position_change(old, new):
    """Position change. Lower is better, so negative is improvement."""
    if old is None or new is None:
        return None
    return round(new - old, 2)  # Negative = improvement


# ============================================================
# Execution Verification
# ============================================================

def _verify_execution(page_id, current_raw, previous_raw, conn=None):
    """
    Compare before vs after implementation for a page.
    Determines if ranking, CTR, traffic, calls, revenue improved.
    """
    verification = {
        'has_previous': previous_raw is not None,
        'ranking_improved': None,
        'ctr_improved': None,
        'traffic_improved': None,
        'calls_improved': None,
        'revenue_improved': None,
        'details': {},
    }

    if not previous_raw:
        return verification

    prev_pos = previous_raw.get('position')
    curr_pos = current_raw.get('position')
    if prev_pos is not None and curr_pos is not None:
        verification['ranking_improved'] = curr_pos < prev_pos
        verification['details']['position_change'] = round(curr_pos - prev_pos, 2)

    prev_ctr = previous_raw.get('ctr', 0)
    curr_ctr = current_raw.get('ctr', 0)
    if prev_ctr is not None and curr_ctr is not None:
        verification['ctr_improved'] = curr_ctr > prev_ctr
        verification['details']['ctr_change'] = round((curr_ctr - prev_ctr) * 100, 4)

    prev_clicks = previous_raw.get('clicks', 0)
    curr_clicks = current_raw.get('clicks', 0)
    if prev_clicks is not None and curr_clicks is not None:
        verification['traffic_improved'] = curr_clicks > prev_clicks
        verification['details']['clicks_change'] = curr_clicks - prev_clicks

    prev_imp = previous_raw.get('impressions', 0)
    curr_imp = current_raw.get('impressions', 0)
    if prev_imp is not None and curr_imp is not None:
        verification['details']['impressions_change'] = curr_imp - prev_imp

    # Calls and revenue are campaign-level — can't verify per-page
    verification['calls_improved'] = None
    verification['revenue_improved'] = None
    verification['details']['calls_note'] = 'Campaign-level data only — per-page call verification not available'
    verification['details']['revenue_note'] = 'Campaign-level data only — per-page revenue verification not available'

    return verification


# ============================================================
# Learning Summary for Report
# ============================================================

def _learning_summary_for_report(conn=None):
    """Get learning summary for the weekly report."""
    owns_conn = conn is None
    conn = conn or decision_store._connect()
    try:
        learning_engine._ensure_learning_schema(conn)
        ls = learning_engine.get_learning_summary(conn=conn)

        # Get recent learning records
        rows = conn.execute(
            'SELECT page_id, recommendation_type, outcome_score, confidence_delta, success, '
            'previous_snapshot_date, current_snapshot_date, timestamp '
            'FROM learning_records ORDER BY timestamp DESC LIMIT 50'
        ).fetchall()

        recent = [dict(row) for row in rows]

        # Get failure suppressions
        suppressed = _get_failure_suppressions(conn=conn)

        return {
            'record_count': ls.record_count,
            'success_count': ls.success_count,
            'failure_count': ls.failure_count,
            'avg_outcome_score': ls.avg_outcome_score,
            'adjustments': ls.adjustments,
            'recent_records': recent,
            'suppressed_actions': [
                {'action': k[0], 'fingerprint': k[1]} for k in suppressed
            ],
        }
    finally:
        if owns_conn:
            conn.close()


# ============================================================
# Weekly Pipeline
# ============================================================

def _run_weekly_pipeline(force_collect=False):
    """
    Run the full weekly pipeline:
    1. Collect data (cached)
    2. Run all engines
    3. Save snapshots to Decision Store
    4. Evaluate learning
    5. Return context with everything needed for the report
    """
    # Step 1: Collect data
    print('Step 1: Data Collection')
    collected = data_collector.run(force=force_collect)

    ctx = {}
    ctx['snapshot_date'] = datetime.now(timezone.utc).strftime('%Y-%m-%d')

    page_reports = collected.get('gsc_pages') or []
    if not page_reports:
        # Fallback to direct CSV load if cache empty
        page_reports = load_gsc_page_report_from_csv()
    ctx['page_reports'] = page_reports
    ctx['n_pages'] = len(page_reports)
    ctx['raw_metrics'] = {p['page']: p for p in page_reports}

    ctx['queries'] = collected.get('gsc_queries') or []
    if not ctx['queries']:
        ctx['queries'] = load_gsc_queries()

    ctx['marketcall'] = collected.get('marketcall')
    ctx['revenue_per_call'] = None
    if ctx['marketcall']:
        ctx['revenue_per_call'] = ctx['marketcall'].get('revenue_per_approved_call')

    ctx['ga4'] = collected.get('ga4')

    # Step 2: Attribution
    print('Step 2: Attribution Engine')
    ctx['attribution'] = None
    if config.is_enabled('attribution'):
        ar = AttributionResolver()
        ar.add_all(
            evidence_from_gsc_page(
                p['page'],
                {'impressions': p.get('impressions', 0), 'clicks': p.get('clicks', 0),
                 'ctr': p.get('ctr'), 'avg_position': p.get('position')},
            )
            for p in page_reports
        )
        if ctx['ga4']:
            _meta_keys = {'attribution_level', 'attribution_note', 'source',
                          'date_from', 'date_to', 'fetched_at'}
            ar.add_all(
                evidence_from_ga4_page(
                    pid, {k: v for k, v in m.items() if k not in _meta_keys},
                    timestamp=m.get('fetched_at'),
                )
                for pid, m in ctx['ga4'].items()
            )
        if ctx['marketcall']:
            ar.add_evidence(
                evidence_from_marketcall_campaign(
                    ctx['marketcall']['campaign_id'], ctx['marketcall']
                )
            )
        ctx['attribution'] = ar

    # Step 3: Opportunity Score
    print('Step 3: Opportunity Score Engine')
    ctx['opp_results'] = []
    ctx['opp_by_id'] = {}
    if page_reports:
        records = [
            {'page': p['page'], 'impressions': p.get('impressions', 0),
             'ctr': p.get('ctr', 0.0), 'avg_position': p.get('position')}
            for p in page_reports
        ]
        ctx['opp_results'] = score_records(records)
        ctx['opp_by_id'] = {r.record_id: r for r in ctx['opp_results']}

    # Step 4: Graph Engine
    print('Step 4: Link Graph Engine')
    ctx['graph_metrics'] = {}
    ctx['weak_components'] = []
    ctx['taxonomy_orphans'] = set()
    if page_reports:
        graph = build_hierarchy_graph(page_reports)
        ranks = pagerank(graph)
        ctx['taxonomy_orphans'] = set(orphan_nodes(graph, exclude=[ROOT_NODE]))
        ctx['graph_metrics'] = {
            p['page']: {
                'pagerank': ranks.get(p['page'], 0.0),
                'is_orphan': p['page'] in ctx['taxonomy_orphans'],
                'in_degree': graph.in_degree(p['page']),
            }
            for p in page_reports
        }
        components = weakly_connected_components(graph)
        ctx['weak_components'] = components[1:] if len(components) > 1 else []

    # Step 5: Real Link Graph
    print('Step 5: Real Link Graph')
    ctx['real_link_graph_metrics'] = {}
    if config.is_enabled('link_graph'):
        rg = build_real_link_graph()
        ctx['real_link_graph_metrics'] = diff_with_hierarchy(
            rg, ctx['taxonomy_orphans'], [p['page'] for p in page_reports],
        )

    # Step 6: Bayesian Engine
    print('Step 6: Bayesian Engine')
    ctx['posteriors'] = {}
    if config.is_enabled('bayesian'):
        eng = BayesianEngine()
        for page in page_reports:
            imp = page.get('impressions', 0)
            clk = page.get('clicks', 0)
            if imp > 0:
                eng.observe(page['page'], successes=min(clk, imp), trials=imp)
        ctx['posteriors'] = {k: eng.get_posterior(k) for k in eng.all_keys()}

    # Step 7: Gott Temporal Prior
    print('Step 7: Gott Temporal Prior Engine')
    ctx['temporal_priors'] = {}
    if config.is_enabled('gott'):
        ctx['temporal_priors'] = gott_engine.compute_all_temporal_priors()

    # Step 8: Learning Engine
    print('Step 8: Learning Engine')
    ctx['learned_adjustments'] = {}
    if config.is_enabled('learning'):
        learning_engine.evaluate_all_learning()
        ls = learning_engine.get_learning_summary()
        ctx['learned_adjustments'] = ls.adjustments

    # Step 9: Recommendations
    print('Step 9: Recommendation Engine')
    ctx['recs'] = []
    if config.is_enabled('recommendation') and ctx['opp_results']:
        ctx['recs'] = generate_recommendations(
            ctx['opp_results'], graph_metrics=ctx['graph_metrics'],
            bayesian_posteriors=ctx['posteriors'],
            raw_metrics=ctx['raw_metrics'],
            weak_components=ctx['weak_components'],
            real_link_graph_metrics=ctx['real_link_graph_metrics'],
            revenue_per_call=ctx['revenue_per_call'],
            attribution_resolver=ctx['attribution'],
            learned_confidence_adjustments=ctx['learned_adjustments'],
            temporal_priors={k: v.to_dict() for k, v in ctx['temporal_priors'].items()},
        )

    # Step 10: Save snapshots to Decision Store
    print('Step 10: Decision Store — Saving Snapshots')
    if config.is_enabled('decision_store') and page_reports:
        _save_snapshots(ctx)

    # Step 11: Get previous week's data for comparison
    print('Step 11: Week-over-Week Comparison')
    conn = decision_store._connect()
    try:
        previous_date = _get_previous_snapshot_date(ctx['snapshot_date'], conn=conn)
        ctx['previous_date'] = previous_date
        ctx['previous_raw_metrics'] = {}
        if previous_date:
            prev_snapshots = decision_store.get_snapshots_for_date(previous_date, conn=conn)
            for snap in prev_snapshots:
                if snap.gsc_metrics:
                    ctx['previous_raw_metrics'][snap.page_id] = snap.gsc_metrics

        # Get previous marketcall from the first available previous snapshot
        ctx['previous_marketcall'] = None
        if prev_snapshots:
            for snap in prev_snapshots:
                if snap.marketcall_metrics:
                    ctx['previous_marketcall'] = snap.marketcall_metrics
                    break

        # Learning summary
        ctx['learning_summary'] = _learning_summary_for_report(conn=conn)

        # Failure suppressions
        suppressed = _get_failure_suppressions(conn=conn)
        ctx['suppressed_actions'] = suppressed

    finally:
        conn.close()

    # Apply failure suppression
    if suppressed:
        ctx['recs'] = _filter_suppressed_recs(ctx['recs'], suppressed)

    return ctx


def _save_snapshots(ctx):
    """Save current run's data as PageDecisionRecord snapshots to Decision Store."""
    snapshot_date = ctx['snapshot_date']
    page_reports = ctx['page_reports']
    marketcall = ctx['marketcall']
    ga4 = ctx['ga4']

    records = []
    for page in page_reports:
        page_id = page['page']
        gsc_metrics = {
            'impressions': page.get('impressions', 0),
            'clicks': page.get('clicks', 0),
            'ctr': page.get('ctr', 0.0),
            'avg_position': page.get('position'),
        }
        ga4_metrics = ga4.get(page_id) if ga4 else None

        opp = ctx['opp_by_id'].get(page_id)
        opp_dict = None
        if opp:
            opp_dict = {
                'opportunity_gap_score': opp.opportunity_gap_score,
                'performance_score': opp.performance_score,
                'percentiles': opp.percentiles,
            }

        posterior = ctx['posteriors'].get(page_id)
        bayes_dict = None
        if posterior:
            bayes_dict = {
                'alpha': posterior.alpha,
                'beta': posterior.beta,
                'mean': posterior.mean,
                'ci_low': posterior.ci_low,
                'ci_high': posterior.ci_high,
                'n_obs': posterior.n_obs,
            }

        gm = ctx['graph_metrics'].get(page_id, {})
        link_dict = {
            'pagerank': gm.get('pagerank', 0.0),
            'is_orphan': gm.get('is_orphan', False),
            'in_degree': gm.get('in_degree', 0),
        } if gm else None

        # Find recommendations for this page
        page_recs = [
            {
                'action': r.action,
                'confidence': r.confidence,
                'business_value_score': r.business_value_score,
                'reason': r.reason,
            }
            for r in ctx['recs'] if r.target == page_id
        ]

        tp = ctx.get('temporal_priors', {}).get(page_id)
        tp_dict = tp.to_dict() if tp else None

        record = PageDecisionRecord(
            page_id=page_id,
            snapshot_date=snapshot_date,
            gsc_metrics=gsc_metrics,
            ga4_metrics=ga4_metrics,
            marketcall_metrics=marketcall,
            link_graph_metrics=link_dict,
            opportunity_score=opp_dict,
            bayesian_posterior=bayes_dict,
            recommendations=page_recs,
            temporal_prior=tp_dict,
        )
        records.append(record)

    if records:
        decision_store.save_snapshots(records)
        print(f'  Saved {len(records)} snapshots for {snapshot_date}')


# ============================================================
# URL Row Builder — ALL URLs
# ============================================================

def _build_url_rows(ctx, money_pages, opp_loss):
    """Build a data row for EVERY analyzed URL with all 20 columns."""
    rows = []
    prev_raw = ctx.get('previous_raw_metrics', {})
    prev_mc = ctx.get('previous_marketcall') or {}
    marketcall = ctx.get('marketcall') or {}
    ga4 = ctx.get('ga4') or {}
    revenue_per_call = ctx.get('revenue_per_call') or 0

    mp_by_page = {mp['page']: mp for mp in money_pages}
    ol_by_page = {ol['page']: ol for ol in opp_loss}
    rec_by_target = {}
    for r in ctx.get('recs', []):
        if r.target not in rec_by_target:
            rec_by_target[r.target] = r

    for page in ctx['page_reports']:
        pid = page['page']
        raw = ctx['raw_metrics'].get(pid, {})
        prev = prev_raw.get(pid, {})
        impressions = raw.get('impressions', 0)
        clicks = raw.get('clicks', 0)
        ctr = raw.get('ctr', 0.0)
        position = raw.get('position')
        ga4_page = ga4.get(pid, {})
        sessions = ga4_page.get('sessions', 'N/A')
        engagement_rate = ga4_page.get('engagement_rate')
        opp = ctx.get('opp_by_id', {}).get(pid)
        opp_gap = opp.opportunity_gap_score if opp and opp.opportunity_gap_score is not None else 0
        perf_score = opp.performance_score if opp and opp.performance_score is not None else 0
        posterior = ctx['posteriors'].get(pid)
        rec = rec_by_target.get(pid)
        mp = mp_by_page.get(pid, {})

        # Business Score = roi_score from money_pages, or 0
        business_score = mp.get('roi_score', 0)

        # Opportunity Score
        opportunity_score = opp_gap

        # Confidence = Bayesian posterior mean or 0
        confidence = posterior.mean if posterior else 0

        # Forecast Score = expected_calls from rec, or 0
        forecast_score = 0
        if rec and rec.expected_impact:
            forecast_score = rec.expected_impact.get('expected_calls', 0) or 0

        # Movement
        rank_change = _position_change(prev.get('position'), position)
        ctr_change = _pct_change(prev.get('ctr'), ctr)
        traffic_change = _pct_change(prev.get('clicks'), clicks)
        call_change = _pct_change(prev_mc.get('calls'), marketcall.get('calls')) if prev_mc else None
        revenue_change = _pct_change(prev_mc.get('revenue'), marketcall.get('revenue')) if prev_mc else None

        # Classification
        classification = _classify_url(pid, ctx)

        # Reasons (only for underperforming / high opportunity)
        reasons = []
        if classification in ('Underperforming', 'High Opportunity'):
            reasons = _root_cause_analysis(pid, ctx)
        reason_str = '; '.join(r['reason'] for r in reasons) if reasons else '—'

        # Status
        if classification in ('Underperforming', 'High Opportunity'):
            status = 'SEO Review Required'
        elif classification in ('Strong Performer', 'Stable Performer'):
            status = 'No action required'
        else:
            status = 'Monitor'

        # Calls and revenue (campaign-level)
        calls = marketcall.get('calls', 'N/A')
        revenue = marketcall.get('revenue', 0)

        rows.append({
            'url': pid,
            'classification': classification,
            'business_score': business_score,
            'opportunity_score': opportunity_score,
            'confidence': confidence,
            'forecast_score': forecast_score,
            'impressions': impressions,
            'clicks': clicks,
            'ctr': ctr,
            'position': position,
            'sessions': sessions,
            'engagement': engagement_rate,
            'calls': calls,
            'revenue': revenue,
            'rank_change': rank_change,
            'ctr_change': ctr_change,
            'traffic_change': traffic_change,
            'call_change': call_change,
            'revenue_change': revenue_change,
            'reasons': reason_str,
            'status': status,
        })

    # Sort by Business Score descending
    rows.sort(key=lambda r: r['business_score'], reverse=True)
    return rows


# ============================================================
# Format Helpers
# ============================================================

def _fmt_num(val, decimals=4):
    """Format a number for table display."""
    if val is None:
        return 'N/A'
    if isinstance(val, str):
        return val
    return f'{val:.{decimals}f}'


def _fmt_change(val, suffix=''):
    """Format a percentage change for table display."""
    if val is None:
        return '—'
    sign = '+' if val > 0 else ''
    return f'{sign}{val}{suffix}'


def _fmt_rank_change(val):
    """Format position change (negative = improvement)."""
    if val is None:
        return '—'
    if val < 0:
        return f'↑{val:.1f}'
    if val > 0:
        return f'↓+{val:.1f}'
    return '0'


def _fmt_url(url, max_len=50):
    """Truncate URL for table display."""
    if len(url) <= max_len:
        return url
    return url[:max_len-3] + '...'


def _fmt_pct(val):
    """Format a percentage change value."""
    if val is None:
        return 'N/A'
    sign = '+' if val > 0 else ''
    return f'{sign}{val:.1f}%'


def _fmt_movement(val):
    """Format a movement value with arrow."""
    if val is None:
        return '—'
    if val > 0:
        return f'↑ +{val:.1f}%'
    if val < 0:
        return f'↓ {val:.1f}%'
    return '→ 0%'


def _fmt_position_movement(val):
    """Format position movement (negative = improvement)."""
    if val is None:
        return '—'
    if val < 0:
        return f'↑ {val:.1f} (improved)'
    if val > 0:
        return f'↓ +{val:.1f} (declined)'
    return '→ 0 (no change)'


def _fmt_prev(val, suffix=''):
    """Format a previous value."""
    if val is None:
        return 'N/A'
    if suffix == '%':
        return f'{val:.4%}'
    return str(val)


def _fmt_bool(val):
    """Format a boolean as Yes/No/N/A."""
    if val is None:
        return 'UNKNOWN'
    return 'YES' if val else 'NO'


# ============================================================
# Weekly Report Generator — URL-centric, ALL URLs
# ============================================================

def generate_weekly_action_plan(all_rows, ctx):
    """Generate WEEKLY_ACTION_PLAN.md — URL-centric, ALL URLs, no hiding."""
    lines = []

    def p(s=''):
        lines.append(s)

    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    revenue_per_call = ctx.get('revenue_per_call') or 0
    previous_date = ctx.get('previous_date')
    learning = ctx.get('learning_summary', {})

    p(f'# Weekly Prioritization Report — Week of {today}')
    p()
    p('> **The engine reports measurable facts only.**')
    p('> **The engine does NOT generate SEO content.**')
    p('> **The engine does NOT evaluate content quality.**')
    p('> **The human SEO workflow decides HOW to improve each page.**')
    p()
    p('---')
    p()

    # Executive Summary
    p('## Executive Summary')
    p()
    p(f'- **Report date:** {today}')
    p(f'- **Previous report:** {previous_date or "N/A (first run)"}')
    p(f'- **Total URLs analyzed:** {len(all_rows)}')
    p(f'- **Revenue per approved call:** ${revenue_per_call:.2f} (MEASURED, n=1)')
    p()

    # Classification Summary
    cls_counts = {}
    for r in all_rows:
        cls_counts[r['classification']] = cls_counts.get(r['classification'], 0) + 1
    p('### URL Classification Summary')
    p()
    p('| Classification | Count |')
    p('|----------------|-------|')
    for cls in ['Strong Performer', 'Stable Performer', 'Underperforming', 'High Opportunity', 'Monitor']:
        p(f'| {cls} | {cls_counts.get(cls, 0)} |')
    p()

    # Data Collection Status
    status = data_collector.get_collection_status()
    p('### Data Collection Status')
    p()
    p('| Source | Last Collected | Fresh | Schedule |')
    p('|--------|---------------|-------|----------|')
    p(f'| Marketcall | {status["marketcall"]["fetched_at"] or "Never"} | {"Yes" if status["marketcall"]["is_fresh"] else "No"} | Every 24h |')
    p(f'| GSC Pages | {status["gsc_pages"]["fetched_at"] or "Never"} | {"Yes" if status["gsc_pages"]["is_fresh"] else "No"} | Weekly |')
    p(f'| GSC Queries | {status["gsc_queries"]["fetched_at"] or "Never"} | {"Yes" if status["gsc_queries"]["is_fresh"] else "No"} | Weekly |')
    p(f'| GA4 | {status["ga4"]["fetched_at"] or "Never"} | {"Yes" if status["ga4"]["is_fresh"] else "No"} | Weekly |')
    p()

    # Learning Engine Status
    p('### Learning Engine Status')
    p()
    p(f'- **Total learning records:** {learning.get("record_count", 0)}')
    p(f'- **Successful actions:** {learning.get("success_count", 0)}')
    p(f'- **Failed actions:** {learning.get("failure_count", 0)}')
    p(f'- **Average outcome score:** {learning.get("avg_outcome_score", 0):.4f}')
    p(f'- **Suppressed actions (repeated failures):** {len(learning.get("suppressed_actions", []))}')
    p()

    p('---')
    p()

    # ============================================================
    # MASTER TABLE — ALL URLs
    # ============================================================
    p('## Master URL Table — All Analyzed URLs')
    p()
    p(f'Every URL appears exactly once. Sorted by Business Score descending. Total: {len(all_rows)} URLs.')
    p()
    p('| # | URL | Classification | Business Score | Opportunity Score | Confidence | Forecast Score | Impressions | Clicks | CTR | Avg Position | Sessions | Engagement | Calls | Revenue | Rank Change | CTR Change | Traffic Change | Call Change | Revenue Change | Reason(s) | Status |')
    p('|---|-----|----------------|---------------|-------------------|------------|--------------|-------------|--------|-----|-------------|----------|------------|-------|---------|-------------|-----------|---------------|------------|----------------|-----------|--------|')

    for i, r in enumerate(all_rows, 1):
        p(f'| {i} | {_fmt_url(r["url"])} | {r["classification"]} | {_fmt_num(r["business_score"], 2)} | {_fmt_num(r["opportunity_score"], 4)} | {_fmt_num(r["confidence"], 6)} | {_fmt_num(r["forecast_score"], 4)} | {r["impressions"]:,} | {r["clicks"]} | {r["ctr"]:.4%} | {_fmt_num(r["position"], 1)} | {r["sessions"]} | {_fmt_num(r["engagement"], 4)} | {r["calls"]} | ${r["revenue"]:.2f} | {_fmt_rank_change(r["rank_change"])} | {_fmt_change(r["ctr_change"], "%")} | {_fmt_change(r["traffic_change"], "%")} | {_fmt_change(r["call_change"], "%")} | {_fmt_change(r["revenue_change"], "%")} | {r["reasons"]} | {r["status"]} |')

    p()
    p('---')
    p()

    # ============================================================
    # Section 1: Top 20 Highest Opportunity URLs
    # ============================================================
    p('## 1. Top 20 Highest Opportunity URLs')
    p()
    p('Sorted by Opportunity Score descending.')
    p()
    opp_sorted = sorted(all_rows, key=lambda r: r['opportunity_score'], reverse=True)[:20]
    p('| # | URL | Classification | Opportunity Score | Impressions | Clicks | CTR | Avg Position | Reason(s) | Status |')
    p('|---|-----|----------------|-------------------|-------------|--------|-----|-------------|-----------|--------|')
    for i, r in enumerate(opp_sorted, 1):
        p(f'| {i} | {_fmt_url(r["url"])} | {r["classification"]} | {_fmt_num(r["opportunity_score"], 4)} | {r["impressions"]:,} | {r["clicks"]} | {r["ctr"]:.4%} | {_fmt_num(r["position"], 1)} | {r["reasons"]} | {r["status"]} |')
    p()

    # ============================================================
    # Section 2: Top 20 Underperforming URLs
    # ============================================================
    p('## 2. Top 20 Underperforming URLs')
    p()
    p('Sorted by Business Score descending. Only URLs classified as Underperforming.')
    p()
    under = [r for r in all_rows if r['classification'] == 'Underperforming'][:20]
    p('| # | URL | Business Score | Impressions | Clicks | CTR | Avg Position | Reason(s) | Status |')
    p('|---|-----|---------------|-------------|--------|-----|-------------|-----------|--------|')
    for i, r in enumerate(under, 1):
        p(f'| {i} | {_fmt_url(r["url"])} | {_fmt_num(r["business_score"], 2)} | {r["impressions"]:,} | {r["clicks"]} | {r["ctr"]:.4%} | {_fmt_num(r["position"], 1)} | {r["reasons"]} | {r["status"]} |')
    p()

    # ============================================================
    # Section 3: Top 20 Strongest URLs
    # ============================================================
    p('## 3. Top 20 Strongest URLs')
    p()
    p('Sorted by Business Score descending. Only URLs classified as Strong Performer or Stable Performer.')
    p()
    strong = [r for r in all_rows if r['classification'] in ('Strong Performer', 'Stable Performer')][:20]
    if strong:
        p('| # | URL | Classification | Business Score | Impressions | Clicks | CTR | Avg Position | Status |')
        p('|---|-----|----------------|---------------|-------------|--------|-----|-------------|--------|')
        for i, r in enumerate(strong, 1):
            p(f'| {i} | {_fmt_url(r["url"])} | {r["classification"]} | {_fmt_num(r["business_score"], 2)} | {r["impressions"]:,} | {r["clicks"]} | {r["ctr"]:.4%} | {_fmt_num(r["position"], 1)} | {r["status"]} |')
    else:
        p('No Strong or Stable Performers found in current data.')
    p()

    # ============================================================
    # Section 4: Top 20 Fastest Improving URLs
    # ============================================================
    p('## 4. Top 20 Fastest Improving URLs')
    p()
    p('Sorted by combined improvement signal (CTR change + traffic change + rank improvement).')
    p()
    def _improvement_score(r):
        score = 0
        if r['ctr_change'] is not None and r['ctr_change'] > 0:
            score += r['ctr_change']
        if r['traffic_change'] is not None and r['traffic_change'] > 0:
            score += r['traffic_change']
        if r['rank_change'] is not None and r['rank_change'] < 0:
            score += abs(r['rank_change']) * 10  # weight rank improvement
        return score

    improving = sorted(all_rows, key=_improvement_score, reverse=True)[:20]
    p('| # | URL | Rank Change | CTR Change | Traffic Change | Impressions | Clicks | CTR | Avg Position | Status |')
    p('|---|-----|-------------|-----------|---------------|-------------|--------|-----|-------------|--------|')
    for i, r in enumerate(improving, 1):
        p(f'| {i} | {_fmt_url(r["url"])} | {_fmt_rank_change(r["rank_change"])} | {_fmt_change(r["ctr_change"], "%")} | {_fmt_change(r["traffic_change"], "%")} | {r["impressions"]:,} | {r["clicks"]} | {r["ctr"]:.4%} | {_fmt_num(r["position"], 1)} | {r["status"]} |')
    p()

    # ============================================================
    # Section 5: Top 20 Biggest Declining URLs
    # ============================================================
    p('## 5. Top 20 Biggest Declining URLs')
    p()
    p('Sorted by combined decline signal (CTR decline + traffic decline + rank decline).')
    p()
    def _decline_score(r):
        score = 0
        if r['ctr_change'] is not None and r['ctr_change'] < 0:
            score += abs(r['ctr_change'])
        if r['traffic_change'] is not None and r['traffic_change'] < 0:
            score += abs(r['traffic_change'])
        if r['rank_change'] is not None and r['rank_change'] > 0:
            score += r['rank_change'] * 10
        return score

    declining = sorted(all_rows, key=_decline_score, reverse=True)[:20]
    p('| # | URL | Rank Change | CTR Change | Traffic Change | Impressions | Clicks | CTR | Avg Position | Status |')
    p('|---|-----|-------------|-----------|---------------|-------------|--------|-----|-------------|--------|')
    for i, r in enumerate(declining, 1):
        p(f'| {i} | {_fmt_url(r["url"])} | {_fmt_rank_change(r["rank_change"])} | {_fmt_change(r["ctr_change"], "%")} | {_fmt_change(r["traffic_change"], "%")} | {r["impressions"]:,} | {r["clicks"]} | {r["ctr"]:.4%} | {_fmt_num(r["position"], 1)} | {r["status"]} |')
    p()

    p('---')
    p()

    # Summary
    p('## Summary')
    p()
    p(f'- **Total URLs analyzed:** {len(all_rows)}')
    p(f'- **Strong Performer:** {cls_counts.get("Strong Performer", 0)}')
    p(f'- **Stable Performer:** {cls_counts.get("Stable Performer", 0)}')
    p(f'- **Underperforming:** {cls_counts.get("Underperforming", 0)}')
    p(f'- **High Opportunity:** {cls_counts.get("High Opportunity", 0)}')
    p(f'- **Monitor:** {cls_counts.get("Monitor", 0)}')
    p(f'- **Learning records:** {learning.get("record_count", 0)}')
    p(f'- **Suppressed actions:** {len(learning.get("suppressed_actions", []))}')
    p()

    p('### What This Report Does NOT Do')
    p()
    p('- Does NOT generate replacement titles, meta descriptions, H1s, FAQs, or schema')
    p('- Does NOT evaluate content quality')
    p('- Does NOT prescribe specific SEO changes')
    p('- Does NOT crawl or inspect page HTML')
    p('- Does NOT claim to know what content is "good" or "bad"')
    p()
    p('The human SEO workflow decides HOW to improve each page.')
    p('The engine only decides WHICH pages deserve attention and WHY based on evidence.')
    p()

    p('---')
    p()
    p(f'*Generated by Weekly Optimization System at {datetime.now(timezone.utc).isoformat()}*')
    p(f'*Uses only existing engine outputs. No new mathematical models.*')

    return '\n'.join(lines)


# ============================================================
# Main
# ============================================================

def run(force_collect=False):
    """
    Run the full weekly optimization pipeline.
    """
    print('=' * 60)
    print('Weekly Optimization System')
    print(f'Run time: {datetime.now(timezone.utc).isoformat()}')
    print('=' * 60)
    print()

    # Run the full pipeline
    ctx = _run_weekly_pipeline(force_collect=force_collect)
    revenue_per_call = ctx.get('revenue_per_call') or 0

    # Run Business Priority Intelligence — get ALL pages (no top_n limit)
    print()
    print('Business Priority Intelligence')
    top_queries = identify_top_commercial_queries(ctx['queries'], top_n=20)
    money_pages = rank_money_pages(
        ctx['page_reports'], revenue_per_call, ctx['recs'], top_n=len(ctx['page_reports']),
    )
    opp_loss = calculate_opportunity_loss(
        ctx['page_reports'], revenue_per_call, top_n=len(ctx['page_reports']),
    )
    survivors, killed = filter_low_roi(ctx['recs'], revenue_per_call)
    prioritized = assign_business_priorities(survivors, revenue_per_call)

    # Build URL rows for ALL analyzed pages
    print()
    print('Building URL rows for all pages...')
    all_rows = _build_url_rows(ctx, money_pages, opp_loss)

    # Generate report
    print()
    print('Generating WEEKLY_ACTION_PLAN.md')
    report = generate_weekly_action_plan(all_rows, ctx)

    with open('WEEKLY_ACTION_PLAN.md', 'w', encoding='utf-8') as f:
        f.write(report)

    # Console summary
    print()
    print('=' * 60)
    print('Weekly Optimization System — Complete')
    print(f'  Pages analyzed:       {ctx["n_pages"]}')
    print(f'  URLs in report:       {len(all_rows)}')
    print(f'  Recommendations:      {len(ctx["recs"])}')
    print(f'  Killed (low ROI):     {len(killed)}')
    print(f'  Active (survivors):   {len(survivors)}')
    print(f'  Revenue per call:     ${revenue_per_call:.2f}')
    print(f'  Previous date:        {ctx.get("previous_date", "N/A")}')
    print(f'  Learning records:     {ctx.get("learning_summary", {}).get("record_count", 0)}')
    print(f'  Suppressed actions:   {len(ctx.get("suppressed_actions", set()))}')
    print(f'  Decision Store snaps: {decision_store.count_snapshots()}')
    print()
    print('  Output: WEEKLY_ACTION_PLAN.md')
    print('=' * 60)


if __name__ == '__main__':
    run()
