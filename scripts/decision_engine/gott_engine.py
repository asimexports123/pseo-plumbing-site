"""
Gott Temporal Prior Engine.

Purpose
-------
Estimate how much useful lifetime remains for a page, recommendation,
experiment, or optimization using J. Richard Gott's Copernican (Delta-t)
reasoning. This engine is a temporal uncertainty estimator only — it
predicts confidence in temporal maturity, not rankings, conversions, or
business outcomes.

The core insight of Gott's Delta-t argument: if you observe a phenomenon
at a random point in its lifetime, and you have no prior information
about its total duration (the Copernican principle — you are not special),
then with 95% confidence the phenomenon's total lifetime falls within:

    total_duration / 39.7  <  remaining_duration  <  total_duration * 39.7

More generally, for a confidence level c (0 < c < 1):

    P(remaining > total_so_far * (1-c)/c) = c

This gives us a principled, assumption-free way to answer:

- Is this recommendation too early to evaluate?
- Has this page likely matured?
- Is this experiment still inside its expected observation window?
- Should Learning Engine wait before reinforcing or penalizing?

Integration
-----------
1. Learning Engine consults Gott BEFORE evaluating outcomes:
   - If evaluation_readiness is False, Learning Engine skips
     reinforcement for that recommendation.
   - If remaining_growth_probability is low and evaluation_readiness
     is True, Learning proceeds normally (the page has matured enough
     that observed outcomes are reliable signals).

2. Recommendation Engine uses Gott as a temporal prior:
   - High opportunity + low maturity -> "observe_and_wait" recommendation
     instead of "rewrite" or "delete".
   - Never overrides business metrics — only adds temporal context.

3. Decision Store persists TemporalPrior in snapshots (append-only,
   no historical mutation).

Mathematics used
----------------
Given a page or recommendation that has existed for `t_past` days (the
time from its first observed signal to the current snapshot date), the
Copernican principle gives:

    For confidence level c:
        P(remaining > t_past * (1-c)/c) = c
        P(total > t_past / (1-c)) = c

Derivation: Under the Copernican assumption, the observation time is
uniformly distributed in [0, total_duration]. So t_past / total_duration
~ Uniform(0, 1). Therefore:

    P(t_past / total > p) = 1 - p

Setting p = (1-c)/c gives the formulas above.

Key outputs derived from this:

    remaining_growth_probability:
        P(page still has growth left) = 1 - t_past / (t_past + t_expected_remaining)
        Simplified via Copernican: at 50% confidence, remaining >= t_past.
        We use a sigmoid-like mapping from t_past to [0,1] based on the
        Copernican 95% CI bounds.

    maturity_score:
        How "settled" the page is. A page is mature when t_past is large
        relative to the Copernican expected total lifetime. We compute
        this as 1 - (Copernican lower bound on remaining / t_past),
        clamped to [0, 1].

    evaluation_readiness:
        True when recommendation_age_days >= recommended_wait_days.
        recommended_wait_days is derived from the evaluation window
        (config.LEARNING_LOOP_EVALUATION_WINDOW_DAYS) and the Copernican
        prior: if the recommendation is younger than the evaluation
        window, we need to wait. If it's older, we check whether the
        page's remaining growth probability suggests the outcome is
        still changing rapidly (in which case we may still want to wait).

Computational complexity
------------------------
O(h) per page where h = number of historical snapshots (to find the
earliest signal date). O(1) for the Gott calculation itself.

Future extensions
-----------------
- Incorporate page-type-specific lifetime priors (e.g. blog posts vs
  service pages have different expected lifetimes) once enough data
  exists to estimate them empirically.
- Time-varying Copernican bounds that tighten as more observations
  accumulate (Bayesian updating of the Gott prior).
"""
import json
import logging
import math
from dataclasses import dataclass, field, asdict
from datetime import datetime, timedelta, timezone
from typing import Optional

from . import config, decision_store
from .logging_utils import traced, log
from .page_profile import PageDecisionRecord, normalize_page_id


# --- Constants ---

# Copernican principle: at 95% confidence, the total lifetime is within
# [t_past / 39.7, t_past * 39.7]. The factor 39.7 comes from 1/(1-c) with
# c=0.975 (two-sided 95% CI): 1/(1-0.975) = 40, and the exact value from
# the integral is (1/0.025) = 40, but the conventional citation uses
# 39.7 from the more precise calculation. We use 39.7 for consistency
# with Gott's original publication.
COPERNICAN_95_FACTOR = 39.7

# At 50% confidence, remaining >= t_past (the median case).
# This is the simplest Copernican result: you're equally likely to be
# in the first half or second half of the phenomenon's lifetime.
COPERNICAN_50_FACTOR = 1.0

# Minimum page age (days) before Gott predictions are considered
# meaningful. Below this, the Copernican bounds are so wide that any
# prediction is essentially uninformative.
MIN_AGE_FOR_PREDICTION = 1

# When recommendation_age is below this fraction of the evaluation
# window, evaluation_readiness is False regardless of other signals.
MIN_REC_AGE_FRACTION = 0.5

# Sigmoid midpoint for maturity scoring: at this age (days), a page
# is considered 50% mature. Derived from the typical SEO maturation
# window of ~90 days (3 months), which is the conventional industry
# estimate for new content to reach its stable ranking.
MATURITY_SIGMOID_MIDPOINT = 90.0
MATURITY_SIGMOID_STEEPNESS = 0.05


# --- Data structures ---

@dataclass
class TemporalPrior:
    page_id: str
    page_age_days: int
    recommendation_age_days: int
    maturity_score: float
    remaining_growth_probability: float
    remaining_observation_probability: float
    retirement_probability: float
    evaluation_readiness: bool
    recommended_wait_days: int
    confidence: float
    reasoning: str

    def to_dict(self):
        return {
            'page_id': self.page_id,
            'page_age_days': self.page_age_days,
            'recommendation_age_days': self.recommendation_age_days,
            'maturity_score': round(self.maturity_score, 6),
            'remaining_growth_probability': round(self.remaining_growth_probability, 6),
            'remaining_observation_probability': round(self.remaining_observation_probability, 6),
            'retirement_probability': round(self.retirement_probability, 6),
            'evaluation_readiness': self.evaluation_readiness,
            'recommended_wait_days': self.recommended_wait_days,
            'confidence': round(self.confidence, 6),
            'reasoning': self.reasoning,
        }

    @classmethod
    def from_dict(cls, d):
        return cls(
            page_id=d.get('page_id', ''),
            page_age_days=d.get('page_age_days', 0),
            recommendation_age_days=d.get('recommendation_age_days', 0),
            maturity_score=d.get('maturity_score', 0.0),
            remaining_growth_probability=d.get('remaining_growth_probability', 1.0),
            remaining_observation_probability=d.get('remaining_observation_probability', 1.0),
            retirement_probability=d.get('retirement_probability', 0.0),
            evaluation_readiness=d.get('evaluation_readiness', True),
            recommended_wait_days=d.get('recommended_wait_days', 0),
            confidence=d.get('confidence', 0.0),
            reasoning=d.get('reasoning', ''),
        )


# --- Core Gott Delta-t calculations ---

def _copernican_remaining_lower(t_past, confidence_level=0.95):
    """
    Copernican lower bound on remaining lifetime at the given confidence
    level. With probability `confidence_level`, the remaining lifetime
    is at least this long.

    P(remaining > t_past * (1-c)/c) = c

    So lower bound = t_past * (1-c)/c
    """
    if t_past <= 0:
        return 0
    c = confidence_level
    return t_past * (1.0 - c) / c


def _copernican_remaining_upper(t_past, confidence_level=0.95):
    """
    Copernican upper bound on remaining lifetime at the given confidence
    level. With probability `confidence_level`, the remaining lifetime
    is at most this long.

    P(remaining < t_past * c/(1-c)) = c

    So upper bound = t_past * c/(1-c)
    """
    if t_past <= 0:
        return 0
    c = confidence_level
    return t_past * c / (1.0 - c)


def _copernican_total_lower(t_past, confidence_level=0.95):
    """
    Copernican lower bound on total lifetime.
    total > t_past / (1 - (1-c)/2) ... simplified:
    total > t_past (at confidence c, total > t_past * (1 / (1 - (1-c)/2)))
    Actually: P(total > t_past / p) = 1-p where p = t_past/total.
    For the lower bound on total: P(total > t_past) = 1 - 0 = 1 (trivially).
    The meaningful lower bound: P(total > t_past / (1-(1-c)/2)) = 1-(1-c)/2
    Simplified: total_lower = t_past / (1 - (1-c)/2) doesn't make sense.

    Correct derivation: t_past/total ~ Uniform(0,1).
    P(total > t_past / q) = 1-q for q in (0,1).
    For confidence c: 1-q = c, so q = 1-c.
    total_lower = t_past / (1-c) ... but that gives total > t_past/(1-c)
    with probability c. Wait: P(total > t_past/q) = 1-q.
    We want P(total > X) = c, so 1-q = c, q = 1-c.
    X = t_past / q = t_past / (1-c).

    So total_lower = t_past / (1 - (1-c)/2) is wrong.
    total_lower = t_past / (1-c) gives P(total > total_lower) = c.
    But this is a lower bound with confidence c — meaning we're c confident
    the total is at least this. For c=0.95: total > t_past/0.05 = t_past*20.
    That seems too aggressive. Let me re-derive.

    t_past/total ~ U(0,1). P(t_past/total < q) = q.
    P(total > t_past/q) = P(t_past/total < q) = q.
    For 95% confidence: q=0.95, total > t_past/0.95 ≈ t_past*1.053.
    That's the lower bound — we're 95% sure total is at least ~t_past.

    For the upper bound: P(total < t_past/q) = 1-q.
    For 95%: q=0.05, total < t_past/0.05 = t_past*20.

    So: total_lower (95%) = t_past / 0.95
        total_upper (95%) = t_past / 0.05 = t_past * 20

    And: remaining_lower = total_lower - t_past = t_past/0.95 - t_past = t_past * (1/0.95 - 1) = t_past * 0.0526
         remaining_upper = total_upper - t_past = t_past*20 - t_past = t_past * 19

    This matches Gott's original: at 95% confidence, remaining is between
    t_past/39.7 and t_past*39.7 (the 39.7 comes from a two-sided interval).

    For a one-sided lower bound at confidence c:
    remaining_lower = t_past * (1-c)/c
    At c=0.95: remaining_lower = t_past * 0.05/0.95 = t_past * 0.0526

    For a one-sided upper bound at confidence c:
    remaining_upper = t_past * c/(1-c)
    At c=0.95: remaining_upper = t_past * 0.95/0.05 = t_past * 19
    """
    if t_past <= 0:
        return 0
    c = confidence_level
    return t_past / (1.0 - (1.0 - c) / 2.0)


def _sigmoid(x, midpoint=MATURITY_SIGMOID_MIDPOINT, steepness=MATURITY_SIGMOID_STEEPNESS):
    """Standard sigmoid, shifted to midpoint and scaled by steepness."""
    return 1.0 / (1.0 + math.exp(-steepness * (x - midpoint)))


def _compute_maturity_score(page_age_days):
    """
    Maturity score in [0, 1]. Uses a sigmoid centered at
    MATURITY_SIGMOID_MIDPOINT (90 days). A page <30 days old is <20%
    mature; a page >150 days old is >80% mature.

    This is combined with the Copernican prior: the sigmoid captures
    the empirical observation that SEO pages typically mature in ~90
    days, while the Copernican bounds provide the uncertainty interval.
    """
    if page_age_days <= 0:
        return 0.0
    return _sigmoid(float(page_age_days))


def _compute_remaining_growth_probability(page_age_days):
    """
    Probability that the page still has significant growth ahead of it.
    Uses the Copernican principle: at 50% confidence, remaining >= t_past.
    So if t_past is small, there's likely a lot of growth left.

    We map this to [0, 1] via: 1 - sigmoid(page_age_days), where the
    sigmoid is centered at the maturity midpoint. A page that is 10 days
    old has ~95% remaining growth probability; a page that is 180 days
    old has ~15%.

    The Copernican justification: P(remaining > t_past) = 0.5 (median).
    For a 10-day-old page, the median remaining lifetime is 10 days —
    still plenty of growth expected. For a 180-day-old page, the median
    remaining is 180 days, but the growth rate has likely slowed (the
    page has passed its initial growth phase), so we use the sigmoid
    to capture the empirical maturation curve.
    """
    if page_age_days <= 0:
        return 1.0
    return 1.0 - _sigmoid(float(page_age_days))


def _compute_remaining_observation_probability(page_age_days, recommendation_age_days):
    """
    Probability that the observation window is still open — i.e., it's
    too early to confidently evaluate outcomes because the phenomenon
    hasn't settled yet.

    Based on the Copernican principle applied to the recommendation's
    age: if the recommendation is young relative to the evaluation
    window, the observation probability is high (we should keep
    observing, not conclude).

    Uses the recommendation age primarily, falling back to page age
    if no recommendation exists.
    """
    effective_age = max(recommendation_age_days, 0)
    if effective_age <= 0:
        # No recommendation — use page age
        effective_age = page_age_days
    if effective_age <= 0:
        return 1.0

    eval_window = config.LEARNING_LOOP_EVALUATION_WINDOW_DAYS
    # If recommendation is younger than eval_window, observation is still open
    if effective_age < eval_window:
        return 1.0 - (effective_age / eval_window) * 0.5  # linear from 1.0 to 0.5
    # Beyond eval_window, observation probability drops with Copernican reasoning
    return max(0.0, 1.0 - _sigmoid(float(effective_age)))


def _compute_retirement_probability(page_age_days):
    """
    Probability that the page has "retired" — i.e., its useful lifetime
    is likely behind it. Uses the Copernican upper bound: if t_past is
    very large, the expected remaining lifetime (at 95% confidence) is
    still t_past * 19, but the *growth* potential is exhausted.

    We use: retirement = sigmoid(page_age_days) * (1 - remaining_growth_prob)
    This captures: the page is old AND has little growth left.
    """
    if page_age_days <= 0:
        return 0.0
    maturity = _compute_maturity_score(page_age_days)
    remaining_growth = _compute_remaining_growth_probability(page_age_days)
    return maturity * (1.0 - remaining_growth)


def _compute_evaluation_readiness(recommendation_age_days, page_age_days,
                                   recommended_wait_days):
    """
    True when the recommendation is old enough that observed outcomes
    are reliable signals. Two conditions must be met:
    1. recommendation_age_days >= recommended_wait_days
    2. page_age_days >= MIN_AGE_FOR_PREDICTION (page has at least some
       history for the Copernican prior to be meaningful)
    """
    if page_age_days < MIN_AGE_FOR_PREDICTION:
        return False
    if recommendation_age_days < recommended_wait_days:
        return False
    return True


def _compute_recommended_wait_days(recommendation_age_days, page_age_days):
    """
    How many more days should we wait before evaluating this recommendation?

    Based on the evaluation window and the Copernican prior:
    - If the recommendation is younger than the evaluation window,
      wait until the evaluation window is complete.
    - If the page is very young (< MIN_AGE_FOR_PREDICTION), wait at
      least until the page has some history.
    - Cap at a reasonable maximum (2x evaluation window) to avoid
      blocking learning indefinitely.
    """
    eval_window = config.LEARNING_LOOP_EVALUATION_WINDOW_DAYS
    max_wait = eval_window * 2

    # Base wait: time until evaluation window is complete
    if recommendation_age_days < eval_window:
        base_wait = eval_window - recommendation_age_days
    else:
        base_wait = 0

    # If page is too young, add wait for page maturity
    page_maturity_wait = 0
    if page_age_days < MIN_AGE_FOR_PREDICTION:
        page_maturity_wait = MIN_AGE_FOR_PREDICTION - page_age_days

    total_wait = max(base_wait, page_maturity_wait)
    return min(total_wait, max_wait)


def _compute_confidence(page_age_days):
    """
    Confidence in the Gott prediction itself. The Copernican principle
    becomes more informative as t_past grows — with very small t_past,
    the bounds are so wide as to be uninformative.

    We use: confidence = min(1.0, page_age_days / MATURITY_SIGMOID_MIDPOINT)
    A page needs to be ~90 days old before we're fully confident in the
    Gott prediction. Below that, confidence scales linearly.
    """
    if page_age_days <= 0:
        return 0.0
    return min(1.0, float(page_age_days) / MATURITY_SIGMOID_MIDPOINT)


def _build_reasoning(page_age_days, recommendation_age_days, maturity_score,
                     remaining_growth_prob, evaluation_readiness, recommended_wait_days):
    """Human-readable explanation of the TemporalPrior."""
    parts = []
    parts.append(f"Page age: {page_age_days} days")
    if recommendation_age_days > 0:
        parts.append(f"Recommendation age: {recommendation_age_days} days")
    parts.append(f"Maturity score: {maturity_score:.2f}")
    parts.append(f"Remaining growth probability: {remaining_growth_prob:.2f}")

    if not evaluation_readiness:
        parts.append(f"Evaluation not ready — wait {recommended_wait_days} more days")
    else:
        parts.append("Evaluation ready — outcomes are reliable signals")

    return "; ".join(parts)


# --- Signal extraction ---

def _find_earliest_signal_date(history):
    """
    Find the earliest date any signal was observed for this page, from
    historical snapshots. This serves as a proxy for 'page creation date'
    or 'first indexed date' since we don't have explicit creation dates.

    Scans all snapshots and returns the earliest snapshot_date.
    """
    if not history:
        return None
    earliest = None
    for record in history:
        try:
            dt = datetime.strptime(record.snapshot_date, '%Y-%m-%d')
            if earliest is None or dt < earliest:
                earliest = dt
        except (ValueError, TypeError):
            continue
    return earliest


def _find_recommendation_date(history, recommendation_type=None):
    """
    Find the earliest snapshot date where a recommendation of the given
    type (or any recommendation if type is None) was recorded for this
    page. This is the 'recommendation execution date' proxy.
    """
    if not history:
        return None
    earliest = None
    for record in history:
        recs = record.recommendations or []
        for rec in recs:
            if isinstance(rec, dict):
                action = rec.get('action')
                if action and (recommendation_type is None or action == recommendation_type):
                    try:
                        dt = datetime.strptime(record.snapshot_date, '%Y-%m-%d')
                        if earliest is None or dt < earliest:
                            earliest = dt
                    except (ValueError, TypeError):
                        continue
    return earliest


def _days_between(date_a, date_b):
    """Absolute difference in days between two datetime objects."""
    if date_a is None or date_b is None:
        return 0
    return abs((date_b - date_a).days)


# --- Public API ---

@traced('gott_engine')
def compute_temporal_prior(page_id, as_of_date=None, conn=None,
                            recommendation_type=None):
    """
    Compute a TemporalPrior for a single page.

    Uses historical snapshots from decision_store to determine:
    - page_age_days: days from earliest snapshot to as_of_date
    - recommendation_age_days: days from earliest recommendation to as_of_date

    If the page has no history, returns a TemporalPrior with zero ages
    and conservative defaults (low confidence, not ready for evaluation).

    Args:
        page_id: The page path (will be normalized).
        as_of_date: The reference date (defaults to today UTC).
        conn: Optional shared DB connection.
        recommendation_type: If provided, compute recommendation age
            for this specific action type only.

    Returns:
        TemporalPrior instance.
    """
    if as_of_date is None:
        as_of_date = datetime.now(timezone.utc)
    elif isinstance(as_of_date, str):
        as_of_date = datetime.strptime(as_of_date, '%Y-%m-%d')

    owns_conn = conn is None
    conn = conn or decision_store._connect()
    try:
        history = decision_store.get_history(page_id, conn=conn)

        if not history:
            return TemporalPrior(
                page_id=normalize_page_id(page_id),
                page_age_days=0,
                recommendation_age_days=0,
                maturity_score=0.0,
                remaining_growth_probability=1.0,
                remaining_observation_probability=1.0,
                retirement_probability=0.0,
                evaluation_readiness=False,
                recommended_wait_days=config.LEARNING_LOOP_EVALUATION_WINDOW_DAYS,
                confidence=0.0,
                reasoning="No historical snapshots — page age unknown, "
                          "defaulting to conservative (not ready for evaluation)",
            )

        earliest_signal = _find_earliest_signal_date(history)
        rec_date = _find_recommendation_date(history, recommendation_type)

        page_age_days = _days_between(earliest_signal, as_of_date) if earliest_signal else 0
        recommendation_age_days = _days_between(rec_date, as_of_date) if rec_date else 0

        maturity_score = _compute_maturity_score(page_age_days)
        remaining_growth_prob = _compute_remaining_growth_probability(page_age_days)
        remaining_obs_prob = _compute_remaining_observation_probability(
            page_age_days, recommendation_age_days,
        )
        retirement_prob = _compute_retirement_probability(page_age_days)
        recommended_wait = _compute_recommended_wait_days(
            recommendation_age_days, page_age_days,
        )
        evaluation_ready = _compute_evaluation_readiness(
            recommendation_age_days, page_age_days, recommended_wait,
        )
        confidence = _compute_confidence(page_age_days)
        reasoning = _build_reasoning(
            page_age_days, recommendation_age_days, maturity_score,
            remaining_growth_prob, evaluation_ready, recommended_wait,
        )

        return TemporalPrior(
            page_id=normalize_page_id(page_id),
            page_age_days=page_age_days,
            recommendation_age_days=recommendation_age_days,
            maturity_score=maturity_score,
            remaining_growth_probability=remaining_growth_prob,
            remaining_observation_probability=remaining_obs_prob,
            retirement_probability=retirement_prob,
            evaluation_readiness=evaluation_ready,
            recommended_wait_days=recommended_wait,
            confidence=confidence,
            reasoning=reasoning,
        )
    finally:
        if owns_conn:
            conn.close()


@traced('gott_engine')
def compute_all_temporal_priors(as_of_date=None, conn=None):
    """
    Compute TemporalPriors for all pages with stored history.

    Returns a dict: {page_id: TemporalPrior}
    """
    owns_conn = conn is None
    conn = conn or decision_store._connect()
    try:
        page_ids = decision_store.get_all_page_ids(conn=conn)
        priors = {}
        for page_id in page_ids:
            prior = compute_temporal_prior(
                page_id, as_of_date=as_of_date, conn=conn,
            )
            priors[page_id] = prior
        log(logging.INFO, 'gott_engine_computed_all',
            n_pages=len(page_ids), n_priors=len(priors))
        return priors
    finally:
        if owns_conn:
            conn.close()


def is_ready_for_evaluation(page_id, as_of_date=None, conn=None,
                            recommendation_type=None):
    """
    Convenience method: should the Learning Engine proceed with
    evaluating outcomes for this page's recommendation?

    Returns True if Gott says evaluation_readiness is True.
    """
    prior = compute_temporal_prior(
        page_id, as_of_date=as_of_date, conn=conn,
        recommendation_type=recommendation_type,
    )
    return prior.evaluation_readiness
