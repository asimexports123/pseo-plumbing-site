#!/usr/bin/env python3
"""
CLI entrypoint: run the full Decision Intelligence Engine pipeline
end-to-end (ingest -> score -> graph -> bayesian -> recommend) and print a
human-readable, fully-cited report. Read-only: writes nothing to
scripts/analytics/, reports/, or gsc-data/.

Usage
-----
    python -m scripts.decision_engine.run_report

Each stage is gated by the corresponding feature flag in `config.py`
(DECISION_ENGINE_ENABLE_<STAGE>=1). All flags default OFF; this script
will explain what it skipped and why, rather than silently doing nothing.

This script only demonstrates the pipeline wiring — it does not persist
Bayesian state across runs by default (that would require deciding on a
canonical trials/successes definition per key, which is a product
decision, not a math one; see docstring of `_build_bayesian_observations`
below for the specific interim assumption made here).
"""
import logging
from datetime import datetime, timezone

from . import config
from . import decision_store, marketcall_ingestion
from .attribution_engine import (
    AttributionResolver, evidence_from_gsc_page, evidence_from_marketcall_campaign,
)
from .logging_utils import log
from .data_ingestion import load_gsc_page_report_from_csv, build_hierarchy_graph, ROOT_NODE
from .opportunity_score import score_records
from .graph_engine import pagerank, orphan_nodes, weakly_connected_components
from .bayesian_engine import BayesianEngine
from .link_ingestion import build_real_link_graph, diff_with_hierarchy
from .page_profile import build_page_decision_records
from .recommendation_engine import generate_recommendations


def _build_bayesian_observations(engine, page_reports):
    """
    Interim, documented assumption: treat each page's (clicks, impressions)
    as a Bernoulli trial for "click probability given impression". This is
    a stand-in for the eventual call-conversion posterior once per-page
    call attribution (not just per-site, per markov_engine's docstring) is
    available -- see data_ingestion.py's "Future extensions" section.
    """
    for page in page_reports:
        impressions = page.get('impressions', 0)
        clicks = page.get('clicks', 0)
        if impressions > 0:
            engine.observe(page['page'], successes=min(clicks, impressions), trials=impressions)


def run():
    flags = config.all_flag_status()
    log(logging.INFO, 'run_report_flags', flags=flags)
    snapshot_date = datetime.now(timezone.utc).strftime('%Y-%m-%d')

    page_reports = load_gsc_page_report_from_csv()
    if not page_reports:
        print('No GSC page data found (scripts/analytics/csv/gsc-pages.csv missing or empty).')
        print('Populate that CSV (see scripts/analytics/csv_report.py docstring) and re-run.')
        return

    # marketcall_ingestion: campaign-level call/revenue outcomes
    marketcall_metrics = None
    revenue_per_approved_call = None
    if config.is_enabled('marketcall'):
        marketcall_metrics = marketcall_ingestion.load_marketcall_metrics()
        if marketcall_metrics:
            revenue_per_approved_call = marketcall_metrics.get('revenue_per_approved_call')
            print(f"\n=== Marketcall (campaign {marketcall_metrics['campaign_id']}) ===")
            print(f"  window: {marketcall_metrics['date_from']} to {marketcall_metrics['date_to']}")
            print(f"  calls={marketcall_metrics['calls']}, approved={marketcall_metrics['approved_calls']}, revenue={marketcall_metrics['revenue']}")
            rate = marketcall_metrics['approval_rate']
            if rate is not None:
                print(f"  approval_rate={rate:.4f}")
        else:
            print('[skipped] marketcall data unavailable (API not configured, no data, or fetch failure)')
    else:
        print('[skipped] marketcall (DECISION_ENGINE_ENABLE_MARKETCALL not set)')

    # attribution_engine: reconcile GSC (page-level) + Marketcall
    # (campaign-level) evidence without fabricating page attribution.
    # GA4 evidence is not included -- GA4 credentials are not yet
    # configured (see attribution_engine.py's "Future extensions"); when
    # ga4_ingestion.py is built, it plugs into this same resolver via
    # evidence_from_ga4_page/evidence_from_ga4_event with zero changes here.
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
        if marketcall_metrics:
            attribution_resolver.add_evidence(
                evidence_from_marketcall_campaign(marketcall_metrics['campaign_id'], marketcall_metrics)
            )
        else:
            print('  [attribution] no Marketcall evidence available for this run')
        print('  [attribution] GA4 evidence unavailable (not configured) — resolving with GSC + Marketcall only')
        unattributed = attribution_resolver.unattributed_summary()
        if unattributed['has_unattributed_evidence']:
            print(f"  [attribution] {unattributed['count']} unattributed evidence entr"
                  f"{'y' if unattributed['count'] == 1 else 'ies'} from: {sorted(unattributed['by_source'].keys())}")
    else:
        print('[skipped] attribution (DECISION_ENGINE_ENABLE_ATTRIBUTION not set)')

    # opportunity_score
    opp_results = []
    if config.is_enabled('opportunity_score'):
        # NOTE: 'calls'/'approval_rate'/'revenue' are intentionally omitted
        # here rather than hardcoded to 0 — no per-page call-attribution
        # data is available yet (see data_ingestion.py's "Future
        # extensions"), and opportunity_score.py treats a genuinely absent
        # field as "unavailable" (neutral 0.5 default), whereas a literal
        # 0 for every record would be a real, identical observed value
        # that collapses every record's calls-percentile to 1.0 and, in
        # turn, every opportunity_gap_score to 0 — see recommendation_engine.py.
        records = [
            {'page': p['page'], 'impressions': p.get('impressions', 0),
             'ctr': p.get('ctr', 0.0), 'avg_position': p.get('position')}
            for p in page_reports
        ]
        opp_results = score_records(records)
    else:
        print('[skipped] opportunity_score (DECISION_ENGINE_ENABLE_OPPORTUNITY_SCORE not set)')

    # graph_engine
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
        # Every component except the largest is a structurally isolated
        # "weak cluster" per graph_engine.weakly_connected_components's
        # own docstring (components are returned largest-first).
        components = weakly_connected_components(graph)
        weak_components = components[1:] if len(components) > 1 else []
    else:
        print('[skipped] graph (DECISION_ENGINE_ENABLE_GRAPH not set)')

    # link_ingestion (real crawled link graph vs. taxonomy graph)
    real_link_graph_metrics = {}
    if config.is_enabled('link_graph'):
        real_graph = build_real_link_graph()
        real_link_graph_metrics = diff_with_hierarchy(
            real_graph, taxonomy_orphans, [p['page'] for p in page_reports],
        )
    else:
        print('[skipped] link_graph (DECISION_ENGINE_ENABLE_LINK_GRAPH not set)')

    # bayesian_engine
    posteriors = {}
    if config.is_enabled('bayesian'):
        engine = BayesianEngine()
        _build_bayesian_observations(engine, page_reports)
        posteriors = {k: engine.get_posterior(k) for k in engine.all_keys()}
    else:
        print('[skipped] bayesian (DECISION_ENGINE_ENABLE_BAYESIAN not set)')

    # recommendation_engine
    recs = []
    if config.is_enabled('recommendation') and opp_results:
        raw_metrics = {p['page']: p for p in page_reports}
        recs = generate_recommendations(
            opp_results, graph_metrics=graph_metrics, bayesian_posteriors=posteriors,
            raw_metrics=raw_metrics, weak_components=weak_components,
            real_link_graph_metrics=real_link_graph_metrics,
            revenue_per_call=revenue_per_approved_call,
            attribution_resolver=attribution_resolver,
        )
        print(f'\n=== {len(recs)} Recommendations ===\n')
        for r in recs[:20]:
            print(f'[{r.action}] {r.target}  (confidence={r.confidence:.2f})')
            print(f'  reason: {r.reason}')
            print(f'  impact: {r.expected_impact}\n')
    else:
        print('[skipped] recommendation (DECISION_ENGINE_ENABLE_RECOMMENDATION not set, or no opportunity scores)')

    # decision_store: persist the full snapshot (including marketcall_metrics)
    if config.is_enabled('decision_store'):
        records = build_page_decision_records(
            page_reports, snapshot_date,
            marketcall_metrics=marketcall_metrics,
            opp_results=opp_results,
            graph_metrics=graph_metrics,
            real_link_graph_metrics=real_link_graph_metrics,
            bayesian_posteriors=posteriors,
            recommendations=recs,
        )
        decision_store.save_snapshots(records)
        print(f'\n=== Persisted {len(records)} PageDecisionRecord snapshots ===')


if __name__ == '__main__':
    run()
