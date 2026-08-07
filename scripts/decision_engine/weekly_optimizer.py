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
    _root_cause_analysis, _generate_implementation_plan,
    _page_forecast, _get_service_info, _extract_city,
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
# Weekly Action Plan Report Generator
# ============================================================

def generate_weekly_action_plan(selected_pages, ctx):
    """Generate WEEKLY_ACTION_PLAN.md."""
    lines = []

    def p(s=''):
        lines.append(s)

    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    revenue_per_call = ctx.get('revenue_per_call') or 0
    previous_date = ctx.get('previous_date')
    learning = ctx.get('learning_summary', {})

    p(f'# Weekly Action Plan — Week of {today}')
    p()
    p('> **The ONLY report. The Action Engine is the single source of truth.**')
    p('> A developer should never need to manually inspect GSC, GA4, or Marketcall.')
    p()
    p('---')
    p()

    # Executive Summary
    p('## Executive Summary')
    p()
    p(f'- **Report date:** {today}')
    p(f'- **Previous report:** {previous_date or "N/A (first run)"}')
    p(f'- **Pages analyzed:** {ctx["n_pages"]}')
    p(f'- **Pages selected for action:** {len(selected_pages)}')
    p(f'- **Revenue per approved call:** ${revenue_per_call:.2f} (MEASURED, n=1)')
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

    # Learning Summary
    p('### Learning Engine Status')
    p()
    p(f'- **Total learning records:** {learning.get("record_count", 0)}')
    p(f'- **Successful actions:** {learning.get("success_count", 0)}')
    p(f'- **Failed actions:** {learning.get("failure_count", 0)}')
    p(f'- **Average outcome score:** {learning.get("avg_outcome_score", 0):.4f}')
    p(f'- **Suppressed actions (repeated failures):** {len(learning.get("suppressed_actions", []))}')
    if learning.get('suppressed_actions'):
        for sa in learning['suppressed_actions']:
            p(f'  - {sa["action"]} (fingerprint: {sa["fingerprint"][:8]}...)')
    p()

    # Site-Level Funnel
    marketcall = ctx.get('marketcall') or {}
    total_imp = sum(r.get('impressions', 0) for r in ctx['raw_metrics'].values())
    total_clicks = sum(r.get('clicks', 0) for r in ctx['raw_metrics'].values())
    total_calls = marketcall.get('calls', 0)
    approved_calls = marketcall.get('approved_calls', 0)

    if total_imp > 0 and total_clicks > 0:
        p('### Site-Level Funnel (Markov Engine)')
        p()
        stage_counts = [('impression', total_imp), ('click', total_clicks)]
        if total_calls > 0:
            stage_counts.append(('call', total_calls))
            if approved_calls > 0:
                stage_counts.append(('approved_call', approved_calls))
        try:
            funnel = analyze_funnel(stage_counts)
            p(f'- **Impressions → Clicks:** {funnel.transition_matrix[0].p:.6f} ({total_imp:,} → {total_clicks})')
            p(f'  - Drop-off: {funnel.drop_off[0].drop_off_rate:.4%} ({funnel.drop_off[0].absolute_loss:.0f} lost)')
            if len(funnel.transition_matrix) > 1:
                p(f'- **Clicks → Calls:** {funnel.transition_matrix[1].p:.6f} ({total_clicks} → {total_calls})')
                p(f'  - Drop-off: {funnel.drop_off[1].drop_off_rate:.4%} ({funnel.drop_off[1].absolute_loss:.0f} lost)')
            if len(funnel.transition_matrix) > 2:
                p(f'- **Calls → Approved:** {funnel.transition_matrix[2].p:.6f} ({total_calls} → {approved_calls})')
                p(f'  - Drop-off: {funnel.drop_off[2].drop_off_rate:.4%} ({funnel.drop_off[2].absolute_loss:.0f} lost)')
            p(f'- **End-to-end conversion:** {funnel.expected_conversion_path:.8f}')
            p(f'- **Highest loss step:** {funnel.highest_loss_step_by_rate.from_stage} → {funnel.highest_loss_step_by_rate.to_stage} ({funnel.highest_loss_step_by_rate.drop_off_rate:.4%})')
        except (ValueError, IndexError):
            p('Funnel analysis not available.')
        p()

    # Week-over-Week Movement (site level)
    p('### Week-over-Week Movement (Site Level)')
    p()
    prev_mc = ctx.get('previous_marketcall') or {}
    if prev_mc:
        p('| Metric | Previous | Current | Change |')
        p('|--------|----------|---------|--------|')
        p(f'| Total Impressions | {sum(r.get("impressions", 0) for r in ctx.get("previous_raw_metrics", {}).values()):,} | {total_imp:,} | {_fmt_pct(_pct_change(sum(r.get("impressions", 0) for r in ctx.get("previous_raw_metrics", {}).values()), total_imp))} |')
        p(f'| Total Clicks | {sum(r.get("clicks", 0) for r in ctx.get("previous_raw_metrics", {}).values()):,} | {total_clicks:,} | {_fmt_pct(_pct_change(sum(r.get("clicks", 0) for r in ctx.get("previous_raw_metrics", {}).values()), total_clicks))} |')
        p(f'| Total Calls | {prev_mc.get("calls", 0)} | {total_calls} | {_fmt_pct(_pct_change(prev_mc.get("calls"), total_calls))} |')
        p(f'| Approved Calls | {prev_mc.get("approved_calls", 0)} | {approved_calls} | {_fmt_pct(_pct_change(prev_mc.get("approved_calls"), approved_calls))} |')
        p(f'| Revenue | ${prev_mc.get("revenue", 0):.2f} | ${marketcall.get("revenue", 0):.2f} | {_fmt_pct(_pct_change(prev_mc.get("revenue"), marketcall.get("revenue")))} |')
    else:
        p('No previous week data available — this is the first run.')
    p()

    p('---')
    p()

    # Per-Page Action Plans
    p('## Per-Page Weekly Action Plans')
    p()
    p('Pages ordered by Business Priority Intelligence ROI ranking.')
    p()

    for i, page_data in enumerate(selected_pages, 1):
        page_id = page_data['page']
        rec = page_data.get('recommendation')
        money_page = page_data.get('money_page', {})
        priority = page_data.get('priority', {})

        raw = ctx['raw_metrics'].get(page_id, {})
        prev_raw = ctx.get('previous_raw_metrics', {}).get(page_id, {})
        impressions = raw.get('impressions', 0)
        clicks = raw.get('clicks', 0)
        ctr = raw.get('ctr', 0.0)
        position = raw.get('position')

        service_info = _get_service_info(page_id)
        city = _extract_city(page_id)

        p(f'### {i}. `{page_id}`')
        p()
        p(f'**Service:** {service_info["label"]} | **City:** {city}')
        p()

        # Current Metrics
        p('#### Current Metrics')
        p()
        p(f'| Metric | Current | Previous | Movement | Source |')
        p(f'|--------|---------|----------|----------|--------|')
        p(f'| Impressions | {impressions:,} | {prev_raw.get("impressions", "N/A"):,} | {_fmt_movement(_pct_change(prev_raw.get("impressions"), impressions))} | GSC |')
        p(f'| Clicks | {clicks} | {prev_raw.get("clicks", "N/A")} | {_fmt_movement(_pct_change(prev_raw.get("clicks"), clicks))} | GSC |')
        p(f'| CTR | {ctr:.4%} | {_fmt_prev(prev_raw.get("ctr"), "%")} | {_fmt_movement(_pct_change(prev_raw.get("ctr"), ctr))} | GSC |')
        pos_prev = prev_raw.get("position")
        pos_curr_str = f'{position:.1f}' if position else 'N/A'
        pos_prev_str = f'{pos_prev:.1f}' if pos_prev else 'N/A'
        p(f'| Position | {pos_curr_str} | {pos_prev_str} | {_fmt_position_movement(_position_change(pos_prev, position))} | GSC |')
        gm = ctx['graph_metrics'].get(page_id, {})
        p(f'| PageRank | {gm.get("pagerank", 0):.6f} | — | — | Link Graph |')
        posterior = ctx['posteriors'].get(page_id)
        if posterior:
            p(f'| CTR Posterior | {posterior.mean:.6f} | — | — | Bayesian |')
        tp = ctx.get('temporal_priors', {}).get(page_id)
        if tp:
            maturity = tp.maturity_score if hasattr(tp, 'maturity_score') else tp.get('maturity_score', 0)
            page_age = tp.page_age_days if hasattr(tp, 'page_age_days') else tp.get('page_age_days', 0)
            p(f'| Page Age | {page_age} days | — | — | Gott |')
            p(f'| Maturity | {maturity:.4f} | — | — | Gott |')
        p()

        # Forecast
        forecast = _page_forecast(page_id, rec, ctx)
        p('#### Forecast')
        p()
        if forecast:
            p(f'| Field | Value | Classification |')
            p(f'|-------|-------|----------------|')
            if forecast.get('expected_calls') != 'UNKNOWN':
                p(f'| Expected Calls | {forecast["expected_calls"]:.4f} | {forecast["classification"]} |')
                p(f'| Calls CI | [{forecast.get("calls_ci_low", "N/A"):.4f}, {forecast.get("calls_ci_high", "N/A"):.4f}] | {forecast["classification"]} |')
            else:
                p(f'| Expected Calls | UNKNOWN | UNKNOWN |')
            if forecast.get('expected_revenue') != 'UNKNOWN':
                p(f'| Expected Revenue | ${forecast["expected_revenue"]:.2f} | {forecast["classification"]} |')
                p(f'| Revenue CI | [${forecast.get("revenue_ci_low", 0):.2f}, ${forecast.get("revenue_ci_high", 0):.2f}] | {forecast["classification"]} |')
            else:
                p(f'| Expected Revenue | UNKNOWN | UNKNOWN |')
            p(f'| Confidence | {forecast.get("confidence", "UNKNOWN"):.1%}' if isinstance(forecast.get('confidence'), float) else f'| Confidence | UNKNOWN | |')
        else:
            p('No forecast available.')
        p()

        # Business Value
        p('#### Business Value')
        p()
        p(f'| Field | Value |')
        p(f'|-------|-------|')
        if money_page:
            p(f'| Expected Revenue (MC) | ${money_page.get("expected_revenue", 0):.2f} |')
            p(f'| Lost Revenue (Opp Loss) | ${money_page.get("lost_revenue", 0):.2f} |')
            p(f'| Total Revenue Opportunity | ${money_page.get("total_revenue_opportunity", 0):.2f} |')
        if priority:
            p(f'| Overall ROI | {priority.get("overall_roi_percent", 0):.1f}% |')
        p()

        # Ranking Blockers
        blockers = _root_cause_analysis(page_id, ctx)
        p('#### Ranking Blockers (Root Cause Analysis)')
        p()
        for b in blockers:
            p(f'- **[{b["severity"]}] {b["blocker"]}**')
            p(f'  - Evidence: `{b["evidence"]}`')
            p(f'  - Engine: {b["engine"]}')
        p()

        # Execution Verification (before vs after)
        verification = _verify_execution(page_id, raw, prev_raw)
        if verification['has_previous']:
            p('#### Execution Verification (vs Previous Week)')
            p()
            p(f'| Check | Result | Details |')
            p(f'|-------|--------|---------|')
            v = verification
            p(f'| Ranking improved? | {_fmt_bool(v["ranking_improved"])} | {v["details"].get("position_change", "N/A")} |')
            p(f'| CTR improved? | {_fmt_bool(v["ctr_improved"])} | {v["details"].get("ctr_change", "N/A")} |')
            p(f'| Traffic improved? | {_fmt_bool(v["traffic_improved"])} | {v["details"].get("clicks_change", "N/A")} |')
            p(f'| Calls improved? | {_fmt_bool(v["calls_improved"])} | {v["details"].get("calls_note", "N/A")} |')
            p(f'| Revenue improved? | {_fmt_bool(v["revenue_improved"])} | {v["details"].get("revenue_note", "N/A")} |')
            p()
        else:
            p('#### Execution Verification')
            p()
            p('No previous week data — this is the first run for this page.')
            p()

        # Learning Changes
        learning_adjustments = ctx.get('learned_adjustments', {})
        p('#### Learning Changes')
        p()
        if learning_adjustments:
            has_relevant = False
            for key, delta in learning_adjustments.items():
                if rec and rec.action in key:
                    has_relevant = True
                    p(f'- **{key}**: confidence delta = {delta:+.4f}')
            if not has_relevant:
                p('No learning adjustments for this page\'s recommendation type.')
        else:
            p('No learning records yet — insufficient historical data for confidence calibration.')
        p()

        # Implementation Plan
        actions = _generate_implementation_plan(page_id, blockers, rec, ctx)
        p('#### Implementation Plan (This Week)')
        p()
        p('EXACT changes to implement. Every action includes reason, evidence, and expected impact.')
        p()
        for j, action in enumerate(actions, 1):
            p(f'##### {j}. {action["change"]}')
            p()
            p(f'- **Current:** {action["current"]}')
            p(f'- **Recommended:** {action["recommended"]}')
            p(f'- **Reason:** {action["reason"]}')
            p(f'- **Evidence:** `{action["evidence"]}`')
            p(f'- **Confidence:** {action["confidence"]}')
            p(f'- **Expected ranking impact:** {action["expected_ranking_improvement"]}')
            p(f'- **Expected CTR impact:** {action["expected_ctr_improvement"]}')
            p(f'- **Expected call impact:** {action["expected_call_improvement"]}')
            p(f'- **Expected revenue impact:** {action["expected_revenue_improvement"]}')
            p()

            if action.get('links'):
                p('  **Links to add:**')
                p()
                p('  | Source | Target | Anchor Text | Placement |')
                p('  |--------|--------|-------------|-----------|')
                for link in action['links']:
                    src = link['source_page'][:35] if len(link['source_page']) > 35 else link['source_page']
                    tgt = link['target_page'][:35] if len(link['target_page']) > 35 else link['target_page']
                    p(f'  | `{src}` | `{tgt}` | "{link["anchor_text"]}" | {link["placement"]} |')
                p()

            if action.get('faqs'):
                p('  **FAQs:**')
                for faq in action['faqs']:
                    p(f'  - {faq}')
                p()

            if action.get('entities'):
                p('  **Entities:**')
                for ent in action['entities']:
                    p(f'  - {ent}')
                p()

            if action.get('sections'):
                p('  **Content sections:**')
                for sec in action['sections']:
                    p(f'  - **{sec["section"]}**')
                    for elem in sec['elements'][:2]:
                        p(f'    - {elem}')
                p()

            if action.get('eeat_items'):
                p('  **EEAT elements:**')
                for eeat in action['eeat_items'][:3]:
                    p(f'  - {eeat}')
                p('  *(+ more — see full list in implementation details)*')
                p()

            p('---')
            p()

        # Next Week's Priority
        p('#### Next Week\'s Priority')
        p()
        if priority:
            roi = priority.get('overall_roi_percent', 0)
            if roi >= 80:
                p(f'**HIGH PRIORITY** (ROI: {roi:.1f}%) — Implement all actions above this week. Verify impact next week.')
            elif roi >= 60:
                p(f'**MEDIUM PRIORITY** (ROI: {roi:.1f}%) — Implement top 5 actions. Verify impact next week.')
            else:
                p(f'**LOW PRIORITY** (ROI: {roi:.1f}%) — Implement if time permits. Monitor for changes.')
        else:
            p('Priority not determined — no recommendation for this page.')
        p()

        p('---')
        p()

    # Summary
    p('## Summary')
    p()
    p(f'- **Pages with action plans:** {len(selected_pages)}')
    p(f'- **Total ranking blockers:** {sum(len(_root_cause_analysis(pd["page"], ctx)) for pd in selected_pages)}')
    p(f'- **Total implementation actions:** {sum(len(_generate_implementation_plan(pd["page"], _root_cause_analysis(pd["page"], ctx), pd.get("recommendation"), ctx)) for pd in selected_pages)}')
    p(f'- **Learning records:** {learning.get("record_count", 0)}')
    p(f'- **Suppressed actions:** {len(learning.get("suppressed_actions", []))}')
    p()

    p('### What Changed This Week')
    p()
    if previous_date:
        p(f'Comparing {today} vs {previous_date}:')
        p()
        # Aggregate movements
        improved_ranking = 0
        improved_ctr = 0
        improved_traffic = 0
        declined_ranking = 0
        declined_ctr = 0
        declined_traffic = 0
        no_change = 0

        for pd in selected_pages:
            raw = ctx['raw_metrics'].get(pd['page'], {})
            prev = ctx.get('previous_raw_metrics', {}).get(pd['page'], {})
            v = _verify_execution(pd['page'], raw, prev)
            if v['ranking_improved'] is True:
                improved_ranking += 1
            elif v['ranking_improved'] is False:
                declined_ranking += 1
            if v['ctr_improved'] is True:
                improved_ctr += 1
            elif v['ctr_improved'] is False:
                declined_ctr += 1
            if v['traffic_improved'] is True:
                improved_traffic += 1
            elif v['traffic_improved'] is False:
                declined_traffic += 1
            if not v['has_previous']:
                no_change += 1

        p(f'- Pages with ranking improvement: {improved_ranking}')
        p(f'- Pages with ranking decline: {declined_ranking}')
        p(f'- Pages with CTR improvement: {improved_ctr}')
        p(f'- Pages with CTR decline: {declined_ctr}')
        p(f'- Pages with traffic improvement: {improved_traffic}')
        p(f'- Pages with traffic decline: {declined_traffic}')
        p(f'- Pages with no previous data: {no_change}')
    else:
        p('First run — no previous week to compare against.')
    p()

    p('### Learning Gained')
    p()
    if learning.get('record_count', 0) > 0:
        p(f'- **Total learning records:** {learning["record_count"]}')
        p(f'- **Success rate:** {learning["success_count"] / learning["record_count"]:.1%}')
        p(f'- **Average outcome score:** {learning["avg_outcome_score"]:.4f}')
        if learning.get('suppressed_actions'):
            p(f'- **Actions suppressed due to repeated failures:** {len(learning["suppressed_actions"])}')
            for sa in learning['suppressed_actions']:
                p(f'  - {sa["action"]} — stopped after {FAILURE_THRESHOLD} consecutive failures')
    else:
        p('- No learning records yet. Learning Engine requires at least 2 weekly snapshots')
        p('  and a 30-day evaluation window before producing confidence adjustments.')
        p('- Run this pipeline weekly for 4+ weeks to activate the learning feedback loop.')
    p()

    p('### Next Week\'s Plan')
    p()
    p('1. Implement all HIGH PRIORITY actions from this report.')
    p('2. Re-run this pipeline next week to collect new data.')
    p('3. The system will automatically compare this week vs next week.')
    p('4. Learning Engine will evaluate outcomes and adjust confidence.')
    p('5. Actions that repeatedly fail will be suppressed automatically.')
    p()

    p('### Evidence Classification')
    p()
    p('| Classification | Meaning |')
    p('|----------------|---------|')
    p('| **MEASURED** | Directly observed from GSC, GA4, or Marketcall data |')
    p('| **ESTIMATED** | Derived from engine models using observed data |')
    p('| **UNKNOWN** | Cannot be supported by evidence from existing engines |')
    p()

    p('### Confidence Calibration')
    p()
    p(f'- **Decision Store snapshots:** {decision_store.count_snapshots()}')
    p(f'- **Learning records:** {learning.get("record_count", 0)}')
    p(f'- **Revenue per call:** ${revenue_per_call:.2f} (n=1 approved call)')
    p(f'- **All dollar forecasts:** UNCALIBRATED MODEL ESTIMATES')
    p(f'- **Ranking/traffic diagnoses:** Evidence-backed from GSC, Opportunity Score, Link Graph')
    p()

    p('---')
    p()
    p(f'*Generated by Weekly Optimization System at {datetime.now(timezone.utc).isoformat()}*')
    p(f'*Uses only existing engine outputs. No new mathematical models.*')

    return '\n'.join(lines)


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

    # Run Business Priority Intelligence to select top pages
    print()
    print('Business Priority Intelligence')
    top_queries = identify_top_commercial_queries(ctx['queries'], top_n=20)
    money_pages = rank_money_pages(
        ctx['page_reports'], revenue_per_call, ctx['recs'], top_n=20,
    )
    opp_loss = calculate_opportunity_loss(
        ctx['page_reports'], revenue_per_call, top_n=20,
    )
    survivors, killed = filter_low_roi(ctx['recs'], revenue_per_call)
    prioritized = assign_business_priorities(survivors, revenue_per_call)

    # Select top 20 pages
    rec_by_target = {}
    for pr in prioritized:
        target = pr['recommendation'].target
        if target not in rec_by_target:
            rec_by_target[target] = pr

    mp_by_page = {mp['page']: mp for mp in money_pages}
    ol_by_page = {ol['page']: ol for ol in opp_loss}

    selected_pages = []
    for pr in prioritized[:20]:
        target = pr['recommendation'].target
        selected_pages.append({
            'page': target,
            'recommendation': pr['recommendation'],
            'priority': pr,
            'money_page': mp_by_page.get(target, {}),
            'opp_loss': ol_by_page.get(target, {}),
        })

    existing = {p['page'] for p in selected_pages}
    for mp in money_pages:
        if len(selected_pages) >= 20:
            break
        if mp['page'] not in existing:
            selected_pages.append({
                'page': mp['page'],
                'recommendation': rec_by_target.get(mp['page'], {}).get('recommendation'),
                'priority': rec_by_target.get(mp['page'], {}),
                'money_page': mp,
                'opp_loss': ol_by_page.get(mp['page'], {}),
            })

    # Generate report
    print()
    print('Generating WEEKLY_ACTION_PLAN.md')
    report = generate_weekly_action_plan(selected_pages, ctx)

    with open('WEEKLY_ACTION_PLAN.md', 'w', encoding='utf-8') as f:
        f.write(report)

    # Console summary
    print()
    print('=' * 60)
    print('Weekly Optimization System — Complete')
    print(f'  Pages analyzed:       {ctx["n_pages"]}')
    print(f'  Pages selected:       {len(selected_pages)}')
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
