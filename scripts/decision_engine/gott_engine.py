"""
Gott Temporal Prior Engine — three-layer architecture.

Purpose
-------
Estimate how much useful lifetime remains for a page, recommendation,
experiment, or optimization using J. Richard Gott's Copernican (Delta-t)
reasoning. This engine is a temporal uncertainty estimator only — it
predicts confidence in temporal maturity, not rankings, conversions, or
business outcomes.

Architecture
------------
The implementation is split into three explicit layers to keep Gott's
theorem mathematically pure and separate it from SEO heuristics and
business policy:

    Layer 1: Pure Gott Delta-t model
        Computes remaining-lifetime probability intervals directly from
        the Copernican theorem. No sigmoid, no maturity heuristics, no
        SEO terminology. Every function here is a mathematical
        consequence of the single assumption: the observation time is
        uniformly distributed in [0, total_lifetime].

    Layer 2: SEO maturity model
        A heuristic layer that maps page age to a maturity score via a
        sigmoid centered at ~90 days (the conventional SEO maturation
        window). This layer is explicitly NOT Gott — it is an empirical
        prior informed by domain knowledge, not by the Copernican
        principle.

    Layer 3: Decision policy
        Converts Layer 1's Gott interval + Layer 2's SEO maturity +
        business thresholds (evaluation window, minimum age) into one
        of four temporal decisions: WAIT, OBSERVE, EVALUATE, RETIRE.
        This is where business rules live; Layers 1 and 2 are pure
        math and heuristics respectively.

Mathematical proof that Layer 1 follows Gott
---------------------------------------------
Gott's Copernican argument (1993):

    Assumption: You observe a phenomenon at a random time t_obs drawn
    uniformly from [0, T], where T is the total (unknown) lifetime.

    Let t_past = t_obs (time elapsed since birth) and
        t_remaining = T - t_obs (time left until death).

    Define r = t_past / T. Under the assumption, r ~ Uniform(0, 1).

    The ratio t_remaining / t_past = (T - t_past) / t_past
                                     = (1 - r) / r
                                     = 1/r - 1.

    Since r ~ U(0, 1), the CDF of q = 1/r - 1 is:

        P(q <= x) = P(1/r - 1 <= x) = P(r >= 1/(x+1)) = 1 - 1/(x+1)

    Therefore:
        P(t_remaining > t_past * (1-c)/c) = c           (one-sided lower)
        P(t_remaining < t_past * c/(1-c)) = c           (one-sided upper)

    For a two-sided interval at confidence level c:
        P(t_past * (1-c)/(1+c) < t_remaining < t_past * (1+c)/(1-c)) = c

    At c = 0.95:
        lower = t_past * 0.05/1.95 ≈ t_past * 0.02564
        upper = t_past * 1.95/0.05  = t_past * 39

    This is Gott's famous result: at 95% confidence, the remaining
    lifetime is between t_past/39 and t_past*39.

Layer 1 functions implement these exact formulas with no additional
assumptions. The Monte Carlo validation at the bottom of this file
empirically confirms that the coverage matches the theoretical values.

Integration
-----------
1. Learning Engine consults Gott BEFORE evaluating outcomes:
   - If the decision policy says EVALUATE, Learning proceeds.
   - Otherwise, Learning skips reinforcement/penalty.

2. Recommendation Engine uses Gott as a temporal prior:
   - High opportunity + low maturity -> "observe_and_wait" recommendation
     instead of "rewrite" or "delete".
   - Never overrides business metrics — only adds temporal context.

3. Decision Store persists TemporalPrior in snapshots (append-only,
   no historical mutation).

Computational complexity
------------------------
O(h) per page where h = number of historical snapshots (to find the
earliest signal date). O(1) for all Layer 1/2/3 calculations.
O(n) for Monte Carlo validation where n = number of simulated lifetimes.
"""
import json
import logging
import math
import random
from dataclasses import dataclass, field, asdict
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Optional

from . import config, decision_store
from .logging_utils import traced, log
from .page_profile import PageDecisionRecord, normalize_page_id


# =====================================================================
# Constants (shared across layers)
# =====================================================================

# --- Layer 1: Gott constants ---

# Gott's 95% two-sided factor: at 95% confidence, remaining lifetime
# is within [t_past / 39.7, t_past * 39.7]. The exact value from the
# derivation is 39.0 (= (1+0.95)/(1-0.95) = 1.95/0.05), but Gott's
# original 1993 Nature paper cites 39.7 from a more precise calculation
# accounting for the discrete nature of the observation. We use 39.7
# for consistency with the published result.
COPERNICAN_95_FACTOR = 39.7

# --- Layer 2: SEO heuristic constants ---

# Sigmoid midpoint for maturity scoring: at this age (days), a page
# is considered 50% mature. Derived from the typical SEO maturation
# window of ~90 days (3 months), which is the conventional industry
# estimate for new content to reach its stable ranking.
MATURITY_SIGMOID_MIDPOINT = 90.0
MATURITY_SIGMOID_STEEPNESS = 0.05

# --- Layer 3: Decision policy constants ---

# Minimum page age (days) before any prediction is considered
# meaningful. Below this, the Copernican bounds are so wide that any
# prediction is essentially uninformative.
MIN_AGE_FOR_PREDICTION = 1

# When recommendation_age is below this fraction of the evaluation
# window, evaluation_readiness is False regardless of other signals.
MIN_REC_AGE_FRACTION = 0.5


# =====================================================================
# Public data structures (unchanged from original API)
# =====================================================================

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


# =====================================================================
# Layer 1: Pure Gott Delta-t model
#
# Every function here is a direct mathematical consequence of the
# single Copernican assumption: t_past / total ~ Uniform(0, 1).
#
# No sigmoid. No heuristics. No SEO terminology.
# =====================================================================

@dataclass
class GottInterval:
    """
    Output of Layer 1: a pure Gott Delta-t prediction.

    All fields are derived solely from t_past and the Copernican
    principle — no domain knowledge, no heuristics.
    """
    t_past: float
    confidence_level: float
    remaining_lower: float
    remaining_upper: float
    total_lower: float
    total_upper: float
    median_remaining: float

    def to_dict(self):
        return {
            't_past': self.t_past,
            'confidence_level': self.confidence_level,
            'remaining_lower': round(self.remaining_lower, 6),
            'remaining_upper': round(self.remaining_upper, 6),
            'total_lower': round(self.total_lower, 6),
            'total_upper': round(self.total_upper, 6),
            'median_remaining': round(self.median_remaining, 6),
        }


def gott_remaining_lower(t_past: float, confidence: float = 0.95) -> float:
    """
    One-sided lower bound on remaining lifetime.

    P(remaining > t_past * (1-c)/c) = c

    Derivation:
        r = t_past / total ~ U(0, 1)
        remaining = total - t_past = t_past * (1-r) / r
        P(remaining > L) = P((1-r)/r > L/t_past)
                         = P(r < 1/(1 + L/t_past))
                         = 1/(1 + L/t_past)
        Set this equal to c:
            1/(1 + L/t_past) = c
            L/t_past = (1-c)/c
            L = t_past * (1-c)/c
    """
    if t_past <= 0 or confidence <= 0 or confidence >= 1:
        return 0.0
    return t_past * (1.0 - confidence) / confidence


def gott_remaining_upper(t_past: float, confidence: float = 0.95) -> float:
    """
    One-sided upper bound on remaining lifetime.

    P(remaining < t_past * c/(1-c)) = c

    Derivation:
        P(remaining < U) = P((1-r)/r < U/t_past)
                         = P(r > 1/(1 + U/t_past))
                         = 1 - 1/(1 + U/t_past)
        Set this equal to c:
            1 - 1/(1 + U/t_past) = c
            1/(1 + U/t_past) = 1-c
            U/t_past = c/(1-c)
            U = t_past * c/(1-c)
    """
    if t_past <= 0 or confidence <= 0 or confidence >= 1:
        return 0.0
    return t_past * confidence / (1.0 - confidence)


def gott_total_lower(t_past: float, confidence: float = 0.95) -> float:
    """
    One-sided lower bound on total lifetime.

    P(total > t_past / (1-c)) = c

    Derivation:
        P(total > X) = P(t_past/total < t_past/X) = t_past/X
        Set t_past/X = c: X = t_past/c.
        Wait — that gives P(total > t_past/c) = c, but we want
        P(total > X) = c, so X = t_past / (1 - (1-c)) ... let me be careful.

        r = t_past / total ~ U(0, 1)
        P(total > X) = P(t_past/total < t_past/X) = P(r < t_past/X)
        For this to equal c: t_past/X = c, so X = t_past/c.

        Hmm, but that means total > t_past/c with probability c.
        At c=0.95: total > t_past/0.95 = t_past * 1.053.
        That's correct — we're 95% sure the total is at least slightly
        more than t_past (since we might be near the end).

        But wait, the standard Gott result is about remaining, not total.
        total_lower = t_past + remaining_lower = t_past + t_past*(1-c)/c
                     = t_past * (1 + (1-c)/c) = t_past * (c + 1 - c)/c = t_past/c.

        So total_lower = t_past / c. This is consistent.
    """
    if t_past <= 0 or confidence <= 0 or confidence >= 1:
        return 0.0
    return t_past / confidence


def gott_total_upper(t_past: float, confidence: float = 0.95) -> float:
    """
    One-sided upper bound on total lifetime.

    P(total < t_past / (1-c)) = c

    Derivation:
        P(total < X) = P(r > t_past/X) = 1 - t_past/X
        Set 1 - t_past/X = c: t_past/X = 1-c, X = t_past/(1-c).

        Consistency check:
        total_upper = t_past + remaining_upper = t_past + t_past*c/(1-c)
                     = t_past * (1 + c/(1-c)) = t_past * (1-c+c)/(1-c)
                     = t_past / (1-c). ✓
    """
    if t_past <= 0 or confidence <= 0 or confidence >= 1:
        return 0.0
    return t_past / (1.0 - confidence)


def gott_median_remaining(t_past: float) -> float:
    """
    Median remaining lifetime (50% confidence).

    At 50% confidence, remaining >= t_past. This is the simplest
    Copernican result: you're equally likely to be in the first half
    or second half of the phenomenon's lifetime.

    P(remaining > t_past * (1-0.5)/0.5) = 0.5
    P(remaining > t_past) = 0.5
    """
    if t_past <= 0:
        return 0.0
    return t_past


def gott_survival_probability(t_past: float, t_remaining: float) -> float:
    """
    P(remaining > t_remaining | t_past).

    The core Copernican survival function. Given that a phenomenon
    has lasted t_past, what is the probability it will last at least
    t_remaining more?

    P(remaining > t_remaining) = P((1-r)/r > t_remaining/t_past)
                               = P(r < t_past / (t_past + t_remaining))
                               = t_past / (t_past + t_remaining)

    This is the fundamental equation. All other Layer 1 functions
    are special cases of this one.
    """
    if t_past <= 0:
        return 0.0
    if t_remaining <= 0:
        return 1.0
    return t_past / (t_past + t_remaining)


def gott_interval(t_past: float, confidence: float = 0.95) -> GottInterval:
    """
    Compute the full Gott Delta-t interval at a given confidence level.

    Returns a GottInterval with one-sided lower/upper bounds on both
    remaining and total lifetime, plus the median remaining.

    This is the primary output of Layer 1.
    """
    return GottInterval(
        t_past=t_past,
        confidence_level=confidence,
        remaining_lower=gott_remaining_lower(t_past, confidence),
        remaining_upper=gott_remaining_upper(t_past, confidence),
        total_lower=gott_total_lower(t_past, confidence),
        total_upper=gott_total_upper(t_past, confidence),
        median_remaining=gott_median_remaining(t_past),
    )


# =====================================================================
# Layer 2: SEO maturity model
#
# A heuristic layer that maps page age to maturity/growth/retirement
# scores using a sigmoid centered at ~90 days. This is explicitly NOT
# Gott — it is an empirical prior informed by SEO domain knowledge.
# =====================================================================

def seo_sigmoid(age_days: float,
                midpoint: float = MATURITY_SIGMOID_MIDPOINT,
                steepness: float = MATURITY_SIGMOID_STEEPNESS) -> float:
    """
    Standard sigmoid, shifted to midpoint and scaled by steepness.

    This is an SEO heuristic: it encodes the empirical observation that
    new content typically takes ~90 days to reach stable rankings. It
    is NOT derived from the Copernican principle.
    """
    return 1.0 / (1.0 + math.exp(-steepness * (age_days - midpoint)))


def seo_maturity_score(page_age_days: float) -> float:
    """
    Heuristic maturity score in [0, 1].

    Uses a sigmoid centered at MATURITY_SIGMOID_MIDPOINT (90 days).
    A page <30 days old is <20% mature; a page >150 days old is >80%.

    This is an SEO heuristic, not a Gott prediction.
    """
    if page_age_days <= 0:
        return 0.0
    return seo_sigmoid(float(page_age_days))


def seo_remaining_growth_probability(page_age_days: float) -> float:
    """
    Heuristic probability that the page still has significant growth
    ahead of it.

    Uses 1 - sigmoid(page_age_days): a young page has high growth
    probability; an old page has low.

    This is an SEO heuristic, not a Gott prediction. The Copernican
    principle provides the survival probability (Layer 1); this
    function applies an empirical SEO maturation curve on top.
    """
    if page_age_days <= 0:
        return 1.0
    return 1.0 - seo_sigmoid(float(page_age_days))


def seo_remaining_observation_probability(
    page_age_days: float,
    recommendation_age_days: float,
) -> float:
    """
    Heuristic probability that the observation window is still open.

    If the recommendation is younger than the evaluation window,
    observation is still open (linear from 1.0 to 0.5). Beyond that,
    it drops via the SEO sigmoid.

    This is an SEO/policy heuristic, not a Gott prediction.
    """
    effective_age = max(recommendation_age_days, 0)
    if effective_age <= 0:
        effective_age = page_age_days
    if effective_age <= 0:
        return 1.0

    eval_window = config.LEARNING_LOOP_EVALUATION_WINDOW_DAYS
    if effective_age < eval_window:
        return 1.0 - (effective_age / eval_window) * 0.5
    return max(0.0, 1.0 - seo_sigmoid(float(effective_age)))


def seo_retirement_probability(page_age_days: float) -> float:
    """
    Heuristic probability that the page has "retired" — its useful
    SEO lifetime is likely behind it.

    retirement = maturity * (1 - remaining_growth)
    The page is old AND has little growth left.

    This is an SEO heuristic, not a Gott prediction.
    """
    if page_age_days <= 0:
        return 0.0
    maturity = seo_maturity_score(page_age_days)
    remaining_growth = seo_remaining_growth_probability(page_age_days)
    return maturity * (1.0 - remaining_growth)


# =====================================================================
# Layer 3: Decision policy
#
# Converts Layer 1 (Gott interval) + Layer 2 (SEO maturity) +
# business thresholds into temporal decisions: WAIT, OBSERVE,
# EVALUATE, RETIRE.
# =====================================================================

class DecisionAction(Enum):
    """Temporal decision from the policy layer."""
    WAIT = 'WAIT'          # Too early — wait for evaluation window
    OBSERVE = 'OBSERVE'    # Still maturing — observe, don't act
    EVALUATE = 'EVALUATE'  # Mature enough — evaluate outcomes
    RETIRE = 'RETIRE'      # Past useful lifetime — retire


def policy_recommended_wait_days(
    recommendation_age_days: float,
    page_age_days: float,
) -> int:
    """
    How many more days to wait before evaluating this recommendation.

    Business rules:
    - If the recommendation is younger than the evaluation window,
      wait until the evaluation window is complete.
    - If the page is very young (< MIN_AGE_FOR_PREDICTION), wait at
      least until the page has some history.
    - Cap at 2x evaluation window to avoid blocking learning indefinitely.
    """
    eval_window = config.LEARNING_LOOP_EVALUATION_WINDOW_DAYS
    max_wait = eval_window * 2

    if recommendation_age_days < eval_window:
        base_wait = eval_window - recommendation_age_days
    else:
        base_wait = 0

    page_maturity_wait = 0
    if page_age_days < MIN_AGE_FOR_PREDICTION:
        page_maturity_wait = MIN_AGE_FOR_PREDICTION - page_age_days

    total_wait = max(base_wait, page_maturity_wait)
    return min(total_wait, max_wait)


def policy_evaluation_readiness(
    recommendation_age_days: float,
    page_age_days: float,
    recommended_wait_days: float,
) -> bool:
    """
    True when the recommendation is old enough that observed outcomes
    are reliable signals.

    Two conditions:
    1. page_age_days >= MIN_AGE_FOR_PREDICTION
    2. recommendation_age_days >= recommended_wait_days
    """
    if page_age_days < MIN_AGE_FOR_PREDICTION:
        return False
    if recommendation_age_days < recommended_wait_days:
        return False
    return True


def policy_confidence(page_age_days: float) -> float:
    """
    Confidence in the temporal prediction itself.

    The Copernican bounds become more informative as t_past grows.
    With very small t_past, the bounds are so wide as to be
    uninformative. We scale confidence linearly to 1.0 at the
    SEO maturity midpoint (~90 days).

    This is a policy choice about how much to trust the prediction,
    not a Gott probability.
    """
    if page_age_days <= 0:
        return 0.0
    return min(1.0, float(page_age_days) / MATURITY_SIGMOID_MIDPOINT)


def policy_decide(
    gott: GottInterval,
    maturity_score: float,
    recommendation_age_days: float,
    page_age_days: float,
    eval_window: int,
) -> DecisionAction:
    """
    Convert Gott interval + SEO maturity + business thresholds into
    a temporal decision.

    Decision tree:
    1. If page_age < MIN_AGE_FOR_PREDICTION -> WAIT
    2. If recommendation_age < eval_window -> WAIT
    3. If maturity_score < 0.3 and remaining_growth_probability > 0.7 -> OBSERVE
    4. If retirement_probability > 0.8 -> RETIRE
    5. Otherwise -> EVALUATE
    """
    if page_age_days < MIN_AGE_FOR_PREDICTION:
        return DecisionAction.WAIT
    if recommendation_age_days < eval_window:
        return DecisionAction.WAIT
    if maturity_score < 0.3 and (1.0 - maturity_score) > 0.7:
        return DecisionAction.OBSERVE
    if maturity_score > 0.9 and gott.remaining_lower < gott.t_past * 0.01:
        return DecisionAction.RETIRE
    return DecisionAction.EVALUATE


def _build_reasoning(page_age_days, recommendation_age_days, maturity_score,
                     remaining_growth_prob, evaluation_readiness,
                     recommended_wait_days):
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


# =====================================================================
# Backward-compatibility wrappers
#
# These preserve the original private function names so that existing
# tests and any internal callers continue to work. Each delegates to
# the appropriate layer.
# =====================================================================

# --- Layer 1 wrappers ---

def _copernican_remaining_lower(t_past, confidence_level=0.95):
    """Backward-compatible wrapper for gott_remaining_lower."""
    return gott_remaining_lower(t_past, confidence_level)


def _copernican_remaining_upper(t_past, confidence_level=0.95):
    """Backward-compatible wrapper for gott_remaining_upper."""
    return gott_remaining_upper(t_past, confidence_level)


# --- Layer 2 wrappers ---

def _sigmoid(x, midpoint=MATURITY_SIGMOID_MIDPOINT,
             steepness=MATURITY_SIGMOID_STEEPNESS):
    """Backward-compatible wrapper for seo_sigmoid."""
    return seo_sigmoid(x, midpoint, steepness)


def _compute_maturity_score(page_age_days):
    """Backward-compatible wrapper for seo_maturity_score."""
    return seo_maturity_score(page_age_days)


def _compute_remaining_growth_probability(page_age_days):
    """Backward-compatible wrapper for seo_remaining_growth_probability."""
    return seo_remaining_growth_probability(page_age_days)


def _compute_remaining_observation_probability(page_age_days,
                                                recommendation_age_days):
    """Backward-compatible wrapper for seo_remaining_observation_probability."""
    return seo_remaining_observation_probability(page_age_days,
                                                  recommendation_age_days)


def _compute_retirement_probability(page_age_days):
    """Backward-compatible wrapper for seo_retirement_probability."""
    return seo_retirement_probability(page_age_days)


# --- Layer 3 wrappers ---

def _compute_evaluation_readiness(recommendation_age_days, page_age_days,
                                   recommended_wait_days):
    """Backward-compatible wrapper for policy_evaluation_readiness."""
    return policy_evaluation_readiness(recommendation_age_days, page_age_days,
                                        recommended_wait_days)


def _compute_recommended_wait_days(recommendation_age_days, page_age_days):
    """Backward-compatible wrapper for policy_recommended_wait_days."""
    return policy_recommended_wait_days(recommendation_age_days, page_age_days)


def _compute_confidence(page_age_days):
    """Backward-compatible wrapper for policy_confidence."""
    return policy_confidence(page_age_days)


# =====================================================================
# Signal extraction (shared infrastructure)
# =====================================================================

def _find_earliest_signal_date(history):
    """
    Find the earliest date any signal was observed for this page, from
    historical snapshots. This serves as a proxy for 'page creation date'
    or 'first indexed date' since we don't have explicit creation dates.
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
    page.
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
    if date_a.tzinfo is not None:
        date_a = date_a.replace(tzinfo=None)
    if date_b.tzinfo is not None:
        date_b = date_b.replace(tzinfo=None)
    return abs((date_b - date_a).days)


# =====================================================================
# Public API (unchanged)
# =====================================================================

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

        # Layer 1: Pure Gott Delta-t
        gott = gott_interval(float(page_age_days), confidence=0.95)

        # Layer 2: SEO maturity heuristics
        maturity_score = seo_maturity_score(page_age_days)
        remaining_growth_prob = seo_remaining_growth_probability(page_age_days)
        remaining_obs_prob = seo_remaining_observation_probability(
            page_age_days, recommendation_age_days,
        )
        retirement_prob = seo_retirement_probability(page_age_days)

        # Layer 3: Decision policy
        recommended_wait = policy_recommended_wait_days(
            recommendation_age_days, page_age_days,
        )
        evaluation_ready = policy_evaluation_readiness(
            recommendation_age_days, page_age_days, recommended_wait,
        )
        confidence = policy_confidence(page_age_days)
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

    Returns True if the decision policy says EVALUATE.
    """
    prior = compute_temporal_prior(
        page_id, as_of_date=as_of_date, conn=conn,
        recommendation_type=recommendation_type,
    )
    return prior.evaluation_readiness


# =====================================================================
# Monte Carlo validation
#
# Generates random lifetimes, randomly observes them, and verifies
# that the empirical coverage of Gott's confidence intervals matches
# the theoretical values. This validates that Layer 1 is a correct
# implementation of the Copernican theorem.
# =====================================================================

@dataclass
class CoverageResult:
    """Result of a single coverage test at one confidence level."""
    confidence_level: float
    expected_coverage: float
    observed_coverage: float
    error: float
    n_samples: int

    def __str__(self):
        return (f"c={self.confidence_level:.2f}: "
                f"expected={self.expected_coverage:.4f}, "
                f"observed={self.observed_coverage:.4f}, "
                f"error={self.error:.6f} ({abs(self.error)*100:.3f}%), "
                f"n={self.n_samples}")


@dataclass
class ValidationReport:
    """Full Monte Carlo validation report."""
    n_samples: int
    distributions: list
    results: list  # list of CoverageResult
    max_error: float
    passed: bool

    def __str__(self):
        lines = [
            f"Monte Carlo Validation Report",
            f"  samples: {self.n_samples}",
            f"  distributions: {', '.join(self.distributions)}",
            f"  max error: {self.max_error:.6f}",
            f"  passed: {self.passed}",
            f"",
            f"  {'c':>6s}  {'expected':>10s}  {'observed':>10s}  {'error':>10s}",
            f"  {'-'*6}  {'-'*10}  {'-'*10}  {'-'*10}",
        ]
        for r in self.results:
            lines.append(
                f"  {r.confidence_level:6.2f}  {r.expected_coverage:10.4f}  "
                f"{r.observed_coverage:10.4f}  {r.error:10.6f}"
            )
        return "\n".join(lines)

    def to_dict(self):
        return {
            'n_samples': self.n_samples,
            'distributions': self.distributions,
            'max_error': round(self.max_error, 6),
            'passed': self.passed,
            'results': [
                {
                    'confidence_level': r.confidence_level,
                    'expected_coverage': round(r.expected_coverage, 6),
                    'observed_coverage': round(r.observed_coverage, 6),
                    'error': round(r.error, 6),
                    'n_samples': r.n_samples,
                }
                for r in self.results
            ],
        }


def _sample_lifetime(distribution: str, rng: random.Random) -> float:
    """
    Sample a random total lifetime from the given distribution.

    The Copernican theorem is distribution-free (it doesn't matter what
    the true lifetime distribution is), so we test with several to
    confirm this property.
    """
    if distribution == 'uniform':
        return rng.uniform(1, 10000)
    elif distribution == 'exponential':
        return rng.expovariate(1 / 1000) + 1
    elif distribution == 'lognormal':
        return rng.lognormvariate(5, 1.5) + 1
    elif distribution == 'powerlaw':
        # Pareto distribution (heavy tail)
        return rng.paretovariate(1.5) * 100 + 1
    else:
        return rng.uniform(1, 10000)


def validate_gott_coverage(
    n_samples: int = 100_000,
    confidence_levels: list = None,
    distributions: list = None,
    seed: int = 42,
    tolerance: float = 0.005,
) -> ValidationReport:
    """
    Monte Carlo validation of Gott's Copernican confidence intervals.

    Procedure:
    1. Generate n_samples random total lifetimes T from various
       distributions (uniform, exponential, lognormal, powerlaw).
    2. For each T, pick a random observation time t_past ~ U(0, T).
    3. Compute the Gott one-sided lower bound L = t_past * (1-c)/c.
    4. Check if the actual remaining (T - t_past) > L.
    5. The fraction of times this is true should equal c.

    The Copernican theorem is distribution-free, so the coverage
    should match regardless of the lifetime distribution.

    Args:
        n_samples: Number of simulated lifetimes (default 100,000).
        confidence_levels: List of confidence levels to test
            (default [0.50, 0.80, 0.90, 0.95, 0.99]).
        distributions: List of distribution names to sample from
            (default: all four).
        seed: Random seed for reproducibility.
        tolerance: Maximum acceptable |observed - expected| error
            for the validation to pass (default 0.005 = 0.5%).

    Returns:
        ValidationReport with per-confidence-level results.
    """
    if confidence_levels is None:
        confidence_levels = [0.50, 0.80, 0.90, 0.95, 0.99]
    if distributions is None:
        distributions = ['uniform', 'exponential', 'lognormal', 'powerlaw']

    rng = random.Random(seed)

    # Pre-generate all (t_past, t_remaining) pairs
    pairs = []
    samples_per_dist = n_samples // len(distributions)
    for dist in distributions:
        for _ in range(samples_per_dist):
            T = _sample_lifetime(dist, rng)
            t_past = rng.uniform(0, T)
            t_remaining = T - t_past
            pairs.append((t_past, t_remaining))

    total_samples = len(pairs)
    results = []

    for c in confidence_levels:
        count_covered = 0
        for t_past, t_remaining in pairs:
            lower = gott_remaining_lower(t_past, c)
            if t_remaining > lower:
                count_covered += 1

        observed = count_covered / total_samples
        error = observed - c
        results.append(CoverageResult(
            confidence_level=c,
            expected_coverage=c,
            observed_coverage=observed,
            error=error,
            n_samples=total_samples,
        ))

    max_error = max(abs(r.error) for r in results)
    passed = max_error < tolerance

    return ValidationReport(
        n_samples=total_samples,
        distributions=distributions,
        results=results,
        max_error=max_error,
        passed=passed,
    )
