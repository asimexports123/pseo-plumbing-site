#!/usr/bin/env python3
"""
URL Prioritization Engine.

The Decision Engine is NOT an SEO content generator.
It is NOT an LLM.
It does NOT determine whether a title, meta description, H1, FAQ, schema,
or content is "good" or "bad" — it has no objective evidence to prove that.

The engine reports ONLY measurable facts:

  - URL
  - Impressions
  - Clicks
  - CTR
  - Average Position
  - Sessions
  - Engagement
  - Calls
  - Revenue
  - Opportunity Score
  - Bayesian Confidence
  - Forecast
  - Learning History
  - Weekly Movement

Then classifies every URL into one category:

  - Strong Performer
  - Stable Performer
  - Underperforming
  - High Opportunity
  - Monitor

For Underperforming or High Opportunity URLs, provides ONLY measurable reasons:

  - Low CTR
  - Low Position
  - High Impressions
  - Zero Clicks
  - Low Engagement
  - Zero Calls
  - Weak Internal Link Graph
  - Low Business Value
  - Large Opportunity Gap

Does NOT say: rewrite title, rewrite H1, rewrite content, rewrite FAQ,
improve schema, improve entities.

Instead outputs: "SEO Review Required"

The human SEO workflow decides HOW to improve the page.
The engine only decides WHICH pages deserve attention and WHY based on evidence.

Output: URL_ACTION_PLAN.md — a prioritization system, not a content generation system.

No new engines. No new mathematical models. Uses only existing engine outputs.
"""
import sys, io
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from datetime import datetime, timezone

from . import config
from . import marketcall_ingestion, ga4_ingestion
from .attribution_engine import (
    AttributionResolver, evidence_from_gsc_page,
    evidence_from_marketcall_campaign, evidence_from_ga4_page,
)
from .data_ingestion import load_gsc_page_report_from_csv, build_hierarchy_graph, ROOT_NODE, infer_taxonomy
from .opportunity_score import score_records
from .graph_engine import pagerank, orphan_nodes, weakly_connected_components
from .bayesian_engine import BayesianEngine, posterior_from_counts
from .link_ingestion import build_real_link_graph, diff_with_hierarchy
from .recommendation_engine import generate_recommendations
from . import learning_engine
from . import gott_engine
from .markov_engine import analyze_funnel
from .business_priority import (
    load_gsc_queries, identify_top_commercial_queries,
    rank_money_pages, calculate_opportunity_loss,
    filter_low_roi, assign_business_priorities,
)
from .execution_layer import _get_service_info, _extract_city


# ============================================================
# URL Classification
# ============================================================

def _classify_url(page_id, ctx):
    """
    Classify a URL into exactly one category based on measurable evidence.

    - Strong Performer: High impressions, high CTR, good position, clicks > 0
    - Stable Performer: Moderate metrics, no major issues, consistent performance
    - Underperforming: Has impressions but zero/near-zero clicks, poor CTR, poor position
    - High Opportunity: Large opportunity gap score, high impressions, underutilized
    - Monitor: New page, low data, or no significant signal
    """
    raw = ctx['raw_metrics'].get(page_id, {})
    impressions = raw.get('impressions', 0)
    clicks = raw.get('clicks', 0)
    ctr = raw.get('ctr', 0.0)
    position = raw.get('position')

    opp = ctx.get('opp_by_id', {}).get(page_id)
    opp_gap = opp.opportunity_gap_score if opp and opp.opportunity_gap_score is not None else 0
    perf_score = opp.performance_score if opp and opp.performance_score is not None else 0

    posterior = ctx['posteriors'].get(page_id)
    posterior_mean = posterior.mean if posterior else 0

    gm = ctx['graph_metrics'].get(page_id, {})
    pagerank_val = gm.get('pagerank', 0.0)
    in_degree = gm.get('in_degree', 0)

    tp = ctx.get('temporal_priors', {}).get(page_id)
    page_age = 0
    maturity = 0
    if tp:
        maturity = tp.maturity_score if hasattr(tp, 'maturity_score') else tp.get('maturity_score', 0)
        page_age = tp.page_age_days if hasattr(tp, 'page_age_days') else tp.get('page_age_days', 0)

    # Monitor: very young or very low data
    if impressions < 10 or (page_age < 7 and impressions < 50):
        return 'Monitor'

    # Strong Performer: good CTR, good position, has clicks
    if clicks > 0 and ctr > 0.01 and (position is None or position < 20):
        if perf_score > 0.6:
            return 'Strong Performer'

    # High Opportunity: large opportunity gap, high impressions, but underperforming
    if opp_gap > 0.6 and impressions > 100:
        return 'High Opportunity'

    # Underperforming: has impressions but zero clicks or very low CTR
    if impressions > 50 and (clicks == 0 or ctr < 0.005):
        return 'Underperforming'

    # Stable Performer: moderate metrics, no major red flags
    if impressions > 10 and clicks >= 0:
        if perf_score > 0.3 and perf_score <= 0.6:
            return 'Stable Performer'

    # Default: Monitor
    return 'Monitor'


# ============================================================
# Measurable Reasons (Root Cause Analysis)
# ============================================================

def _root_cause_analysis(page_id, ctx):
    """
    Identify ONLY measurable reasons for underperformance.
    Every reason backed by engine evidence.
    No content quality judgments. No SEO advice.
    """
    reasons = []

    raw = ctx['raw_metrics'].get(page_id, {})
    impressions = raw.get('impressions', 0)
    clicks = raw.get('clicks', 0)
    ctr = raw.get('ctr', 0.0)
    position = raw.get('position')

    # Compute site medians for comparison
    all_ctr = [p.get('ctr', 0) for p in ctx['raw_metrics'].values() if p.get('ctr', 0) > 0]
    site_median_ctr = sorted(all_ctr)[len(all_ctr) // 2] if all_ctr else 0
    all_pos = [p.get('position') for p in ctx['raw_metrics'].values() if p.get('position')]
    site_median_pos = sorted(all_pos)[len(all_pos) // 2] if all_pos else None
    all_pr = [gm.get('pagerank', 0) for gm in ctx['graph_metrics'].values()]
    site_median_pr = sorted(all_pr)[len(all_pr) // 2] if all_pr else 0

    # --- Zero Clicks ---
    if clicks == 0 and impressions > 0:
        reasons.append({
            'reason': 'Zero Clicks',
            'evidence': f'GSC: {impressions:,} impressions, 0 clicks',
            'engine': 'GSC',
            'severity': 'HIGH',
        })

    # --- Low CTR ---
    if ctr > 0 and ctr < site_median_ctr * 0.5 and impressions > 50:
        reasons.append({
            'reason': 'Low CTR',
            'evidence': f'GSC: CTR={ctr:.4%}, site median CTR={site_median_ctr:.4%}',
            'engine': 'GSC',
            'severity': 'HIGH',
        })

    # --- Low Position ---
    if position is not None and position > 30 and impressions > 10:
        reasons.append({
            'reason': 'Low Position',
            'evidence': f'GSC: avg_position={position:.1f}, site median={site_median_pos:.1f}' if site_median_pos else f'GSC: avg_position={position:.1f}',
            'engine': 'GSC',
            'severity': 'MEDIUM',
        })

    # --- High Impressions (with zero/near-zero clicks = wasted opportunity) ---
    if impressions > 500 and clicks <= 2:
        reasons.append({
            'reason': 'High Impressions',
            'evidence': f'GSC: {impressions:,} impressions, {clicks} clicks — large impression volume with minimal click capture',
            'engine': 'GSC',
            'severity': 'MEDIUM',
        })

    # --- Low Engagement ---
    ga4 = ctx.get('ga4') or {}
    ga4_page = ga4.get(page_id, {})
    sessions = ga4_page.get('sessions', 0)
    engagement_rate = ga4_page.get('engagement_rate')
    if sessions > 0 and engagement_rate is not None and engagement_rate < 0.4:
        reasons.append({
            'reason': 'Low Engagement',
            'evidence': f'GA4: sessions={sessions}, engagement_rate={engagement_rate:.4f}',
            'engine': 'GA4',
            'severity': 'MEDIUM',
        })

    # --- Zero Calls (campaign-level, noted as site-wide) ---
    marketcall = ctx.get('marketcall') or {}
    total_calls = marketcall.get('calls', 0)
    if total_calls == 0:
        reasons.append({
            'reason': 'Zero Calls',
            'evidence': 'Marketcall: 0 calls in current period (campaign-level, not per-page)',
            'engine': 'Marketcall',
            'severity': 'HIGH',
        })

    # --- Weak Internal Link Graph ---
    gm = ctx['graph_metrics'].get(page_id, {})
    is_orphan = gm.get('is_orphan', False)
    in_degree = gm.get('in_degree', 0)
    pagerank_val = gm.get('pagerank', 0.0)
    if is_orphan or (in_degree <= 1 and impressions > 0):
        reasons.append({
            'reason': 'Weak Internal Link Graph',
            'evidence': f'Link Graph: is_orphan={is_orphan}, in_degree={in_degree}, PageRank={pagerank_val:.6f}',
            'engine': 'Link Graph',
            'severity': 'MEDIUM',
        })
    elif pagerank_val < site_median_pr * 0.5 and impressions > 10:
        reasons.append({
            'reason': 'Weak Internal Link Graph',
            'evidence': f'Link Graph: PageRank={pagerank_val:.6f}, site median={site_median_pr:.6f}',
            'engine': 'Link Graph',
            'severity': 'LOW',
        })

    # --- Low Business Value ---
    rec = None
    for r in ctx.get('recs', []):
        if r.target == page_id:
            rec = r
            break
    if rec and rec.business_value_score is not None and rec.business_value_score < 1.0:
        reasons.append({
            'reason': 'Low Business Value',
            'evidence': f'Recommendation Engine: business_value_score={rec.business_value_score:.4f}',
            'engine': 'Business Priority',
            'severity': 'LOW',
        })

    # --- Large Opportunity Gap ---
    opp = ctx.get('opp_by_id', {}).get(page_id)
    if opp and opp.opportunity_gap_score is not None and opp.opportunity_gap_score > 0.6:
        reasons.append({
            'reason': 'Large Opportunity Gap',
            'evidence': f'Opportunity Score: gap={opp.opportunity_gap_score:.4f}, performance={opp.performance_score:.4f}' if opp.performance_score is not None else f'Opportunity Score: gap={opp.opportunity_gap_score:.4f}',
            'engine': 'Opportunity Score',
            'severity': 'MEDIUM',
        })

    # Sort by severity
    severity_order = {'HIGH': 0, 'MEDIUM': 1, 'LOW': 2}
    reasons.sort(key=lambda b: severity_order.get(b['severity'], 3))

    return reasons


# ============================================================
# Forecast for Page
# ============================================================

def _page_forecast(page_id, rec, ctx):
    """Extract forecast data from recommendation expected_impact."""
    if not rec:
        return None

    impact = rec.expected_impact or {}
    if 'note' in impact and not impact.get('expected_calls'):
        return {
            'classification': 'UNKNOWN',
            'note': impact['note'],
            'expected_calls': 'UNKNOWN',
            'expected_revenue': 'UNKNOWN',
            'confidence': 'UNKNOWN',
        }

    return {
        'classification': 'ESTIMATED',
        'expected_calls': impact.get('expected_calls', 'UNKNOWN'),
        'expected_revenue': impact.get('expected_revenue', 'UNKNOWN'),
        'calls_ci_low': impact.get('calls_ci_low', 'UNKNOWN'),
        'calls_ci_high': impact.get('calls_ci_high', 'UNKNOWN'),
        'revenue_ci_low': impact.get('revenue_ci_low', 'UNKNOWN'),
        'revenue_ci_high': impact.get('revenue_ci_high', 'UNKNOWN'),
        'confidence': rec.confidence,
        'confidence_basis': 'Bayesian posterior precision (uncalibrated against outcomes)',
    }


# ============================================================
# URL Action Plan Report Generator
# ============================================================

def generate_url_action_plan(selected_pages, ctx):
    """Generate URL_ACTION_PLAN.md — a prioritization report, not a content generation system."""
    lines = []

    def p(s=''):
        lines.append(s)

    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    revenue_per_call = ctx.get('revenue_per_call') or 0

    p(f'# URL Prioritization Report — {today}')
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
    p(f'- **Pages analyzed:** {ctx["n_pages"]}')
    p(f'- **Pages selected for prioritization:** {len(selected_pages)}')
    p(f'- **Revenue per approved call:** ${revenue_per_call:.2f} (MEASURED, n=1)')
    p()

    # Classification Summary
    classifications = {}
    for pd in selected_pages:
        cls = _classify_url(pd['page'], ctx)
        classifications[pd['page']] = cls
    cls_counts = {}
    for c in classifications.values():
        cls_counts[c] = cls_counts.get(c, 0) + 1

    p('### URL Classification Summary')
    p()
    p('| Classification | Count |')
    p('|----------------|-------|')
    for cls in ['Strong Performer', 'Stable Performer', 'Underperforming', 'High Opportunity', 'Monitor']:
        p(f'| {cls} | {cls_counts.get(cls, 0)} |')
    p()

    # Markov Funnel (site-level)
    marketcall = ctx.get('marketcall') or {}
    total_imp = sum(r.get('impressions', 0) for r in ctx['raw_metrics'].values())
    total_clicks = sum(r.get('clicks', 0) for r in ctx['raw_metrics'].values())
    total_calls = marketcall.get('calls', 0)
    approved_calls = marketcall.get('approved_calls', 0)

    if total_imp > 0 and total_clicks > 0:
        p('### Site-Level Funnel (Markov Engine)')
        p()
        stage_counts = [
            ('impression', total_imp),
            ('click', total_clicks),
        ]
        if total_calls > 0:
            stage_counts.append(('call', total_calls))
            if approved_calls > 0:
                stage_counts.append(('approved_call', approved_calls))
        try:
            funnel = analyze_funnel(stage_counts)
            p(f'- **Impressions → Clicks:** {funnel.transition_matrix[0].p:.6f} ({total_imp:,} → {total_clicks})')
            p(f'  - Drop-off rate: {funnel.drop_off[0].drop_off_rate:.4%} ({funnel.drop_off[0].absolute_loss:.0f} lost)')
            if len(funnel.transition_matrix) > 1:
                p(f'- **Clicks → Calls:** {funnel.transition_matrix[1].p:.6f} ({total_clicks} → {total_calls})')
                p(f'  - Drop-off rate: {funnel.drop_off[1].drop_off_rate:.4%} ({funnel.drop_off[1].absolute_loss:.0f} lost)')
            if len(funnel.transition_matrix) > 2:
                p(f'- **Calls → Approved:** {funnel.transition_matrix[2].p:.6f} ({total_calls} → {approved_calls})')
                p(f'  - Drop-off rate: {funnel.drop_off[2].drop_off_rate:.4%} ({funnel.drop_off[2].absolute_loss:.0f} lost)')
            p(f'- **End-to-end conversion:** {funnel.expected_conversion_path:.8f}')
            p(f'- **Highest loss step (by rate):** {funnel.highest_loss_step_by_rate.from_stage} → {funnel.highest_loss_step_by_rate.to_stage} ({funnel.highest_loss_step_by_rate.drop_off_rate:.4%})')
            p()
        except (ValueError, IndexError):
            p('Funnel analysis not available — insufficient stage data.')
            p()

    p('---')
    p()

    # Per-Page Reports
    p('## Per-Page Prioritization')
    p()
    p('Pages ordered by Business Priority Intelligence ROI ranking.')
    p()

    for i, page_data in enumerate(selected_pages, 1):
        page_id = page_data['page']
        rec = page_data.get('recommendation')
        money_page = page_data.get('money_page', {})
        opp_loss = page_data.get('opp_loss', {})
        priority = page_data.get('priority', {})

        raw = ctx['raw_metrics'].get(page_id, {})
        impressions = raw.get('impressions', 0)
        clicks = raw.get('clicks', 0)
        ctr = raw.get('ctr', 0.0)
        position = raw.get('position')

        classification = classifications.get(page_id, 'Monitor')

        p(f'### {i}. `{page_id}`')
        p()
        p(f'**Classification: {classification}**')
        p()

        # Measurable Facts Table
        p('#### Measurable Facts')
        p()
        p(f'| Metric | Value | Source |')
        p(f'|--------|-------|--------|')
        p(f'| URL | `{page_id}` | — |')
        p(f'| Impressions | {impressions:,} | GSC |')
        p(f'| Clicks | {clicks} | GSC |')
        p(f'| CTR | {ctr:.4%} | GSC |')
        pos_str = f'{position:.1f}' if position else 'N/A'
        p(f'| Average Position | {pos_str} | GSC |')

        ga4 = ctx.get('ga4') or {}
        ga4_page = ga4.get(page_id, {})
        sessions = ga4_page.get('sessions', 'N/A')
        engagement_rate = ga4_page.get('engagement_rate')
        eng_str = f'{engagement_rate:.4f}' if engagement_rate is not None else 'N/A'
        p(f'| Sessions | {sessions} | GA4 |')
        p(f'| Engagement Rate | {eng_str} | GA4 |')

        marketcall = ctx.get('marketcall') or {}
        p(f'| Calls (campaign) | {marketcall.get("calls", "N/A")} | Marketcall |')
        p(f'| Revenue (campaign) | ${marketcall.get("revenue", 0):.2f} | Marketcall |')

        opp = ctx.get('opp_by_id', {}).get(page_id)
        if opp:
            gap_str = f'{opp.opportunity_gap_score:.4f}' if opp.opportunity_gap_score is not None else 'N/A'
            perf_str = f'{opp.performance_score:.4f}' if opp.performance_score is not None else 'N/A'
            p(f'| Opportunity Score | gap={gap_str}, perf={perf_str} | Opportunity Engine |')

        posterior = ctx['posteriors'].get(page_id)
        if posterior:
            p(f'| Bayesian Confidence | mean={posterior.mean:.6f}, CI=[{posterior.ci_low:.6f}, {posterior.ci_high:.6f}], n={posterior.n_obs} | Bayesian |')

        tp = ctx.get('temporal_priors', {}).get(page_id)
        if tp:
            maturity = tp.maturity_score if hasattr(tp, 'maturity_score') else tp.get('maturity_score', 0)
            page_age = tp.page_age_days if hasattr(tp, 'page_age_days') else tp.get('page_age_days', 0)
            p(f'| Page Age | {page_age} days | Gott |')
            p(f'| Maturity Score | {maturity:.4f} | Gott |')

        gm = ctx['graph_metrics'].get(page_id, {})
        p(f'| PageRank | {gm.get("pagerank", 0):.6f} | Link Graph |')
        p(f'| In-degree | {gm.get("in_degree", 0)} | Link Graph |')
        p(f'| Is Orphan | {gm.get("is_orphan", False)} | Link Graph |')
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
            conf = forecast.get('confidence', 'UNKNOWN')
            if isinstance(conf, float):
                p(f'| Confidence | {conf:.1%} | — |')
            else:
                p(f'| Confidence | UNKNOWN | — |')
        else:
            p('No forecast available — no recommendation for this page.')
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
            p(f'| Lost Clicks | {money_page.get("lost_clicks", 0):,} |')
            p(f'| Lost Calls | {money_page.get("lost_calls", 0)} |')
        if priority:
            p(f'| Revenue Priority | {priority.get("revenue_priority", "?")}/5 |')
            p(f'| Call Priority | {priority.get("call_priority", "?")}/5 |')
            p(f'| Traffic Priority | {priority.get("traffic_priority", "?")}/5 |')
            p(f'| Engineering Priority | {priority.get("engineering_priority", "?")}/5 |')
            p(f'| Overall ROI | {priority.get("overall_roi_percent", 0):.1f}% |')
        p()

        # Measurable Reasons (only for Underperforming / High Opportunity)
        if classification in ('Underperforming', 'High Opportunity'):
            reasons = _root_cause_analysis(page_id, ctx)
            p('#### Measurable Reasons')
            p()
            p('Every reason is backed by engine evidence. No content quality judgments.')
            p()
            for r in reasons:
                p(f'- **[{r["severity"]}] {r["reason"]}**')
                p(f'  - Evidence: `{r["evidence"]}`')
                p(f'  - Engine: {r["engine"]}')
            p()

            p('#### Action')
            p()
            p('**SEO Review Required**')
            p()
            p('The engine has identified this page as underperforming based on measurable evidence.')
            p('The human SEO workflow must decide how to improve this page.')
            p('The engine does not prescribe specific content changes.')
            p()
        elif classification in ('Strong Performer', 'Stable Performer'):
            p('#### Measurable Reasons')
            p()
            p('No significant performance issues detected by engine evidence.')
            p()
            p('#### Action')
            p()
            p('**No action required** — page is performing well based on measurable metrics.')
            p()
        else:
            p('#### Measurable Reasons')
            p()
            p('Insufficient data for root cause analysis — page is new or has very low impression volume.')
            p()
            p('#### Action')
            p()
            p('**Monitor** — continue tracking. Re-evaluate when more data is available.')
            p()

        p('---')
        p()

    # Summary
    p('## Summary')
    p()
    p(f'- **Pages analyzed:** {ctx["n_pages"]}')
    p(f'- **Pages selected:** {len(selected_pages)}')
    p(f'- **Strong Performer:** {cls_counts.get("Strong Performer", 0)}')
    p(f'- **Stable Performer:** {cls_counts.get("Stable Performer", 0)}')
    p(f'- **Underperforming:** {cls_counts.get("Underperforming", 0)}')
    p(f'- **High Opportunity:** {cls_counts.get("High Opportunity", 0)}')
    p(f'- **Monitor:** {cls_counts.get("Monitor", 0)}')
    p()

    p('### What This Report Does')
    p()
    p('- Reports measurable facts for every URL (impressions, clicks, CTR, position, etc.)')
    p('- Classifies every URL into one performance category')
    p('- Identifies measurable reasons for underperformance (backed by engine evidence)')
    p('- Prioritizes pages by business value (ROI, revenue opportunity, call opportunity)')
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
    p(f'*Generated by URL Prioritization Engine at {datetime.now(timezone.utc).isoformat()}*')
    p(f'*Uses only existing engine outputs. No new mathematical models.*')

    return '\n'.join(lines)


# ============================================================
# Pipeline (reuses existing engines — same as business_priority.py)
# ============================================================

def _run_pipeline():
    ctx = {}
    ctx['snapshot_date'] = datetime.now(timezone.utc).strftime('%Y-%m-%d')

    page_reports = load_gsc_page_report_from_csv()
    ctx['page_reports'] = page_reports
    ctx['n_pages'] = len(page_reports)
    ctx['raw_metrics'] = {p['page']: p for p in page_reports}

    ctx['queries'] = load_gsc_queries()

    ctx['marketcall'] = None
    ctx['revenue_per_call'] = None
    if config.is_enabled('marketcall'):
        m = marketcall_ingestion.load_marketcall_metrics()
        ctx['marketcall'] = m
        if m:
            ctx['revenue_per_call'] = m.get('revenue_per_approved_call')

    ctx['ga4'] = None
    if config.is_enabled('ga4'):
        ctx['ga4'] = ga4_ingestion.load_ga4_page_metrics()

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
        if m:
            ar.add_evidence(
                evidence_from_marketcall_campaign(m['campaign_id'], m)
            )
        ctx['attribution'] = ar

    ctx['opp_results'] = []
    ctx['opp_by_id'] = {}
    if config.is_enabled('opportunity_score'):
        records = [
            {'page': p['page'], 'impressions': p.get('impressions', 0),
             'ctr': p.get('ctr', 0.0), 'avg_position': p.get('position')}
            for p in page_reports
        ]
        ctx['opp_results'] = score_records(records)
        ctx['opp_by_id'] = {r.record_id: r for r in ctx['opp_results']}

    ctx['graph_metrics'] = {}
    ctx['weak_components'] = []
    ctx['taxonomy_orphans'] = set()
    if config.is_enabled('graph'):
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

    ctx['real_link_graph_metrics'] = {}
    if config.is_enabled('link_graph'):
        rg = build_real_link_graph()
        ctx['real_link_graph_metrics'] = diff_with_hierarchy(
            rg, ctx['taxonomy_orphans'], [p['page'] for p in page_reports],
        )

    ctx['posteriors'] = {}
    if config.is_enabled('bayesian'):
        eng = BayesianEngine()
        for page in page_reports:
            imp = page.get('impressions', 0)
            clk = page.get('clicks', 0)
            if imp > 0:
                eng.observe(page['page'], successes=min(clk, imp), trials=imp)
        ctx['posteriors'] = {k: eng.get_posterior(k) for k in eng.all_keys()}

    ctx['temporal_priors'] = {}
    if config.is_enabled('gott'):
        ctx['temporal_priors'] = gott_engine.compute_all_temporal_priors()

    ctx['learned_adjustments'] = {}
    if config.is_enabled('learning'):
        learning_engine.evaluate_all_learning()
        ls = learning_engine.get_learning_summary()
        ctx['learned_adjustments'] = ls.adjustments

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

    return ctx


# ============================================================
# Main
# ============================================================

def run():
    ctx = _run_pipeline()
    revenue_per_call = ctx.get('revenue_per_call') or 0

    # Run Business Priority Intelligence to select top pages
    top_queries = identify_top_commercial_queries(ctx['queries'], top_n=20)
    money_pages = rank_money_pages(
        ctx['page_reports'], revenue_per_call, ctx['recs'], top_n=20,
    )
    opp_loss = calculate_opportunity_loss(
        ctx['page_reports'], revenue_per_call, top_n=20,
    )
    survivors, killed = filter_low_roi(ctx['recs'], revenue_per_call)
    prioritized = assign_business_priorities(survivors, revenue_per_call)

    # Select pages: top 20 from prioritized recommendations
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
    report = generate_url_action_plan(selected_pages, ctx)

    with open('URL_ACTION_PLAN.md', 'w', encoding='utf-8') as f:
        f.write(report)

    # Console summary
    print('URL Prioritization Engine — Complete')
    print(f'  Pages analyzed:       {ctx["n_pages"]}')
    print(f'  Pages selected:       {len(selected_pages)}')
    print(f'  Recommendations:      {len(ctx["recs"])}')
    print(f'  Killed (low ROI):     {len(killed)}')
    print(f'  Active (survivors):   {len(survivors)}')
    print(f'  Revenue per call:     ${revenue_per_call:.2f}')
    print()
    print(f'  Top 5 Pages (by ROI):')
    for i, pd in enumerate(selected_pages[:5], 1):
        pr = pd.get('priority', {})
        roi = pr.get('overall_roi_percent', 0)
        cls = _classify_url(pd['page'], ctx)
        print(f'    {i}. {pd["page"][:50]} | ROI: {roi:.1f}% | {cls}')
    print()
    print('  Output: URL_ACTION_PLAN.md')


if __name__ == '__main__':
    run()
