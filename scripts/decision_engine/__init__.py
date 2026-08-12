"""
YoHomeFix Decision Intelligence Engine (Phase 1)
=================================================

An internal, production-safe, feature-flagged mathematical decision layer
that learns from YoHomeFix's own analytics data (GSC, GA4, Marketcall) and
produces auditable, data-derived recommendations.

This package is fully isolated from:
    - engine/                  (the existing JS page-generation engine —
                                 untouched, different concern: deciding
                                 which pages to BUILD, not analyzing
                                 performance of pages already built)
    - scripts/analytics/       (GSC/GA4/Marketcall clients — untouched,
                                 only read from via data_ingestion.py)
    - UI, routing, SEO templates, production phone flow — untouched.

No module in this package executes anything against production on import.
Every module is independently importable, independently unit-testable, and
gated by the feature flags in `config.py` (all OFF by default — shadow
mode only until explicitly enabled).

Sub-modules
-----------
config              Feature flags + simulation/logging defaults.
logging_utils       Structured JSON logging + @traced decorator used by
                    every engine for input/output/timing/error capture.
numerics            Dependency-free numerical primitives (regularized
                    incomplete beta function, percentile/quantile helpers)
                    shared by bayesian_engine and montecarlo_engine.
bayesian_engine     Beta-Binomial Bayesian learning engine.
markov_engine       Discrete-time Markov funnel transition engine.
montecarlo_engine   Monte Carlo simulation engine.
graph_engine        Site-structure graph engine (PageRank, HITS,
                    centrality, orphan/weak-cluster detection).
opportunity_score   Percentile-rank-based opportunity scoring (no
                    invented weights).
recommendation_engine  Combines all of the above into ranked, explained
                    recommendations.
data_ingestion      Read-only adapters from existing reports/*.json and
                    gsc-data/*.json into this package's internal schema.

See docs/DECISION_INTELLIGENCE_ENGINE_v1.0.md for the full architecture,
formulas, validation methodology, and rollout plan.
"""

__version__ = '1.0.0-phase1'
