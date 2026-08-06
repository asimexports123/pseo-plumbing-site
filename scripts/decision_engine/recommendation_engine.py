"""
Recommendation Engine.

Purpose
-------
Combine the outputs of opportunity_score.py, graph_engine.py,
bayesian_engine.py, and montecarlo_engine.py into a ranked list of
concrete, explained, uncertainty-quantified recommendations. Every
recommendation is a *consequence of a documented rule applied to measured
data* — no recommendation is ever emitted without the specific numbers
that triggered it, so every recommendation is independently auditable by
re-checking the stated numbers.

Inputs
------
- `opportunity_results`: list of opportunity_score.ScoreResult (or .to_dict()).
- `graph_metrics` (optional): dict keyed by the same record_id as above,
  each value like {'pagerank': float, 'in_degree': int, 'is_orphan': bool}.
  If omitted, link-authority-based diagnoses are skipped (and this is
  logged, not silently ignored).
- `bayesian_posteriors` (optional): dict keyed by record_id ->
  bayesian_engine.PosteriorSummary, tracked *across runs*. Used whenever
  available since it carries more history than a single snapshot.
- `raw_metrics` (optional): dict keyed by record_id -> the original input
  record passed into opportunity_score.score_records (impressions, ctr,
  clicks, avg_position, calls, revenue, approval_rate, approved_calls —
  whichever are available). Used to (a) build a per-target ad hoc
  Bayesian posterior when no cross-run posterior exists yet, so
  confidence is always evidence-derived, never score-derived, and (b)
  drive the per-target Monte Carlo impact simulation.
- `weak_components` (optional): list of node-id sets, e.g. every
  component from graph_engine.weakly_connected_components() *except* the
  largest (caller's responsibility to exclude it) — used to diagnose and
  produce a recovery strategy for structurally isolated clusters, not
  just individually underperforming pages.
- `real_link_graph_metrics` (optional): dict keyed by record_id ->
  link_ingestion.diff_with_hierarchy() output ({'real_in_degree',
  'real_pagerank', 'real_is_orphan', 'link_discrepancy'}), built from the
  *actual* crawled internal link graph (see link_ingestion.py), not the
  inferred taxonomy graph `graph_metrics` above comes from. Used only for
  the dedicated `fix_broken_or_missing_internal_link` diagnosis below —
  it never overrides or replaces any `graph_metrics`-based diagnosis. If
  omitted, that diagnosis is skipped (and this is logged, not silently
  ignored), matching `graph_metrics`'s own convention.
- `mc_seed` (optional): base seed for the embedded Monte Carlo
  simulations (default config.MC_DEFAULT_SEED), reproducible per target
  via a deterministic per-target offset (crc32 of the target id).
- `revenue_per_call` (optional): a campaign-level revenue-per-approved-call
  figure (e.g. from marketcall_ingestion.py) used as a fallback for
  `_simulate_target_impact`'s revenue estimate only when `raw_metrics`
  cannot supply a population-derived ratio of its own.
- `attribution_resolver` (optional): an attribution_engine.AttributionResolver
  already populated with evidence for this run. When supplied, each
  per-page recommendation's `supporting_data['attribution']` is set to
  that page's `resolve_page(target)` result (page-level evidence only,
  never fabricated) purely as additional audit context -- it never
  changes which recommendations are triggered, their confidence, or their
  business_value_score. When omitted (the default), behavior is identical
  to before this parameter existed.

Outputs
-------
List of `Recommendation`:
    action              a *specific* diagnosed action (e.g.
                        'rewrite_title_and_meta_description',
                        'strengthen_content_depth_and_topical_relevance',
                        'add_trust_schema_and_faqs',
                        'improve_lead_qualification_copy',
                        'increase_internal_links', 'expand_cluster',
                        'recovery_strategy', 'cluster_recovery_strategy',
                        'general_content_and_ux_audit') — the single
                        highest-severity item of `action_plan` below.
    action_plan         ordered list of *all* diagnosed remediation steps
                        for this target (each: action, reason, severity),
                        most severe first — this is what replaces a flat
                        "improve page" with a prioritized, specific plan.
    target              record_id (or 'cluster:<id>(+N more)') this
                        recommendation applies to
    reason              human-readable, numbers-included explanation of
                        the primary (highest-severity) diagnosis
    supporting_data     the exact metric values that triggered the rule
    confidence          in [0, 1], *always* evidence-derived: a Bayesian
                        credible-interval width (narrower = higher
                        confidence) from either a supplied cross-run
                        posterior or an ad hoc single-snapshot posterior
                        built from this target's own counts; only when
                        neither is possible does it fall back to a flat,
                        clearly-labeled low-evidence constant. It is never
                        derived from how extreme the opportunity/
                        performance score itself is (score extremity says
                        nothing about how much data backs it).
    expected_impact     dict with `expected_calls`, `calls_ci_low/high`,
                        `expected_approved_calls`,
                        `approved_calls_ci_low/high`, `ci_level`, and (if
                        a population revenue/call ratio could be computed
                        from `raw_metrics`) `expected_revenue`,
                        `revenue_ci_low/high`. If the target has no usable
                        counts, a `note` key explains why instead of
                        fabricating a number.
    business_value_score confidence-weighted expected value (revenue if
                        available, else calls) — used for final ranking.

Mathematics used
-----------------
Trigger rules (all thresholds below are *statistical*, not business
weights — see inline comments):
    increase_internal_links:
        opportunity_gap_score >= 0.5 (population median) AND the target
        is either an orphan (in-degree 0) or below the *median* pagerank
        of the observed graph population.
    expand_cluster:
        Bayesian posterior mean above the median posterior mean across
        all tracked keys, AND a narrow credible interval (<= median
        interval width), AND n_obs below the median n_obs (a confidently
        good performer that has not yet been scaled up).
    top-decile diagnosis (opportunity_gap_score >= 90th percentile):
        routed through `_diagnose_actions` (see below) instead of a flat
        "improve page" label.
    recovery_strategy (per page, replaces flat "reduce_investment"):
        performance_score <= 10th percentile AND (if a posterior is
        available) a narrow credible interval (so "low" is a confident
        conclusion, not a small-sample artifact) — routed through
        `_diagnose_actions` to identify *why* it is weak.
    cluster_recovery_strategy:
        one per caller-supplied weak component — diagnoses structural
        isolation (always, since weak components are isolated by
        definition) plus, if the component's average performance_score
        is below the population midpoint (0.5), content-quality as a
        compounding cause.
    fix_broken_or_missing_internal_link:
        `real_link_graph_metrics[target]['link_discrepancy']` is True —
        i.e. the taxonomy graph does NOT consider this page orphaned
        (some other page's URL structure implies a link to it) but the
        *real*, crawled link graph shows zero actual incoming links. This
        is a distinct signal from plain `increase_internal_links`: it
        means a link is expected to exist and does not — most likely
        broken, missing, or rendered only client-side in a way a crawler
        does not see — rather than the page simply being deep/unlinked by
        design.

_diagnose_actions routes each already-computed percentile (from
opportunity_score.py) or graph metric to the standard remediation that
targets that specific weak signal — no invented weight, just routing a
known-weak metric to its matching fix, ranked by how far below the
population that specific metric is (severity = 1 - percentile):
    orphan / below-median pagerank  -> increase_internal_links
    low CTR percentile despite adequate impressions -> rewrite title/meta
    low avg_position percentile     -> strengthen content depth/relevance
    low calls percentile despite adequate CTR/position -> trust schema/FAQs
    low approval_rate percentile    -> improve lead-qualification copy
    (none of the above fired)       -> general_content_and_ux_audit

confidence (`_target_confidence`):
    1. explicit cross-run posterior (bayesian_posteriors[target]) if
       supplied -> 1 - (ci_high - ci_low).
    2. else an ad hoc posterior built from this target's own
       (clicks, impressions) counts via bayesian_engine.posterior_from_counts
       (Beta(1,1) prior + observed counts, same conjugate math as the
       stateful engine) -> 1 - (ci_high - ci_low).
    3. else a flat, explicitly-labeled LOW_EVIDENCE_CONFIDENCE constant
       (no counts available at all to support any interval).

expected_impact (`_simulate_target_impact`): runs
montecarlo_engine.simulate_new_page_calls with n_new_pages=1, an
impressions sampler that returns this target's own observed impressions
(a single-snapshot stand-in until per-page impressions time series are
ingested — documented, not fabricated), and per-target ad hoc posteriors
for CTR / call-conversion-rate / approval-rate built the same way as the
confidence posterior above. Revenue is estimated only if
`_population_revenue_per_call` can compute an observed median
revenue/approved-call ratio from `raw_metrics`; otherwise it is left
unestimated rather than assumed.

business_value_score = expected_revenue (or expected_calls if no revenue
figure is available) * confidence — this is what final ranking sorts on,
not opportunity_gap_score or confidence alone, so a high-confidence,
high-value fix outranks a low-confidence, low-value one even if the
opportunity_gap_score of the latter happens to look larger.

Computational complexity
-------------------------
O(n log n) (sorting for percentile/median thresholds) + O(n) rule
evaluation + O(k) Monte Carlo simulations, where k = number of distinct
targets that actually trigger at least one recommendation (each target's
simulation is cached and reused across all of its triggered
recommendations), each simulation O(mc_simulations) per
montecarlo_engine.py's own complexity notes.

Future extensions
------------------
- Incorporate markov_engine drop-off analysis directly as its own
  diagnosis branch once per-page funnel data (not just per-site funnel
  data) is available.
- True Louvain community detection (graph_engine.py's own documented
  deferral) would let `weak_components` be genuine SEO clusters rather
  than raw weakly-connected components.
- Hierarchical shrinkage across pages for the ad hoc per-target posterior
  (currently Beta(1,1) + that page's own counts only, per
  bayesian_engine.py's own documented Epic D1/D2 deferral) would sharpen
  confidence/impact estimates for very-low-traffic pages.
"""
import statistics
import zlib
from dataclasses import dataclass, field

from . import config
from .logging_utils import traced, log
from .bayesian_engine import posterior_from_counts
from .montecarlo_engine import simulate_new_page_calls
from .learning_engine import compute_context_fingerprint
import logging


LOW_EVIDENCE_CONFIDENCE = 0.3
# Used only when neither a cross-run posterior nor any raw counts exist
# for a target. Deliberately not 0 (we are not claiming zero confidence
# in the underlying rule) and deliberately not close to 1 (we have no
# evidence volume to justify high confidence either) — a documented,
# fixed placeholder distinct from any statistically-derived value so it
# is never mistaken for one when inspecting `confidence_basis`.

_PERCENTILE_LOW = 0.3   # "bottom 30%" cutoff used to flag a specific weak metric
_PERCENTILE_HIGH = 0.5  # "at/above the median" cutoff used as a co-condition
_MC_SIMULATIONS_PER_RECOMMENDATION = 2000
# Smaller than config.MC_DEFAULT_SIMULATIONS (10000) because this runs
# once per *triggered* recommendation target (potentially hundreds per
# report) rather than once per report; still a stable empirical CI per
# montecarlo_engine.py's own complexity notes, at a fraction of the cost.


@dataclass
class Recommendation:
    action: str
    target: str
    reason: str
    supporting_data: dict
    confidence: float
    expected_impact: dict
    business_value_score: float
    action_plan: list = field(default_factory=list)

    def to_dict(self):
        return {
            'action': self.action, 'target': self.target, 'reason': self.reason,
            'supporting_data': self.supporting_data, 'confidence': self.confidence,
            'expected_impact': self.expected_impact,
            'business_value_score': self.business_value_score,
            'action_plan': self.action_plan,
        }


def _median(values):
    return statistics.median(values) if values else None


def _confidence_from_posterior(posterior):
    width = posterior.ci_high - posterior.ci_low
    return max(0.0, min(1.0, 1.0 - width))


def _target_confidence(posterior, raw):
    """
    Always evidence-derived. See module docstring's `confidence` section
    for the priority order. Returns (confidence, basis_label) so callers
    can record *why* a confidence value was chosen (for auditability).
    """
    if posterior is not None:
        return _confidence_from_posterior(posterior), 'cross_run_bayesian_posterior'
    if raw:
        impressions = raw.get('impressions') or 0
        clicks = raw.get('clicks')
        if clicks is None and raw.get('ctr') is not None and impressions:
            clicks = round(raw['ctr'] * impressions)
        if clicks is not None and impressions > 0:
            clicks = max(0, min(int(round(clicks)), impressions))
            ad_hoc = posterior_from_counts(clicks, impressions)
            return _confidence_from_posterior(ad_hoc), 'ad_hoc_ctr_posterior'
    return LOW_EVIDENCE_CONFIDENCE, 'low_evidence_fallback'


def _diagnose_actions(percentiles, gmetrics, is_orphan, below_median_pagerank, pagerank):
    """
    Ordered (most severe first) list of {'action', 'reason', 'severity'}
    diagnosed from already-computed percentiles/graph metrics. See module
    docstring's diagnosis table. Always returns at least one item.
    """
    plan = []

    if is_orphan or below_median_pagerank:
        plan.append({
            'action': 'increase_internal_links',
            'reason': (
                'No internal links point to this page (orphan — in-degree 0).' if is_orphan
                else f'PageRank {pagerank:.4f} is below the observed-population median.'
            ),
            'severity': 1.0 if is_orphan else 0.7,
        })

    ctr_pct = percentiles.get('ctr')
    imp_pct = percentiles.get('impressions')
    if ctr_pct is not None and ctr_pct <= _PERCENTILE_LOW and (imp_pct is None or imp_pct >= _PERCENTILE_HIGH):
        plan.append({
            'action': 'rewrite_title_and_meta_description',
            'reason': (
                f'CTR percentile {ctr_pct:.2f} is in the bottom 30% despite adequate '
                f'impression volume — the listing is seen but not clicked.'
            ),
            'severity': 1 - ctr_pct,
        })

    pos_pct = percentiles.get('avg_position')
    if pos_pct is not None and pos_pct <= _PERCENTILE_LOW:
        plan.append({
            'action': 'strengthen_content_depth_and_topical_relevance',
            'reason': (
                f'Average-position percentile {pos_pct:.2f} is in the bottom 30% relative '
                f'to the rest of the site — ranking is comparatively weak.'
            ),
            'severity': 1 - pos_pct,
        })

    calls_pct = percentiles.get('calls')
    if calls_pct is not None and calls_pct <= _PERCENTILE_LOW and (
        (ctr_pct is not None and ctr_pct >= _PERCENTILE_HIGH) or
        (pos_pct is not None and pos_pct >= _PERCENTILE_HIGH)
    ):
        plan.append({
            'action': 'add_trust_schema_and_faqs',
            'reason': (
                f'Calls percentile {calls_pct:.2f} is low despite adequate click-through/'
                f'ranking — visitors arrive but do not convert; add LocalBusiness/FAQ schema, '
                f'reviews, and a clearer call-to-action.'
            ),
            'severity': 1 - calls_pct,
        })

    appr_pct = percentiles.get('approval_rate')
    if appr_pct is not None and appr_pct <= _PERCENTILE_LOW:
        plan.append({
            'action': 'improve_lead_qualification_copy',
            'reason': (
                f'Approval-rate percentile {appr_pct:.2f} is low — calls are being generated '
                f'but a high share are unqualified; clarify service area, pricing, and scope '
                f'on the page itself.'
            ),
            'severity': 1 - appr_pct,
        })

    if not plan:
        plan.append({
            'action': 'general_content_and_ux_audit',
            'reason': 'High opportunity-gap score without a specific weak percentile identified — manual audit recommended.',
            'severity': 0.5,
        })

    plan.sort(key=lambda item: item['severity'], reverse=True)
    return plan


def _population_revenue_per_call(raw_metrics):
    """
    Median observed revenue/approved-call (or revenue/call, if approved
    counts are unavailable) ratio across raw_metrics, used to translate a
    simulated call count into a revenue estimate without inventing a
    figure. Returns None (never a made-up default) if no record has both
    a call count and a revenue figure.
    """
    ratios = []
    for r in raw_metrics.values():
        calls_key = 'approved_calls' if r.get('approved_calls') else 'calls'
        calls = r.get(calls_key)
        revenue = r.get('revenue')
        if calls and revenue is not None and calls > 0:
            ratios.append(revenue / calls)
    return statistics.median(ratios) if ratios else None


def _counts_for_target(raw):
    """
    Best-effort (successes, trials) pairs for ctr / call_cvr / approval
    from a single-snapshot raw record. Any count that cannot be derived
    from what is actually present falls back to (0, 0), i.e. an
    uninformative Beta(1,1) posterior via posterior_from_counts — never a
    guessed rate.
    """
    impressions = raw.get('impressions') or 0
    clicks = raw.get('clicks')
    if clicks is None and raw.get('ctr') is not None and impressions:
        clicks = round(raw['ctr'] * impressions)
    clicks = max(0, min(int(round(clicks)), impressions)) if clicks is not None else 0

    calls = raw.get('calls') or 0
    approved = raw.get('approved_calls')
    if approved is None and raw.get('approval_rate') is not None and calls:
        approved = round(calls * raw['approval_rate'])
    approved = max(0, min(int(round(approved)), calls)) if approved is not None else 0

    return {
        'ctr': (clicks, impressions),
        'call_cvr': (min(calls, clicks), clicks) if clicks else (0, 0),
        'approval': (approved, calls) if calls else (0, 0),
    }


def _simulate_target_impact(target, raw, revenue_per_call, mc_cache, seed_base):
    if target in mc_cache:
        return mc_cache[target]

    if not raw or not raw.get('impressions'):
        result = {'note': 'insufficient data — no impressions/click/call counts available for this target to simulate an impact range'}
        mc_cache[target] = result
        return result

    counts = _counts_for_target(raw)
    ctr_post = posterior_from_counts(*counts['ctr'])
    cvr_post = posterior_from_counts(*counts['call_cvr'])
    appr_post = posterior_from_counts(*counts['approval'])
    impressions_value = raw['impressions']
    seed = (seed_base + zlib.crc32(str(target).encode('utf-8'))) % (2 ** 31)

    sim = simulate_new_page_calls(
        n_new_pages=1,
        impressions_per_page_sampler=lambda: impressions_value,
        ctr_posterior=ctr_post,
        call_cvr_posterior=cvr_post,
        approval_rate_posterior=appr_post,
        n_simulations=_MC_SIMULATIONS_PER_RECOMMENDATION,
        seed=seed,
    )
    result = {
        'expected_calls': sim.expected_calls,
        'calls_ci_low': sim.ci_low,
        'calls_ci_high': sim.ci_high,
        'ci_level': sim.ci_level,
        'expected_approved_calls': sim.expected_approved_calls,
        'approved_calls_ci_low': sim.ci_low_approved,
        'approved_calls_ci_high': sim.ci_high_approved,
    }
    if revenue_per_call is not None:
        result['expected_revenue'] = sim.expected_approved_calls * revenue_per_call
        result['revenue_ci_low'] = sim.ci_low_approved * revenue_per_call
        result['revenue_ci_high'] = sim.ci_high_approved * revenue_per_call
        result['revenue_per_call_basis'] = 'population-median observed revenue/approved-call ratio'
    else:
        result['note'] = 'revenue not estimated — no observed revenue/calls ratio available in raw_metrics'
    mc_cache[target] = result
    return result


def _business_value(impact, confidence):
    if not impact:
        return 0.0
    value = impact.get('expected_revenue')
    if value is None:
        value = impact.get('expected_calls', 0.0)
    return value * confidence


def _diagnose_weak_clusters(weak_components, opportunity_by_id, raw_metrics):
    """One cluster_recovery_strategy Recommendation per caller-supplied weak component."""
    recs = []
    for component in weak_components:
        members = sorted(str(m) for m in component)
        if not members:
            continue
        member_scores = [opportunity_by_id[m] for m in members if m in opportunity_by_id]
        perf_values = [m['performance_score'] for m in member_scores if m.get('performance_score') is not None]
        avg_perf = statistics.mean(perf_values) if perf_values else None
        total_impressions = sum((raw_metrics.get(m) or {}).get('impressions', 0) for m in members)
        representative = members[0]

        plan = [{
            'action': 'reconnect_cluster_via_internal_links',
            'reason': f'{len(members)} page(s) form a structurally isolated component, disconnected from the main site graph.',
            'severity': 1.0,
        }]
        if avg_perf is not None and avg_perf < 0.5:
            plan.append({
                'action': 'improve_content_quality_across_cluster',
                'reason': f'Average performance score across the cluster ({avg_perf:.2f}) is below the population midpoint.',
                'severity': 1 - avg_perf,
            })
        plan.sort(key=lambda item: item['severity'], reverse=True)

        # Confidence in a cluster-level diagnosis scales with how many
        # pages corroborate the same structural pattern (more members ->
        # less likely to be one noisy outlier). A documented heuristic,
        # capped at 1.0, distinct from the per-page Bayesian confidence.
        confidence = min(1.0, len(members) / 10.0)
        target_label = f'cluster:{representative}' + (f'(+{len(members) - 1} more)' if len(members) > 1 else '')

        recs.append(Recommendation(
            action=plan[0]['action'], target=target_label,
            reason=(
                f"Weakly connected component of {len(members)} page(s) is isolated from the "
                f"main site graph ({total_impressions} total impressions currently under-"
                f"realized due to poor internal discoverability)."
            ),
            supporting_data={'members': members, 'avg_performance_score': avg_perf, 'total_impressions': total_impressions},
            confidence=confidence,
            expected_impact={'note': 'cluster-level impact not simulated per-member; see individual per-page recommendations for numeric estimates'},
            business_value_score=total_impressions * confidence,
            action_plan=plan,
        ))
    return recs


@traced('recommendation_engine')
def generate_recommendations(
    opportunity_results,
    graph_metrics=None,
    bayesian_posteriors=None,
    raw_metrics=None,
    weak_components=None,
    real_link_graph_metrics=None,
    mc_seed=None,
    revenue_per_call=None,
    attribution_resolver=None,
    learned_confidence_adjustments=None,
):
    graph_metrics = graph_metrics or {}
    bayesian_posteriors = bayesian_posteriors or {}
    raw_metrics = raw_metrics or {}
    weak_components = weak_components or []
    real_link_graph_metrics = real_link_graph_metrics or {}
    learned_confidence_adjustments = learned_confidence_adjustments or {}
    seed_base = mc_seed if mc_seed is not None else config.MC_DEFAULT_SEED

    if attribution_resolver is None:
        log(logging.INFO, 'recommendation_engine_no_attribution_resolver',
            note='per-recommendation attribution metadata will be omitted')

    if not graph_metrics:
        log(logging.INFO, 'recommendation_engine_no_graph_metrics',
            note='link-authority-based diagnoses will be skipped')
    if not bayesian_posteriors:
        log(logging.INFO, 'recommendation_engine_no_bayesian_posteriors',
            note='confidence will fall back to per-target ad hoc posteriors or the low-evidence constant')
    if not raw_metrics:
        log(logging.INFO, 'recommendation_engine_no_raw_metrics',
            note='ad hoc confidence and Monte Carlo impact estimation will be skipped for all targets')
    if not real_link_graph_metrics:
        log(logging.INFO, 'recommendation_engine_no_real_link_graph_metrics',
            note='fix_broken_or_missing_internal_link diagnosis will be skipped')
    if not learned_confidence_adjustments:
        log(logging.INFO, 'recommendation_engine_no_learned_adjustments',
            note='recommendations will use base confidence without historical learning')

    results = [r.to_dict() if hasattr(r, 'to_dict') else r for r in opportunity_results]
    if not results:
        return []

    opportunity_by_id = {r['record_id']: r for r in results}
    gap_scores = [r['opportunity_gap_score'] for r in results]
    perf_scores = [r['performance_score'] for r in results if r.get('performance_score') is not None]
    sorted_gap = sorted(gap_scores)
    sorted_perf = sorted(perf_scores) if perf_scores else []

    pageranks = [m.get('pagerank') for m in graph_metrics.values() if m.get('pagerank') is not None]
    median_pagerank = _median(pageranks)

    posterior_means = [p.mean for p in bayesian_posteriors.values()]
    posterior_widths = [p.ci_high - p.ci_low for p in bayesian_posteriors.values()]
    posterior_n_obs = [p.n_obs for p in bayesian_posteriors.values()]
    median_mean = _median(posterior_means)
    median_width = _median(posterior_widths)
    median_n_obs = _median(posterior_n_obs)

    default_revenue_per_call = _population_revenue_per_call(raw_metrics)
    effective_revenue_per_call = default_revenue_per_call if default_revenue_per_call is not None else revenue_per_call
    mc_cache = {}

    def percentile_of(value, sorted_pop):
        import bisect
        return bisect.bisect_right(sorted_pop, value) / len(sorted_pop)

    recommendations = []

    for r in results:
        target = r['record_id']
        gap = r['opportunity_gap_score']
        perf = r.get('performance_score')
        percentiles = r.get('percentiles', {})
        gmetrics = graph_metrics.get(target)
        posterior = bayesian_posteriors.get(target)
        raw = raw_metrics.get(target)

        confidence, confidence_basis = _target_confidence(posterior, raw)

        # Apply learned confidence adjustment from historical outcomes
        learned_delta = 0.0
        if learned_confidence_adjustments:
            opp_score = r.get('opportunity_score') or r
            fingerprint = compute_context_fingerprint(r.get('action', ''), opp_score)
            learned_delta = learned_confidence_adjustments.get(
                f'{r.get("action", "")}|{fingerprint}', 0.0,
            )
        adjusted_confidence = max(0.0, min(1.0, confidence + learned_delta))

        resolved_attribution = (
            attribution_resolver.resolve_page(target).to_dict()
            if attribution_resolver is not None else None
        )

        is_orphan = bool(gmetrics.get('is_orphan')) if gmetrics else False
        pagerank = gmetrics.get('pagerank') if gmetrics else None
        below_median_pagerank = (
            gmetrics is not None and median_pagerank is not None and pagerank is not None and pagerank < median_pagerank
        )

        def impact_and_value(conf):
            impact = _simulate_target_impact(target, raw, effective_revenue_per_call, mc_cache, seed_base)
            return impact, _business_value(impact, conf)

        # Use adjusted_confidence (with learned delta) for business value
        def learned_impact_and_value():
            impact = _simulate_target_impact(target, raw, effective_revenue_per_call, mc_cache, seed_base)
            return impact, _business_value(impact, adjusted_confidence)

        # --- top-decile opportunity: specific, prioritized action plan ---
        if sorted_gap and percentile_of(gap, sorted_gap) >= 0.90:
            plan = _diagnose_actions(percentiles, gmetrics, is_orphan, below_median_pagerank, pagerank)
            primary = plan[0]
            impact, business_value = learned_impact_and_value()
            recommendations.append(Recommendation(
                action=primary['action'], target=target,
                reason=(
                    f"Opportunity-gap score {gap:.2f} is in the top decile of this batch "
                    f"(>= 90th percentile). Primary diagnosis: {primary['reason']}"
                ),
                supporting_data={
                    'opportunity_gap_score': gap, 'percentiles': percentiles,
                    'confidence_basis': confidence_basis,
                    'learned_confidence_delta': learned_delta,
                    **({'attribution': resolved_attribution} if resolved_attribution is not None else {}),
                },
                confidence=adjusted_confidence,
                expected_impact=impact,
                business_value_score=business_value,
                action_plan=plan,
            ))

        # --- increase_internal_links (explicit, dedicated trigger) ---
        if gmetrics is not None and gap >= 0.5 and (is_orphan or below_median_pagerank):
            impact, business_value = learned_impact_and_value()
            recommendations.append(Recommendation(
                action='increase_internal_links', target=target,
                reason=(
                    f"Opportunity-gap score {gap:.2f} is at/above the population median "
                    f"(0.5), meaning this page is visible but under-converting relative to "
                    f"its peers, and its internal authority is "
                    f"{'zero (orphaned — no internal links point to it)' if is_orphan else f'below the median PageRank ({pagerank:.4f} < {median_pagerank:.4f})'}."
                ),
                supporting_data={
                    'opportunity_gap_score': gap, 'pagerank': pagerank, 'is_orphan': is_orphan,
                    'confidence_basis': confidence_basis,
                    **({'attribution': resolved_attribution} if resolved_attribution is not None else {}),
                },
                confidence=adjusted_confidence,
                expected_impact=impact,
                business_value_score=business_value,
                action_plan=[{
                    'action': 'increase_internal_links',
                    'reason': 'orphan (in-degree 0)' if is_orphan else 'below-median PageRank',
                    'severity': 1.0 if is_orphan else 0.7,
                }],
            ))

        # --- expand_cluster ---
        if posterior is not None and median_mean is not None and median_width is not None and median_n_obs is not None:
            if (posterior.mean >= median_mean and
                    (posterior.ci_high - posterior.ci_low) <= median_width and
                    posterior.n_obs <= median_n_obs):
                conf = _confidence_from_posterior(posterior)
                learned_delta_expand = 0.0
                if learned_confidence_adjustments:
                    fp = compute_context_fingerprint('expand_cluster', r.get('opportunity_score') or r)
                    learned_delta_expand = learned_confidence_adjustments.get(f'expand_cluster|{fp}', 0.0)
                adjusted_conf = max(0.0, min(1.0, conf + learned_delta_expand))
                impact = _simulate_target_impact(target, raw, effective_revenue_per_call, mc_cache, seed_base)
                business_value = _business_value(impact, adjusted_conf)
                recommendations.append(Recommendation(
                    action='expand_cluster', target=target,
                    reason=(
                        f"Posterior conversion mean {posterior.mean:.3f} is at/above the "
                        f"cross-cluster median ({median_mean:.3f}) with a narrow credible "
                        f"interval [{posterior.ci_low:.3f}, {posterior.ci_high:.3f}] (width "
                        f"{(posterior.ci_high - posterior.ci_low):.3f} <= median width "
                        f"{median_width:.3f}), but has only {posterior.n_obs} observations "
                        f"(<= median {median_n_obs}) — this is a confidently strong performer "
                        f"that has not yet been scaled up."
                    ),
                    supporting_data={
                        **posterior.to_dict(),
                        **({'attribution': resolved_attribution} if resolved_attribution is not None else {}),
                    },
                    confidence=adjusted_conf,
                    expected_impact=impact,
                    business_value_score=business_value,
                    action_plan=[{
                        'action': 'expand_cluster',
                        'reason': 'confidently strong, under-scaled performer',
                        'severity': conf,
                    }],
                ))

        # --- recovery_strategy (bottom-decile performance, root-cause diagnosed) ---
        if perf is not None and sorted_perf and percentile_of(perf, sorted_perf) <= 0.10:
            if posterior is not None:
                confident_low = (posterior.ci_high - posterior.ci_low) <= median_width if median_width is not None else False
                conf = _confidence_from_posterior(posterior) if confident_low else 0.0
            else:
                confident_low = True
                conf = confidence
            if confident_low:
                plan = _diagnose_actions(percentiles, gmetrics, is_orphan, below_median_pagerank, pagerank)
                learned_delta_recovery = 0.0
                if learned_confidence_adjustments:
                    fp = compute_context_fingerprint('recovery_strategy', r.get('opportunity_score') or r)
                    learned_delta_recovery = learned_confidence_adjustments.get(f'recovery_strategy|{fp}', 0.0)
                adjusted_conf_recovery = max(0.0, min(1.0, conf + learned_delta_recovery))
                impact = _simulate_target_impact(target, raw, effective_revenue_per_call, mc_cache, seed_base)
                business_value = _business_value(impact, adjusted_conf_recovery)
                recommendations.append(Recommendation(
                    action='recovery_strategy', target=target,
                    reason=(
                        f"Performance score {perf:.2f} is in the bottom decile of this batch "
                        f"(<= 10th percentile)"
                        + (f", confirmed by a narrow Bayesian credible interval "
                           f"[{posterior.ci_low:.3f}, {posterior.ci_high:.3f}]" if posterior is not None else "")
                        + f". Diagnosed cause: {plan[0]['reason']}"
                    ),
                    supporting_data={
                        'performance_score': perf,
                        'posterior': posterior.to_dict() if posterior else None,
                        'confidence_basis': confidence_basis,
                        **({'attribution': resolved_attribution} if resolved_attribution is not None else {}),
                    },
                    confidence=adjusted_conf_recovery,
                    expected_impact=impact,
                    business_value_score=business_value,
                    action_plan=plan,
                ))

        # --- fix_broken_or_missing_internal_link (real crawled link graph only) ---
        real_gmetrics = real_link_graph_metrics.get(target)
        if real_gmetrics is not None and real_gmetrics.get('link_discrepancy'):
            impact, business_value = learned_impact_and_value()
            recommendations.append(Recommendation(
                action='fix_broken_or_missing_internal_link', target=target,
                reason=(
                    f"The taxonomy graph implies at least one page links to this URL, but "
                    f"the real crawled link graph shows {real_gmetrics.get('real_in_degree', 0)} "
                    f"actual incoming link(s) — a link is expected to exist and does not, most "
                    f"likely broken, missing, or rendered only client-side."
                ),
                supporting_data={
                    'real_in_degree': real_gmetrics.get('real_in_degree'),
                    'real_pagerank': real_gmetrics.get('real_pagerank'),
                    'real_is_orphan': real_gmetrics.get('real_is_orphan'),
                    'link_discrepancy': real_gmetrics.get('link_discrepancy'),
                    'confidence_basis': confidence_basis,
                    **({'attribution': resolved_attribution} if resolved_attribution is not None else {}),
                },
                confidence=adjusted_confidence,
                expected_impact=impact,
                business_value_score=business_value,
                action_plan=[{
                    'action': 'fix_broken_or_missing_internal_link',
                    'reason': 'expected internal link is missing from the real crawled link graph',
                    'severity': 1.0,
                }],
            ))

    recommendations.extend(_diagnose_weak_clusters(weak_components, opportunity_by_id, raw_metrics))

    recommendations.sort(key=lambda rec: (rec.business_value_score, rec.confidence), reverse=True)
    return recommendations
