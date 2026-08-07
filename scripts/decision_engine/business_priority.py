#!/usr/bin/env python3
"""
Business Priority Intelligence.

Refactors the decision layer so that business value dominates every
recommendation. The engine stops behaving like an analytics tool and
starts behaving like a CEO whose only KPIs are:

  - Qualified Calls
  - Approved Calls
  - Revenue

Uses only existing engine outputs (GSC, GA4, Marketcall, Learning,
Bayesian, Markov, Gott, Recommendation Engine). No new mathematical
models. No dashboard. No UI.

Outputs:
  - CEO_REPORT.md  (exactly one report, executive summary only)

The report answers one question:
  "If you had only ONE day to work on YoHomeFix,
   what exactly would you do to maximize future calls and revenue?"
"""
import sys, io
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import csv
import json
import math
import statistics
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

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

REPO_ROOT = Path(__file__).resolve().parents[2]
ANALYTICS_CSV_DIR = REPO_ROOT / 'scripts' / 'analytics' / 'csv'


# ============================================================
# Commercial Intent Classification
# ============================================================

COMMERCIAL_INTENT_KEYWORDS = [
    'emergency plumber',
    'emergency plumbing',
    '24 hour plumber',
    '24 hour plumbing',
    'plumber near me',
    'plumbing near me',
    'emergency plumber near me',
    'emergency plumbing near me',
    '24 hour plumber near me',
    'emergency drain service',
    'emergency drain service near me',
    'emergency drain cleaning',
    'emergency drain cleaning service',
    '24 hour drain service',
    '24 hour drain cleaning',
    '24 hour drain cleaning service',
    'emergency plumbing services',
    'plumbing emergency',
    'emergency hot water heater repair',
    'emergency water heater repair',
    'water heater repair',
    'water heater repair near me',
    'drain cleaning',
    'drain cleaning near me',
    'drain cleaning service',
    'drain cleaning service near me',
    'sewer line repair',
    'sewer line repair near me',
    'leak repair',
    'leak repair near me',
    'slab leak repair',
    'slab leak repair near me',
    'pipe burst repair',
    'pipe repair',
    'pipe repair near me',
    'faucet repair',
    'faucet repair near me',
    'faucet installation',
    'faucet installation near me',
    'water softener installation',
    'water softener repair',
    'water line repair',
    'water line repair near me',
    'repiping',
    'repiping near me',
    'whole house repiping',
    'main water shutoff valve',
    'main water shutoff valve repair',
    'gas line repair',
    'gas line repair near me',
    'boiler repair',
    'boiler repair near me',
    'sewer line cleaning',
    'sewer line cleaning near me',
    'hydro jetting',
    'hydro jetting near me',
    'clogged drain',
    'clogged drain repair',
    'clogged drain near me',
    'burst pipe repair',
    'burst pipe repair near me',
    'frozen pipe repair',
    'frozen pipe repair near me',
    'water leak repair',
    'water leak repair near me',
    'slab leak',
    'slab leak near me',
    'garbage disposal repair',
    'garbage disposal repair near me',
    'garbage disposal installation',
    'tankless water heater',
    'tankless water heater repair',
    'tankless water heater installation',
    'tankless water heater near me',
    'water heater installation',
    'water heater installation near me',
    'water heater replacement',
    'water heater replacement near me',
    'sewer line replacement',
    'sewer line replacement near me',
    'water line replacement',
    'water line replacement near me',
    'plumbing repair',
    'plumbing repair near me',
    'plumbing services',
    'plumbing services near me',
    'plumbing service',
    'best plumber',
    'best plumber near me',
    'affordable plumber',
    'affordable plumber near me',
    'cheap plumber',
    'cheap plumber near me',
    'local plumber',
    'local plumber near me',
    'licensed plumber',
    'licensed plumber near me',
    'professional plumber',
    'professional plumber near me',
    'reliable plumber',
    'reliable plumber near me',
    'trusted plumber',
    'trusted plumber near me',
    'top rated plumber',
    'top rated plumber near me',
    'plumbing company',
    'plumbing company near me',
    'plumbing contractor',
    'plumbing contractor near me',
    'plumbing experts',
    'plumbing experts near me',
]

COMMERCIAL_INTENT_PATTERNS = [
    'near me',
    'emergency',
    '24 hour',
    '24/7',
    'repair',
    'service',
    'installation',
    'replacement',
    'cleaning',
    'plumber',
    'plumbing',
    'cost',
    'price',
    'estimate',
    'quote',
    'affordable',
    'cheap',
    'best',
    'top rated',
    'licensed',
    'professional',
    'local',
    'hire',
    'contractor',
    'company',
]


def _is_commercial_intent(query):
    """Classify a search query as commercial intent."""
    q_lower = query.lower()

    # Direct match against known commercial keywords
    for kw in COMMERCIAL_INTENT_KEYWORDS:
        if kw in q_lower:
            return True

    # Pattern-based: contains at least one commercial pattern
    for pattern in COMMERCIAL_INTENT_PATTERNS:
        if pattern in q_lower:
            return True

    return False


def _parse_ctr(ctr_str):
    """Parse CTR string like '10%' or '0.1' to float."""
    if isinstance(ctr_str, (int, float)):
        return float(ctr_str)
    if ctr_str.endswith('%'):
        return float(ctr_str.rstrip('%')) / 100.0
    return float(ctr_str)


# ============================================================
# Query Data Loader
# ============================================================

def load_gsc_queries():
    """Load GSC query-level data from gsc-queries.csv."""
    path = ANALYTICS_CSV_DIR / 'gsc-queries.csv'
    if not path.exists():
        return []

    rows = list(csv.DictReader(open(path, encoding='utf-8')))
    queries = []
    for row in rows:
        try:
            queries.append({
                'query': row['Top queries'],
                'clicks': int(row['Clicks']),
                'impressions': int(row['Impressions']),
                'ctr': _parse_ctr(row['CTR']),
                'position': float(row['Position']),
            })
        except (ValueError, KeyError):
            continue

    return queries


# ============================================================
# 1. Top Commercial Queries
# ============================================================

def identify_top_commercial_queries(queries, top_n=20):
    """
    Identify queries with:
    - High impressions
    - Position between 10 and 30 (page 2-3 — reachable with optimization)
    - Low CTR
    - High commercial intent

    These represent the highest ROI opportunities: the page is visible
    but not being clicked, and the query has commercial intent (someone
    ready to call a plumber).
    """
    commercial = []
    for q in queries:
        if not _is_commercial_intent(q['query']):
            continue

        impressions = q['impressions']
        position = q['position']
        ctr = q['ctr']

        # Must have meaningful impression volume
        if impressions < 10:
            continue

        # Priority tier:
        # Tier 1: Position 10-30, low CTR (page 2-3, visible but not clicked)
        # Tier 2: Position 31-50, any CTR (page 3-5, needs content improvement)
        # Tier 3: Position 1-10, low CTR (page 1 but underperforming)
        tier = 0
        if 10 <= position <= 30 and ctr < 0.03:
            tier = 1
        elif 31 <= position <= 50:
            tier = 2
        elif 1 <= position <= 10 and ctr < 0.02:
            tier = 3

        if tier == 0:
            continue

        # Opportunity score: impressions * (1 - ctr) * tier_weight * position_proximity
        tier_weight = {1: 1.0, 2: 0.7, 3: 0.5}[tier]

        # Position proximity: closer to position 10 = higher opportunity
        if position >= 10:
            position_proximity = max(0.1, 1.0 - (position - 10) / 40.0)
        else:
            position_proximity = 0.3  # Already on page 1, less upside

        # CTR gap: how far below 5% (a reasonable target for commercial queries)
        ctr_gap = max(0.0, 0.05 - ctr)

        opportunity_score = (
            impressions
            * ctr_gap
            * tier_weight
            * position_proximity
        )

        # Estimated lost clicks: if CTR were at 5%, how many more clicks?
        target_ctr = 0.05
        estimated_lost_clicks = int(impressions * (target_ctr - ctr)) if ctr < target_ctr else 0

        commercial.append({
            'query': q['query'],
            'impressions': impressions,
            'clicks': q['clicks'],
            'ctr': ctr,
            'position': position,
            'tier': tier,
            'opportunity_score': opportunity_score,
            'estimated_lost_clicks': estimated_lost_clicks,
            'commercial_intent': True,
        })

    commercial.sort(key=lambda x: x['opportunity_score'], reverse=True)
    return commercial[:top_n]


# ============================================================
# 2. Top Money Pages
# ============================================================

def rank_money_pages(page_reports, revenue_per_call, recommendations, top_n=20):
    """
    Rank pages by Expected Revenue Opportunity, not impressions or clicks.

    Expected Revenue Opportunity = expected_revenue from Monte Carlo
    simulation * confidence, plus opportunity loss from commercial
    query underperformance.
    """
    # Build a map of target -> expected revenue from recommendations
    rec_revenue = {}
    rec_calls = {}
    rec_confidence = {}
    for rec in recommendations:
        impact = rec.expected_impact or {}
        target = rec.target
        if target not in rec_revenue:
            exp_rev = impact.get('expected_revenue', 0) or 0
            exp_calls = impact.get('expected_calls', 0) or 0
            rec_revenue[target] = exp_rev
            rec_calls[target] = exp_calls
            rec_confidence[target] = rec.confidence

    money_pages = []
    for page in page_reports:
        pid = page['page']
        impressions = page.get('impressions', 0)
        clicks = page.get('clicks', 0)
        ctr = page.get('ctr', 0.0)
        position = page.get('position')

        # Expected revenue from recommendations
        exp_rev = rec_revenue.get(pid, 0)
        exp_calls = rec_calls.get(pid, 0)
        confidence = rec_confidence.get(pid, 0)

        # Opportunity loss: if this page is at position > 10 with impressions,
        # it's losing potential clicks. Estimate lost clicks at target CTR of 5%.
        target_ctr = 0.05
        if ctr < target_ctr and impressions > 0:
            lost_clicks = int(impressions * (target_ctr - ctr))
        else:
            lost_clicks = 0

        # Estimate lost calls: lost_clicks * population call CVR
        # Use a conservative 5% call CVR if no better data
        call_cvr_estimate = 0.05
        lost_calls = int(lost_clicks * call_cvr_estimate)

        # Lost revenue
        lost_revenue = lost_calls * (revenue_per_call or 0)

        # Total revenue opportunity = expected revenue + lost revenue
        total_revenue_opportunity = exp_rev + lost_revenue

        # ROI score: revenue opportunity * confidence
        roi_score = total_revenue_opportunity * confidence

        money_pages.append({
            'page': pid,
            'impressions': impressions,
            'clicks': clicks,
            'ctr': ctr,
            'position': position,
            'expected_revenue': exp_rev,
            'expected_calls': exp_calls,
            'lost_clicks': lost_clicks,
            'lost_calls': lost_calls,
            'lost_revenue': lost_revenue,
            'total_revenue_opportunity': total_revenue_opportunity,
            'confidence': confidence,
            'roi_score': roi_score,
        })

    money_pages.sort(key=lambda x: x['roi_score'], reverse=True)
    return money_pages[:top_n]


# ============================================================
# 3. Opportunity Loss
# ============================================================

def calculate_opportunity_loss(page_reports, revenue_per_call, top_n=20):
    """
    Calculate estimated lost clicks, calls, and revenue for every page.
    Sort descending by lost revenue.
    """
    losses = []
    target_ctr = 0.05  # 5% target CTR for commercial pages
    call_cvr_estimate = 0.05  # conservative call CVR

    for page in page_reports:
        pid = page['page']
        impressions = page.get('impressions', 0)
        clicks = page.get('clicks', 0)
        ctr = page.get('ctr', 0.0)
        position = page.get('position')

        if impressions < 10:
            continue

        # Lost clicks: gap between current CTR and target CTR
        if ctr < target_ctr:
            lost_clicks = int(impressions * (target_ctr - ctr))
        else:
            lost_clicks = 0

        # Lost calls: lost clicks * call CVR
        lost_calls = int(lost_clicks * call_cvr_estimate)

        # Lost revenue
        lost_revenue = lost_calls * (revenue_per_call or 0)

        # Position-based opportunity: if at position 10-30, there's
        # additional upside from reaching page 1 (position < 10)
        position_upside = 0
        if position and 10 <= position <= 30:
            # Reaching page 1 could 5x the CTR
            position_upside_clicks = int(impressions * (target_ctr * 5 - ctr))
            position_upside_calls = int(position_upside_clicks * call_cvr_estimate)
            position_upside = position_upside_calls * (revenue_per_call or 0)

        total_lost_revenue = lost_revenue + position_upside

        losses.append({
            'page': pid,
            'impressions': impressions,
            'clicks': clicks,
            'ctr': ctr,
            'position': position,
            'lost_clicks': lost_clicks,
            'lost_calls': lost_calls,
            'lost_revenue': lost_revenue,
            'position_upside_revenue': position_upside,
            'total_lost_revenue': total_lost_revenue,
        })

    losses.sort(key=lambda x: x['total_lost_revenue'], reverse=True)
    return losses[:top_n]


# ============================================================
# 4. Recommendation Priority (Business-Weighted)
# ============================================================

def assign_business_priorities(recommendations, revenue_per_call):
    """
    Every recommendation gets:
    - Revenue Priority (1-5)
    - Call Priority (1-5)
    - Traffic Priority (1-5)
    - Engineering Priority (1-5)
    - Overall ROI (composite score)
    """
    if not recommendations:
        return []

    # Normalize business value scores for relative ranking
    max_bv = max(r.business_value_score for r in recommendations) or 1.0
    max_rev = max(
        (r.expected_impact or {}).get('expected_revenue', 0) or 0
        for r in recommendations
    ) or 1.0
    max_calls = max(
        (r.expected_impact or {}).get('expected_calls', 0) or 0
        for r in recommendations
    ) or 1.0

    prioritized = []
    for rec in recommendations:
        impact = rec.expected_impact or {}
        exp_rev = impact.get('expected_revenue', 0) or 0
        exp_calls = impact.get('expected_calls', 0) or 0

        # Revenue Priority: based on expected revenue relative to max
        rev_norm = exp_rev / max_rev if max_rev > 0 else 0
        revenue_priority = _tier_score(rev_norm)

        # Call Priority: based on expected calls relative to max
        calls_norm = exp_calls / max_calls if max_calls > 0 else 0
        call_priority = _tier_score(calls_norm)

        # Traffic Priority: based on the action's ability to increase traffic
        traffic_actions = {
            'expand_cluster': 0.9,
            'increase_internal_links': 0.7,
            'fix_broken_or_missing_internal_link': 0.6,
            'rewrite_title_and_meta_description': 0.8,
            'strengthen_content_depth_and_topical_relevance': 0.7,
            'add_trust_schema_and_faqs': 0.4,
            'improve_lead_qualification_copy': 0.2,
            'general_content_and_ux_audit': 0.5,
            'recovery_strategy': 0.6,
            'reconnect_cluster_via_internal_links': 0.5,
            'improve_content_quality_across_cluster': 0.5,
            'observe_and_wait': 0.0,
        }
        traffic_potential = traffic_actions.get(rec.action, 0.3)
        traffic_priority = _tier_score(traffic_potential)

        # Engineering Priority: based on confidence and actionability
        eng_score = rec.confidence * (1.0 if rec.action_plan else 0.5)
        engineering_priority = _tier_score(eng_score)

        # Overall ROI: weighted composite
        # Revenue 40%, Calls 30%, Traffic 20%, Engineering 10%
        overall_roi = (
            rev_norm * 0.40
            + calls_norm * 0.30
            + traffic_potential * 0.20
            + eng_score * 0.10
        )

        prioritized.append({
            'recommendation': rec,
            'revenue_priority': revenue_priority,
            'call_priority': call_priority,
            'traffic_priority': traffic_priority,
            'engineering_priority': engineering_priority,
            'overall_roi': overall_roi,
            'overall_roi_percent': overall_roi * 100,
        })

    prioritized.sort(key=lambda x: x['overall_roi'], reverse=True)
    return prioritized


def _tier_score(normalized):
    """Convert a 0-1 normalized score to a 1-5 tier."""
    if normalized >= 0.8:
        return 5
    if normalized >= 0.6:
        return 4
    if normalized >= 0.4:
        return 3
    if normalized >= 0.2:
        return 2
    return 1


# ============================================================
# 5. Kill Low ROI Recommendations
# ============================================================

def filter_low_roi(recommendations, revenue_per_call):
    """
    Kill recommendations that cannot realistically increase
    traffic, calls, or revenue.

    Criteria for killing:
    - observe_and_wait: business_value_score is 0, no action needed
    - No expected impact (no impressions, no calls, no revenue)
    - Confidence below 0.1 with no action plan
    - Business value score is 0 and no expected revenue
    """
    killed = []
    survivors = []

    for rec in recommendations:
        impact = rec.expected_impact or {}
        exp_rev = impact.get('expected_revenue', 0) or 0
        exp_calls = impact.get('expected_calls', 0) or 0
        bv = rec.business_value_score or 0

        # Kill observe_and_wait — no business action
        if rec.action == 'observe_and_wait':
            killed.append((rec, 'observe_and_wait — no business action needed'))
            continue

        # Kill if no expected impact at all
        if 'note' in impact and not exp_rev and not exp_calls:
            killed.append((rec, 'no measurable expected impact'))
            continue

        # Kill if business value is 0 AND no expected revenue AND no expected calls
        if bv == 0 and exp_rev == 0 and exp_calls == 0:
            killed.append((rec, 'zero business value, no expected revenue or calls'))
            continue

        # Kill if confidence is extremely low AND no action plan
        if rec.confidence < 0.05 and not rec.action_plan:
            killed.append((rec, 'extremely low confidence with no action plan'))
            continue

        survivors.append(rec)

    return survivors, killed


# ============================================================
# 6. CEO Report Generator
# ============================================================

def generate_ceo_report(top_queries, money_pages, opportunity_loss,
                        prioritized_recs, killed_recs, ctx):
    """Generate CEO_REPORT.md — exactly one executive report."""
    lines = []

    def p(s=''):
        lines.append(s)

    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    revenue_per_call = ctx.get('revenue_per_call') or 0

    p(f'# CEO Report — {today}')
    p()
    p('> **If you had only ONE day to work on YoHomeFix,')
    p('> what exactly would you do to maximize future calls and revenue?**')
    p()
    p('---')
    p()

    # Executive Summary
    total_upside = sum(mp['total_revenue_opportunity'] for mp in money_pages)
    total_lost = sum(ol['total_lost_revenue'] for ol in opportunity_loss)
    total_expected = sum(
        (r['recommendation'].expected_impact or {}).get('expected_revenue', 0) or 0
        for r in prioritized_recs[:20]
    )

    p('## Executive Summary')
    p()
    p(f'- **Pages analyzed:** {ctx["n_pages"]}')
    p(f'- **Commercial queries identified:** {len(top_queries)}')
    p(f'- **Recommendations generated:** {len(prioritized_recs) + len(killed_recs)}')
    p(f'- **Recommendations killed (low ROI):** {len(killed_recs)}')
    p(f'- **Active recommendations:** {len(prioritized_recs)}')
    p(f'- **Estimated business upside (top 20 pages):** ${total_upside:,.2f}')
    p(f'- **Estimated opportunity loss (top 20 pages):** ${total_lost:,.2f}')
    p(f'- **Expected revenue from top 20 actions:** ${total_expected:,.2f}')
    p(f'- **Revenue per approved call:** ${revenue_per_call:,.2f}')
    p()

    # Top 20 Commercial Queries
    p('## Top 20 Commercial Queries')
    p()
    p('Queries with high impressions, position 10-30, low CTR, and commercial intent.')
    p('These are people ready to call a plumber — we are visible but not getting clicked.')
    p()
    p('| # | Query | Impressions | Position | CTR | Lost Clicks | Opportunity Score |')
    p('|---|-------|-------------|----------|-----|-------------|-------------------|')
    for i, q in enumerate(top_queries[:20], 1):
        p(f'| {i} | {q["query"]} | {q["impressions"]:,} | {q["position"]:.1f} | {q["ctr"]:.1%} | {q["estimated_lost_clicks"]:,} | {q["opportunity_score"]:.1f} |')
    p()

    # Top 20 Money Pages
    p('## Top 20 Money Pages')
    p()
    p('Pages ranked by Expected Revenue Opportunity — not impressions, not clicks, not page score.')
    p()
    p('| # | Page | Impressions | CTR | Exp. Revenue | Lost Revenue | Total Opportunity | Confidence |')
    p('|---|------|-------------|-----|-------------|--------------|-------------------|------------|')
    for i, mp in enumerate(money_pages[:20], 1):
        page = mp['page']
        if len(page) > 50:
            page = page[:47] + '...'
        p(f'| {i} | `{page}` | {mp["impressions"]:,} | {mp["ctr"]:.1%} | ${mp["expected_revenue"]:.2f} | ${mp["lost_revenue"]:.2f} | ${mp["total_revenue_opportunity"]:.2f} | {mp["confidence"]:.1%} |')
    p()

    # Top 20 Opportunity Loss
    p('## Top 20 Opportunity Loss')
    p()
    p('Estimated lost clicks, calls, and revenue for every commercial page.')
    p('Sorted by total lost revenue (CTR gap + position upside).')
    p()
    p('| # | Page | Impressions | CTR | Position | Lost Clicks | Lost Calls | Lost Revenue | Position Upside | Total Lost |')
    p('|---|------|-------------|-----|----------|-------------|------------|--------------|-----------------|------------|')
    for i, ol in enumerate(opportunity_loss[:20], 1):
        page = ol['page']
        if len(page) > 40:
            page = page[:37] + '...'
        pos_str = f'{ol["position"]:.1f}' if ol['position'] else 'N/A'
        p(f'| {i} | `{page}` | {ol["impressions"]:,} | {ol["ctr"]:.1%} | {pos_str} | {ol["lost_clicks"]:,} | {ol["lost_calls"]} | ${ol["lost_revenue"]:.2f} | ${ol["position_upside_revenue"]:.2f} | ${ol["total_lost_revenue"]:.2f} |')
    p()

    # Top 20 Highest ROI Actions
    p('## Top 20 Highest ROI Actions')
    p()
    p('If you have one day, do these first. Sorted by Overall ROI.')
    p()
    p('| # | Action | Target | Rev Priority | Call Priority | Traffic Priority | Eng Priority | ROI % | Exp. Revenue | Exp. Calls | Confidence | Effort |')
    p('|---|--------|--------|-------------|--------------|-----------------|-------------|-------|-------------|------------|------------|--------|')
    for i, pr in enumerate(prioritized_recs[:20], 1):
        rec = pr['recommendation']
        target = rec.target
        if len(target) > 40:
            target = target[:37] + '...'
        impact = rec.expected_impact or {}
        exp_rev = impact.get('expected_revenue', 0) or 0
        exp_calls = impact.get('expected_calls', 0) or 0

        # Estimate effort
        action = rec.action
        if action == 'increase_internal_links':
            effort = '~100 min'
        elif action == 'expand_cluster':
            effort = '~8 hours'
        elif action in ('general_content_and_ux_audit', 'recovery_strategy'):
            effort = '~6 hours'
        elif action == 'fix_broken_or_missing_internal_link':
            effort = '~30 min'
        else:
            effort = '~2 hours'

        p(f'| {i} | {rec.action} | `{target}` | {pr["revenue_priority"]}/5 | {pr["call_priority"]}/5 | {pr["traffic_priority"]}/5 | {pr["engineering_priority"]}/5 | {pr["overall_roi_percent"]:.1f}% | ${exp_rev:.2f} | {exp_calls:.1f} | {rec.confidence:.1%} | {effort} |')
    p()

    # Detailed Action Plan for Top 5
    p('## Detailed Action Plan — Top 5 (Do These First)')
    p()
    for i, pr in enumerate(prioritized_recs[:5], 1):
        rec = pr['recommendation']
        impact = rec.expected_impact or {}
        exp_rev = impact.get('expected_revenue', 0) or 0
        exp_calls = impact.get('expected_calls', 0) or 0

        p(f'### {i}. {rec.action} — `{rec.target}`')
        p(f'- **Overall ROI:** {pr["overall_roi_percent"]:.1f}%')
        p(f'- **Revenue Priority:** {pr["revenue_priority"]}/5')
        p(f'- **Call Priority:** {pr["call_priority"]}/5')
        p(f'- **Traffic Priority:** {pr["traffic_priority"]}/5')
        p(f'- **Engineering Priority:** {pr["engineering_priority"]}/5')
        p(f'- **Expected Revenue:** ${exp_rev:.2f}')
        p(f'- **Expected Calls:** {exp_calls:.1f}')
        p(f'- **Confidence:** {rec.confidence:.1%}')
        p(f'- **Reason:** {rec.reason[:300]}')
        p()

        if rec.action_plan:
            p('**Action Plan:**')
            for step in rec.action_plan:
                p(f'- {step["action"]}: {step["reason"]} (severity: {step["severity"]:.1f})')
            p()

        p('---')
        p()

    # Estimated Business Upside
    p('## Estimated Business Upside')
    p()
    top20_revenue = sum(
        (pr['recommendation'].expected_impact or {}).get('expected_revenue', 0) or 0
        for pr in prioritized_recs[:20]
    )
    top20_calls = sum(
        (pr['recommendation'].expected_impact or {}).get('expected_calls', 0) or 0
        for pr in prioritized_recs[:20]
    )
    p(f'- **Expected revenue from top 20 actions:** ${top20_revenue:,.2f}')
    p(f'- **Expected calls from top 20 actions:** {top20_calls:.1f}')
    p(f'- **Opportunity loss from top 20 pages:** ${total_lost:,.2f}')
    p(f'- **Total business upside (revenue + recovered loss):** ${top20_revenue + total_lost:,.2f}')
    p()

    # Estimated Implementation Effort
    p('## Estimated Implementation Effort')
    p()
    effort_map = {
        'increase_internal_links': ('~100 min per page', 'Add internal links from high-authority pages'),
        'expand_cluster': ('~8 hours per cluster', 'Create missing service pages with full content'),
        'general_content_and_ux_audit': ('~6 hours per page', 'Add missing sections, entities, schema, EEAT'),
        'recovery_strategy': ('~6 hours per page', 'Content overhaul for bottom-decile pages'),
        'fix_broken_or_missing_internal_link': ('~30 min per link', 'Fix or add missing internal links'),
    }

    action_counts = defaultdict(int)
    for pr in prioritized_recs[:20]:
        action_counts[pr['recommendation'].action] += 1

    p('| Action | Count | Effort per Task | Total Effort | What It Does |')
    p('|--------|-------|-----------------|--------------|--------------|')
    for action, count in sorted(action_counts.items(), key=lambda x: -x[1]):
        effort, desc = effort_map.get(action, ('~2 hours', 'General optimization'))
        # Parse effort
        if 'min' in effort:
            mins = int(effort.replace('~', '').replace(' min per page', '').replace(' min per link', ''))
            total = mins * count
            total_str = f'{total} min ({total/60:.1f} hrs)'
        elif 'hours' in effort:
            hrs = int(effort.replace('~', '').replace(' hours per cluster', '').replace(' hours per page', ''))
            total = hrs * count
            total_str = f'{total} hours'
        else:
            total_str = effort

        p(f'| {action} | {count} | {effort} | {total_str} | {desc} |')
    p()

    # Estimated Confidence
    p('## Estimated Confidence')
    p()
    avg_conf = statistics.mean(
        pr['recommendation'].confidence for pr in prioritized_recs[:20]
    ) if prioritized_recs else 0
    high_conf = sum(1 for pr in prioritized_recs[:20] if pr['recommendation'].confidence >= 0.7)
    med_conf = sum(1 for pr in prioritized_recs[:20] if 0.3 <= pr['recommendation'].confidence < 0.7)
    low_conf = sum(1 for pr in prioritized_recs[:20] if pr['recommendation'].confidence < 0.3)

    p(f'- **Average confidence (top 20):** {avg_conf:.1%}')
    p(f'- **High confidence (>= 70%):** {high_conf} recommendations')
    p(f'- **Medium confidence (30-70%):** {med_conf} recommendations')
    p(f'- **Low confidence (< 30%):** {low_conf} recommendations')
    p()
    p('Confidence is derived from Bayesian posteriors, cross-run evidence,')
    p('and Learning Engine adjustments. High confidence means the engine')
    p('has enough data to trust its prediction. Low confidence means more')
    p('data is needed before acting.')
    p()

    # Killed Recommendations Summary
    if killed_recs:
        p('## Killed Recommendations (Low ROI)')
        p()
        p(f'{len(killed_recs)} recommendations were killed because they cannot')
        p('realistically increase traffic, calls, or revenue.')
        p()
        kill_reasons = defaultdict(int)
        for _, reason in killed_recs:
            kill_reasons[reason] += 1
        for reason, count in sorted(kill_reasons.items(), key=lambda x: -x[1]):
            p(f'- {reason}: {count}')
        p()

    p('---')
    p()
    p(f'*Generated by Business Priority Intelligence at {datetime.now(timezone.utc).isoformat()}*')
    p(f'*Uses only existing engine outputs. No new mathematical models.*')

    return '\n'.join(lines)


# ============================================================
# Pipeline (reuses existing engines)
# ============================================================

def _run_pipeline():
    ctx = {}
    ctx['snapshot_date'] = datetime.now(timezone.utc).strftime('%Y-%m-%d')

    # Load GSC page data
    page_reports = load_gsc_page_report_from_csv()
    ctx['page_reports'] = page_reports
    ctx['n_pages'] = len(page_reports)
    ctx['raw_metrics'] = {p['page']: p for p in page_reports}

    # Load GSC query data
    ctx['queries'] = load_gsc_queries()

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

    # Link Graph
    ctx['real_link_graph_metrics'] = {}
    if config.is_enabled('link_graph'):
        rg = build_real_link_graph()
        ctx['real_link_graph_metrics'] = diff_with_hierarchy(
            rg, ctx['taxonomy_orphans'], [p['page'] for p in page_reports],
        )

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
    if config.is_enabled('learning'):
        learning_engine.evaluate_all_learning()
        ls = learning_engine.get_learning_summary()
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

    return ctx


# ============================================================
# Main
# ============================================================

def run():
    ctx = _run_pipeline()
    revenue_per_call = ctx.get('revenue_per_call') or 0

    # 1. Top Commercial Queries
    top_queries = identify_top_commercial_queries(ctx['queries'], top_n=20)

    # 2. Top Money Pages
    money_pages = rank_money_pages(
        ctx['page_reports'], revenue_per_call, ctx['recs'], top_n=20,
    )

    # 3. Opportunity Loss
    opp_loss = calculate_opportunity_loss(
        ctx['page_reports'], revenue_per_call, top_n=20,
    )

    # 5. Kill Low ROI Recommendations
    survivors, killed = filter_low_roi(ctx['recs'], revenue_per_call)

    # 4. Assign Business Priorities to survivors
    prioritized = assign_business_priorities(survivors, revenue_per_call)

    # 6. Generate CEO Report
    report = generate_ceo_report(
        top_queries, money_pages, opp_loss,
        prioritized, killed, ctx,
    )

    # Write output
    with open('CEO_REPORT.md', 'w', encoding='utf-8') as f:
        f.write(report)

    # Console summary
    print('Business Priority Intelligence — Complete')
    print(f'  Pages analyzed:       {ctx["n_pages"]}')
    print(f'  Queries analyzed:     {len(ctx["queries"])}')
    print(f'  Commercial queries:   {len(top_queries)}')
    print(f'  Recommendations:      {len(ctx["recs"])}')
    print(f'  Killed (low ROI):     {len(killed)}')
    print(f'  Active (survivors):   {len(survivors)}')
    print(f'  Revenue per call:     ${revenue_per_call:.2f}')
    print()
    print(f'  Top 5 Actions (by ROI):')
    for i, pr in enumerate(prioritized[:5], 1):
        rec = pr['recommendation']
        impact = rec.expected_impact or {}
        exp_rev = impact.get('expected_revenue', 0) or 0
        print(f'    {i}. {rec.action} -> {rec.target[:40]} | ROI: {pr["overall_roi_percent"]:.1f}% | Rev: ${exp_rev:.2f}')
    print()
    print('  Output: CEO_REPORT.md')


if __name__ == '__main__':
    run()
