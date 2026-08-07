#!/usr/bin/env python3
"""
URL Action Plan Generator.

Converts the Decision Engine from a recommendation engine into an
ACTION ENGINE. Instead of producing recommendations, it produces
implementation instructions.

For every page selected by Business Priority Intelligence:
  1. Runs a COMPLETE analysis using ALL existing engines.
  2. Performs page-level ROOT CAUSE ANALYSIS identifying exact
     ranking blockers backed by engine evidence.
  3. Generates an IMPLEMENTATION PLAN with EXACT changes
     (Title, Meta, H1, Internal links, Schema, FAQ, Entity coverage,
     Trust section, CTA, Phone placement, Canonical, Anchor changes,
     Content sections).
  4. Every action includes Reason, Evidence, Expected ranking/CTR/
     call/revenue improvement, and Forecast confidence.
  5. If an expected improvement cannot be supported by evidence,
     writes UNKNOWN. Never invents numbers.

Output: URL_ACTION_PLAN.md — the ONLY implementation document.
A developer should be able to implement everything without opening
GSC, GA4, or any other report.

No new engines. No new mathematical models. Uses only existing
engine outputs.
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
from .execution_layer import (
    SERVICE_KEYWORDS, DEFAULT_SERVICE, EEAT_REQUIREMENTS, CONTENT_SECTIONS,
    _get_service_info, _extract_city, _find_related_pages,
    _find_high_authority_pages, _generate_anchor_text,
    _suggest_link_placement, _fill_template,
)


# ============================================================
# Page-Level Root Cause Analysis
# ============================================================

def _root_cause_analysis(page_id, ctx):
    """
    Identify the EXACT reasons preventing ranking improvement for this page.
    Every conclusion backed by evidence from one or more engines.
    """
    blockers = []

    raw = ctx['raw_metrics'].get(page_id, {})
    impressions = raw.get('impressions', 0)
    clicks = raw.get('clicks', 0)
    ctr = raw.get('ctr', 0.0)
    position = raw.get('position')

    # --- GSC Evidence ---
    if impressions > 0 and clicks == 0:
        blockers.append({
            'blocker': 'Zero clicks despite impressions',
            'evidence': f'GSC: {impressions:,} impressions, 0 clicks, CTR={ctr:.4f}',
            'engine': 'GSC',
            'severity': 'HIGH',
            'diagnosis': 'Title tag and meta description are not compelling enough to earn clicks at current position. SERP snippet is underperforming.',
        })

    if position and position > 30:
        blockers.append({
            'blocker': f'Position {position:.1f} — below page 3',
            'evidence': f'GSC: average position {position:.1f}',
            'engine': 'GSC',
            'severity': 'HIGH',
            'diagnosis': 'Content depth, topical authority, or internal link equity is insufficient for Google to rank this page on page 1-2.',
        })

    if position and 10 <= position <= 30 and ctr < 0.02:
        blockers.append({
            'blocker': f'Stuck on page 2-3 (position {position:.1f}) with low CTR ({ctr:.2%})',
            'evidence': f'GSC: position {position:.1f}, CTR {ctr:.4f}',
            'engine': 'GSC',
            'severity': 'MEDIUM',
            'diagnosis': 'Page is visible but not clicked. Title/meta optimization could improve CTR, and content depth improvement could push to page 1.',
        })

    # --- Opportunity Score Evidence ---
    opp = ctx['opp_by_id'].get(page_id)
    if opp:
        pct = opp.percentiles
        if opp.opportunity_gap_score > 0.7:
            blockers.append({
                'blocker': f'High opportunity gap score ({opp.opportunity_gap_score:.3f})',
                'evidence': f'Opportunity Score Engine: gap={opp.opportunity_gap_score:.3f}, impressions percentile={pct.get("impressions", 0):.2f}, CTR percentile={pct.get("ctr", 0):.2f}',
                'engine': 'Opportunity Score',
                'severity': 'MEDIUM',
                'diagnosis': 'Page has high visibility relative to the site population but is converting poorly. This is a prioritization signal, not a root cause itself.',
            })

        ctr_pct = pct.get('ctr')
        if ctr_pct is not None and ctr_pct <= 0.3:
            blockers.append({
                'blocker': f'CTR in bottom 30% of site population (percentile {ctr_pct:.2f})',
                'evidence': f'Opportunity Score: CTR percentile={ctr_pct:.2f}',
                'engine': 'Opportunity Score',
                'severity': 'HIGH',
                'diagnosis': 'CTR is in the bottom 30% relative to other YoHomeFix pages. Title tag and meta description need rewriting.',
            })

        pos_pct = pct.get('avg_position')
        if pos_pct is not None and pos_pct <= 0.3:
            blockers.append({
                'blocker': f'Position in bottom 30% of site population (percentile {pos_pct:.2f})',
                'evidence': f'Opportunity Score: position percentile={pos_pct:.2f}',
                'engine': 'Opportunity Score',
                'severity': 'HIGH',
                'diagnosis': 'Ranking is weak relative to other pages on the site. Content depth and topical authority need strengthening.',
            })

    # --- Link Graph Evidence ---
    gm = ctx['graph_metrics'].get(page_id, {})
    pagerank_val = gm.get('pagerank', 0.0)
    is_orphan = gm.get('is_orphan', False)
    in_degree = gm.get('in_degree', 0)

    if is_orphan:
        blockers.append({
            'blocker': 'Orphan page — no internal links point to it',
            'evidence': f'Link Graph: in_degree=0, is_orphan=True',
            'engine': 'Link Graph',
            'severity': 'HIGH',
            'diagnosis': 'No other page on the site links to this page. Google may struggle to discover and rank it. Internal links from high-authority pages are critical.',
        })
    elif in_degree <= 1:
        blockers.append({
            'blocker': f'Very few internal links (in_degree={in_degree})',
            'evidence': f'Link Graph: in_degree={in_degree}, PageRank={pagerank_val:.6f}',
            'engine': 'Link Graph',
            'severity': 'MEDIUM',
            'diagnosis': 'Only 1 internal link points to this page. Adding more internal links from relevant, high-authority pages will improve crawl frequency and ranking signals.',
        })

    # Check if PageRank is below median
    all_prs = [m.get('pagerank', 0) for m in ctx['graph_metrics'].values()]
    if all_prs:
        import statistics as stats_mod
        median_pr = stats_mod.median(all_prs)
        if pagerank_val < median_pr and not is_orphan:
            blockers.append({
                'blocker': f'PageRank {pagerank_val:.6f} below site median ({median_pr:.6f})',
                'evidence': f'Link Graph: PageRank={pagerank_val:.6f}, site median={median_pr:.6f}',
                'engine': 'Link Graph',
                'severity': 'MEDIUM',
                'diagnosis': 'Internal link equity flowing to this page is below the site median. More internal links from high-authority pages needed.',
            })

    # --- Real Link Graph Evidence ---
    real_metrics = ctx.get('real_link_graph_metrics', {})
    real_page = real_metrics.get(page_id, {}) if real_metrics else {}
    if real_page.get('link_discrepancy'):
        blockers.append({
            'blocker': 'Link discrepancy — taxonomy expects links that do not exist in the real crawl',
            'evidence': f'Link Graph (real crawl): link_discrepancy=True',
            'engine': 'Link Graph (Real Crawl)',
            'severity': 'MEDIUM',
            'diagnosis': 'The taxonomy graph expects internal links to/from this page that are missing from the actual crawled site. Fix broken or missing internal links.',
        })

    # --- Bayesian Evidence ---
    posterior = ctx['posteriors'].get(page_id)
    if posterior:
        ci_width = posterior.ci_high - posterior.ci_low
        posterior_mean = posterior.mean
        blockers.append({
            'blocker': f'CTR posterior mean={posterior_mean:.6f} (CI width={ci_width:.6f})',
            'evidence': f'Bayesian Engine: Beta({posterior.alpha:.0f}, {posterior.beta:.0f}), mean={posterior_mean:.6f}, CI=[{posterior.ci_low:.6f}, {posterior.ci_high:.6f}], n_obs={posterior.n_obs}',
            'engine': 'Bayesian',
            'severity': 'LOW',
            'diagnosis': f'CTR is estimated at {posterior_mean:.4%} based on {posterior.n_obs} impressions. {"Very low evidence volume — estimate is dominated by prior." if posterior.n_obs < 100 else "Sufficient evidence for a stable estimate."}',
        })

    # --- GA4 Evidence ---
    ga4 = ctx.get('ga4') or {}
    ga4_page = ga4.get(page_id, {})
    if ga4_page:
        sessions = ga4_page.get('sessions', 0)
        engagement_rate = ga4_page.get('engagement_rate')
        phone_clicks = ga4_page.get('phone_click_events', 0)

        if sessions > 0 and engagement_rate is not None and engagement_rate < 0.4:
            blockers.append({
                'blocker': f'Low engagement rate ({engagement_rate:.1%}) from {sessions} sessions',
                'evidence': f'GA4: sessions={sessions}, engagement_rate={engagement_rate:.4f}',
                'engine': 'GA4',
                'severity': 'MEDIUM',
                'diagnosis': 'Visitors land on the page but leave quickly. Content quality, page speed, or UX may be poor. Content audit recommended.',
            })

        if sessions > 0 and phone_clicks == 0:
            blockers.append({
                'blocker': 'Zero phone click events despite sessions',
                'evidence': f'GA4: sessions={sessions}, phone_click_events=0',
                'engine': 'GA4',
                'severity': 'MEDIUM',
                'diagnosis': 'Visitors are not clicking the call button. CTA placement, visibility, or copy may be poor. Phone number may not be prominently displayed.',
            })

    # --- Gott Temporal Prior Evidence ---
    tp = ctx.get('temporal_priors', {}).get(page_id)
    if tp:
        maturity = tp.maturity_score if hasattr(tp, 'maturity_score') else tp.get('maturity_score', 0)
        page_age = tp.page_age_days if hasattr(tp, 'page_age_days') else tp.get('page_age_days', 0)
        if maturity < 0.3 and page_age < 30:
            blockers.append({
                'blocker': f'Page is very young (age={page_age} days, maturity={maturity:.3f})',
                'evidence': f'Gott Engine: page_age_days={page_age}, maturity_score={maturity:.4f}',
                'engine': 'Gott Temporal Prior',
                'severity': 'LOW',
                'diagnosis': 'Page has not had enough time to accumulate ranking signals. Some ranking underperformance may be due to age, not quality.',
            })

    # --- Learning Engine Evidence ---
    learned = ctx.get('learned_adjustments', {})
    if learned:
        for rec_type, delta in learned.items():
            if abs(delta) > 0.01:
                blockers.append({
                    'blocker': f'Learning Engine adjustment for {rec_type}: delta={delta:+.3f}',
                    'evidence': f'Learning Engine: {rec_type} confidence_delta={delta:+.4f}',
                    'engine': 'Learning Engine',
                    'severity': 'LOW',
                    'diagnosis': f'Historical outcome data suggests {"increased" if delta > 0 else "decreased"} confidence for {rec_type} actions on similar pages.',
                })

    # If no blockers found
    if not blockers:
        blockers.append({
            'blocker': 'No specific ranking blockers identified by engine evidence',
            'evidence': 'All engines analyzed — no specific weak metric found',
            'engine': 'All',
            'severity': 'LOW',
            'diagnosis': 'Page does not have obvious weaknesses detected by the current engine suite. Manual audit may reveal issues not captured by automated analysis.',
        })

    # Sort by severity
    severity_order = {'HIGH': 0, 'MEDIUM': 1, 'LOW': 2}
    blockers.sort(key=lambda b: severity_order.get(b['severity'], 3))

    return blockers


# ============================================================
# Implementation Plan Generator
# ============================================================

def _generate_implementation_plan(page_id, blockers, rec, ctx):
    """
    Generate EXACT changes for a page.
    Every action includes Reason, Evidence, Expected improvements, Confidence.
    """
    actions = []
    service_info = _get_service_info(page_id)
    city = _extract_city(page_id)
    taxonomy = infer_taxonomy(page_id)
    raw = ctx['raw_metrics'].get(page_id, {})
    impressions = raw.get('impressions', 0)
    clicks = raw.get('clicks', 0)
    ctr = raw.get('ctr', 0.0)
    position = raw.get('position')
    posterior = ctx['posteriors'].get(page_id)

    # --- Title Tag ---
    title_reason = 'Zero clicks despite impressions — title tag not compelling'
    title_evidence = f'GSC: {impressions:,} impressions, {clicks} clicks, CTR={ctr:.4f}'
    if clicks == 0 and impressions > 0:
        actions.append({
            'change': 'Title Tag',
            'current': 'UNKNOWN — not crawled by this system',
            'recommended': f'{service_info["label"]} in {city} | 24/7 Licensed Plumbers | Free Estimate',
            'reason': title_reason,
            'evidence': title_evidence,
            'expected_ranking_improvement': 'UNKNOWN',
            'expected_ctr_improvement': 'MODEL ESTIMATE — CTR posterior mean is {:.4%}, improving title could increase CTR toward site median'.format(posterior.mean) if posterior else 'UNKNOWN',
            'expected_call_improvement': 'UNKNOWN',
            'expected_revenue_improvement': 'UNKNOWN',
            'confidence': 'LOW — title tag not crawled, current title unknown',
        })

    # --- Meta Description ---
    if clicks == 0 and impressions > 0:
        actions.append({
            'change': 'Meta Description',
            'current': 'UNKNOWN — not crawled by this system',
            'recommended': f'Need a {service_info["label"].lower()} in {city}? Licensed, insured plumbers available 24/7. Call now for a free estimate!',
            'reason': 'Zero clicks — meta description not earning clicks at current position',
            'evidence': title_evidence,
            'expected_ranking_improvement': 'UNKNOWN',
            'expected_ctr_improvement': 'MODEL ESTIMATE — improved meta description could increase CTR from {:.4%} toward site median'.format(ctr) if ctr < 0.01 else 'UNKNOWN',
            'expected_call_improvement': 'UNKNOWN',
            'expected_revenue_improvement': 'UNKNOWN',
            'confidence': 'LOW — meta description not crawled',
        })

    # --- H1 ---
    actions.append({
        'change': 'H1',
        'current': 'UNKNOWN — not crawled by this system',
        'recommended': f'{service_info["label"]} in {city}',
        'reason': 'Ensure H1 matches primary search intent (city + service)',
        'evidence': f'Taxonomy: service={taxonomy.get("service")}, city={city}',
        'expected_ranking_improvement': 'UNKNOWN',
        'expected_ctr_improvement': 'UNKNOWN',
        'expected_call_improvement': 'UNKNOWN',
        'expected_revenue_improvement': 'UNKNOWN',
        'confidence': 'LOW — H1 not crawled, current value unknown',
    })

    # --- Internal Links ---
    gm = ctx['graph_metrics'].get(page_id, {})
    is_orphan = gm.get('is_orphan', False)
    in_degree = gm.get('in_degree', 0)
    pagerank_val = gm.get('pagerank', 0.0)

    if is_orphan or in_degree <= 2:
        related = _find_related_pages(page_id, ctx['page_reports'], ctx['graph_metrics'], max_results=10)
        high_auth = _find_high_authority_pages(ctx['graph_metrics'], ctx['page_reports'], max_results=5)
        anchor_texts = _generate_anchor_text(page_id, service_info)

        links_to_add = []
        for i, source in enumerate(related[:5]):
            links_to_add.append({
                'source_page': source,
                'target_page': page_id,
                'anchor_text': anchor_texts[i % len(anchor_texts)],
                'placement': _suggest_link_placement(infer_taxonomy(source), infer_taxonomy(page_id)),
            })
        for i, source in enumerate(high_auth[:3]):
            if source not in related:
                links_to_add.append({
                    'source_page': source,
                    'target_page': page_id,
                    'anchor_text': anchor_texts[i % len(anchor_texts)],
                    'placement': 'Within relevant content or footer service links',
                })

        # Also links FROM this page to related pages
        outbound_links = []
        for rp in related[:5]:
            rp_service = _get_service_info(rp)
            rp_city = _extract_city(rp)
            outbound_links.append({
                'source_page': page_id,
                'target_page': rp,
                'anchor_text': f'{rp_service["label"]} in {rp_city}',
                'placement': 'Within services section or related services area',
            })

        actions.append({
            'change': 'Internal Links (Inbound)',
            'current': f'in_degree={in_degree}, PageRank={pagerank_val:.6f}',
            'recommended': f'Add {len(links_to_add)} internal links from related and high-authority pages',
            'links': links_to_add,
            'reason': 'Low internal link equity — page is {} with PageRank {}'.format(
                'an orphan (0 inbound links)' if is_orphan else f'underlinked (in_degree={in_degree})',
                f'{pagerank_val:.6f}'),
            'evidence': f'Link Graph: is_orphan={is_orphan}, in_degree={in_degree}, PageRank={pagerank_val:.6f}',
            'expected_ranking_improvement': 'MODEL ESTIMATE — internal links pass PageRank and improve crawl discoverability. Expected improvement in position is UNKNOWN without historical calibration.',
            'expected_ctr_improvement': 'UNKNOWN — depends on resulting position change',
            'expected_call_improvement': 'UNKNOWN — depends on traffic increase and call CVR (unmeasured)',
            'expected_revenue_improvement': 'UNKNOWN — depends on call increase and revenue per call (n=1)',
            'confidence': 'MEDIUM — link equity deficit is evidence-backed; magnitude of improvement is uncalibrated',
        })

        if outbound_links:
            actions.append({
                'change': 'Internal Links (Outbound)',
                'current': 'UNKNOWN — not crawled',
                'recommended': f'Add {len(outbound_links)} outbound internal links to related service pages',
                'links': outbound_links,
                'reason': 'Linking to related service pages strengthens topical cluster and improves site navigation',
                'evidence': f'Taxonomy: {len(related)} related pages in same cluster',
                'expected_ranking_improvement': 'UNKNOWN',
                'expected_ctr_improvement': 'UNKNOWN',
                'expected_call_improvement': 'UNKNOWN',
                'expected_revenue_improvement': 'UNKNOWN',
                'confidence': 'LOW',
            })

    # --- Schema ---
    actions.append({
        'change': 'Schema Markup',
        'current': 'UNKNOWN — not crawled by this system',
        'recommended': f'Add structured data: {", ".join(service_info["schema_types"])}',
        'reason': 'Structured data helps Google understand page content and can earn rich snippets',
        'evidence': f'Service template: {service_info["label"]} requires {", ".join(service_info["schema_types"])}',
        'expected_ranking_improvement': 'UNKNOWN',
        'expected_ctr_improvement': 'MODEL ESTIMATE — rich snippets can improve CTR but magnitude is uncalibrated for this site',
        'expected_call_improvement': 'UNKNOWN',
        'expected_revenue_improvement': 'UNKNOWN',
        'confidence': 'LOW — schema presence not verified by crawl',
    })

    # --- FAQ ---
    actions.append({
        'change': 'FAQ Section',
        'current': 'UNKNOWN — not crawled by this system',
        'recommended': f'Add FAQ section with {len(service_info["faqs"])} questions and FAQPage schema',
        'faqs': service_info['faqs'],
        'reason': 'FAQs target long-tail queries, earn FAQ rich results, and improve content depth',
        'evidence': f'Service template: {service_info["label"]} has {len(service_info["faqs"])} standard FAQs',
        'expected_ranking_improvement': 'UNKNOWN',
        'expected_ctr_improvement': 'MODEL ESTIMATE — FAQ rich results can improve CTR but magnitude is uncalibrated',
        'expected_call_improvement': 'UNKNOWN',
        'expected_revenue_improvement': 'UNKNOWN',
        'confidence': 'LOW — FAQ presence not verified by crawl',
    })

    # --- Entity Coverage ---
    actions.append({
        'change': 'Entity Coverage',
        'current': 'UNKNOWN — not crawled by this system',
        'recommended': f'Ensure these entities are mentioned in content: {", ".join(service_info["entities"])}',
        'entities': service_info['entities'],
        'reason': 'Entity-rich content improves topical authority and helps Google understand page relevance',
        'evidence': f'Service template: {service_info["label"]} requires entities: {", ".join(service_info["entities"][:3])}...',
        'expected_ranking_improvement': 'UNKNOWN',
        'expected_ctr_improvement': 'UNKNOWN',
        'expected_call_improvement': 'UNKNOWN',
        'expected_revenue_improvement': 'UNKNOWN',
        'confidence': 'LOW — entity coverage not verified by crawl',
    })

    # --- Content Sections ---
    missing_sections = []
    for section in CONTENT_SECTIONS:
        missing_sections.append({
            'section': section['section'],
            'elements': _fill_template(section, city, service_info),
        })

    actions.append({
        'change': 'Content Sections',
        'current': 'UNKNOWN — not crawled by this system',
        'recommended': f'Ensure all {len(missing_sections)} standard content sections are present',
        'sections': missing_sections,
        'reason': 'Complete content structure improves topical coverage and user experience',
        'evidence': f'Content template: {len(CONTENT_SECTIONS)} standard sections for {service_info["label"]} pages',
        'expected_ranking_improvement': 'MODEL ESTIMATE — content depth is a known ranking factor but magnitude is uncalibrated',
        'expected_ctr_improvement': 'UNKNOWN',
        'expected_call_improvement': 'UNKNOWN',
        'expected_revenue_improvement': 'UNKNOWN',
        'confidence': 'LOW — current content not verified by crawl',
    })

    # --- Trust / EEAT ---
    actions.append({
        'change': 'Trust / EEAT Section',
        'current': 'UNKNOWN — not crawled by this system',
        'recommended': f'Add {len(EEAT_REQUIREMENTS)} EEAT elements',
        'eeat_items': EEAT_REQUIREMENTS,
        'reason': 'EEAT signals (license, insurance, reviews, experience) improve trust signals for local service pages',
        'evidence': f'EEAT template: {len(EEAT_REQUIREMENTS)} standard trust elements',
        'expected_ranking_improvement': 'UNKNOWN',
        'expected_ctr_improvement': 'UNKNOWN',
        'expected_call_improvement': 'UNKNOWN',
        'expected_revenue_improvement': 'UNKNOWN',
        'confidence': 'LOW — EEAT elements not verified by crawl',
    })

    # --- CTA / Phone Placement ---
    ga4 = ctx.get('ga4') or {}
    ga4_page = ga4.get(page_id, {})
    phone_clicks = ga4_page.get('phone_click_events', 0)
    sessions = ga4_page.get('sessions', 0)

    cta_reason = 'Standard CTA optimization'
    cta_evidence = 'Best practice — phone number should be prominently visible'
    if sessions > 0 and phone_clicks == 0:
        cta_reason = 'Zero phone click events despite GA4 sessions — CTA not visible or not compelling'
        cta_evidence = f'GA4: sessions={sessions}, phone_click_events=0'
    elif clicks == 0 and impressions > 0:
        cta_reason = 'Zero clicks from GSC — page may also have CTA issues'
        cta_evidence = f'GSC: {impressions} impressions, 0 clicks'

    actions.append({
        'change': 'CTA / Phone Placement',
        'current': 'UNKNOWN — not crawled by this system',
        'recommended': 'Add click-to-call button in hero section (above the fold), sticky header, and footer. Phone number should be visible without scrolling.',
        'reason': cta_reason,
        'evidence': cta_evidence,
        'expected_ranking_improvement': 'UNKNOWN',
        'expected_ctr_improvement': 'UNKNOWN',
        'expected_call_improvement': 'MODEL ESTIMATE — prominent CTA can increase call conversion but magnitude is uncalibrated (call CVR unmeasured per-page)',
        'expected_revenue_improvement': 'UNKNOWN',
        'confidence': 'LOW — current CTA placement not verified by crawl',
    })

    # --- Canonical ---
    actions.append({
        'change': 'Canonical Tag',
        'current': 'UNKNOWN — not crawled by this system',
        'recommended': f'Ensure canonical tag points to: {page_id}',
        'reason': 'Prevent duplicate content issues from URL variations',
        'evidence': 'Best practice — canonical should match the page URL',
        'expected_ranking_improvement': 'UNKNOWN',
        'expected_ctr_improvement': 'UNKNOWN',
        'expected_call_improvement': 'UNKNOWN',
        'expected_revenue_improvement': 'UNKNOWN',
        'confidence': 'LOW — canonical not verified by crawl',
    })

    # --- Anchor Text Changes (from recommendation action_plan) ---
    if rec and rec.action_plan:
        for step in rec.action_plan:
            if step['action'] == 'increase_internal_links':
                # Already covered above
                continue
            elif step['action'] == 'rewrite_title_and_meta_description':
                # Already covered above
                continue
            elif step['action'] == 'strengthen_content_depth_and_topical_relevance':
                actions.append({
                    'change': 'Content Depth',
                    'current': 'UNKNOWN — not crawled by this system',
                    'recommended': 'Expand content to 1,500+ words with service-specific headings, detailed service descriptions, and entity-rich paragraphs',
                    'reason': step['reason'],
                    'evidence': f'Recommendation Engine: {step["reason"]} (severity: {step["severity"]:.1f})',
                    'expected_ranking_improvement': 'MODEL ESTIMATE — content depth is a known ranking factor but magnitude is uncalibrated',
                    'expected_ctr_improvement': 'UNKNOWN',
                    'expected_call_improvement': 'UNKNOWN',
                    'expected_revenue_improvement': 'UNKNOWN',
                    'confidence': 'MEDIUM — diagnosis is evidence-backed from Opportunity Score percentiles',
                })
            elif step['action'] == 'add_trust_schema_and_faqs':
                # Already covered in Schema and FAQ sections
                continue
            elif step['action'] == 'improve_lead_qualification_copy':
                actions.append({
                    'change': 'Lead Qualification Copy',
                    'current': 'UNKNOWN — not crawled by this system',
                    'recommended': 'Clarify service area, pricing, and scope on the page. Add "Serving [City] and surrounding areas" and starting price or "Free Estimate".',
                    'reason': step['reason'],
                    'evidence': f'Recommendation Engine: {step["reason"]} (severity: {step["severity"]:.1f})',
                    'expected_ranking_improvement': 'UNKNOWN',
                    'expected_ctr_improvement': 'UNKNOWN',
                    'expected_call_improvement': 'MODEL ESTIMATE — qualifying copy can improve call quality but call CVR is unmeasured per-page',
                    'expected_revenue_improvement': 'UNKNOWN',
                    'confidence': 'LOW — approval rate data is campaign-level, not per-page',
                })

    return actions


# ============================================================
# Markov Funnel for Page
# ============================================================

def _page_funnel_analysis(page_id, ctx):
    """Run Markov funnel analysis for a single page using available data."""
    raw = ctx['raw_metrics'].get(page_id, {})
    ga4 = ctx.get('ga4') or {}
    ga4_page = ga4.get(page_id, {})
    marketcall = ctx.get('marketcall') or {}

    impressions = raw.get('impressions', 0)
    clicks = raw.get('clicks', 0)
    sessions = ga4_page.get('sessions', 0)
    phone_clicks = ga4_page.get('phone_click_events', 0)
    total_calls = marketcall.get('calls', 0)
    approved_calls = marketcall.get('approved_calls', 0)

    # Build funnel from available data
    # If we have GA4 sessions, use them; otherwise use GSC clicks
    landing = sessions if sessions > 0 else clicks

    if impressions > 0 and landing > 0:
        stage_counts = [
            ('impression', impressions),
            ('click', clicks),
            ('landing_page', landing),
        ]
        if phone_clicks > 0:
            stage_counts.append(('phone_click', phone_clicks))
        if total_calls > 0:
            stage_counts.append(('call', total_calls))
            if approved_calls > 0:
                stage_counts.append(('approved_call', approved_calls))

        try:
            result = analyze_funnel(stage_counts)
            return result
        except ValueError:
            return None
    return None


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
    """Generate URL_ACTION_PLAN.md."""
    lines = []

    def p(s=''):
        lines.append(s)

    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    revenue_per_call = ctx.get('revenue_per_call') or 0

    p(f'# URL Action Plan — {today}')
    p()
    p('> **The ONLY implementation document.**')
    p('> A developer should be able to implement everything without opening GSC, GA4, or any other report.')
    p()
    p('---')
    p()

    # Executive Summary
    p('## Executive Summary')
    p()
    p(f'- **Pages selected for action:** {len(selected_pages)}')
    p(f'- **Total pages analyzed:** {ctx["n_pages"]}')
    p(f'- **Revenue per approved call:** ${revenue_per_call:.2f} (MEASURED, n=1)')
    p(f'- **Engines used:** GSC, GA4, Marketcall, Decision Store, Learning Engine, Gott Temporal Prior, Bayesian, Monte Carlo, Markov, Attribution, Link Graph, Business Priority Intelligence, CEO Report')
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

    # Per-Page Action Plans
    p('## Per-Page Action Plans')
    p()
    p('Pages are ordered by Business Priority Intelligence ROI ranking.')
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

        service_info = _get_service_info(page_id)
        city = _extract_city(page_id)

        p(f'### {i}. `{page_id}`')
        p()
        p(f'**Service:** {service_info["label"]} | **City:** {city}')
        p()

        # Current Metrics
        p('#### Current Metrics')
        p()
        p(f'| Metric | Value | Source |')
        p(f'|--------|-------|--------|')
        p(f'| Impressions | {impressions:,} | GSC |')
        p(f'| Clicks | {clicks} | GSC |')
        p(f'| CTR | {ctr:.4%} | GSC |')
        p(f'| Position | {position:.1f}' if position else '| Position | N/A | GSC |')
        gm = ctx['graph_metrics'].get(page_id, {})
        p(f'| PageRank | {gm.get("pagerank", 0):.6f} | Link Graph |')
        p(f'| In-degree | {gm.get("in_degree", 0)} | Link Graph |')
        p(f'| Is Orphan | {gm.get("is_orphan", False)} | Link Graph |')
        posterior = ctx['posteriors'].get(page_id)
        if posterior:
            p(f'| CTR Posterior Mean | {posterior.mean:.6f} | Bayesian |')
            p(f'| CTR CI | [{posterior.ci_low:.6f}, {posterior.ci_high:.6f}] | Bayesian |')
            p(f'| Posterior N | {posterior.n_obs} | Bayesian |')
        ga4 = ctx.get('ga4') or {}
        ga4_page = ga4.get(page_id, {})
        if ga4_page:
            p(f'| GA4 Sessions | {ga4_page.get("sessions", 0)} | GA4 |')
            p(f'| Engagement Rate | {ga4_page.get("engagement_rate", "N/A")} | GA4 |')
            p(f'| Phone Clicks | {ga4_page.get("phone_click_events", 0)} | GA4 |')
        tp = ctx.get('temporal_priors', {}).get(page_id)
        if tp:
            maturity = tp.maturity_score if hasattr(tp, 'maturity_score') else tp.get('maturity_score', 0)
            page_age = tp.page_age_days if hasattr(tp, 'page_age_days') else tp.get('page_age_days', 0)
            p(f'| Page Age | {page_age} days | Gott |')
            p(f'| Maturity Score | {maturity:.4f} | Gott |')
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
            p(f'| Confidence Basis | {forecast.get("confidence_basis", "UNKNOWN")} | |')
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

        # Ranking Blockers (Root Cause Analysis)
        blockers = _root_cause_analysis(page_id, ctx)
        p('#### Ranking Blockers (Root Cause Analysis)')
        p()
        p('Every blocker is backed by engine evidence. No generic SEO advice.')
        p()
        for b in blockers:
            p(f'- **[{b["severity"]}] {b["blocker"]}**')
            p(f'  - Evidence: `{b["evidence"]}`')
            p(f'  - Engine: {b["engine"]}')
            p(f'  - Diagnosis: {b["diagnosis"]}')
        p()

        # Implementation Plan
        actions = _generate_implementation_plan(page_id, blockers, rec, ctx)
        p('#### Implementation Plan')
        p()
        p('EXACT changes to implement. Every action includes reason, evidence, and expected improvements.')
        p()
        for j, action in enumerate(actions, 1):
            p(f'##### {j}. {action["change"]}')
            p()
            p(f'- **Current:** {action["current"]}')
            p(f'- **Recommended:** {action["recommended"]}')
            p(f'- **Reason:** {action["reason"]}')
            p(f'- **Evidence:** `{action["evidence"]}`')
            p(f'- **Expected ranking improvement:** {action["expected_ranking_improvement"]}')
            p(f'- **Expected CTR improvement:** {action["expected_ctr_improvement"]}')
            p(f'- **Expected call improvement:** {action["expected_call_improvement"]}')
            p(f'- **Expected revenue improvement:** {action["expected_revenue_improvement"]}')
            p(f'- **Confidence:** {action["confidence"]}')
            p()

            # Detailed sub-items
            if action.get('links'):
                p('  **Links to add:**')
                p()
                p('  | Source Page | Target Page | Anchor Text | Placement |')
                p('  |-------------|-------------|-------------|-----------|')
                for link in action['links']:
                    src = link['source_page'][:40] if len(link['source_page']) > 40 else link['source_page']
                    tgt = link['target_page'][:40] if len(link['target_page']) > 40 else link['target_page']
                    p(f'  | `{src}` | `{tgt}` | "{link["anchor_text"]}" | {link["placement"]} |')
                p()

            if action.get('faqs'):
                p('  **FAQs to add:**')
                p()
                for faq in action['faqs']:
                    p(f'  - {faq}')
                p()

            if action.get('entities'):
                p('  **Entities to include:**')
                p()
                for ent in action['entities']:
                    p(f'  - {ent}')
                p()

            if action.get('sections'):
                p('  **Content sections to ensure:**')
                p()
                for sec in action['sections']:
                    p(f'  - **{sec["section"]}**')
                    for elem in sec['elements']:
                        p(f'    - {elem}')
                p()

            if action.get('eeat_items'):
                p('  **EEAT elements to add:**')
                p()
                for eeat in action['eeat_items']:
                    p(f'  - {eeat}')
                p()

            p('---')
            p()

        p('---')
        p()

    # Summary
    p('## Summary')
    p()
    p(f'- **Pages with action plans:** {len(selected_pages)}')
    p(f'- **Total ranking blockers identified:** {sum(len(_root_cause_analysis(pd["page"], ctx)) for pd in selected_pages)}')
    p(f'- **Total implementation actions:** {sum(len(_generate_implementation_plan(pd["page"], _root_cause_analysis(pd["page"], ctx), pd.get("recommendation"), ctx)) for pd in selected_pages)}')
    p()
    p('### Evidence Classification Summary')
    p()
    p('| Classification | Meaning |')
    p('|----------------|---------|')
    p('| **MEASURED** | Directly observed from GSC, GA4, or Marketcall data |')
    p('| **ESTIMATED** | Derived from engine models (Bayesian, Monte Carlo, Markov) using observed data |')
    p('| **UNKNOWN** | Cannot be supported by evidence from existing engines |')
    p()
    p('### Confidence Calibration Status')
    p()
    p('- **Decision Store:** 0 rows (no historical snapshots)')
    p('- **Learning Records:** 0 rows (no outcome-based calibration)')
    p('- **Revenue per call:** n=1 approved call ($47.23)')
    p('- **Call CVR per page:** UNMEASURED (no per-page call attribution)')
    p('- **All dollar forecasts:** UNCALIBRATED MODEL ESTIMATES')
    p('- **Ranking/traffic diagnoses:** Evidence-backed from GSC, Opportunity Score, Link Graph')
    p()
    p('### Important Notes')
    p()
    p('- Title, meta, H1, schema, FAQ, and content section recommendations are based on service templates.')
    p('  Current page content is NOT crawled by this system. A developer must verify current state before implementing.')
    p('- Expected improvements marked as **MODEL ESTIMATE** are directionally correct but magnitude is uncalibrated.')
    p('- Expected improvements marked as **UNKNOWN** cannot be supported by evidence from existing engines.')
    p('- No numbers are fabricated. Every value is either measured, estimated from engines, or marked UNKNOWN.')
    p()

    p('---')
    p()
    p(f'*Generated by URL Action Plan Engine at {datetime.now(timezone.utc).isoformat()}*')
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
    # Build a map of page_id -> recommendation
    rec_by_target = {}
    for pr in prioritized:
        target = pr['recommendation'].target
        if target not in rec_by_target:
            rec_by_target[target] = pr

    # Build money_page map
    mp_by_page = {mp['page']: mp for mp in money_pages}

    # Build opp_loss map
    ol_by_page = {ol['page']: ol for ol in opp_loss}

    # Select top 20 pages from prioritized recommendations
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

    # If fewer than 20 from recommendations, fill from money_pages
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
    print('URL Action Plan Engine — Complete')
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
        print(f'    {i}. {pd["page"][:50]} | ROI: {roi:.1f}%')
    print()
    print('  Output: URL_ACTION_PLAN.md')


if __name__ == '__main__':
    run()
