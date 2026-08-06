"""
Unified Page Decision Model.

Purpose
-------
Every other module in this package (opportunity_score, graph_engine,
bayesian_engine, montecarlo_engine, recommendation_engine, ga4_ingestion,
marketcall_ingestion) currently produces its own dict/dataclass, keyed
ad hoc by page path, and `run_report.py` wires them together by hand for
a single in-memory run. `PageDecisionRecord` is the single canonical,
serializable object that normalizes *all* of those outputs for one page
on one day, so it can be:
    1. persisted (decision_store.py) as one row per page per day,
    2. queried historically (trend engine, not yet built),
    3. served to a dashboard API (not yet built),
without every consumer re-deriving its own merge logic.

This module performs no computation of its own — it only normalizes and
assembles outputs that other modules already computed. It never invents a
metric that was not actually produced upstream (a missing input stays
`None`/absent, exactly like every other module in this package).

Inputs
------
- `page_id` (str): the GSC page path (e.g. '/plumber-austin-tx-emergency'),
  already the stable identifier used throughout this package (opportunity_
  score.ScoreResult.record_id, graph_engine node ids, recommendation_
  engine.Recommendation.target all use this same string). Normalized via
  `normalize_page_id` (strip whitespace, collapse a trailing slash except
  for the bare root '/') so the same logical page can never silently
  fragment into two different stored rows due to a trailing-slash
  inconsistency between data sources.
- `snapshot_date` (str, 'YYYY-MM-DD'): the report date this record
  represents. Callers own picking this value (typically the GSC report's
  `end` date) — this module does not read the system clock.
- Optional per-page metric dicts/objects from upstream engines (gsc_
  metrics, ga4_metrics, link_graph_metrics, opportunity_score,
  bayesian_posterior, montecarlo_estimate, recommendations). Anything
  omitted is stored as `None` (or `[]` for `recommendations`), never
  fabricated.
- `marketcall_metrics` is deliberately **campaign/site-level, not
  per-page** (see marketcall_ingestion.py's own docstring: Marketcall's
  confirmed API schema has no page/URL field, so per-page call
  attribution cannot be derived from it without inventing a mapping).
  When supplied, the *same* dict is attached to every page's record for
  that snapshot date, and this is documented in the stored record itself
  via `marketcall_metrics['attribution_level'] == 'campaign'` so no
  downstream consumer mistakes it for a per-page figure.

Outputs
-------
`PageDecisionRecord` (dataclass) with `.to_dict()` / `.from_dict()` for
JSON round-tripping (used directly by decision_store.py), and
`SCHEMA_VERSION` so decision_store.py can detect and tolerate records
written by an older version of this dataclass (see `from_dict`'s
defensive `.get()` usage below — every field has a safe default so an
older stored JSON blob missing newer fields still loads).

`build_page_decision_records(page_reports, snapshot_date, ...)` bulk-
assembles one record per page from the same per-page/keyed-by-page-id
structures `run_report.py` already builds today (opp_results list,
graph_metrics dict, real_link_graph_metrics dict, posteriors dict,
recommendations list grouped by `.target`), so wiring this into
run_report.py is a drop-in addition, not a rewrite of existing stages.

Mathematics used
-----------------
None — pure data assembly/normalization.

Computational complexity
-------------------------
O(n) in the number of pages, plus O(r) to group r recommendations by
target (single pass, dict-of-lists).

Future extensions
------------------
- Once per-page Marketcall attribution is ever confirmed possible (a real
  page/URL field appears in the API, or a UTM/campaign-per-page mapping
  is established), replace the shared campaign-level `marketcall_metrics`
  with true per-page figures here — no other module needs to change.
"""
from dataclasses import dataclass, field, is_dataclass, asdict
from collections import defaultdict

SCHEMA_VERSION = 1


def normalize_page_id(page_id):
    """
    Canonicalize a page path so the same logical page never fragments into
    two stored rows due to trailing-slash or whitespace differences.
    """
    p = (page_id or '').strip()
    if len(p) > 1 and p.endswith('/'):
        p = p.rstrip('/')
    return p


def _serialize(value):
    """Best-effort JSON-safe conversion for values that may be a dataclass
    instance, an object with `.to_dict()`, or already a plain dict/list."""
    if value is None:
        return None
    if hasattr(value, 'to_dict'):
        return value.to_dict()
    if is_dataclass(value) and not isinstance(value, type):
        return asdict(value)
    return value


@dataclass
class PageDecisionRecord:
    page_id: str
    snapshot_date: str
    gsc_metrics: dict | None = None
    ga4_metrics: dict | None = None
    marketcall_metrics: dict | None = None
    link_graph_metrics: dict | None = None
    opportunity_score: dict | None = None
    bayesian_posterior: dict | None = None
    montecarlo_estimate: dict | None = None
    recommendations: list = field(default_factory=list)
    business_value_score: float | None = None
    temporal_prior: dict | None = None
    schema_version: int = SCHEMA_VERSION

    def __post_init__(self):
        self.page_id = normalize_page_id(self.page_id)
        if self.business_value_score is None and self.recommendations:
            scored = [r.get('business_value_score') for r in self.recommendations
                      if isinstance(r, dict) and r.get('business_value_score') is not None]
            if scored:
                self.business_value_score = max(scored)

    def to_dict(self):
        return {
            'schema_version': self.schema_version,
            'page_id': self.page_id,
            'snapshot_date': self.snapshot_date,
            'gsc_metrics': self.gsc_metrics,
            'ga4_metrics': self.ga4_metrics,
            'marketcall_metrics': self.marketcall_metrics,
            'link_graph_metrics': self.link_graph_metrics,
            'opportunity_score': self.opportunity_score,
            'bayesian_posterior': self.bayesian_posterior,
            'montecarlo_estimate': self.montecarlo_estimate,
            'recommendations': self.recommendations,
            'business_value_score': self.business_value_score,
            'temporal_prior': self.temporal_prior,
        }

    @classmethod
    def from_dict(cls, d):
        """
        Tolerant of missing keys so a record written by an older
        SCHEMA_VERSION still loads (backward compatibility) — every field
        not present in `d` falls back to this dataclass's own default.
        """
        return cls(
            page_id=d.get('page_id', ''),
            snapshot_date=d.get('snapshot_date', ''),
            gsc_metrics=d.get('gsc_metrics'),
            ga4_metrics=d.get('ga4_metrics'),
            marketcall_metrics=d.get('marketcall_metrics'),
            link_graph_metrics=d.get('link_graph_metrics'),
            opportunity_score=d.get('opportunity_score'),
            bayesian_posterior=d.get('bayesian_posterior'),
            montecarlo_estimate=d.get('montecarlo_estimate'),
            recommendations=d.get('recommendations') or [],
            business_value_score=d.get('business_value_score'),
            temporal_prior=d.get('temporal_prior'),
            schema_version=d.get('schema_version', SCHEMA_VERSION),
        )


def build_page_decision_record(
    page_id, snapshot_date, *,
    gsc_metrics=None, ga4_metrics=None, marketcall_metrics=None,
    link_graph_metrics=None, opportunity_score=None, bayesian_posterior=None,
    montecarlo_estimate=None, recommendations=None,
    temporal_prior=None,
):
    """Assemble one PageDecisionRecord from already-computed upstream outputs."""
    return PageDecisionRecord(
        page_id=page_id,
        snapshot_date=snapshot_date,
        gsc_metrics=_serialize(gsc_metrics),
        ga4_metrics=_serialize(ga4_metrics),
        marketcall_metrics=_serialize(marketcall_metrics),
        link_graph_metrics=_serialize(link_graph_metrics),
        opportunity_score=_serialize(opportunity_score),
        bayesian_posterior=_serialize(bayesian_posterior),
        montecarlo_estimate=_serialize(montecarlo_estimate),
        recommendations=[_serialize(r) for r in recommendations] if recommendations else [],
        temporal_prior=_serialize(temporal_prior),
    )


def build_page_decision_records(
    page_reports, snapshot_date, *,
    page_id_field='page',
    ga4_metrics_by_page=None,
    marketcall_metrics=None,
    graph_metrics=None,
    real_link_graph_metrics=None,
    opp_results=None,
    bayesian_posteriors=None,
    montecarlo_estimates_by_page=None,
    recommendations=None,
    temporal_priors=None,
):
    """
    Bulk-build one PageDecisionRecord per entry in `page_reports` (the same
    list `run_report.py` already loads via data_ingestion.load_gsc_page_
    report_from_csv()), merging in whichever optional per-page structures
    are supplied. Every optional argument mirrors a structure run_report.py
    already builds today:
        ga4_metrics_by_page          dict: page_id -> dict (ga4_ingestion.py)
        marketcall_metrics           dict (campaign-level; shared as-is
                                      across every record — see module
                                      docstring)
        graph_metrics                dict: page_id -> {'pagerank', 'is_orphan', 'in_degree'}
        real_link_graph_metrics      dict: page_id -> link_ingestion.diff_with_hierarchy() entry
        opp_results                  list of opportunity_score.ScoreResult
        bayesian_posteriors          dict: page_id -> bayesian_engine.PosteriorSummary
        montecarlo_estimates_by_page dict: page_id -> montecarlo_engine.SimulationResult
        recommendations              list of recommendation_engine.Recommendation
                                      (grouped here by `.target`; targets
                                      that are not a plain page_id, e.g.
                                      'cluster:...', are skipped since they
                                      do not correspond to a single page)
    """
    opp_by_id = {r.record_id: r for r in (opp_results or [])}
    recs_by_target = defaultdict(list)
    for rec in (recommendations or []):
        target = getattr(rec, 'target', None) if not isinstance(rec, dict) else rec.get('target')
        if target:
            recs_by_target[target].append(rec)

    marketcall_shared = None
    if marketcall_metrics is not None:
        marketcall_shared = dict(_serialize(marketcall_metrics))
        marketcall_shared.setdefault('attribution_level', 'campaign')

    records = []
    for page in page_reports:
        page_id = page[page_id_field]
        records.append(build_page_decision_record(
            page_id, snapshot_date,
            gsc_metrics=page,
            ga4_metrics=(ga4_metrics_by_page or {}).get(page_id),
            marketcall_metrics=marketcall_shared,
            link_graph_metrics=_merge_link_metrics(
                (graph_metrics or {}).get(page_id),
                (real_link_graph_metrics or {}).get(page_id),
            ),
            opportunity_score=opp_by_id.get(page_id),
            bayesian_posterior=(bayesian_posteriors or {}).get(page_id),
            montecarlo_estimate=(montecarlo_estimates_by_page or {}).get(page_id),
            recommendations=recs_by_target.get(page_id, []),
            temporal_prior=(temporal_priors or {}).get(page_id),
        ))
    return records


def _merge_link_metrics(taxonomy_graph_entry, real_link_graph_entry):
    if taxonomy_graph_entry is None and real_link_graph_entry is None:
        return None
    merged = dict(taxonomy_graph_entry or {})
    if real_link_graph_entry:
        merged.update(real_link_graph_entry)
    return merged
