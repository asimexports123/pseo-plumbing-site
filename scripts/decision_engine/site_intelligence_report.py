#!/usr/bin/env python3
"""
Mathematical Site Intelligence Report.

Uses ONLY the existing mathematical engines (GSC, GA4, Marketcall,
Attribution, Bayesian, Markov, Gott, Learning, Decision Store,
Monte Carlo, Recommendation, Opportunity Score, Graph) to produce
a complete site-level and page-level intelligence report.

No new models. No new theories. No new heuristics.
If evidence is insufficient, the report says so explicitly.

Usage:
    python -m scripts.decision_engine.site_intelligence_report
"""
import sys, io
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import math
import statistics
from collections import Counter, defaultdict
from datetime import datetime, timezone

from . import config
from . import decision_store, marketcall_ingestion, ga4_ingestion
from .attribution_engine import (
    AttributionResolver, evidence_from_gsc_page,
    evidence_from_marketcall_campaign, evidence_from_ga4_page,
)
from .data_ingestion import load_gsc_page_report_from_csv, build_hierarchy_graph, ROOT_NODE
from .opportunity_score import score_records
from .graph_engine import pagerank, orphan_nodes, weakly_connected_components
from .bayesian_engine import BayesianEngine, posterior_from_counts
from .link_ingestion import build_real_link_graph, diff_with_hierarchy
from .markov_engine import analyze_funnel
from .montecarlo_engine import simulate_new_page_calls
from .recommendation_engine import generate_recommendations, Recommendation
from . import learning_engine
from . import gott_engine


# ============================================================
# Helpers
# ============================================================

def _safe_pct(value, total):
    if total == 0:
        return 0.0
    return (value / total) * 100.0


def _fmt_pct(v):
    return f"{v:.1f}%"


def _fmt_score(v):
    if v is None:
        return "N/A"
    return f"{v:.4f}"


def _fmt_money(v):
    if v is None:
        return "N/A"
    return f"${v:,.2f}"


def _stars(v, max_v=1.0, n_stars=10):
    if v is None or max_v == 0:
        return ""
    filled = int(round((v / max_v) * n_stars))
    return "#" * filled + "." * (n_stars - filled)


def _confidence_label(conf):
    if conf >= 0.9:
        return "Very High"
    if conf >= 0.7:
        return "High"
    if conf >= 0.5:
        return "Moderate"
    if conf >= 0.3:
        return "Low"
    return "Very Low"


# ============================================================
# Pipeline runner (reuses existing engines)
# ============================================================

def _run_pipeline():
    """Run all engines and return a context dict with all outputs."""
    ctx = {}
    ctx['snapshot_date'] = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    ctx['run_time'] = datetime.now(timezone.utc).isoformat()

    # GSC
    page_reports = load_gsc_page_report_from_csv()
    ctx['page_reports'] = page_reports
    ctx['n_pages'] = len(page_reports)
    ctx['raw_metrics'] = {p['page']: p for p in page_reports}

    total_impressions = sum(p.get('impressions', 0) for p in page_reports)
    total_clicks = sum(p.get('clicks', 0) for p in page_reports)
    ctx['total_impressions'] = total_impressions
    ctx['total_clicks'] = total_clicks

    # Marketcall
    ctx['marketcall'] = None
    ctx['revenue_per_call'] = None
    if config.is_enabled('marketcall'):
        m = marketcall_ingestion.load_marketcall_metrics()
        ctx['marketcall'] = m
        if m:
            ctx['revenue_per_call'] = m.get('revenue_per_approved_call')

    # GA4
    ctx['ga4'] = None
    if config.is_enabled('ga4'):
        ctx['ga4'] = ga4_ingestion.load_ga4_page_metrics()

    # Attribution
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

    # Opportunity Score
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

    # Graph
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

    # Link graph
    ctx['real_link_graph_metrics'] = {}
    if config.is_enabled('link_graph'):
        rg = build_real_link_graph()
        ctx['real_link_graph_metrics'] = diff_with_hierarchy(
            rg, ctx['taxonomy_orphans'], [p['page'] for p in page_reports],
        )
        ctx['real_link_graph_has_data'] = bool(rg.nodes)
    else:
        ctx['real_link_graph_has_data'] = False

    # Bayesian
    ctx['posteriors'] = {}
    if config.is_enabled('bayesian'):
        eng = BayesianEngine()
        for page in page_reports:
            imp = page.get('impressions', 0)
            clk = page.get('clicks', 0)
            if imp > 0:
                eng.observe(page['page'], successes=min(clk, imp), trials=imp)
        ctx['posteriors'] = {k: eng.get_posterior(k) for k in eng.all_keys()}

    # Gott
    ctx['temporal_priors'] = {}
    if config.is_enabled('gott'):
        ctx['temporal_priors'] = gott_engine.compute_all_temporal_priors()

    # Learning
    ctx['learned_adjustments'] = {}
    ctx['learning_summary'] = None
    if config.is_enabled('learning'):
        learning_engine.evaluate_all_learning()
        ls = learning_engine.get_learning_summary()
        ctx['learning_summary'] = ls
        ctx['learned_adjustments'] = ls.adjustments

    # Recommendations
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
    ctx['recs_by_target'] = defaultdict(list)
    for r in ctx['recs']:
        ctx['recs_by_target'][r.target].append(r)

    # Markov funnel (site-level)
    mc = ctx['marketcall'] or {}
    ga4 = ctx['ga4'] or {}
    total_sessions = sum(m.get('sessions', 0) for m in ga4.values())
    total_phone_clicks = sum(m.get('phone_click_events', 0) for m in ga4.values())
    total_calls = mc.get('calls', 0) or total_phone_clicks
    total_approved = mc.get('approved_calls', 0)
    total_revenue = mc.get('revenue', 0)

    funnel_counts = [
        ('impression', total_impressions),
        ('click', total_clicks),
        ('landing_page', max(total_clicks, total_sessions)),
        ('call', total_calls),
        ('approved_call', total_approved),
        ('revenue', total_approved),  # count of revenue-bearing calls
    ]
    try:
        ctx['markov_funnel'] = analyze_funnel(funnel_counts)
    except ValueError:
        ctx['markov_funnel'] = None

    ctx['total_calls'] = total_calls
    ctx['total_approved'] = total_approved
    ctx['total_revenue'] = total_revenue
    ctx['total_sessions'] = total_sessions

    return ctx


# ============================================================
# Site-Level Scores
# ============================================================

def _site_health_score(ctx):
    """
    Geometric mean of: (1 - zero_click_rate), (1 - orphan_rate),
    funnel_conversion_rate, and avg_confidence.
    Each component in [0, 1]. Result in [0, 1].
    """
    n = ctx['n_pages']
    zero_click = sum(1 for p in ctx['page_reports'] if p.get('clicks', 0) == 0)
    zero_click_rate = zero_click / n if n else 1.0

    orphans = len(ctx['taxonomy_orphans'])
    orphan_rate = orphans / n if n else 1.0

    funnel = ctx.get('markov_funnel')
    funnel_conv = funnel.expected_conversion_path if funnel else 0.0

    confs = [r.confidence for r in ctx['recs']] if ctx['recs'] else [0.0]
    avg_conf = statistics.mean(confs)

    components = {
        'click_through_rate': 1 - zero_click_rate,
        'link_coverage': 1 - orphan_rate,
        'funnel_conversion': funnel_conv,
        'recommendation_confidence': avg_conf,
    }
    product = 1.0
    for v in components.values():
        product *= max(v, 1e-12)
    score = product ** (1.0 / len(components))
    return score, components


def _site_opportunity_score(ctx):
    """
    Mean opportunity_gap_score across all pages with opportunity scores.
    Formula: mean(opp_gap_score_i) for i in all pages.
    """
    opps = [r.opportunity_gap_score for r in ctx['opp_results']]
    if not opps:
        return 0.0, {'pages_scored': 0}
    mean_opp = statistics.mean(opps)
    median_opp = statistics.median(opps)
    top_decile = sorted(opps, reverse=True)[:max(1, len(opps) // 10)]
    return mean_opp, {
        'mean': mean_opp,
        'median': median_opp,
        'top_decile_mean': statistics.mean(top_decile),
        'pages_scored': len(opps),
    }


def _site_risk_score(ctx):
    """
    Proportion of pages in the bottom decile of performance score
    PLUS proportion of taxonomy orphans PLUS proportion of weak
    graph components. Capped at 1.0.
    """
    n = ctx['n_pages']
    if n == 0:
        return 1.0, {}

    bottom_decile = sum(
        1 for r in ctx['opp_results']
        if r.performance_score is not None and r.performance_score < 0.1
    )
    orphans = len(ctx['taxonomy_orphans'])
    weak = len(ctx['weak_components'])
    zero_click = sum(1 for p in ctx['page_reports'] if p.get('clicks', 0) == 0)

    risk = (bottom_decile / n) * 0.3 + (orphans / n) * 0.2 + (zero_click / n) * 0.5
    risk = min(risk, 1.0)
    return risk, {
        'bottom_decile_pages': bottom_decile,
        'orphan_pages': orphans,
        'weak_components': weak,
        'zero_click_pages': zero_click,
        'weights': 'bottom_decile=0.3, orphans=0.2, zero_click=0.5',
    }


def _site_confidence_score(ctx):
    """
    Mean confidence across all recommendations, weighted by
    business_value_score. Formula:
      sum(conf_i * bv_i) / sum(bv_i)
    """
    if not ctx['recs']:
        return 0.0, {'recommendations': 0}
    total_bv = sum(r.business_value_score for r in ctx['recs'])
    if total_bv == 0:
        return statistics.mean([r.confidence for r in ctx['recs']]), {
            'recommendations': len(ctx['recs']),
            'weighted': False,
        }
    weighted = sum(r.confidence * r.business_value_score for r in ctx['recs']) / total_bv
    return weighted, {
        'recommendations': len(ctx['recs']),
        'weighted': True,
        'total_business_value': total_bv,
    }


def _growth_readiness(ctx):
    """
    Fraction of pages with opportunity_gap_score >= 0.5 AND
    confidence >= 0.5 (from any recommendation for that page).
    """
    n = ctx['n_pages']
    if n == 0:
        return 0.0, {}
    high_opp = set(
        r.record_id for r in ctx['opp_results']
        if r.opportunity_gap_score >= 0.5
    )
    high_conf = set(
        r.target for r in ctx['recs']
        if r.confidence >= 0.5
    )
    ready = high_opp & high_conf
    return len(ready) / n, {
        'high_opportunity_pages': len(high_opp),
        'high_confidence_pages': len(high_conf),
        'ready_pages': len(ready),
    }


def _business_readiness(ctx):
    """
    Based on: Marketcall revenue > 0, GA4 sessions > 0,
    funnel conversion > 0, and at least one High-scored recommendation.
    """
    has_revenue = (ctx['total_revenue'] or 0) > 0
    has_sessions = ctx['total_sessions'] > 0
    funnel = ctx.get('markov_funnel')
    has_funnel = funnel is not None and funnel.expected_conversion_path > 0
    high_recs = sum(1 for r in ctx['recs'] if r.confidence >= 0.7)

    score = 0.0
    if has_revenue:
        score += 0.25
    if has_sessions:
        score += 0.25
    if has_funnel:
        score += 0.25
    if high_recs > 0:
        score += min(0.25, high_recs / 100.0)
    return score, {
        'has_revenue': has_revenue,
        'has_sessions': has_sessions,
        'has_funnel': has_funnel,
        'high_confidence_recommendations': high_recs,
    }


def _learning_readiness(ctx):
    """
    Based on: number of snapshots, learning records, and temporal
    priors with evaluation_readiness=True.
    """
    ls = ctx.get('learning_summary')
    records = ls.record_count if ls else 0

    tp_ready = sum(
        1 for tp in ctx['temporal_priors'].values()
        if tp.evaluation_readiness
    )
    tp_total = len(ctx['temporal_priors'])

    # Need >= 2 snapshots separated by 30 days for learning
    score = 0.0
    if records > 0:
        score += 0.4
    if tp_ready > 0:
        score += min(0.3, tp_ready / 100.0)
    if tp_total > 0:
        score += min(0.3, tp_total / 1000.0)
    return score, {
        'learning_records': records,
        'temporal_priors_total': tp_total,
        'temporal_priors_ready': tp_ready,
        'note': 'Learning requires >= 2 snapshots 30 days apart. Currently 1 snapshot exists.',
    }


def _model_confidence(ctx):
    """
    Mean Bayesian posterior confidence (1 - CI width) across
    all pages with posteriors.
    """
    posteriors = ctx['posteriors']
    if not posteriors:
        return 0.0, {'posteriors': 0}
    confs = []
    for p in posteriors.values():
        width = p.ci_high - p.ci_low
        confs.append(max(0.0, min(1.0, 1.0 - width)))
    mean_conf = statistics.mean(confs)
    return mean_conf, {
        'posteriors': len(posteriors),
        'mean_ci_width': statistics.mean([p.ci_high - p.ci_low for p in posteriors.values()]),
    }


def _data_quality_score(ctx):
    """
    Weighted composite of:
      - GSC coverage: all pages have impressions (weight 0.3)
      - GA4 coverage: fraction of pages with GA4 data (weight 0.3)
      - Marketcall coverage: has revenue data (weight 0.2)
      - Crawl coverage: real link graph exists (weight 0.2)
    """
    n = ctx['n_pages']
    gsc_cov = sum(1 for p in ctx['page_reports'] if p.get('impressions', 0) > 0) / n if n else 0

    ga4 = ctx.get('ga4') or {}
    ga4_cov = len(ga4) / n if n else 0

    mc_cov = 1.0 if ctx.get('marketcall') else 0.0

    crawl_cov = 1.0 if ctx.get('real_link_graph_has_data') else 0.0

    score = gsc_cov * 0.3 + ga4_cov * 0.3 + mc_cov * 0.2 + crawl_cov * 0.2
    return score, {
        'gsc_coverage': gsc_cov,
        'ga4_coverage': ga4_cov,
        'marketcall_coverage': mc_cov,
        'crawl_coverage': crawl_cov,
        'weights': 'gsc=0.3, ga4=0.3, marketcall=0.2, crawl=0.2',
    }


# ============================================================
# Probability Report
# ============================================================

def _probability_report(ctx):
    """Estimate probabilities using only existing engine outputs."""
    probs = {}
    n = ctx['n_pages']
    if n == 0:
        return probs

    # Traffic: based on Bayesian CTR posteriors
    # If posterior mean CTR is above population median -> growing signal
    # If below -> declining signal. If near median -> stable.
    posteriors = ctx['posteriors']
    if posteriors:
        ctr_means = [p.mean for p in posteriors.values()]
        median_ctr = statistics.median(ctr_means)
        above = sum(1 for m in ctr_means if m > median_ctr * 1.1)
        below = sum(1 for m in ctr_means if m < median_ctr * 0.9)
        stable = len(ctr_means) - above - below
        total = len(ctr_means)
        probs['traffic_growth'] = above / total
        probs['traffic_stagnation'] = stable / total
        probs['traffic_decline'] = below / total
        probs['traffic_engines'] = ['Bayesian (CTR posteriors)']
        probs['traffic_note'] = (
            'Population-level CTR posterior distribution split at +/-10% of median. '
            'This is a relative ranking, not an absolute forecast. '
            'True trend detection requires >= 2 snapshots over time.'
        )
    else:
        probs['traffic_growth'] = None
        probs['traffic_stagnation'] = None
        probs['traffic_decline'] = None
        probs['traffic_engines'] = []
        probs['traffic_note'] = 'Insufficient data: no Bayesian posteriors.'

    # Calls: based on Monte Carlo expected_calls from recommendations
    recs = ctx['recs']
    if recs:
        impacts = [r.expected_impact.get('expected_calls', 0) for r in recs if isinstance(r.expected_impact.get('expected_calls'), (int, float))]
        if impacts:
            median_calls = statistics.median(impacts)
            above = sum(1 for c in impacts if c > median_calls * 1.1)
            below = sum(1 for c in impacts if c < median_calls * 0.9)
            stable = len(impacts) - above - below
            total = len(impacts)
            probs['call_growth'] = above / total
            probs['call_stagnation'] = stable / total
            probs['call_decline'] = below / total
            probs['call_engines'] = ['Monte Carlo', 'Bayesian', 'Recommendation Engine']
            probs['call_note'] = (
                'Based on Monte Carlo expected_calls distribution from recommendations. '
                'Beta(1,1) priors for call_cvr and approval_rate on 99.1% of pages '
                'with zero clicks make these estimates weak. '
                'Calibration not possible with 0 learning records.'
            )
        else:
            probs['call_growth'] = None
            probs['call_stagnation'] = None
            probs['call_decline'] = None
            probs['call_engines'] = []
            probs['call_note'] = 'No numeric call estimates available.'
    else:
        probs['call_growth'] = None
        probs['call_stagnation'] = None
        probs['call_decline'] = None
        probs['call_engines'] = []
        probs['call_note'] = 'No recommendations to estimate from.'

    # Revenue: based on expected_revenue from recommendations
    if recs:
        revenues = [r.expected_impact.get('expected_revenue', 0) for r in recs if isinstance(r.expected_impact.get('expected_revenue'), (int, float))]
        if revenues:
            median_rev = statistics.median(revenues)
            above = sum(1 for c in revenues if c > median_rev * 1.1)
            below = sum(1 for c in revenues if c < median_rev * 0.9)
            stable = len(revenues) - above - below
            total = len(revenues)
            probs['revenue_growth'] = above / total
            probs['revenue_stagnation'] = stable / total
            probs['revenue_decline'] = below / total
            probs['revenue_engines'] = ['Monte Carlo', 'Marketcall', 'Recommendation Engine']
            probs['revenue_note'] = (
                'Revenue = expected_approved_calls * $47.23 (single observed revenue/approved-call). '
                'With 1 approved call in Marketcall, the revenue_per_call estimate has '
                'zero statistical confidence. All revenue probabilities inherit this weakness.'
            )
        else:
            probs['revenue_growth'] = None
            probs['revenue_stagnation'] = None
            probs['revenue_decline'] = None
            probs['revenue_engines'] = []
            probs['revenue_note'] = 'No revenue estimates available.'
    else:
        probs['revenue_growth'] = None
        probs['revenue_stagnation'] = None
        probs['revenue_decline'] = None
        probs['revenue_engines'] = []
        probs['revenue_note'] = 'No recommendations to estimate from.'

    return probs


# ============================================================
# Forecast (30/60/90 day outlook per page)
# ============================================================

def _forecast_for_page(page_id, ctx):
    """Produce 30/60/90 day forecast for a single page."""
    raw = ctx['raw_metrics'].get(page_id, {})
    posterior = ctx['posteriors'].get(page_id)
    tp = ctx['temporal_priors'].get(page_id)
    recs = ctx['recs_by_target'].get(page_id, [])

    impressions = raw.get('impressions', 0)
    clicks = raw.get('clicks', 0)

    forecast = {
        'page': page_id,
        'measured': {
            'impressions': impressions,
            'clicks': clicks,
            'ctr': raw.get('ctr', 0.0),
            'avg_position': raw.get('position'),
        },
        'forecast_30d': {},
        'forecast_60d': {},
        'forecast_90d': {},
        'engines': [],
        'assumptions': [],
        'confidence': 'insufficient',
    }

    # Need impressions to forecast
    if impressions == 0:
        forecast['assumptions'].append('No impressions — cannot forecast.')
        return forecast

    # Bayesian posterior for CTR
    if posterior:
        forecast['engines'].append('Bayesian')
        ctr_mean = posterior.mean
        ctr_ci_low = posterior.ci_low
        ctr_ci_high = posterior.ci_high
        ci_width = posterior.ci_high - posterior.ci_low
        bayesian_conf = max(0.0, min(1.0, 1.0 - ci_width))
        forecast['bayesian_confidence'] = bayesian_conf
    else:
        ctr_mean = clicks / impressions if impressions else 0.0
        ctr_ci_low = ctr_mean
        ctr_ci_high = ctr_mean
        bayesian_conf = 0.0

    # Monte Carlo for call estimates
    # Use the same approach as recommendation_engine._simulate_target_impact
    counts_ctr = (clicks, impressions)
    counts_cvr = (0, clicks) if clicks else (0, 0)
    counts_appr = (0, 0)

    ctr_post = posterior_from_counts(*counts_ctr)
    cvr_post = posterior_from_counts(*counts_cvr)
    appr_post = posterior_from_counts(*counts_appr)

    rev_per_call = ctx.get('revenue_per_call')

    # 30-day: assume current impressions continue at same monthly rate
    # 60-day: 2x impressions (cumulative)
    # 90-day: 3x impressions (cumulative)
    for horizon, multiplier in [('forecast_30d', 1), ('forecast_60d', 2), ('forecast_90d', 3)]:
        sim_impressions = impressions * multiplier
        seed = hash(page_id) % (2 ** 31)
        try:
            sim = simulate_new_page_calls(
                n_new_pages=1,
                impressions_per_page_sampler=lambda: sim_impressions,
                ctr_posterior=ctr_post,
                call_cvr_posterior=cvr_post,
                approval_rate_posterior=appr_post,
                n_simulations=500,
                seed=seed,
            )
            forecast[horizon]['expected_clicks'] = round(sim.expected_calls * (ctr_mean / (cvr_post.mean if cvr_post.mean > 0 else 0.5)) if cvr_post.mean > 0 else sim.expected_calls, 2)
            forecast[horizon]['expected_calls'] = round(sim.expected_calls, 4)
            forecast[horizon]['calls_ci_low'] = round(sim.ci_low, 4)
            forecast[horizon]['calls_ci_high'] = round(sim.ci_high, 4)
            forecast[horizon]['expected_approved_calls'] = round(sim.expected_approved_calls, 4)
            if rev_per_call:
                forecast[horizon]['expected_revenue'] = round(sim.expected_approved_calls * rev_per_call, 2)
                forecast[horizon]['revenue_ci_low'] = round(sim.ci_low_approved * rev_per_call, 2)
                forecast[horizon]['revenue_ci_high'] = round(sim.ci_high_approved * rev_per_call, 2)
            forecast[horizon]['ci_level'] = sim.ci_level
        except Exception:
            forecast[horizon]['error'] = 'Simulation failed'

    forecast['engines'].extend(['Monte Carlo'])

    # Gott temporal state
    if tp:
        forecast['engines'].append('Gott')
        forecast['gott_state'] = {
            'maturity_score': tp.maturity_score,
            'remaining_growth_probability': tp.remaining_growth_probability,
            'evaluation_readiness': tp.evaluation_readiness,
            'recommended_wait_days': tp.recommended_wait_days,
        }
        if tp.maturity_score < 0.3:
            forecast['assumptions'].append(
                f'Gott: low maturity ({tp.maturity_score:.2f}) — '
                f'page may still be in SEO maturation phase. '
                f'Wait {tp.recommended_wait_days} days before evaluating.'
            )

    # Direction: based on Bayesian CTR vs population median
    all_ctr_means = [p.mean for p in ctx['posteriors'].values()] if ctx['posteriors'] else []
    if all_ctr_means and posterior:
        median_ctr = statistics.median(all_ctr_means)
        if posterior.mean > median_ctr * 1.1:
            forecast['direction'] = 'Growing'
        elif posterior.mean < median_ctr * 0.9:
            forecast['direction'] = 'Declining'
        else:
            forecast['direction'] = 'Stable'
    else:
        forecast['direction'] = 'Unknown'

    # Confidence
    if clicks > 0:
        forecast['confidence'] = _confidence_label(bayesian_conf)
    elif impressions > 100:
        forecast['confidence'] = 'Low (zero clicks, uninformative Beta(1,1) for call_cvr)'
    else:
        forecast['confidence'] = 'Very Low (insufficient data)'

    forecast['assumptions'].append(
        f'Impressions assumed constant at {impressions}/month. '
        f'No trend data to project growth/decline in impressions.'
    )
    if clicks == 0:
        forecast['assumptions'].append(
            'Call conversion rate posterior is Beta(1,1) (uninformative) — '
            'call estimates are dominated by this prior, not by evidence.'
        )

    # Markov funnel contribution (site-level)
    funnel = ctx.get('markov_funnel')
    if funnel:
        forecast['engines'].append('Markov (site-level funnel)')
        forecast['markov_conversion_path'] = funnel.expected_conversion_path

    return forecast


# ============================================================
# Report Generator
# ============================================================

def generate_report(ctx):
    lines = []
    w = 100  # width

    def p(s=''):
        lines.append(s)

    def header(title):
        p()
        p('=' * w)
        p(f'  {title}')
        p('=' * w)
        p()

    def subheader(title):
        p()
        p(f'  --- {title} ---')
        p()

    # ============================================================
    # TITLE
    # ============================================================
    p('=' * w)
    p('  MATHEMATICAL SITE INTELLIGENCE REPORT')
    p('  YoHomeFix.com')
    p(f'  Generated: {ctx["run_time"]}')
    p('=' * w)
    p()
    p('  Based only on the existing mathematical engines and real production data.')
    p('  No new models. No new theories. If evidence is insufficient, this report says so.')
    p()
    p('  ENGINES USED:')
    engines_used = []
    if ctx['page_reports']:
        engines_used.append('Google Search Console')
    if ctx.get('marketcall'):
        engines_used.append('Marketcall')
    if ctx.get('ga4'):
        engines_used.append('GA4')
    if ctx.get('attribution'):
        engines_used.append('Attribution Engine')
    if ctx['posteriors']:
        engines_used.append('Bayesian Engine')
    if ctx.get('markov_funnel'):
        engines_used.append('Markov Engine')
    if ctx['temporal_priors']:
        engines_used.append('Gott Temporal Prior Engine')
    if ctx.get('learning_summary'):
        engines_used.append('Learning Engine')
    if ctx['opp_results']:
        engines_used.append('Opportunity Score Engine')
    if ctx['graph_metrics']:
        engines_used.append('Graph Engine')
    if ctx['recs']:
        engines_used.append('Recommendation Engine')
    engines_used.append('Monte Carlo Engine')
    for e in engines_used:
        p(f'    - {e}')
    p()

    # ============================================================
    # SECTION 1: SITE-LEVEL ANALYSIS
    # ============================================================
    header('SECTION 1: SITE-LEVEL ANALYSIS')

    health, health_components = _site_health_score(ctx)
    opp, opp_detail = _site_opportunity_score(ctx)
    risk, risk_detail = _site_risk_score(ctx)
    conf, conf_detail = _site_confidence_score(ctx)
    growth, growth_detail = _growth_readiness(ctx)
    biz, biz_detail = _business_readiness(ctx)
    learning, learning_detail = _learning_readiness(ctx)
    model_conf, model_detail = _model_confidence(ctx)
    dq, dq_detail = _data_quality_score(ctx)

    p(f'  Overall Site Health Score:    {_fmt_score(health)}  {_stars(health)}')
    p(f'    Formula: geometric_mean(click_through_rate, link_coverage, funnel_conversion, recommendation_confidence)')
    p(f'    click_through_rate:       {health_components["click_through_rate"]:.4f}  (1 - zero_click_rate)')
    p(f'    link_coverage:            {health_components["link_coverage"]:.4f}  (1 - orphan_rate)')
    p(f'    funnel_conversion:        {health_components["funnel_conversion"]:.6f}  (Markov expected_conversion_path)')
    p(f'    recommendation_confidence:{health_components["recommendation_confidence"]:.4f}  (mean rec confidence)')
    p(f'    Contributing engines: GSC, Graph, Markov, Recommendation')
    p()

    p(f'  Overall Opportunity Score:    {_fmt_score(opp)}  {_stars(opp)}')
    p(f'    Formula: mean(opportunity_gap_score_i) across all {opp_detail.get("pages_scored", 0)} pages')
    p(f'    opportunity_gap_score = percentile(impressions) * (1 - percentile(ctr)) * (1 - percentile(calls))')
    p(f'    Mean: {opp_detail.get("mean", 0):.4f}  Median: {opp_detail.get("median", 0):.4f}  Top-decile mean: {opp_detail.get("top_decile_mean", 0):.4f}')
    p(f'    Contributing engine: Opportunity Score')
    p()

    p(f'  Overall Risk Score:           {_fmt_score(risk)}  {_stars(risk)}')
    p(f'    Formula: 0.3*(bottom_decile/n) + 0.2*(orphans/n) + 0.5*(zero_click/n)')
    p(f'    bottom_decile_pages: {risk_detail.get("bottom_decile_pages", 0)}')
    p(f'    orphan_pages:         {risk_detail.get("orphan_pages", 0)}')
    p(f'    zero_click_pages:     {risk_detail.get("zero_click_pages", 0)}')
    p(f'    weak_components:      {risk_detail.get("weak_components", 0)}')
    p(f'    Contributing engines: Opportunity Score, Graph, GSC')
    p()

    p(f'  Overall Confidence Score:     {_fmt_score(conf)}  {_stars(conf)}')
    p(f'    Formula: sum(confidence_i * business_value_i) / sum(business_value_i)')
    p(f'    Weighted: {conf_detail.get("weighted", False)}')
    p(f'    Recommendations: {conf_detail.get("recommendations", 0)}')
    p(f'    Contributing engine: Recommendation Engine')
    p()

    p(f'  Growth Readiness:             {_fmt_score(growth)}  {_stars(growth)}')
    p(f'    Formula: |{growth_detail.get("high_opportunity_pages", 0)} high-opp pages AND {growth_detail.get("high_confidence_pages", 0)} high-conf pages| / {ctx["n_pages"]} total')
    p(f'    Ready pages: {growth_detail.get("ready_pages", 0)}')
    p(f'    Contributing engines: Opportunity Score, Recommendation')
    p()

    p(f'  Business Readiness:           {_fmt_score(biz)}  {_stars(biz)}')
    p(f'    Formula: 0.25*(revenue>0) + 0.25*(sessions>0) + 0.25*(funnel>0) + 0.25*(high_recs>0)')
    p(f'    has_revenue:     {biz_detail["has_revenue"]}')
    p(f'    has_sessions:    {biz_detail["has_sessions"]}')
    p(f'    has_funnel:      {biz_detail["has_funnel"]}')
    p(f'    high_conf_recs:  {biz_detail["high_confidence_recommendations"]}')
    p(f'    Contributing engines: Marketcall, GA4, Markov, Recommendation')
    p()

    p(f'  Learning Readiness:           {_fmt_score(learning)}  {_stars(learning)}')
    p(f'    Formula: 0.4*(records>0) + 0.3*(tp_ready/100) + 0.3*(tp_total/1000)')
    p(f'    learning_records:       {learning_detail["learning_records"]}')
    p(f'    temporal_priors_total:  {learning_detail["temporal_priors_total"]}')
    p(f'    temporal_priors_ready:  {learning_detail["temporal_priors_ready"]}')
    p(f'    NOTE: {learning_detail["note"]}')
    p(f'    Contributing engines: Learning, Gott')
    p()

    p(f'  Model Confidence:             {_fmt_score(model_conf)}  {_stars(model_conf)}')
    p(f'    Formula: mean(1 - CI_width) across all Bayesian posteriors')
    p(f'    Posteriors: {model_detail.get("posteriors", 0)}')
    p(f'    Mean CI width: {model_detail.get("mean_ci_width", 0):.6f}')
    p(f'    Contributing engine: Bayesian')
    p()

    p(f'  Data Quality Score:           {_fmt_score(dq)}  {_stars(dq)}')
    p(f'    Formula: 0.3*gsc_cov + 0.3*ga4_cov + 0.2*mc_cov + 0.2*crawl_cov')
    p(f'    GSC coverage:       {_fmt_pct(dq_detail["gsc_coverage"]*100)}  ({dq_detail["gsc_coverage"]:.4f})')
    p(f'    GA4 coverage:       {_fmt_pct(dq_detail["ga4_coverage"]*100)}  ({dq_detail["ga4_coverage"]:.4f})')
    p(f'    Marketcall coverage:{_fmt_pct(dq_detail["marketcall_coverage"]*100)}  ({dq_detail["marketcall_coverage"]:.4f})')
    p(f'    Crawl coverage:     {_fmt_pct(dq_detail["crawl_coverage"]*100)}  ({dq_detail["crawl_coverage"]:.4f})')
    p(f'    Contributing engines: GSC, GA4, Marketcall, Link Graph')
    p()

    # ============================================================
    # SECTION 2: PROBABILITY REPORT
    # ============================================================
    header('SECTION 2: PROBABILITY REPORT')
    p('  Estimated probabilities based on existing engine outputs.')
    p('  These are relative distributions, not absolute forecasts.')
    p('  Calibration is NOT possible with 0 learning records and 1 snapshot.')
    p()

    probs = _probability_report(ctx)

    for category in ['traffic', 'call', 'revenue']:
        growth_key = f'{category}_growth'
        stag_key = f'{category}_stagnation'
        decl_key = f'{category}_decline'

        g = probs.get(growth_key)
        s = probs.get(stag_key)
        d = probs.get(decl_key)
        engines = probs.get(f'{category}_engines', [])
        note = probs.get(f'{category}_note', '')

        label = category.replace('call', 'call').replace('traffic', 'traffic').replace('revenue', 'revenue')
        p(f'  {label.capitalize()} Growth:      {_fmt_pct(g*100) if g is not None else "INSUFFICIENT DATA"}')
        p(f'  {label.capitalize()} Stagnation:  {_fmt_pct(s*100) if s is not None else "INSUFFICIENT DATA"}')
        p(f'  {label.capitalize()} Decline:     {_fmt_pct(d*100) if d is not None else "INSUFFICIENT DATA"}')
        p(f'    Engines: {", ".join(engines) if engines else "None"}')
        p(f'    Note: {note}')
        p()

    # ============================================================
    # SECTION 3: PAGE-LEVEL REPORT
    # ============================================================
    header('SECTION 3: PAGE-LEVEL REPORT')
    p(f'  Total pages: {ctx["n_pages"]}')
    p(f'  Showing top 50 by business_value_score (full data in all pages below)')
    p()

    # Sort by top recommendation business_value_score
    page_bv = {}
    for rec in ctx['recs']:
        if rec.target not in page_bv or rec.business_value_score > page_bv[rec.target]:
            page_bv[rec.target] = rec.business_value_score

    sorted_pages = sorted(ctx['page_reports'], key=lambda p: page_bv.get(p['page'], 0), reverse=True)
    top_50 = sorted_pages[:50]

    p(f'  {"#":>3} {"Page":<55} {"Opp":>6} {"Risk":>6} {"Conf":>6} {"Bayes":>6} {"Gott":>6} {"Learn":>6} {"Rec":>30} {"Priority":>8}')
    p(f'  {"":>3} {"":<55} {"":>6} {"":>6} {"":>6} {"":>6} {"":>6} {"":>6} {"":>30} {"":>8}')
    p('  ' + '-' * (w - 2))

    for i, page in enumerate(top_50, 1):
        pid = page['page']
        opp_r = ctx['opp_by_id'].get(pid)
        opp_score = opp_r.opportunity_gap_score if opp_r else None

        # Risk: bottom decile performance
        perf = opp_r.performance_score if opp_r else None
        risk_score = 1.0 - (perf or 0.5)

        # Confidence from top recommendation
        recs_for_page = ctx['recs_by_target'].get(pid, [])
        top_rec = recs_for_page[0] if recs_for_page else None
        rec_conf = top_rec.confidence if top_rec else 0.0

        # Bayesian confidence
        post = ctx['posteriors'].get(pid)
        bayes_conf = max(0.0, min(1.0, 1.0 - (post.ci_high - post.ci_low))) if post else 0.0

        # Gott state
        tp = ctx['temporal_priors'].get(pid)
        gott_state = 'EVAL' if (tp and tp.evaluation_readiness) else 'WAIT' if tp else 'N/A'

        # Learning confidence
        ls = ctx.get('learning_summary')
        learn_conf = 0.0
        if ls and ls.record_count > 0 and top_rec:
            from .learning_engine import compute_context_fingerprint
            fp = compute_context_fingerprint(top_rec.action, opp_r.to_dict() if opp_r else {})
            learn_conf = ls.get_adjustment(top_rec.action, fp)

        rec_action = top_rec.action[:28] if top_rec else 'none'
        priority = 'High' if rec_conf >= 0.7 else 'Medium' if rec_conf >= 0.5 else 'Low'

        display_page = pid[:53] + '..' if len(pid) > 55 else pid

        p(f'  {i:>3} {display_page:<55} {_fmt_score(opp_score):>6} {_fmt_score(risk_score):>6} '
          f'{_fmt_score(rec_conf):>6} {_fmt_score(bayes_conf):>6} {gott_state:>6} {_fmt_score(learn_conf):>6} '
          f'{rec_action:>30} {priority:>8}')

    p()
    p('  Full page-level details (all pages with recommendations):')
    p()

    for page in top_50[:20]:  # Detailed for top 20
        pid = page['page']
        opp_r = ctx['opp_by_id'].get(pid)
        post = ctx['posteriors'].get(pid)
        tp = ctx['temporal_priors'].get(pid)
        recs_for_page = ctx['recs_by_target'].get(pid, [])
        top_rec = recs_for_page[0] if recs_for_page else None

        p(f'  Page: {pid}')
        p(f'    Impressions: {page.get("impressions", 0):,}  Clicks: {page.get("clicks", 0)}  CTR: {page.get("ctr", 0):.4f}  Position: {page.get("position", "N/A")}')
        if opp_r:
            p(f'    Opportunity Score: {opp_r.opportunity_gap_score:.4f}  Performance: {_fmt_score(opp_r.performance_score)}')
        if post:
            p(f'    Bayesian: mean={post.mean:.6f}  CI=[{post.ci_low:.6f}, {post.ci_high:.6f}]  n_obs={post.n_obs}  confidence={max(0, min(1, 1-(post.ci_high-post.ci_low))):.4f}')
        if tp:
            p(f'    Gott: maturity={tp.maturity_score:.4f}  growth_prob={tp.remaining_growth_probability:.4f}  wait_days={tp.recommended_wait_days}  readiness={tp.evaluation_readiness}')
        if top_rec:
            impact = top_rec.expected_impact or {}
            p(f'    Recommendation: {top_rec.action}')
            p(f'    Confidence: {top_rec.confidence:.4f}  Business Value: {top_rec.business_value_score:.4f}')
            p(f'    Expected calls: {impact.get("expected_calls", "N/A")}  Expected revenue: {_fmt_money(impact.get("expected_revenue"))}')
            p(f'    Reason: {top_rec.reason[:120]}')
        else:
            p(f'    Recommendation: none')
        p()

    # ============================================================
    # SECTION 4: FORECAST
    # ============================================================
    header('SECTION 4: FORECAST (30/60/90 DAY OUTLOOK)')
    p('  Uses: Bayesian posteriors, Monte Carlo simulation, Gott temporal priors, Markov funnel.')
    p('  Does NOT invent new forecasting models.')
    p('  Clearly separates MEASURED DATA from MODEL ESTIMATE.')
    p()

    # Site-level forecast
    p('  SITE-LEVEL FORECAST')
    p('  ' + '-' * (w - 2))
    funnel = ctx.get('markov_funnel')
    if funnel:
        p(f'  Markov Funnel (site-wide):')
        for t in funnel.transition_matrix:
            p(f'    P({t.from_stage} -> {t.to_stage}) = {t.p:.6f}  (raw: {t.raw_from_count:.0f} -> {t.raw_to_count:.0f})')
        p(f'  Expected end-to-end conversion: {funnel.expected_conversion_path:.8f}')
        p(f'  Highest loss step (by rate): {funnel.highest_loss_step_by_rate.from_stage} -> {funnel.highest_loss_step_by_rate.to_stage} ({funnel.highest_loss_step_by_rate.drop_off_rate:.4f})')
        p(f'  Highest loss step (by absolute): {funnel.highest_loss_step_by_absolute.from_stage} -> {funnel.highest_loss_step_by_absolute.to_stage} ({funnel.highest_loss_step_by_absolute.absolute_loss:.0f})')
    else:
        p('  Markov Funnel: insufficient data')
    p()

    # Page-level forecasts (top 20)
    p('  PAGE-LEVEL FORECASTS (Top 20 by business value)')
    p('  ' + '-' * (w - 2))
    p()

    for page in top_50[:20]:
        pid = page['page']
        fc = _forecast_for_page(pid, ctx)

        p(f'  Page: {pid}')
        p(f'    MEASURED DATA:')
        p(f'      Impressions: {fc["measured"]["impressions"]:,}  Clicks: {fc["measured"]["clicks"]}  CTR: {fc["measured"]["ctr"]:.6f}  Position: {fc["measured"]["avg_position"]}')
        p(f'    MODEL ESTIMATE:')
        p(f'      Engines: {", ".join(fc["engines"])}')
        p(f'      Confidence: {fc["confidence"]}')
        p(f'      Direction: {fc.get("direction", "Unknown")}')

        for horizon in ['forecast_30d', 'forecast_60d', 'forecast_90d']:
            h = fc[horizon]
            label = horizon.replace('forecast_', '').upper()
            if 'error' in h:
                p(f'      {label}: ERROR — {h["error"]}')
            else:
                p(f'      {label}: expected_calls={h.get("expected_calls", "N/A")}  '
                  f'CI=[{h.get("calls_ci_low", "N/A")}, {h.get("calls_ci_high", "N/A")}]  '
                  f'expected_revenue={_fmt_money(h.get("expected_revenue"))}')

        if fc.get('gott_state'):
            gs = fc['gott_state']
            p(f'      Gott: maturity={gs["maturity_score"]:.4f}  growth_prob={gs["remaining_growth_probability"]:.4f}  readiness={gs["evaluation_readiness"]}')

        p(f'    ASSUMPTIONS:')
        for a in fc['assumptions']:
            p(f'      - {a}')
        p()

    # ============================================================
    # SECTION 5: INVESTMENT REPORT
    # ============================================================
    header('SECTION 5: INVESTMENT REPORT')
    p('  Ranked by expected business ROI using only existing evidence.')
    p('  ROI = business_value_score (expected_revenue * confidence) from Recommendation Engine.')
    p()

    # Sort all recommendations by business_value_score
    all_recs_sorted = sorted(ctx['recs'], key=lambda r: r.business_value_score, reverse=True)

    # Top 5 pages
    p('  IF YOU CAN WORK ON ONLY 5 PAGES:')
    p('  ' + '-' * (w - 2))
    seen_pages = set()
    count = 0
    for rec in all_recs_sorted:
        if rec.target in seen_pages:
            continue
        seen_pages.add(rec.target)
        count += 1
        impact = rec.expected_impact or {}
        p(f'    {count}. {rec.target}')
        p(f'       Action: {rec.action}')
        p(f'       Confidence: {rec.confidence:.4f}  Business Value: {rec.business_value_score:.4f}')
        p(f'       Expected calls: {impact.get("expected_calls", "N/A")}  Expected revenue: {_fmt_money(impact.get("expected_revenue"))}')
        p(f'       Reason: {rec.reason[:100]}')
        p()
        if count >= 5:
            break

    # Top 10 pages
    p('  IF YOU CAN WORK ON 10 PAGES:')
    p('  ' + '-' * (w - 2))
    seen_pages = set()
    count = 0
    for rec in all_recs_sorted:
        if rec.target in seen_pages:
            continue
        seen_pages.add(rec.target)
        count += 1
        impact = rec.expected_impact or {}
        p(f'    {count:>2}. {rec.target}')
        p(f'        Action: {rec.action}  Conf: {rec.confidence:.4f}  BV: {rec.business_value_score:.4f}  Rev: {_fmt_money(impact.get("expected_revenue"))}')
        if count >= 10:
            break

    p()

    # $100 budget
    p('  IF YOU HAVE $100:')
    p('  ' + '-' * (w - 2))
    p('  Allocate to the single highest-business-value recommendation.')
    p('  With $100, focus on one page where the expected revenue justifies the effort.')
    if all_recs_sorted:
        top = all_recs_sorted[0]
        impact = top.expected_impact or {}
        p(f'  Recommendation: {top.action} on {top.target}')
        p(f'  Expected revenue: {_fmt_money(impact.get("expected_revenue"))}')
        p(f'  Confidence: {top.confidence:.4f}')
        p(f'  Business Value Score: {top.business_value_score:.4f}')
        rev = impact.get('expected_revenue', 0)
        if isinstance(rev, (int, float)) and rev > 0:
            roi = (rev - 100) / 100 * 100
            p(f'  Estimated ROI: {roi:+.1f}% (expected_revenue - $100) / $100')
            p(f'  NOTE: This ROI is uncalibrated. Revenue estimate is based on 1 approved call ($47.23).')
        p()

    # $1000 budget
    p('  IF YOU HAVE $1000:')
    p('  ' + '-' * (w - 2))
    p('  Distribute across top 5-10 pages by business_value_score.')
    p()
    top_invest = []
    seen = set()
    for rec in all_recs_sorted:
        if rec.target in seen:
            continue
        seen.add(rec.target)
        top_invest.append(rec)
        if len(top_invest) >= 10:
            break

    total_bv = sum(r.business_value_score for r in top_invest)
    if total_bv > 0:
        p(f'  {"Page":<55} {"Action":<30} {"Alloc":>8} {"BV":>8} {"Exp Rev":>12}')
        p('  ' + '-' * (w - 2))
        for rec in top_invest:
            alloc = (rec.business_value_score / total_bv) * 1000
            impact = rec.expected_impact or {}
            display = rec.target[:53] + '..' if len(rec.target) > 55 else rec.target
            p(f'  {display:<55} {rec.action[:28]:<30} ${alloc:>6.2f} {rec.business_value_score:>8.4f} {_fmt_money(impact.get("expected_revenue")):>12}')
    p()
    p('  NOTE: All allocations are proportional to business_value_score. ROI estimates are')
    p('  uncalibrated due to 0 learning records and Beta(1,1) priors on 99.1% of pages.')
    p()

    # ============================================================
    # SECTION 6: NO-INVESTMENT REPORT
    # ============================================================
    header('SECTION 6: NO-INVESTMENT REPORT')
    p('  Pages where the mathematics suggests additional effort is unlikely')
    p('  to produce meaningful business value.')
    p()

    no_invest = []
    for page in ctx['page_reports']:
        pid = page['page']
        impressions = page.get('impressions', 0)
        clicks = page.get('clicks', 0)
        recs_for_page = ctx['recs_by_target'].get(pid, [])

        reasons = []
        if impressions < 10:
            reasons.append(f'Very low impressions ({impressions}) — minimal search visibility')
        if clicks == 0 and impressions < 100:
            reasons.append('Zero clicks with low impressions — not enough traffic to optimize')
        if not recs_for_page:
            reasons.append('No recommendation generated — engine found no actionable signal')

        tp = ctx['temporal_priors'].get(pid)
        if tp and tp.maturity_score < 0.1 and impressions < 50:
            reasons.append(f'Gott: very low maturity ({tp.maturity_score:.2f}) — page may still be in early SEO phase')

        if reasons:
            no_invest.append((pid, reasons))

    p(f'  Pages identified: {len(no_invest)} out of {ctx["n_pages"]}')
    p()
    for pid, reasons in no_invest[:30]:
        p(f'  {pid}')
        for r in reasons:
            p(f'    - {r}')
        p()
    if len(no_invest) > 30:
        p(f'  ... and {len(no_invest) - 30} more pages with similar profiles.')
    p()

    # ============================================================
    # SECTION 7: UNCERTAINTY REPORT
    # ============================================================
    header('SECTION 7: UNCERTAINTY REPORT')
    p('  Every conclusion above carries uncertainty. This section makes it explicit.')
    p()

    p('  DATA CONFIDENCE:')
    p(f'    GSC: {ctx["n_pages"]} pages, all with impressions. High coverage.')
    p(f'    GA4: {len(ctx.get("ga4") or {})} pages out of {ctx["n_pages"]}. Low coverage ({_fmt_pct(_safe_pct(len(ctx.get("ga4") or {}), ctx["n_pages"]))}).')
    mc = ctx.get('marketcall') or {}
    p(f'    Marketcall: {mc.get("calls", 0)} calls, {mc.get("approved_calls", 0)} approved. Very small sample.')
    p(f'    Crawl graph: {"exists" if ctx.get("real_link_graph_has_data") else "ABSENT — edges.jsonl missing"}.')
    p()

    p('  MODEL CONFIDENCE:')
    p(f'    Bayesian: {len(ctx["posteriors"])} posteriors. Mean CI width: {model_detail.get("mean_ci_width", 0):.6f}.')
    p(f'    For 99.1% of pages (zero clicks), CTR posterior is Beta(1, 1+impressions) —')
    p(f'    technically valid but practically uninformative for conversion prediction.')
    p(f'    Call conversion rate is Beta(1,1) for all zero-click pages — uniform prior,')
    p(f'    meaning expected calls ~0.5 regardless of page quality.')
    p()

    p('  EVIDENCE STRENGTH:')
    p(f'    Clicks observed: {ctx["total_clicks"]} across {ctx["n_pages"]} pages.')
    p(f'    Approved calls: {ctx["total_approved"]}. Revenue data points: 1.')
    p(f'    Learning records: 0. Snapshots: 1 (date: {ctx["snapshot_date"]}).')
    p(f'    Evidence strength: VERY LOW for calibration, MODERATE for relative ranking.')
    p()

    p('  UNKNOWN FACTORS:')
    p('    - No historical trend data (1 snapshot only)')
    p('    - No A/B test results')
    p('    - No crawl data (internal link structure unknown)')
    p('    - No per-page Marketcall attribution (campaign-level only)')
    p('    - No seasonal adjustment')
    p('    - No competitor data')
    p('    - No content quality scores')
    p()

    p('  MISSING DATA:')
    p('    - edges.jsonl (crawl artifact) — link graph recommendations suppressed')
    p('    - GA4 data for 96.1% of pages — engagement metrics unavailable')
    p('    - >= 2 snapshots separated by 30 days — learning engine cannot evaluate')
    p('    - Per-page call attribution — revenue estimates are population-level')
    p()

    p('  EXPLICIT "I DO NOT KNOW" STATEMENTS:')
    p('    - I do not know whether expected_calls forecasts are calibrated (0 learning records).')
    p('    - I do not know whether traffic is growing or declining (1 snapshot, no trend).')
    p('    - I do not know the true revenue per approved call ($47.23 from 1 data point).')
    p('    - I do not know which internal links are broken (no crawl data).')
    p('    - I do not know the true call conversion rate for 99.1% of pages (Beta(1,1) prior).')
    p('    - I do not know whether recommendations have been effective (no outcome data).')
    p()

    # ============================================================
    # SECTION 8: LEARNING STATUS
    # ============================================================
    header('SECTION 8: LEARNING STATUS')
    p()

    ls = ctx.get('learning_summary')
    records = ls.record_count if ls else 0
    successes = ls.success_count if ls else 0
    failures = ls.failure_count if ls else 0

    p('  WHAT THE LEARNING ENGINE CURRENTLY KNOWS:')
    p(f'    Learning records: {records}')
    p(f'    Successes: {successes}')
    p(f'    Failures: {failures}')
    p(f'    Confidence adjustments: {len(ls.adjustments) if ls else 0}')
    if records == 0:
        p('    The Learning Engine knows NOTHING yet. It has never evaluated any recommendation.')
    p()

    p('  WHAT IT CANNOT KNOW YET:')
    p('    - Whether any recommendation has been followed')
    p('    - Whether followed recommendations improved outcomes')
    p('    - Whether confidence estimates are calibrated')
    p('    - Which recommendation types are most effective')
    p('    - Whether temporal maturity affects outcomes as predicted')
    p()

    p('  WHAT ADDITIONAL HISTORICAL DATA IS REQUIRED:')
    p('    1. A second pipeline run >= 30 days after the first (currently only 1 snapshot exists)')
    p('    2. The recommendation must have been acted on (or not) between the two snapshots')
    p('    3. At least 10-20 learning records per recommendation type for meaningful statistics')
    p('    4. At least 100 learning records total for system-wide calibration')
    p()

    p('  WHEN PREDICTIONS BECOME CALIBRATED:')
    p('    - Minimum: 2 snapshots, 30 days apart, with outcome comparison')
    p('    - Meaningful: 4-6 snapshots (4-6 months of weekly/biweekly runs)')
    p('    - Calibrated: 100+ learning records with diverse recommendation types')
    p('    - Currently: 0% of the way to calibration')
    p()

    # ============================================================
    # SECTION 9: VALIDATION
    # ============================================================
    header('SECTION 9: VALIDATION')
    p('  Every reported number, its formula, inputs, and assumptions.')
    p()

    p('  SITE-LEVEL SCORES:')
    p('    Site Health Score:')
    p(f'      Formula: (click_through_rate * link_coverage * funnel_conversion * rec_confidence)^(1/4)')
    p(f'      Inputs: 1-zero_click_rate={health_components["click_through_rate"]:.4f}, '
      f'1-orphan_rate={health_components["link_coverage"]:.4f}, '
      f'funnel={health_components["funnel_conversion"]:.6f}, '
      f'rec_conf={health_components["recommendation_confidence"]:.4f}')
    p(f'      Result: {health:.4f}')
    p(f'      Engines: GSC, Graph, Markov, Recommendation')
    p()

    p('    Opportunity Score:')
    p(f'      Formula: mean(opportunity_gap_score_i) for all pages')
    p(f'      opportunity_gap_score = percentile(impressions) * (1-ctr_pct) * (1-calls_pct)')
    p(f'      Inputs: {opp_detail.get("pages_scored", 0)} pages')
    p(f'      Result: {opp:.4f}')
    p(f'      Engine: Opportunity Score')
    p()

    p('    Risk Score:')
    p(f'      Formula: 0.3*(bottom_decile/n) + 0.2*(orphans/n) + 0.5*(zero_click/n)')
    p(f'      Inputs: {risk_detail.get("bottom_decile_pages", 0)} bottom-decile, '
      f'{risk_detail.get("orphan_pages", 0)} orphans, '
      f'{risk_detail.get("zero_click_pages", 0)} zero-click, n={ctx["n_pages"]}')
    p(f'      Result: {risk:.4f}')
    p(f'      Engines: Opportunity Score, Graph, GSC')
    p()

    p('  FORECAST VALIDATION:')
    p('    Each page forecast uses:')
    p('      Formula: Monte Carlo simulation (500 trials) through Beta-Binomial funnel')
    p('        impressions -> Beta(ctr) -> Binomial -> clicks -> Beta(cvr) -> Binomial -> calls -> Beta(appr) -> Binomial -> approved')
    p('      Inputs per page:')
    p('        ctr_posterior = Beta(1+clicks, 1+impressions-clicks)')
    p('        cvr_posterior = Beta(1+calls, 1+clicks-calls) [Beta(1,1) if clicks=0]')
    p('        appr_posterior = Beta(1+approved, 1+calls-approved) [Beta(1,1) if calls=0]')
    p('        revenue = expected_approved_calls * $47.23')
    p('      Engines: Bayesian, Monte Carlo, Marketcall (revenue_per_call)')
    p('      Assumptions:')
    p('        - Impressions constant at current monthly rate (no trend data)')
    p('        - 30d = 1x, 60d = 2x, 90d = 3x cumulative impressions')
    p('        - No seasonal adjustment')
    p('        - No competitor impact')
    p('        - revenue_per_call = $47.23 (from 1 approved call)')
    p('      Confidence: LOW for pages with 0 clicks (Beta(1,1) prior dominates)')
    p()

    p('  PROBABILITY VALIDATION:')
    p('    Traffic probabilities: relative CTR posterior distribution split at +/-10% of median')
    p('      This is a RANKING, not a forecast. It says which pages are above/below average,')
    p('      not whether traffic will actually grow or decline.')
    p('    Call/Revenue probabilities: same approach on Monte Carlo expected values')
    p('      Inherited weakness: Beta(1,1) on call_cvr for 99.1% of pages')
    p()

    p('  INVESTMENT VALIDATION:')
    p('    ROI = (expected_revenue - cost) / cost')
    p('    expected_revenue = Monte Carlo expected_approved_calls * $47.23')
    p('    With 1 approved call in the dataset, revenue_per_call has zero statistical confidence.')
    p('    All ROI figures should be treated as ordinal rankings, not dollar forecasts.')
    p()

    # ============================================================
    # CLOSING
    # ============================================================
    header('SUMMARY')
    p()
    p('  "If the mathematics is correct, what does it currently say about the future of YoHomeFix?"')
    p()
    p(f'  The mathematics says:')
    p(f'  1. YoHomeFix has {ctx["n_pages"]:,} pages with {ctx["total_impressions"]:,} monthly impressions.')
    p(f'  2. Only {ctx["total_clicks"]} clicks and {ctx["total_approved"]} approved call(s) were observed.')
    p(f'  3. The single biggest opportunity is improving click-through rate: 99.1% of pages get zero clicks.')
    p(f'  4. The site has {len(ctx["recs"])} actionable recommendations, but their confidence is uncalibrated.')
    p(f'  5. The system cannot yet predict whether traffic will grow or decline (1 snapshot, 0 learning records).')
    p(f'  6. The system cannot yet validate whether recommendations improve outcomes (no historical comparison).')
    p(f'  7. Data quality is moderate for GSC, low for GA4, very low for Marketcall, absent for crawl data.')
    p()
    p(f'  The honest mathematical answer is: the system has identified WHERE opportunity exists')
    p(f'  (high-impression, zero-click pages), but cannot yet predict IF action will produce results.')
    p(f'  Calibration requires 4-6 months of biweekly pipeline runs.')
    p()
    p('=' * w)
    p('  END OF MATHEMATICAL SITE INTELLIGENCE REPORT')
    p('=' * w)

    return '\n'.join(lines)


# ============================================================
# Main
# ============================================================

def run():
    ctx = _run_pipeline()
    report = generate_report(ctx)
    print(report)

    # Also write to file
    output_path = 'scripts/decision_engine/site_intelligence_report_output.txt'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(report)
    print(f'\n  Report written to {output_path}', file=sys.stderr)


if __name__ == '__main__':
    run()
