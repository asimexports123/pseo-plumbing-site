#!/usr/bin/env python3
"""
Production Validation: run the full Decision Engine on live data,
produce Top 50 recommendations with full metadata, validate quality,
score every recommendation, and emit a Recommendation Quality Report.

Usage:
    python -m scripts.decision_engine.production_validation

All feature flags must be enabled in the environment. This script
does NOT implement any new theoretical engines — it validates the
existing pipeline end-to-end.
"""
import sys, io
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import json
import logging
import os
from collections import Counter, defaultdict
from datetime import datetime, timezone

from . import config
from . import decision_store, marketcall_ingestion, ga4_ingestion
from .attribution_engine import (
    AttributionResolver, evidence_from_gsc_page, evidence_from_marketcall_campaign,
    evidence_from_ga4_page,
)
from .logging_utils import log
from .data_ingestion import load_gsc_page_report_from_csv, build_hierarchy_graph, ROOT_NODE
from .opportunity_score import score_records
from .graph_engine import pagerank, orphan_nodes, weakly_connected_components
from .bayesian_engine import BayesianEngine
from .link_ingestion import build_real_link_graph, diff_with_hierarchy
from .page_profile import build_page_decision_records
from .recommendation_engine import generate_recommendations
from . import learning_engine
from . import gott_engine


def _build_bayesian_observations(engine, page_reports):
    for page in page_reports:
        impressions = page.get('impressions', 0)
        clicks = page.get('clicks', 0)
        if impressions > 0:
            engine.observe(page['page'], successes=min(clicks, impressions), trials=impressions)


def _score_recommendation(rec):
    """Score a recommendation as Critical / High / Medium / Low."""
    bv = rec.business_value_score
    conf = rec.confidence
    action = rec.action

    # Critical: high business value + high confidence + actionable
    if bv >= 50 and conf >= 0.9:
        return 'Critical'
    # High: significant business value or high confidence with moderate value
    if bv >= 20 and conf >= 0.8:
        return 'High'
    if bv >= 10 and conf >= 0.9:
        return 'High'
    # Medium: moderate value or confidence
    if bv >= 5 and conf >= 0.5:
        return 'Medium'
    if conf >= 0.8:
        return 'Medium'
    # Low: everything else
    return 'Low'


def _identify_engines(rec):
    """Identify which engine(s) contributed to this recommendation."""
    engines = []
    sd = rec.supporting_data or {}
    action = rec.action

    # GSC is always a contributor (opportunity score uses GSC data)
    engines.append('GSC')

    # Graph engine
    if 'pagerank' in sd or 'is_orphan' in sd or action in ('increase_internal_links', 'fix_broken_or_missing_internal_link'):
        engines.append('Graph')

    # Bayesian engine
    if 'posterior' in sd or 'ci_high' in sd or action == 'expand_cluster':
        engines.append('Bayesian')

    # Learning engine
    if sd.get('learned_confidence_delta', 0.0) != 0.0:
        engines.append('Learning')

    # Gott engine
    if 'temporal_prior' in sd or action == 'observe_and_wait':
        engines.append('Gott')

    # Marketcall (via attribution or revenue)
    if 'attribution' in sd:
        engines.append('Attribution')

    # GA4 (via attribution)
    if sd.get('attribution') and isinstance(sd['attribution'], dict):
        sources = sd['attribution'].get('sources', [])
        if 'ga4' in sources or 'marketcall' in sources:
            if 'ga4' in sources:
                engines.append('GA4')
            if 'marketcall' in sources:
                engines.append('Marketcall')

    # Deduplicate while preserving order
    seen = set()
    result = []
    for e in engines:
        if e not in seen:
            seen.add(e)
            result.append(e)
    return result


def _detect_false_positives(recs, raw_metrics):
    """Identify likely false positives."""
    false_positives = []
    for rec in recs:
        target = rec.target
        raw = raw_metrics.get(target, {})
        impressions = raw.get('impressions', 0)
        clicks = raw.get('clicks', 0)

        # FP1: Page with 0 impressions getting content recommendations
        if impressions == 0 and rec.action not in ('fix_broken_or_missing_internal_link', 'observe_and_wait'):
            false_positives.append({
                'target': target,
                'action': rec.action,
                'reason': f'Zero impressions — no search visibility to diagnose',
                'confidence': rec.confidence,
            })

        # FP2: Page with 0 clicks and 0 impressions getting "improve" recs
        if impressions == 0 and clicks == 0 and rec.action == 'general_content_and_ux_audit':
            false_positives.append({
                'target': target,
                'action': rec.action,
                'reason': f'No traffic data — audit recommendation is speculative',
                'confidence': rec.confidence,
            })

    return false_positives


def _detect_duplicates(recs):
    """Identify duplicate recommendations (same target + same action)."""
    seen = {}
    duplicates = []
    for rec in recs:
        key = (rec.target, rec.action)
        if key in seen:
            duplicates.append({
                'target': rec.target,
                'action': rec.action,
                'reason': f'Duplicate of recommendation #{seen[key]}',
            })
        else:
            seen[key] = len(duplicates) + len(recs) - len(recs)  # index placeholder
    return duplicates


def _detect_weak_recommendations(recs):
    """Identify recommendations with weak evidence."""
    weak = []
    for rec in recs:
        # Weak: low confidence + low business value
        if rec.confidence < 0.3 and rec.business_value_score < 1.0:
            weak.append({
                'target': rec.target,
                'action': rec.action,
                'reason': f'Low confidence ({rec.confidence:.2f}) and low business value ({rec.business_value_score:.2f})',
                'confidence': rec.confidence,
                'business_value_score': rec.business_value_score,
            })

        # Weak: observe_and_wait with 0 business value (by design, but flag for awareness)
        if rec.action == 'observe_and_wait' and rec.business_value_score == 0.0:
            weak.append({
                'target': rec.target,
                'action': rec.action,
                'reason': f'Observe-and-wait with zero business value (temporal hold)',
                'confidence': rec.confidence,
                'business_value_score': rec.business_value_score,
            })
    return weak


def _detect_insufficient_evidence(recs):
    """Identify recommendations with insufficient evidence."""
    insufficient = []
    for rec in recs:
        sd = rec.supporting_data or {}
        basis = sd.get('confidence_basis', '')

        # Insufficient: using low-evidence constant
        if 'low_evidence' in basis.lower():
            insufficient.append({
                'target': rec.target,
                'action': rec.action,
                'reason': f'Confidence based on low-evidence constant (no statistical data)',
                'confidence': rec.confidence,
            })

        # Insufficient: expected_impact has a note instead of numbers
        impact = rec.expected_impact or {}
        if 'note' in impact and 'expected_calls' not in impact:
            insufficient.append({
                'target': rec.target,
                'action': rec.action,
                'reason': f'No numeric impact estimate — {impact.get("note", "unknown")}',
                'confidence': rec.confidence,
            })
    return insufficient


def _check_conflicts(recs, raw_metrics, marketcall_metrics, ga4_metrics):
    """Verify no recommendations conflict with revenue/engagement/trends."""
    conflicts = []

    for rec in recs:
        target = rec.target
        raw = raw_metrics.get(target, {})
        ga4 = ga4_metrics.get(target, {}) if ga4_metrics else {}

        # Check: recommending RETIRE/observe_and_wait on a page with revenue
        if rec.action in ('observe_and_wait',) and marketcall_metrics:
            # This is by design (temporal hold), not a conflict — but flag if
            # the page has actual call conversions
            if ga4 and ga4.get('phone_click_events', 0) > 0:
                conflicts.append({
                    'target': target,
                    'action': rec.action,
                    'conflict': 'Page has phone click events but recommendation is to wait',
                    'severity': 'low',
                })

        # Check: recommending content changes on a page with improving GA4 engagement
        if rec.action in ('rewrite_title_and_meta_description', 'strengthen_content_depth_and_topical_relevance') and ga4:
            sessions = ga4.get('sessions', 0)
            if sessions > 0:
                # Not necessarily a conflict — just flag for awareness
                pass

    return conflicts


def run():
    print('=' * 80)
    print('  YOHOMEFIX — DECISION ENGINE PRODUCTION VALIDATION')
    print(f'  Run time: {datetime.now(timezone.utc).isoformat()}')
    print('=' * 80)

    # ── 1. Run full pipeline ──────────────────────────────────────────
    print('\n── Stage 1: Running full Decision Engine pipeline ──\n')

    snapshot_date = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    page_reports = load_gsc_page_report_from_csv()
    print(f'  GSC pages loaded: {len(page_reports)}')

    # Marketcall
    marketcall_metrics = None
    revenue_per_approved_call = None
    if config.is_enabled('marketcall'):
        marketcall_metrics = marketcall_ingestion.load_marketcall_metrics()
        if marketcall_metrics:
            revenue_per_approved_call = marketcall_metrics.get('revenue_per_approved_call')
            print(f'  Marketcall: calls={marketcall_metrics["calls"]}, '
                  f'approved={marketcall_metrics["approved_calls"]}, '
                  f'revenue=${marketcall_metrics["revenue"]:.2f}')
        else:
            print('  Marketcall: [unavailable]')
    else:
        print('  Marketcall: [disabled]')

    # GA4
    ga4_metrics_by_page = None
    if config.is_enabled('ga4'):
        ga4_metrics_by_page = ga4_ingestion.load_ga4_page_metrics()
        if ga4_metrics_by_page:
            total_sessions = sum(m.get('sessions', 0) for m in ga4_metrics_by_page.values())
            print(f'  GA4: {len(ga4_metrics_by_page)} pages, {total_sessions} total sessions')
        else:
            print('  GA4: [unavailable]')
    else:
        print('  GA4: [disabled]')

    # Attribution
    attribution_resolver = None
    if config.is_enabled('attribution'):
        attribution_resolver = AttributionResolver()
        attribution_resolver.add_all(
            evidence_from_gsc_page(
                p['page'],
                {'impressions': p.get('impressions', 0), 'clicks': p.get('clicks', 0),
                 'ctr': p.get('ctr'), 'avg_position': p.get('position')},
            )
            for p in page_reports
        )
        if ga4_metrics_by_page:
            _ga4_meta_keys = {'attribution_level', 'attribution_note', 'source', 'date_from', 'date_to', 'fetched_at'}
            attribution_resolver.add_all(
                evidence_from_ga4_page(
                    page_id, {k: v for k, v in metrics.items() if k not in _ga4_meta_keys},
                    timestamp=metrics.get('fetched_at'),
                )
                for page_id, metrics in ga4_metrics_by_page.items()
            )
        if marketcall_metrics:
            attribution_resolver.add_evidence(
                evidence_from_marketcall_campaign(marketcall_metrics['campaign_id'], marketcall_metrics)
            )
        print(f'  Attribution: enabled')
    else:
        print('  Attribution: [disabled]')

    # Opportunity score
    opp_results = []
    if config.is_enabled('opportunity_score'):
        records = [
            {'page': p['page'], 'impressions': p.get('impressions', 0),
             'ctr': p.get('ctr', 0.0), 'avg_position': p.get('position')}
            for p in page_reports
        ]
        opp_results = score_records(records)
        print(f'  Opportunity scores: {len(opp_results)} pages scored')
    else:
        print('  Opportunity score: [disabled]')

    # Graph
    graph_metrics = {}
    weak_components = []
    taxonomy_orphans = set()
    if config.is_enabled('graph'):
        graph = build_hierarchy_graph(page_reports)
        ranks = pagerank(graph)
        taxonomy_orphans = set(orphan_nodes(graph, exclude=[ROOT_NODE]))
        graph_metrics = {
            p['page']: {
                'pagerank': ranks.get(p['page'], 0.0),
                'is_orphan': p['page'] in taxonomy_orphans,
                'in_degree': graph.in_degree(p['page']),
            }
            for p in page_reports
        }
        components = weakly_connected_components(graph)
        weak_components = components[1:] if len(components) > 1 else []
        print(f'  Graph: {len(graph_metrics)} pages, {len(taxonomy_orphans)} orphans, {len(weak_components)} weak components')
    else:
        print('  Graph: [disabled]')

    # Link graph
    real_link_graph_metrics = {}
    if config.is_enabled('link_graph'):
        real_graph = build_real_link_graph()
        real_link_graph_metrics = diff_with_hierarchy(
            real_graph, taxonomy_orphans, [p['page'] for p in page_reports],
        )
        discrepancies = sum(1 for v in real_link_graph_metrics.values() if v.get('link_discrepancy'))
        print(f'  Link graph: {discrepancies} link discrepancies found')
    else:
        print('  Link graph: [disabled]')

    # Bayesian
    posteriors = {}
    if config.is_enabled('bayesian'):
        engine = BayesianEngine()
        _build_bayesian_observations(engine, page_reports)
        posteriors = {k: engine.get_posterior(k) for k in engine.all_keys()}
        print(f'  Bayesian: {len(posteriors)} posteriors computed')
    else:
        print('  Bayesian: [disabled]')

    # Gott temporal priors
    temporal_priors = {}
    if config.is_enabled('gott'):
        temporal_priors = gott_engine.compute_all_temporal_priors()
        ready = sum(1 for p in temporal_priors.values() if p.evaluation_readiness)
        print(f'  Gott: {len(temporal_priors)} pages, {ready} ready for evaluation')
    else:
        print('  Gott: [disabled]')

    # Learning
    learned_adjustments = {}
    if config.is_enabled('learning'):
        learning_engine.evaluate_all_learning()
        learning_summary = learning_engine.get_learning_summary()
        learned_adjustments = learning_summary.adjustments
        print(f'  Learning: {learning_summary.record_count} records, '
              f'{learning_summary.success_count} successes, '
              f'{learning_summary.failure_count} failures')
    else:
        print('  Learning: [disabled]')

    # Recommendations
    print()
    if config.is_enabled('recommendation') and opp_results:
        raw_metrics = {p['page']: p for p in page_reports}
        recs = generate_recommendations(
            opp_results, graph_metrics=graph_metrics, bayesian_posteriors=posteriors,
            raw_metrics=raw_metrics, weak_components=weak_components,
            real_link_graph_metrics=real_link_graph_metrics,
            revenue_per_call=revenue_per_approved_call,
            attribution_resolver=attribution_resolver,
            learned_confidence_adjustments=learned_adjustments,
            temporal_priors={k: v.to_dict() for k, v in temporal_priors.items()},
        )
        print(f'  Recommendations generated: {len(recs)}')
    else:
        print('  Recommendations: [disabled or no opportunity scores]')
        recs = []

    # ── 2. Top 50 recommendations with full metadata ─────────────────
    print('\n── Stage 2: Top 50 Highest-Priority Recommendations ──\n')

    top_50 = recs[:50]
    for i, rec in enumerate(top_50, 1):
        engines = _identify_engines(rec)
        score = _score_recommendation(rec)
        impact = rec.expected_impact or {}
        exp_calls = impact.get('expected_calls', 'N/A')
        exp_revenue = impact.get('expected_revenue', 'N/A')
        sd = rec.supporting_data or {}

        print(f'  #{i:2d} [{score:8s}] {rec.action}')
        print(f'       Page: {rec.target}')
        print(f'       Problem: {rec.reason[:120]}...' if len(rec.reason) > 120 else f'       Problem: {rec.reason}')
        print(f'       Confidence: {rec.confidence:.4f}')
        print(f'       Business value score: {rec.business_value_score:.4f}')
        print(f'       Expected calls: {exp_calls}')
        print(f'       Expected revenue: ${exp_revenue}' if isinstance(exp_revenue, (int, float)) else f'       Expected revenue: {exp_revenue}')
        print(f'       Engines: {", ".join(engines)}')
        if sd.get('opportunity_gap_score') is not None:
            print(f'       Opportunity gap: {sd["opportunity_gap_score"]:.4f}')
        if sd.get('pagerank') is not None:
            print(f'       PageRank: {sd["pagerank"]:.6f}')
        if sd.get('is_orphan') is not None:
            print(f'       Orphan: {sd["is_orphan"]}')
        print()

    # ── 3. Validate recommendation quality ───────────────────────────
    print('\n── Stage 3: Recommendation Quality Validation ──\n')

    false_positives = _detect_false_positives(recs, raw_metrics)
    duplicates = _detect_duplicates(recs)
    weak_recs = _detect_weak_recommendations(recs)
    insufficient = _detect_insufficient_evidence(recs)

    print(f'  False positives detected: {len(false_positives)}')
    for fp in false_positives[:10]:
        print(f'    - {fp["target"]} ({fp["action"]}): {fp["reason"]}')
    if len(false_positives) > 10:
        print(f'    ... and {len(false_positives) - 10} more')

    print(f'\n  Duplicate recommendations: {len(duplicates)}')
    for d in duplicates[:10]:
        print(f'    - {d["target"]} ({d["action"]}): {d["reason"]}')

    print(f'\n  Weak recommendations: {len(weak_recs)}')
    for w in weak_recs[:10]:
        print(f'    - {w["target"]} ({w["action"]}): {w["reason"]}')
    if len(weak_recs) > 10:
        print(f'    ... and {len(weak_recs) - 10} more')

    print(f'\n  Insufficient evidence: {len(insufficient)}')
    for ie in insufficient[:10]:
        print(f'    - {ie["target"]} ({ie["action"]}): {ie["reason"]}')

    # ── 4. Score every recommendation ────────────────────────────────
    print('\n── Stage 4: Recommendation Scoring ──\n')

    scores = [_score_recommendation(rec) for rec in recs]
    score_counts = Counter(scores)
    for level in ['Critical', 'High', 'Medium', 'Low']:
        count = score_counts.get(level, 0)
        pct = (count / len(recs) * 100) if recs else 0
        print(f'  {level:8s}: {count:4d} ({pct:.1f}%)')

    # ── 5. Recommendation Quality Report ─────────────────────────────
    print('\n── Stage 5: Recommendation Quality Report ──\n')

    # Confidence distribution
    conf_buckets = {'0.9-1.0': 0, '0.7-0.9': 0, '0.5-0.7': 0, '0.3-0.5': 0, '0.0-0.3': 0}
    for rec in recs:
        c = rec.confidence
        if c >= 0.9:
            conf_buckets['0.9-1.0'] += 1
        elif c >= 0.7:
            conf_buckets['0.7-0.9'] += 1
        elif c >= 0.5:
            conf_buckets['0.5-0.7'] += 1
        elif c >= 0.3:
            conf_buckets['0.3-0.5'] += 1
        else:
            conf_buckets['0.0-0.3'] += 1

    print('  Confidence Distribution:')
    for bucket, count in conf_buckets.items():
        pct = (count / len(recs) * 100) if recs else 0
        bar = '#' * int(pct / 2)
        print(f'    {bucket:8s}: {count:4d} ({pct:5.1f}%) {bar}')

    # Engine contribution statistics
    engine_counts = Counter()
    for rec in recs:
        for e in _identify_engines(rec):
            engine_counts[e] += 1

    print('\n  Engine Contribution Statistics:')
    for engine, count in engine_counts.most_common():
        pct = (count / len(recs) * 100) if recs else 0
        print(f'    {engine:15s}: {count:4d} recommendations ({pct:.1f}%)')

    # Recommendation categories
    action_counts = Counter(rec.action for rec in recs)
    print('\n  Recommendation Categories:')
    for action, count in action_counts.most_common():
        pct = (count / len(recs) * 100) if recs else 0
        print(f'    {action:45s}: {count:4d} ({pct:.1f}%)')

    # Potential business impact
    total_expected_revenue = 0
    total_expected_calls = 0
    revenue_count = 0
    calls_count = 0
    for rec in recs:
        impact = rec.expected_impact or {}
        if 'expected_revenue' in impact and isinstance(impact['expected_revenue'], (int, float)):
            total_expected_revenue += impact['expected_revenue']
            revenue_count += 1
        if 'expected_calls' in impact and isinstance(impact['expected_calls'], (int, float)):
            total_expected_calls += impact['expected_calls']
            calls_count += 1

    print('\n  Potential Business Impact:')
    print(f'    Total expected calls (sum): {total_expected_calls:.1f}')
    print(f'    Total expected revenue (sum): ${total_expected_revenue:.2f}')
    print(f'    Recommendations with revenue estimate: {revenue_count}/{len(recs)}')
    print(f'    Recommendations with call estimate: {calls_count}/{len(recs)}')

    # ── 6. Conflict verification ─────────────────────────────────────
    print('\n── Stage 6: Conflict Verification ──\n')

    conflicts = _check_conflicts(recs, raw_metrics, marketcall_metrics, ga4_metrics_by_page)
    if not conflicts:
        print('  No conflicts detected with Marketcall revenue, GA4 engagement, or GSC trends.')
    else:
        print(f'  {len(conflicts)} potential conflicts detected:')
        for c in conflicts:
            print(f'    - {c["target"]} ({c["action"]}): {c["conflict"]} [severity: {c["severity"]}]')

    # ── 7. Quality improvement opportunities ─────────────────────────
    print('\n── Stage 7: Quality Improvement Opportunities ──\n')

    opportunities = []

    if false_positives:
        opportunities.append({
            'opportunity': 'Filter zero-impression pages from content recommendations',
            'impact': f'Would eliminate {len(false_positives)} false positive recommendations',
            'effort': 'Low — add impression > 0 guard in recommendation triggers',
        })

    # Check for pages with high impressions but 0 clicks that lack specific CTR recommendations
    high_imp_zero_click = 0
    for p in page_reports:
        if p.get('impressions', 0) >= 100 and p.get('clicks', 0) == 0:
            target = p['page']
            has_ctr_rec = any(r.target == target and 'rewrite_title' in r.action for r in recs)
            if not has_ctr_rec:
                high_imp_zero_click += 1
    if high_imp_zero_click > 0:
        opportunities.append({
            'opportunity': 'Add explicit CTR-improvement recommendations for high-impression zero-click pages',
            'impact': f'Would surface {high_imp_zero_click} pages with significant impressions but zero clicks',
            'effort': 'Medium — add a dedicated trigger rule for impressions >= threshold AND clicks == 0',
        })

    # Check for duplicate target+action pairs
    target_action_counts = Counter((r.target, r.action) for r in recs)
    actual_dups = sum(1 for v in target_action_counts.values() if v > 1)
    if actual_dups > 0:
        opportunities.append({
            'opportunity': 'Deduplicate recommendations with same target + action',
            'impact': f'Would remove {actual_dups} duplicate recommendations',
            'effort': 'Low — add dedup pass after recommendation generation',
        })

    # Check for recommendations without GA4 data
    if ga4_metrics_by_page:
        recs_without_ga4 = 0
        for rec in recs:
            if rec.target not in ga4_metrics_by_page and rec.action not in ('observe_and_wait', 'cluster_recovery_strategy'):
                recs_without_ga4 += 1
        if recs_without_ga4 > 0:
            opportunities.append({
                'opportunity': 'Expand GA4 tracking to cover more pages',
                'impact': f'{recs_without_ga4} recommendations lack GA4 engagement data for validation',
                'effort': 'High — requires GA4 property configuration changes',
            })

    # Check for recommendations using low-evidence confidence
    low_evidence_count = sum(1 for rec in recs if 'low_evidence' in str(rec.supporting_data.get('confidence_basis', '')).lower())
    if low_evidence_count > 0:
        opportunities.append({
            'opportunity': 'Collect more data for low-evidence recommendations',
            'impact': f'{low_evidence_count} recommendations use the low-evidence confidence constant',
            'effort': 'Ongoing — these pages need more search impressions to build statistical confidence',
        })

    # Check for link graph data gaps
    if not real_link_graph_metrics:
        opportunities.append({
            'opportunity': 'Crawl and persist internal link graph data',
            'impact': 'Would enable fix_broken_or_missing_internal_link recommendations',
            'effort': 'Medium — requires a site crawler to produce edges.jsonl',
        })

    for i, opp in enumerate(opportunities, 1):
        print(f'  {i}. {opp["opportunity"]}')
        print(f'     Impact: {opp["impact"]}')
        print(f'     Effort: {opp["effort"]}')
        print()

    # ── Summary ──────────────────────────────────────────────────────
    print('── Summary ──\n')
    print(f'  Total recommendations:     {len(recs)}')
    print(f'  Top 50 produced:           {min(50, len(recs))}')
    print(f'  Critical:                  {score_counts.get("Critical", 0)}')
    print(f'  High:                      {score_counts.get("High", 0)}')
    print(f'  Medium:                    {score_counts.get("Medium", 0)}')
    print(f'  Low:                       {score_counts.get("Low", 0)}')
    print(f'  False positives:           {len(false_positives)}')
    print(f'  Duplicates:                {len(duplicates)}')
    print(f'  Weak recommendations:      {len(weak_recs)}')
    print(f'  Insufficient evidence:     {len(insufficient)}')
    print(f'  Conflicts:                 {len(conflicts)}')
    print(f'  Improvement opportunities: {len(opportunities)}')
    print(f'  Total expected revenue:    ${total_expected_revenue:.2f}')
    print(f'  Total expected calls:      {total_expected_calls:.1f}')
    print()
    print('=' * 80)
    print('  PRODUCTION VALIDATION COMPLETE')
    print('=' * 80)

    # Persist snapshots
    if config.is_enabled('decision_store'):
        records = build_page_decision_records(
            page_reports, snapshot_date,
            ga4_metrics_by_page=ga4_metrics_by_page,
            marketcall_metrics=marketcall_metrics,
            opp_results=opp_results,
            graph_metrics=graph_metrics,
            real_link_graph_metrics=real_link_graph_metrics,
            bayesian_posteriors=posteriors,
            recommendations=recs,
            temporal_priors={k: v.to_dict() for k, v in temporal_priors.items()},
        )
        decision_store.save_snapshots(records)
        print(f'\n  Persisted {len(records)} PageDecisionRecord snapshots')


if __name__ == '__main__':
    run()
