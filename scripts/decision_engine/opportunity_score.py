"""
Opportunity Score Engine.

Purpose
-------
Score every page/cluster on two independent, fully data-derived axes —
"how well is it performing" and "how much unrealized opportunity does it
represent" — without ever hand-picking a weight or coefficient. Every
input metric is normalized against the *actual observed population* of
pages/clusters via empirical percentile rank, so the "weight" of each
metric is entirely determined by how that metric is actually distributed
across YoHomeFix's own data, not by an analyst's guess.

This directly generalizes the existing, already-accepted rule-based logic
in scripts/analytics/report_core.py::identify_opportunities (which uses
fixed thresholds, e.g. "impressions >= 100 and CTR < 2%") into a
continuous, population-relative form — the same *shape* of signal
(high visibility + low realized conversion = opportunity), just no longer
sensitive to an arbitrary cutoff.

Inputs
------
A list of records (dicts), each containing whichever of the following
measurable fields are available (no field is mandatory — any missing
field is simply excluded from that record's composite, and this is
logged):
    impressions, ctr, avg_position, calls, approval_rate, revenue,
    internal_authority   (typically a PageRank score from graph_engine)

Outputs
-------
Per input record, a `ScoreResult`:
    performance_score     geometric mean of percentile ranks of the
                           "doing well" metrics available for this record
                           (calls, approval_rate, revenue, internal_authority;
                           for avg_position, lower is better, so its
                           percentile is inverted first)
    opportunity_gap_score percentile(impressions) * (1 - percentile(ctr))
                           * (1 - percentile(calls))
                           — high visibility, low realized value
    metrics_used           which fields contributed (for auditability)
    percentiles             the raw percentile rank of every field used
                           (for auditability / explaining the score)

Mathematics used
-----------------
Percentile normalization (no invented weight):
    percentile_i = numerics.percentile_rank(sorted_population_values_of_metric_i, value_i)
    -> in [0, 1], where 1.0 means "at or above every other page/cluster
       observed on this metric."

performance_score (geometric mean, chosen because it is the standard
way to combine several [0,1]-normalized quantities into one score
*without* needing weights, and because it is conservative: a record
that scores near 0 on any one available metric gets a low composite
score, rather than being able to compensate with a high score elsewhere
the way an arithmetic mean would allow):
    performance_score = ( Product_{i in available} percentile_i ) ^ (1 / |available|)

opportunity_gap_score (direct continuization of report_core.py's existing
accepted rule "impressions >= 100 and CTR < 2%" — i.e. visible but
under-converting):
    opportunity_gap_score = percentile(impressions)
                             * (1 - percentile(ctr))
                             * (1 - percentile(calls))
    (any of the three terms defaults to a neutral 0.5 if that metric is
    unavailable for this record, and this substitution is recorded in
    `metrics_used` for transparency — never silently treated as 0 or 1,
    either of which would bias the score in a direction not supported by
    missing data.)

For avg_position, lower is objectively better (position 1 beats position
30), so its percentile is computed on the *negated* value before use,
so that percentile=1.0 consistently means "best" across every metric.

Computational complexity
-------------------------
O(n log n) to sort each metric's population once, then O(log n) per
percentile lookup (binary search) per record per metric — overall
O(n log n) for n records.

Future extensions
------------------
- Confounder adjustment (Epic D2 in the broader plan) before trusting any
  score directionally across pages with different launch cohorts/ages.
- Graph-regularized shrinkage (Epic D3) incorporating neighbor cluster
  performance into low-sample-size records' scores.
"""
from dataclasses import dataclass, field

from .logging_utils import traced
from .numerics import percentile_rank


NEUTRAL_PERCENTILE = 0.5  # used only when a metric is missing; documented above

PERFORMANCE_METRICS = ('calls', 'approval_rate', 'revenue', 'internal_authority')
LOWER_IS_BETTER_METRICS = {'avg_position'}


@dataclass
class ScoreResult:
    record_id: str
    performance_score: float | None
    opportunity_gap_score: float
    metrics_used: dict
    percentiles: dict

    def to_dict(self):
        return {
            'record_id': self.record_id,
            'performance_score': self.performance_score,
            'opportunity_gap_score': self.opportunity_gap_score,
            'metrics_used': self.metrics_used,
            'percentiles': self.percentiles,
        }


def _build_populations(records, fields):
    """Pre-sort the observed population for each metric field, once."""
    populations = {}
    for field_name in fields:
        values = [r[field_name] for r in records if field_name in r and r[field_name] is not None]
        if values:
            populations[field_name] = sorted(values)
    return populations


def _percentile_for(record, field_name, populations):
    """Percentile rank of record[field_name], oriented so 1.0 == best, None if unavailable."""
    if field_name not in record or record[field_name] is None or field_name not in populations:
        return None
    raw_value = record[field_name]
    if field_name in LOWER_IS_BETTER_METRICS:
        raw_value = -raw_value
        population = sorted(-v for v in populations[field_name])
    else:
        population = populations[field_name]
    return percentile_rank(population, raw_value)


@traced('opportunity_score')
def score_records(records, record_id_field='page'):
    """
    records: list of dicts, each with a unique `record_id_field` plus any
    of: impressions, ctr, avg_position, calls, approval_rate, revenue,
    internal_authority.
    """
    if not records:
        return []

    all_fields = set(PERFORMANCE_METRICS) | LOWER_IS_BETTER_METRICS | {'impressions', 'ctr'}
    populations = _build_populations(records, all_fields)

    results = []
    for record in records:
        percentiles = {}
        for field_name in all_fields:
            p = _percentile_for(record, field_name, populations)
            if p is not None:
                percentiles[field_name] = p

        # --- performance_score: geometric mean of available performance metrics ---
        perf_fields = [f for f in PERFORMANCE_METRICS if f in percentiles]
        if perf_fields:
            product = 1.0
            for f in perf_fields:
                product *= max(percentiles[f], 1e-12)  # avoid hard zero collapsing geometric mean
            performance_score = product ** (1.0 / len(perf_fields))
        else:
            performance_score = None

        # --- opportunity_gap_score: percentile(impressions) * (1 - ctr_pct) * (1 - calls_pct) ---
        metrics_used = {}
        imp_pct = percentiles.get('impressions')
        ctr_pct = percentiles.get('ctr')
        calls_pct = percentiles.get('calls')
        metrics_used['impressions'] = 'observed' if imp_pct is not None else 'neutral_default'
        metrics_used['ctr'] = 'observed' if ctr_pct is not None else 'neutral_default'
        metrics_used['calls'] = 'observed' if calls_pct is not None else 'neutral_default'
        imp_pct = imp_pct if imp_pct is not None else NEUTRAL_PERCENTILE
        ctr_pct = ctr_pct if ctr_pct is not None else NEUTRAL_PERCENTILE
        calls_pct = calls_pct if calls_pct is not None else NEUTRAL_PERCENTILE
        opportunity_gap_score = imp_pct * (1 - ctr_pct) * (1 - calls_pct)

        results.append(ScoreResult(
            record_id=str(record.get(record_id_field, id(record))),
            performance_score=performance_score,
            opportunity_gap_score=opportunity_gap_score,
            metrics_used=metrics_used,
            percentiles=percentiles,
        ))

    return results
