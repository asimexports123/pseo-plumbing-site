"""
Comprehensive unit tests for the Gott Temporal Prior Engine.

Tests cover:
- TemporalPrior creation and serialization
- Copernican Delta-t calculations (lower/upper bounds)
- Maturity score computation (sigmoid, edge cases)
- Remaining growth probability
- Remaining observation probability
- Retirement probability
- Evaluation readiness and recommended wait days
- Confidence computation
- Signal extraction from historical snapshots
- Full compute_temporal_prior workflow with mock history
- compute_all_temporal_priors across multiple pages
- Integration with learning_engine (Gott gate prevents premature evaluation)
- Integration with recommendation_engine (observe_and_wait for immature pages)
- Append-only persistence in decision_store snapshots
- Backward compatibility (old records without temporal_prior load correctly)
- Edge cases: new page, mature page, sparse history, long-lived inactive page,
  recommendation too young, recommendation ready
"""
import json
import os
import math
import tempfile
from datetime import datetime, timedelta, timezone
from unittest import mock

import pytest

from scripts.decision_engine import config, decision_store, gott_engine
from scripts.decision_engine.gott_engine import (
    TemporalPrior,
    GottInterval,
    DecisionAction,
    CoverageResult,
    ValidationReport,
    # Layer 1: Pure Gott
    gott_remaining_lower,
    gott_remaining_upper,
    gott_total_lower,
    gott_total_upper,
    gott_median_remaining,
    gott_survival_probability,
    gott_interval,
    # Layer 2: SEO heuristics
    seo_sigmoid,
    seo_maturity_score,
    seo_remaining_growth_probability,
    seo_remaining_observation_probability,
    seo_retirement_probability,
    # Layer 3: Decision policy
    policy_recommended_wait_days,
    policy_evaluation_readiness,
    policy_confidence,
    policy_decide,
    # Monte Carlo validation
    validate_gott_coverage,
    # Backward-compatible wrappers
    _copernican_remaining_lower,
    _copernican_remaining_upper,
    _compute_maturity_score,
    _compute_remaining_growth_probability,
    _compute_remaining_observation_probability,
    _compute_retirement_probability,
    _compute_evaluation_readiness,
    _compute_recommended_wait_days,
    _compute_confidence,
    _find_earliest_signal_date,
    _find_recommendation_date,
    _days_between,
    _sigmoid,
    compute_temporal_prior,
    compute_all_temporal_priors,
    is_ready_for_evaluation,
    COPERNICAN_95_FACTOR,
    MATURITY_SIGMOID_MIDPOINT,
    MIN_AGE_FOR_PREDICTION,
)
from scripts.decision_engine.page_profile import PageDecisionRecord


# --- Fixtures ---

@pytest.fixture
def temp_db(monkeypatch):
    """Create a temporary SQLite DB for isolated testing."""
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = os.path.join(tmpdir, 'test_decisions.sqlite3')
        monkeypatch.setattr(config, 'DECISION_STORE_DB_PATH', __import__('pathlib').Path(db_path))
        yield db_path


@pytest.fixture
def temp_conn(temp_db):
    """Provide a shared connection to the temp DB."""
    conn = decision_store._connect()
    yield conn
    conn.close()


def _make_record(page_id, snapshot_date, *, gsc=None, ga4=None, marketcall=None,
                 opp_score=None, recommendations=None, bvs=None, temporal_prior=None):
    """Helper to create a PageDecisionRecord for testing."""
    return PageDecisionRecord(
        page_id=page_id,
        snapshot_date=snapshot_date,
        gsc_metrics=gsc,
        ga4_metrics=ga4,
        marketcall_metrics=marketcall,
        opportunity_score=opp_score,
        recommendations=recommendations or [],
        business_value_score=bvs,
        temporal_prior=temporal_prior,
    )


# --- TemporalPrior dataclass tests ---

class TestTemporalPrior:
    def test_creation(self):
        tp = TemporalPrior(
            page_id='/test-page',
            page_age_days=100,
            recommendation_age_days=45,
            maturity_score=0.75,
            remaining_growth_probability=0.25,
            remaining_observation_probability=0.3,
            retirement_probability=0.56,
            evaluation_readiness=True,
            recommended_wait_days=0,
            confidence=1.0,
            reasoning='test reasoning',
        )
        assert tp.page_id == '/test-page'
        assert tp.page_age_days == 100
        assert tp.recommendation_age_days == 45
        assert tp.maturity_score == 0.75
        assert tp.remaining_growth_probability == 0.25
        assert tp.remaining_observation_probability == 0.3
        assert tp.retirement_probability == 0.56
        assert tp.evaluation_readiness is True
        assert tp.recommended_wait_days == 0
        assert tp.confidence == 1.0
        assert tp.reasoning == 'test reasoning'

    def test_to_dict(self):
        tp = TemporalPrior(
            page_id='/test',
            page_age_days=50,
            recommendation_age_days=20,
            maturity_score=0.5,
            remaining_growth_probability=0.5,
            remaining_observation_probability=0.6,
            retirement_probability=0.25,
            evaluation_readiness=False,
            recommended_wait_days=10,
            confidence=0.55,
            reasoning='wait',
        )
        d = tp.to_dict()
        assert d['page_id'] == '/test'
        assert d['page_age_days'] == 50
        assert d['maturity_score'] == 0.5
        assert d['evaluation_readiness'] is False
        assert d['recommended_wait_days'] == 10

    def test_from_dict(self):
        d = {
            'page_id': '/page',
            'page_age_days': 200,
            'recommendation_age_days': 100,
            'maturity_score': 0.95,
            'remaining_growth_probability': 0.05,
            'remaining_observation_probability': 0.0,
            'retirement_probability': 0.9,
            'evaluation_readiness': True,
            'recommended_wait_days': 0,
            'confidence': 1.0,
            'reasoning': 'mature page',
        }
        tp = TemporalPrior.from_dict(d)
        assert tp.page_id == '/page'
        assert tp.page_age_days == 200
        assert tp.maturity_score == 0.95
        assert tp.evaluation_readiness is True

    def test_roundtrip(self):
        tp = TemporalPrior(
            page_id='/roundtrip',
            page_age_days=77,
            recommendation_age_days=33,
            maturity_score=0.6,
            remaining_growth_probability=0.4,
            remaining_observation_probability=0.35,
            retirement_probability=0.36,
            evaluation_readiness=True,
            recommended_wait_days=0,
            confidence=0.85,
            reasoning='roundtrip test',
        )
        d = tp.to_dict()
        tp2 = TemporalPrior.from_dict(d)
        assert tp2.page_id == tp.page_id
        assert tp2.page_age_days == tp.page_age_days
        assert tp2.maturity_score == tp.maturity_score
        assert tp2.evaluation_readiness == tp.evaluation_readiness
        assert tp2.reasoning == tp.reasoning

    def test_from_dict_defaults(self):
        """from_dict should handle missing keys gracefully."""
        tp = TemporalPrior.from_dict({'page_id': '/minimal'})
        assert tp.page_id == '/minimal'
        assert tp.page_age_days == 0
        assert tp.maturity_score == 0.0
        assert tp.remaining_growth_probability == 1.0
        assert tp.evaluation_readiness is True
        assert tp.reasoning == ''


# --- Copernican calculation tests ---

class TestCopernicanBounds:
    def test_remaining_lower_95(self):
        """At 95% confidence, remaining > t_past * (1-0.95)/0.95 = t_past * 0.0526"""
        result = _copernican_remaining_lower(100, 0.95)
        assert result == pytest.approx(100 * 0.05 / 0.95, rel=1e-6)

    def test_remaining_upper_95(self):
        """At 95% confidence, remaining < t_past * 0.95/0.05 = t_past * 19"""
        result = _copernican_remaining_upper(100, 0.95)
        assert result == pytest.approx(100 * 0.95 / 0.05, rel=1e-6)

    def test_remaining_lower_50(self):
        """At 50% confidence, remaining > t_past * 0.5/0.5 = t_past"""
        result = _copernican_remaining_lower(100, 0.5)
        assert result == pytest.approx(100, rel=1e-6)

    def test_zero_past(self):
        assert _copernican_remaining_lower(0, 0.95) == 0
        assert _copernican_remaining_upper(0, 0.95) == 0

    def test_negative_past(self):
        assert _copernican_remaining_lower(-10, 0.95) == 0
        assert _copernican_remaining_upper(-10, 0.95) == 0

    def test_lower_less_than_upper(self):
        for t in [1, 10, 100, 1000]:
            assert _copernican_remaining_lower(t, 0.95) < _copernican_remaining_upper(t, 0.95)


# --- Sigmoid tests ---

class TestSigmoid:
    def test_midpoint(self):
        """At midpoint, sigmoid = 0.5"""
        assert _sigmoid(MATURITY_SIGMOID_MIDPOINT) == pytest.approx(0.5, abs=1e-6)

    def test_below_midpoint(self):
        """Below midpoint, sigmoid < 0.5"""
        assert _sigmoid(MATURITY_SIGMOID_MIDPOINT - 50) < 0.5

    def test_above_midpoint(self):
        """Above midpoint, sigmoid > 0.5"""
        assert _sigmoid(MATURITY_SIGMOID_MIDPOINT + 50) > 0.5

    def test_extreme_low(self):
        """Very low value -> close to 0"""
        assert _sigmoid(0) < 0.1

    def test_extreme_high(self):
        """Very high value -> close to 1"""
        assert _sigmoid(300) > 0.9

    def test_monotonic(self):
        """Sigmoid is monotonically increasing"""
        values = [0, 30, 60, 90, 120, 150, 200, 300]
        results = [_sigmoid(v) for v in values]
        for i in range(len(results) - 1):
            assert results[i] <= results[i + 1]


# --- Maturity score tests ---

class TestMaturityScore:
    def test_zero_age(self):
        assert _compute_maturity_score(0) == 0.0

    def test_negative_age(self):
        assert _compute_maturity_score(-5) == 0.0

    def test_midpoint(self):
        assert _compute_maturity_score(MATURITY_SIGMOID_MIDPOINT) == pytest.approx(0.5, abs=1e-6)

    def test_young_page(self):
        """10-day-old page is <20% mature"""
        assert _compute_maturity_score(10) < 0.2

    def test_mature_page(self):
        """200-day-old page is >80% mature"""
        assert _compute_maturity_score(200) > 0.8

    def test_bounded(self):
        """Maturity score is always in [0, 1]"""
        for age in [-100, 0, 1, 10, 50, 100, 500, 1000, 10000]:
            score = _compute_maturity_score(age)
            assert 0.0 <= score <= 1.0


# --- Remaining growth probability tests ---

class TestRemainingGrowthProbability:
    def test_zero_age(self):
        assert _compute_remaining_growth_probability(0) == 1.0

    def test_negative_age(self):
        assert _compute_remaining_growth_probability(-5) == 1.0

    def test_young_page(self):
        """10-day-old page has >90% remaining growth"""
        assert _compute_remaining_growth_probability(10) > 0.9

    def test_old_page(self):
        """200-day-old page has <20% remaining growth"""
        assert _compute_remaining_growth_probability(200) < 0.2

    def test_bounded(self):
        for age in [0, 1, 10, 100, 500, 10000]:
            prob = _compute_remaining_growth_probability(age)
            assert 0.0 <= prob <= 1.0

    def test_decreasing(self):
        """Remaining growth probability decreases with age"""
        ages = [1, 30, 60, 90, 120, 200]
        probs = [_compute_remaining_growth_probability(a) for a in ages]
        for i in range(len(probs) - 1):
            assert probs[i] >= probs[i + 1]


# --- Remaining observation probability tests ---

class TestRemainingObservationProbability:
    def test_zero_age(self):
        assert _compute_remaining_observation_probability(0, 0) == 1.0

    def test_young_recommendation(self):
        """5-day-old recommendation within eval window has high observation prob"""
        prob = _compute_remaining_observation_probability(100, 5)
        assert prob > 0.9

    def test_old_recommendation(self):
        """100-day-old recommendation has lower observation prob than young one"""
        prob = _compute_remaining_observation_probability(200, 100)
        prob_young = _compute_remaining_observation_probability(200, 5)
        assert prob < prob_young
        assert prob < 0.5

    def test_no_recommendation_uses_page_age(self):
        """When recommendation_age=0, falls back to page_age"""
        prob = _compute_remaining_observation_probability(10, 0)
        assert prob > 0.8

    def test_bounded(self):
        for page_age in [0, 10, 100, 500]:
            for rec_age in [0, 10, 100, 500]:
                prob = _compute_remaining_observation_probability(page_age, rec_age)
                assert 0.0 <= prob <= 1.0


# --- Retirement probability tests ---

class TestRetirementProbability:
    def test_zero_age(self):
        assert _compute_retirement_probability(0) == 0.0

    def test_negative_age(self):
        assert _compute_retirement_probability(-5) == 0.0

    def test_young_page(self):
        """Young page has low retirement probability"""
        assert _compute_retirement_probability(10) < 0.1

    def test_old_page(self):
        """Very old page has high retirement probability"""
        assert _compute_retirement_probability(300) > 0.5

    def test_bounded(self):
        for age in [0, 1, 10, 100, 500, 10000]:
            prob = _compute_retirement_probability(age)
            assert 0.0 <= prob <= 1.0


# --- Evaluation readiness tests ---

class TestEvaluationReadiness:
    def test_page_too_young(self):
        """Page younger than MIN_AGE_FOR_PREDICTION is not ready"""
        assert _compute_evaluation_readiness(100, 0, 0) is False

    def test_recommendation_too_young(self):
        """Recommendation younger than recommended_wait is not ready"""
        # arg order: (recommendation_age_days, page_age_days, recommended_wait_days)
        assert _compute_evaluation_readiness(5, 100, 30) is False
        assert _compute_evaluation_readiness(10, 100, 30) is False

    def test_ready(self):
        """Both conditions met -> ready"""
        assert _compute_evaluation_readiness(100, 50, 30) is True

    def test_exactly_at_wait(self):
        """recommendation_age == recommended_wait -> ready (>=)"""
        assert _compute_evaluation_readiness(100, 30, 30) is True


# --- Recommended wait days tests ---

class TestRecommendedWaitDays:
    def test_young_recommendation(self):
        """5-day-old recommendation with 30-day eval window -> wait 25"""
        wait = _compute_recommended_wait_days(5, 100)
        assert wait == 25

    def test_old_recommendation(self):
        """50-day-old recommendation past eval window -> wait 0"""
        wait = _compute_recommended_wait_days(50, 100)
        assert wait == 0

    def test_page_too_young(self):
        """Page younger than MIN_AGE_FOR_PREDICTION adds page maturity wait"""
        wait = _compute_recommended_wait_days(10, 0)
        # rec_age=10 < eval_window=30 -> base_wait=20
        # page_age=0 < MIN_AGE_FOR_PREDICTION=1 -> page_maturity_wait=1
        # total = max(20, 1) = 20
        assert wait == 20

    def test_capped_at_max(self):
        """Wait is capped at 2x eval window"""
        wait = _compute_recommended_wait_days(0, 100)
        # rec_age=0 < 30 -> base_wait=30
        # total = 30, max_wait = 60
        assert wait <= 60


# --- Confidence tests ---

class TestConfidence:
    def test_zero_age(self):
        assert _compute_confidence(0) == 0.0

    def test_negative_age(self):
        assert _compute_confidence(-5) == 0.0

    def test_at_midpoint(self):
        """At MATURITY_SIGMOID_MIDPOINT, confidence = 1.0"""
        assert _compute_confidence(MATURITY_SIGMOID_MIDPOINT) == pytest.approx(1.0)

    def test_halfway(self):
        """At half midpoint, confidence = 0.5"""
        assert _compute_confidence(MATURITY_SIGMOID_MIDPOINT / 2) == pytest.approx(0.5)

    def test_bounded(self):
        for age in [0, 1, 50, 100, 500, 10000]:
            conf = _compute_confidence(age)
            assert 0.0 <= conf <= 1.0


# --- Signal extraction tests ---

class TestSignalExtraction:
    def test_earliest_signal_date(self):
        records = [
            _make_record('/page', '2025-03-01'),
            _make_record('/page', '2025-01-01'),
            _make_record('/page', '2025-02-01'),
        ]
        earliest = _find_earliest_signal_date(records)
        assert earliest == datetime(2025, 1, 1)

    def test_earliest_signal_empty(self):
        assert _find_earliest_signal_date([]) is None

    def test_earliest_signal_invalid_date(self):
        records = [_make_record('/page', 'invalid-date')]
        assert _find_earliest_signal_date(records) is None

    def test_recommendation_date(self):
        records = [
            _make_record('/page', '2025-01-01',
                         recommendations=[{'action': 'expand_cluster'}]),
            _make_record('/page', '2025-02-01'),
            _make_record('/page', '2025-03-01',
                         recommendations=[{'action': 'increase_internal_links'}]),
        ]
        rec_date = _find_recommendation_date(records)
        assert rec_date == datetime(2025, 1, 1)

    def test_recommendation_date_specific_type(self):
        records = [
            _make_record('/page', '2025-01-01',
                         recommendations=[{'action': 'expand_cluster'}]),
            _make_record('/page', '2025-02-01',
                         recommendations=[{'action': 'increase_internal_links'}]),
        ]
        rec_date = _find_recommendation_date(records, 'increase_internal_links')
        assert rec_date == datetime(2025, 2, 1)

    def test_recommendation_date_none(self):
        records = [_make_record('/page', '2025-01-01')]
        assert _find_recommendation_date(records) is None

    def test_recommendation_date_empty(self):
        assert _find_recommendation_date([]) is None

    def test_days_between(self):
        a = datetime(2025, 1, 1)
        b = datetime(2025, 2, 1)
        assert _days_between(a, b) == 31

    def test_days_between_none(self):
        assert _days_between(None, datetime(2025, 1, 1)) == 0

    def test_days_between_same(self):
        a = datetime(2025, 1, 1)
        assert _days_between(a, a) == 0


# --- compute_temporal_prior tests ---

class TestComputeTemporalPrior:
    def test_no_history(self, temp_conn):
        """Page with no history gets conservative defaults."""
        tp = compute_temporal_prior('/new-page', conn=temp_conn,
                                     as_of_date='2025-06-01')
        assert tp.page_id == '/new-page'
        assert tp.page_age_days == 0
        assert tp.recommendation_age_days == 0
        assert tp.maturity_score == 0.0
        assert tp.remaining_growth_probability == 1.0
        assert tp.evaluation_readiness is False
        assert tp.confidence == 0.0
        assert 'No historical snapshots' in tp.reasoning

    def test_new_page(self, temp_conn):
        """Page with only 5 days of history is immature."""
        for date in ['2025-05-28', '2025-06-01', '2025-06-02']:
            decision_store.save_snapshot(
                _make_record('/new', date, gsc={'clicks': 10, 'impressions': 100}),
                conn=temp_conn,
            )
        tp = compute_temporal_prior('/new', conn=temp_conn,
                                     as_of_date='2025-06-02')
        assert tp.page_age_days == 5
        assert tp.maturity_score < 0.2
        assert tp.remaining_growth_probability > 0.9
        assert tp.confidence < 0.1

    def test_mature_page(self, temp_conn):
        """Page with 200 days of history is mature."""
        for i in range(0, 200, 30):
            date = (datetime(2024, 6, 1) + timedelta(days=i)).strftime('%Y-%m-%d')
            decision_store.save_snapshot(
                _make_record('/mature', date, gsc={'clicks': 50, 'impressions': 500}),
                conn=temp_conn,
            )
        tp = compute_temporal_prior('/mature', conn=temp_conn,
                                     as_of_date='2024-12-18')
        assert tp.page_age_days == 200
        assert tp.maturity_score > 0.8
        assert tp.remaining_growth_probability < 0.2
        assert tp.confidence == 1.0

    def test_sparse_history(self, temp_conn):
        """Page with only 2 snapshots far apart."""
        decision_store.save_snapshot(
            _make_record('/sparse', '2025-01-01', gsc={'clicks': 10}),
            conn=temp_conn,
        )
        decision_store.save_snapshot(
            _make_record('/sparse', '2025-06-01', gsc={'clicks': 20}),
            conn=temp_conn,
        )
        tp = compute_temporal_prior('/sparse', conn=temp_conn,
                                     as_of_date='2025-06-01')
        assert tp.page_age_days == 151
        assert tp.maturity_score > 0.7

    def test_long_lived_inactive_page(self, temp_conn):
        """Page with old history but no recent activity."""
        decision_store.save_snapshot(
            _make_record('/old-inactive', '2024-01-01', gsc={'clicks': 100}),
            conn=temp_conn,
        )
        decision_store.save_snapshot(
            _make_record('/old-inactive', '2024-06-01', gsc={'clicks': 5}),
            conn=temp_conn,
        )
        tp = compute_temporal_prior('/old-inactive', conn=temp_conn,
                                     as_of_date='2025-06-01')
        assert tp.page_age_days > 500
        assert tp.retirement_probability > 0.5
        assert tp.maturity_score > 0.9

    def test_recommendation_too_young(self, temp_conn):
        """Recommendation made 11 days ago, eval window is 30 -> not ready."""
        decision_store.save_snapshot(
            _make_record('/page', '2025-01-01', gsc={'clicks': 100},
                         recommendations=[{'action': 'expand_cluster'}]),
            conn=temp_conn,
        )
        # 11 days after recommendation
        decision_store.save_snapshot(
            _make_record('/page', '2025-01-12', gsc={'clicks': 110}),
            conn=temp_conn,
        )
        tp = compute_temporal_prior('/page', conn=temp_conn,
                                     as_of_date='2025-01-12')
        assert tp.recommendation_age_days == 11
        assert tp.evaluation_readiness is False
        assert tp.recommended_wait_days > 0

    def test_recommendation_ready(self, temp_conn):
        """Recommendation made 95 days ago, well past eval window -> ready."""
        decision_store.save_snapshot(
            _make_record('/page', '2024-01-01', gsc={'clicks': 100},
                         recommendations=[{'action': 'expand_cluster'}]),
            conn=temp_conn,
        )
        decision_store.save_snapshot(
            _make_record('/page', '2024-04-05', gsc={'clicks': 200}),
            conn=temp_conn,
        )
        tp = compute_temporal_prior('/page', conn=temp_conn,
                                     as_of_date='2024-04-05')
        assert tp.recommendation_age_days == 95
        assert tp.evaluation_readiness is True
        assert tp.recommended_wait_days == 0

    def test_reasoning_contains_key_info(self, temp_conn):
        """Reasoning string should contain page age and readiness info."""
        decision_store.save_snapshot(
            _make_record('/page', '2025-01-01', gsc={'clicks': 100},
                         recommendations=[{'action': 'expand_cluster'}]),
            conn=temp_conn,
        )
        decision_store.save_snapshot(
            _make_record('/page', '2025-03-01', gsc={'clicks': 200}),
            conn=temp_conn,
        )
        tp = compute_temporal_prior('/page', conn=temp_conn,
                                     as_of_date='2025-03-01')
        assert 'Page age' in tp.reasoning
        assert 'Maturity score' in tp.reasoning
        assert 'Remaining growth probability' in tp.reasoning


# --- compute_all_temporal_priors tests ---

class TestComputeAllTemporalPriors:
    def test_multiple_pages(self, temp_conn):
        decision_store.save_snapshot(
            _make_record('/page-a', '2025-01-01', gsc={'clicks': 100}),
            conn=temp_conn,
        )
        decision_store.save_snapshot(
            _make_record('/page-b', '2025-01-01', gsc={'clicks': 200}),
            conn=temp_conn,
        )
        decision_store.save_snapshot(
            _make_record('/page-a', '2025-06-01', gsc={'clicks': 150}),
            conn=temp_conn,
        )
        decision_store.save_snapshot(
            _make_record('/page-b', '2025-06-01', gsc={'clicks': 250}),
            conn=temp_conn,
        )
        priors = compute_all_temporal_priors(conn=temp_conn, as_of_date='2025-06-01')
        assert len(priors) == 2
        assert '/page-a' in priors
        assert '/page-b' in priors
        assert all(isinstance(p, TemporalPrior) for p in priors.values())

    def test_empty_store(self, temp_conn):
        priors = compute_all_temporal_priors(conn=temp_conn, as_of_date='2025-06-01')
        assert priors == {}


# --- is_ready_for_evaluation tests ---

class TestIsReadyForEvaluation:
    def test_ready(self, temp_conn):
        decision_store.save_snapshot(
            _make_record('/page', '2024-01-01', gsc={'clicks': 100},
                         recommendations=[{'action': 'expand_cluster'}]),
            conn=temp_conn,
        )
        decision_store.save_snapshot(
            _make_record('/page', '2024-06-01', gsc={'clicks': 200}),
            conn=temp_conn,
        )
        assert is_ready_for_evaluation('/page', conn=temp_conn,
                                       as_of_date='2024-06-01') is True

    def test_not_ready(self, temp_conn):
        decision_store.save_snapshot(
            _make_record('/page', '2025-01-01', gsc={'clicks': 100},
                         recommendations=[{'action': 'expand_cluster'}]),
            conn=temp_conn,
        )
        decision_store.save_snapshot(
            _make_record('/page', '2025-01-05', gsc={'clicks': 110}),
            conn=temp_conn,
        )
        assert is_ready_for_evaluation('/page', conn=temp_conn,
                                       as_of_date='2025-01-05') is False


# --- Append-only persistence tests ---

class TestAppendOnlyPersistence:
    def test_temporal_prior_persisted_in_snapshot(self, temp_conn):
        """Temporal prior is stored in the snapshot's record_json."""
        tp = TemporalPrior(
            page_id='/page',
            page_age_days=100,
            recommendation_age_days=50,
            maturity_score=0.75,
            remaining_growth_probability=0.25,
            remaining_observation_probability=0.2,
            retirement_probability=0.56,
            evaluation_readiness=True,
            recommended_wait_days=0,
            confidence=1.0,
            reasoning='mature page',
        )
        rec = _make_record('/page', '2025-06-01', temporal_prior=tp.to_dict())
        decision_store.save_snapshot(rec, conn=temp_conn)

        loaded = decision_store.get_snapshot('/page', '2025-06-01', conn=temp_conn)
        assert loaded.temporal_prior is not None
        assert loaded.temporal_prior['page_age_days'] == 100
        assert loaded.temporal_prior['maturity_score'] == 0.75
        assert loaded.temporal_prior['evaluation_readiness'] is True

    def test_temporal_prior_none_by_default(self, temp_conn):
        """Records without temporal_prior should load as None."""
        rec = _make_record('/page', '2025-06-01')
        decision_store.save_snapshot(rec, conn=temp_conn)

        loaded = decision_store.get_snapshot('/page', '2025-06-01', conn=temp_conn)
        assert loaded.temporal_prior is None

    def test_upsert_preserves_temporal_prior(self, temp_conn):
        """Saving twice for same page+date updates the temporal_prior."""
        rec1 = _make_record('/page', '2025-06-01', temporal_prior=None)
        decision_store.save_snapshot(rec1, conn=temp_conn)

        tp = TemporalPrior(
            page_id='/page', page_age_days=50, recommendation_age_days=20,
            maturity_score=0.5, remaining_growth_probability=0.5,
            remaining_observation_probability=0.5, retirement_probability=0.25,
            evaluation_readiness=False, recommended_wait_days=10,
            confidence=0.55, reasoning='updated',
        )
        rec2 = _make_record('/page', '2025-06-01', temporal_prior=tp.to_dict())
        decision_store.save_snapshot(rec2, conn=temp_conn)

        loaded = decision_store.get_snapshot('/page', '2025-06-01', conn=temp_conn)
        assert loaded.temporal_prior is not None
        assert loaded.temporal_prior['page_age_days'] == 50


# --- Backward compatibility tests ---

class TestBackwardCompatibility:
    def test_old_record_without_temporal_prior_loads(self, temp_conn):
        """A record JSON missing 'temporal_prior' should still load correctly."""
        old_json = json.dumps({
            'page_id': '/old-page',
            'snapshot_date': '2025-01-01',
            'gsc_metrics': {'clicks': 100, 'impressions': 1000},
            'recommendations': [],
            'business_value_score': None,
            'schema_version': 1,
            # Note: no 'temporal_prior' key
        })
        conn = temp_conn
        conn.execute(
            """INSERT INTO page_snapshots
               (page_id, snapshot_date, schema_version, record_json, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?)""",
            ('/old-page', '2025-01-01', 1, old_json, '2025-01-01T00:00:00Z', '2025-01-01T00:00:00Z'),
        )
        conn.commit()

        loaded = decision_store.get_snapshot('/old-page', '2025-01-01', conn=temp_conn)
        assert loaded.page_id == '/old-page'
        assert loaded.gsc_metrics == {'clicks': 100, 'impressions': 1000}
        assert loaded.temporal_prior is None  # graceful default

    def test_old_record_with_temporal_prior_loads(self, temp_conn):
        """A record JSON with temporal_prior should load it correctly."""
        tp_dict = {
            'page_id': '/page',
            'page_age_days': 100,
            'recommendation_age_days': 50,
            'maturity_score': 0.75,
            'remaining_growth_probability': 0.25,
            'remaining_observation_probability': 0.2,
            'retirement_probability': 0.56,
            'evaluation_readiness': True,
            'recommended_wait_days': 0,
            'confidence': 1.0,
            'reasoning': 'test',
        }
        rec = _make_record('/page', '2025-06-01', temporal_prior=tp_dict)
        decision_store.save_snapshot(rec, conn=temp_conn)

        loaded = decision_store.get_snapshot('/page', '2025-06-01', conn=temp_conn)
        assert loaded.temporal_prior is not None
        assert loaded.temporal_prior['page_age_days'] == 100

    def test_page_decision_record_roundtrip_with_temporal_prior(self):
        """Full to_dict/from_dict roundtrip preserves temporal_prior."""
        tp = TemporalPrior(
            page_id='/rt', page_age_days=77, recommendation_age_days=33,
            maturity_score=0.6, remaining_growth_probability=0.4,
            remaining_observation_probability=0.35, retirement_probability=0.36,
            evaluation_readiness=True, recommended_wait_days=0,
            confidence=0.85, reasoning='roundtrip',
        )
        rec = PageDecisionRecord(
            page_id='/rt', snapshot_date='2025-06-01',
            temporal_prior=tp.to_dict(),
        )
        d = rec.to_dict()
        assert d['temporal_prior'] is not None
        assert d['temporal_prior']['page_age_days'] == 77

        rec2 = PageDecisionRecord.from_dict(d)
        assert rec2.temporal_prior is not None
        assert rec2.temporal_prior['page_age_days'] == 77
        assert rec2.temporal_prior['reasoning'] == 'roundtrip'


# --- Learning engine integration tests ---

class TestLearningEngineIntegration:
    def test_gott_prevents_premature_learning(self, temp_conn):
        """Gott should prevent learning evaluation for young recommendations."""
        from scripts.decision_engine.learning_engine import (
            evaluate_page_learning, count_learning_records,
            _ensure_learning_schema,
        )
        _ensure_learning_schema(temp_conn)

        # Recommendation made 5 days ago — too young for 30-day eval window
        decision_store.save_snapshot(
            _make_record('/young-rec', '2025-01-01', gsc={'clicks': 100, 'impressions': 1000},
                         opp_score={'opportunity_gap_score': 0.85},
                         recommendations=[{'action': 'expand_cluster'}]),
            conn=temp_conn,
        )
        decision_store.save_snapshot(
            _make_record('/young-rec', '2025-01-06', gsc={'clicks': 200, 'impressions': 2000}),
            conn=temp_conn,
        )

        records = evaluate_page_learning('/young-rec', conn=temp_conn, evaluation_window_days=30)
        # Gott should have blocked evaluation — no learning records produced
        assert len(records) == 0
        assert count_learning_records(conn=temp_conn) == 0

    def test_gott_allows_mature_learning(self, temp_conn):
        """Gott should allow learning evaluation for mature recommendations."""
        from scripts.decision_engine.learning_engine import (
            evaluate_page_learning, count_learning_records,
            _ensure_learning_schema,
        )
        _ensure_learning_schema(temp_conn)

        # Recommendation made 95 days ago — well past eval window
        decision_store.save_snapshot(
            _make_record('/mature-rec', '2024-01-01', gsc={'clicks': 100, 'impressions': 1000},
                         opp_score={'opportunity_gap_score': 0.85},
                         recommendations=[{'action': 'expand_cluster'}]),
            conn=temp_conn,
        )
        decision_store.save_snapshot(
            _make_record('/mature-rec', '2024-04-05', gsc={'clicks': 200, 'impressions': 2000}),
            conn=temp_conn,
        )

        records = evaluate_page_learning('/mature-rec', conn=temp_conn, evaluation_window_days=30)
        # Gott should allow evaluation — learning records produced
        assert len(records) > 0
        assert count_learning_records(conn=temp_conn) > 0


# --- Recommendation engine integration tests ---

class TestRecommendationEngineIntegration:
    def test_observe_and_wait_for_immature_page(self):
        """High-opportunity low-maturity page should get observe_and_wait."""
        from scripts.decision_engine.recommendation_engine import generate_recommendations
        from scripts.decision_engine.opportunity_score import ScoreResult

        results = [
            ScoreResult(
                record_id='/young-page',
                opportunity_gap_score=0.85,
                performance_score=0.3,
                metrics_used={'impressions': 'observed', 'ctr': 'observed', 'calls': 'neutral_default'},
                percentiles={'ctr': 0.2, 'impressions': 0.8},
            ),
        ]
        temporal_priors = {
            '/young-page': {
                'page_id': '/young-page',
                'page_age_days': 5,
                'recommendation_age_days': 0,
                'maturity_score': 0.05,
                'remaining_growth_probability': 0.95,
                'remaining_observation_probability': 1.0,
                'retirement_probability': 0.0,
                'evaluation_readiness': False,
                'recommended_wait_days': 30,
                'confidence': 0.05,
                'reasoning': 'very young page',
            },
        }
        recs = generate_recommendations(
            results, raw_metrics={'/young-page': {'impressions': 1000, 'clicks': 50}},
            temporal_priors=temporal_priors,
        )
        observe_recs = [r for r in recs if r.action == 'observe_and_wait']
        assert len(observe_recs) > 0
        assert observe_recs[0].target == '/young-page'
        assert 'temporal maturity' in observe_recs[0].reason

    def test_no_observe_and_wait_for_mature_page(self):
        """Mature high-opportunity page should not get observe_and_wait."""
        from scripts.decision_engine.recommendation_engine import generate_recommendations
        from scripts.decision_engine.opportunity_score import ScoreResult

        results = [
            ScoreResult(
                record_id='/mature-page',
                opportunity_gap_score=0.85,
                performance_score=0.3,
                metrics_used={'impressions': 'observed', 'ctr': 'observed', 'calls': 'neutral_default'},
                percentiles={'ctr': 0.2, 'impressions': 0.8},
            ),
        ]
        temporal_priors = {
            '/mature-page': {
                'page_id': '/mature-page',
                'page_age_days': 200,
                'recommendation_age_days': 100,
                'maturity_score': 0.95,
                'remaining_growth_probability': 0.05,
                'remaining_observation_probability': 0.0,
                'retirement_probability': 0.9,
                'evaluation_readiness': True,
                'recommended_wait_days': 0,
                'confidence': 1.0,
                'reasoning': 'mature page',
            },
        }
        recs = generate_recommendations(
            results, raw_metrics={'/mature-page': {'impressions': 1000, 'clicks': 50}},
            temporal_priors=temporal_priors,
        )
        observe_recs = [r for r in recs if r.action == 'observe_and_wait']
        assert len(observe_recs) == 0

    def test_no_observe_and_wait_without_temporal_priors(self):
        """Without temporal_priors, no observe_and_wait recommendations."""
        from scripts.decision_engine.recommendation_engine import generate_recommendations
        from scripts.decision_engine.opportunity_score import ScoreResult

        results = [
            ScoreResult(
                record_id='/page',
                opportunity_gap_score=0.85,
                performance_score=0.3,
                metrics_used={'impressions': 'observed', 'ctr': 'observed', 'calls': 'neutral_default'},
                percentiles={'ctr': 0.2, 'impressions': 0.8},
            ),
        ]
        recs = generate_recommendations(
            results, raw_metrics={'/page': {'impressions': 1000, 'clicks': 50}},
        )
        observe_recs = [r for r in recs if r.action == 'observe_and_wait']
        assert len(observe_recs) == 0

    def test_observe_and_wait_only_for_high_opportunity(self):
        """Low-opportunity immature page should NOT get observe_and_wait."""
        from scripts.decision_engine.recommendation_engine import generate_recommendations
        from scripts.decision_engine.opportunity_score import ScoreResult

        results = [
            ScoreResult(
                record_id='/low-opp',
                opportunity_gap_score=0.2,  # low opportunity
                performance_score=0.8,
                metrics_used={'impressions': 'observed', 'ctr': 'observed', 'calls': 'neutral_default'},
                percentiles={'ctr': 0.8, 'impressions': 0.2},
            ),
        ]
        temporal_priors = {
            '/low-opp': {
                'page_id': '/low-opp',
                'page_age_days': 5,
                'recommendation_age_days': 0,
                'maturity_score': 0.05,
                'remaining_growth_probability': 0.95,
                'remaining_observation_probability': 1.0,
                'retirement_probability': 0.0,
                'evaluation_readiness': False,
                'recommended_wait_days': 30,
                'confidence': 0.05,
                'reasoning': 'young but low opportunity',
            },
        }
        recs = generate_recommendations(
            results, raw_metrics={'/low-opp': {'impressions': 100, 'clicks': 5}},
            temporal_priors=temporal_priors,
        )
        observe_recs = [r for r in recs if r.action == 'observe_and_wait']
        assert len(observe_recs) == 0


# =====================================================================
# Layer 1: Pure Gott Delta-t model tests
# =====================================================================

class TestGottSurvivalProbability:
    """Test the fundamental Copernican survival function."""

    def test_zero_past(self):
        """P(remaining > t | t_past=0) = 0 — no observation, no prediction."""
        assert gott_survival_probability(0, 100) == 0.0

    def test_zero_remaining(self):
        """P(remaining > 0) = 1 — always true (lifetime hasn't ended yet)."""
        assert gott_survival_probability(100, 0) == 1.0

    def test_equal_past_and_remaining(self):
        """P(remaining > t_past) = 0.5 — the median Copernican result."""
        assert gott_survival_probability(100, 100) == pytest.approx(0.5)

    def test_remaining_much_larger(self):
        """P(remaining >> t_past) is small."""
        assert gott_survival_probability(10, 1000) < 0.01

    def test_remaining_much_smaller(self):
        """P(remaining << t_past) is close to 1."""
        assert gott_survival_probability(1000, 10) > 0.99

    def test_formula(self):
        """P(remaining > t_r) = t_past / (t_past + t_r)."""
        for t_past, t_r in [(50, 50), (100, 200), (1, 999), (500, 1)]:
            expected = t_past / (t_past + t_r)
            assert gott_survival_probability(t_past, t_r) == pytest.approx(expected)

    def test_bounded(self):
        """Survival probability is always in [0, 1]."""
        for t_past in [0, 1, 10, 100, 1000]:
            for t_r in [0, 1, 10, 100, 1000]:
                p = gott_survival_probability(t_past, t_r)
                assert 0.0 <= p <= 1.0


class TestGottTotalBounds:
    """Test total lifetime bounds (derived from the Copernican principle)."""

    def test_total_lower_95(self):
        """P(total > t_past/0.95) = 0.95."""
        result = gott_total_lower(100, 0.95)
        assert result == pytest.approx(100 / 0.95, rel=1e-6)

    def test_total_upper_95(self):
        """P(total < t_past/0.05) = 0.95."""
        result = gott_total_upper(100, 0.95)
        assert result == pytest.approx(100 / 0.05, rel=1e-6)

    def test_total_lower_less_than_total_upper(self):
        for t in [1, 10, 100, 1000]:
            assert gott_total_lower(t, 0.95) < gott_total_upper(t, 0.95)

    def test_total_consistency_with_remaining(self):
        """total_lower = t_past + remaining_lower, total_upper = t_past + remaining_upper."""
        for t in [10, 100, 1000]:
            for c in [0.5, 0.8, 0.95]:
                tl = gott_total_lower(t, c)
                tu = gott_total_upper(t, c)
                rl = gott_remaining_lower(t, c)
                ru = gott_remaining_upper(t, c)
                assert tl == pytest.approx(t + rl)
                assert tu == pytest.approx(t + ru)

    def test_zero_past(self):
        assert gott_total_lower(0, 0.95) == 0
        assert gott_total_upper(0, 0.95) == 0


class TestGottMedianRemaining:
    """Test the median remaining lifetime (50% confidence)."""

    def test_basic(self):
        """Median remaining = t_past."""
        assert gott_median_remaining(100) == 100

    def test_zero(self):
        assert gott_median_remaining(0) == 0

    def test_consistency_with_survival(self):
        """P(remaining > median_remaining) should be 0.5."""
        for t in [10, 100, 1000]:
            med = gott_median_remaining(t)
            assert gott_survival_probability(t, med) == pytest.approx(0.5)


class TestGottInterval:
    """Test the combined GottInterval output."""

    def test_creation(self):
        gi = gott_interval(100, 0.95)
        assert gi.t_past == 100
        assert gi.confidence_level == 0.95
        assert gi.remaining_lower > 0
        assert gi.remaining_upper > gi.remaining_lower
        assert gi.total_lower > 0
        assert gi.total_upper > gi.total_lower
        assert gi.median_remaining == 100

    def test_to_dict(self):
        gi = gott_interval(100, 0.95)
        d = gi.to_dict()
        assert d['t_past'] == 100
        assert d['confidence_level'] == 0.95
        assert 'remaining_lower' in d
        assert 'remaining_upper' in d

    def test_consistency(self):
        """Interval bounds are consistent with individual functions."""
        gi = gott_interval(200, 0.90)
        assert gi.remaining_lower == gott_remaining_lower(200, 0.90)
        assert gi.remaining_upper == gott_remaining_upper(200, 0.90)
        assert gi.total_lower == gott_total_lower(200, 0.90)
        assert gi.total_upper == gott_total_upper(200, 0.90)
        assert gi.median_remaining == gott_median_remaining(200)

    def test_zero_past(self):
        gi = gott_interval(0, 0.95)
        assert gi.remaining_lower == 0
        assert gi.remaining_upper == 0
        assert gi.total_lower == 0
        assert gi.total_upper == 0


class TestGottLayer1Purity:
    """Verify Layer 1 functions don't use sigmoid or SEO heuristics."""

    def test_no_sigmoid_dependency(self):
        """Layer 1 functions produce exact formula results, not sigmoid-based."""
        for t in [10, 50, 100, 200, 500]:
            rl = gott_remaining_lower(t, 0.95)
            ru = gott_remaining_upper(t, 0.95)
            assert rl == pytest.approx(t * 0.05 / 0.95)
            assert ru == pytest.approx(t * 0.95 / 0.05)

    def test_gott_is_distribution_free(self):
        """Gott's theorem makes no assumption about the lifetime distribution."""
        assert gott_survival_probability(100, 100) == 0.5
        assert gott_survival_probability(100, 300) == 0.25
        assert gott_survival_probability(300, 100) == 0.75


# =====================================================================
# Layer 2: SEO maturity model tests
# =====================================================================

class TestSeoSigmoid:
    """Test the SEO sigmoid heuristic (NOT Gott)."""

    def test_midpoint(self):
        assert seo_sigmoid(MATURITY_SIGMOID_MIDPOINT) == pytest.approx(0.5, abs=1e-6)

    def test_below_midpoint(self):
        assert seo_sigmoid(MATURITY_SIGMOID_MIDPOINT - 50) < 0.5

    def test_above_midpoint(self):
        assert seo_sigmoid(MATURITY_SIGMOID_MIDPOINT + 50) > 0.5

    def test_monotonic(self):
        values = [0, 30, 60, 90, 120, 150, 200, 300]
        results = [seo_sigmoid(v) for v in values]
        for i in range(len(results) - 1):
            assert results[i] <= results[i + 1]


class TestSeoMaturityScore:
    """Test the SEO maturity score heuristic."""

    def test_zero_age(self):
        assert seo_maturity_score(0) == 0.0

    def test_young_page(self):
        assert seo_maturity_score(10) < 0.2

    def test_mature_page(self):
        assert seo_maturity_score(200) > 0.8

    def test_bounded(self):
        for age in [-100, 0, 1, 10, 50, 100, 500, 1000, 10000]:
            assert 0.0 <= seo_maturity_score(age) <= 1.0


class TestSeoRemainingGrowth:
    """Test the SEO remaining growth probability heuristic."""

    def test_young_page(self):
        assert seo_remaining_growth_probability(10) > 0.9

    def test_old_page(self):
        assert seo_remaining_growth_probability(200) < 0.2

    def test_decreasing(self):
        ages = [1, 30, 60, 90, 120, 200]
        probs = [seo_remaining_growth_probability(a) for a in ages]
        for i in range(len(probs) - 1):
            assert probs[i] >= probs[i + 1]


class TestSeoRetirement:
    """Test the SEO retirement probability heuristic."""

    def test_young_page(self):
        assert seo_retirement_probability(10) < 0.1

    def test_old_page(self):
        assert seo_retirement_probability(300) > 0.5

    def test_bounded(self):
        for age in [0, 1, 10, 100, 500, 10000]:
            assert 0.0 <= seo_retirement_probability(age) <= 1.0


class TestLayer2IsNotGott:
    """Verify Layer 2 functions are explicitly different from Layer 1."""

    def test_maturity_uses_sigmoid_not_copernican(self):
        """Maturity score at 90 days = 0.5 (sigmoid midpoint),
        not related to Copernican survival probability."""
        assert seo_maturity_score(90) == pytest.approx(0.5, abs=1e-6)
        assert seo_maturity_score(180) > 0.9
        assert gott_survival_probability(180, 180) == 0.5  # still 50%!

    def test_growth_probability_is_not_copernican_survival(self):
        """SEO growth probability uses sigmoid, not t_past/(t_past+t_remaining)."""
        assert seo_remaining_growth_probability(180) < 0.2  # sigmoid says low
        # Copernican says P(remaining > 180 | t_past=180) = 0.5 — very different


# =====================================================================
# Layer 3: Decision policy tests
# =====================================================================

class TestDecisionAction:
    """Test the DecisionAction enum."""

    def test_values(self):
        assert DecisionAction.WAIT.value == 'WAIT'
        assert DecisionAction.OBSERVE.value == 'OBSERVE'
        assert DecisionAction.EVALUATE.value == 'EVALUATE'
        assert DecisionAction.RETIRE.value == 'RETIRE'


class TestPolicyDecide:
    """Test the decision policy that converts layers 1+2+thresholds to actions."""

    def test_wait_for_young_page(self):
        """Page younger than MIN_AGE_FOR_PREDICTION -> WAIT."""
        gi = gott_interval(0, 0.95)
        decision = policy_decide(gi, 0.0, 0, 0,
                                 config.LEARNING_LOOP_EVALUATION_WINDOW_DAYS)
        assert decision == DecisionAction.WAIT

    def test_wait_for_young_recommendation(self):
        """Recommendation younger than eval window -> WAIT."""
        gi = gott_interval(100, 0.95)
        decision = policy_decide(gi, 0.8, 5, 100,
                                 config.LEARNING_LOOP_EVALUATION_WINDOW_DAYS)
        assert decision == DecisionAction.WAIT

    def test_observe_for_immature_page(self):
        """High opportunity, low maturity -> OBSERVE."""
        gi = gott_interval(10, 0.95)
        decision = policy_decide(gi, 0.1, 50, 10,
                                 config.LEARNING_LOOP_EVALUATION_WINDOW_DAYS)
        assert decision == DecisionAction.OBSERVE

    def test_evaluate_for_mature_page(self):
        """Mature page with old recommendation -> EVALUATE."""
        gi = gott_interval(200, 0.95)
        decision = policy_decide(gi, 0.9, 100, 200,
                                 config.LEARNING_LOOP_EVALUATION_WINDOW_DAYS)
        assert decision == DecisionAction.EVALUATE

    def test_retire_for_very_old_page(self):
        """Very old page with minimal remaining lifetime at high confidence -> RETIRE."""
        gi_high = gott_interval(10000, 0.999)
        decision = policy_decide(gi_high, 0.99, 100, 10000,
                                 config.LEARNING_LOOP_EVALUATION_WINDOW_DAYS)
        assert decision == DecisionAction.RETIRE


class TestPolicyConfidence:
    """Test the policy confidence function."""

    def test_zero_age(self):
        assert policy_confidence(0) == 0.0

    def test_at_midpoint(self):
        assert policy_confidence(MATURITY_SIGMOID_MIDPOINT) == pytest.approx(1.0)

    def test_bounded(self):
        for age in [0, 1, 50, 100, 500, 10000]:
            assert 0.0 <= policy_confidence(age) <= 1.0


# =====================================================================
# Monte Carlo validation tests
# =====================================================================

class TestMonteCarloValidation:
    """
    Monte Carlo validation that Layer 1 empirically matches Gott's theorem.

    Generates 100,000 random lifetimes from multiple distributions,
    randomly observes them, and verifies empirical coverage against
    the theoretical confidence intervals.
    """

    @pytest.fixture(scope='class')
    def validation_report(self):
        """Run the full Monte Carlo validation once for all tests in this class."""
        return validate_gott_coverage(
            n_samples=100_000,
            confidence_levels=[0.50, 0.80, 0.90, 0.95, 0.99],
            distributions=['uniform', 'exponential', 'lognormal', 'powerlaw'],
            seed=42,
            tolerance=0.005,
        )

    def test_report_structure(self, validation_report):
        """The validation report has the expected structure."""
        assert isinstance(validation_report, ValidationReport)
        assert validation_report.n_samples == 100_000
        assert len(validation_report.results) == 5
        assert validation_report.max_error >= 0

    def test_coverage_at_50_percent(self, validation_report):
        """At 50% confidence, observed coverage should be ~0.50."""
        result = validation_report.results[0]
        assert result.confidence_level == 0.50
        assert result.expected_coverage == 0.50
        assert abs(result.error) < 0.005, (
            f"Expected error < 0.005, got {result.error:.6f}"
        )

    def test_coverage_at_80_percent(self, validation_report):
        """At 80% confidence, observed coverage should be ~0.80."""
        result = validation_report.results[1]
        assert result.confidence_level == 0.80
        assert abs(result.error) < 0.005

    def test_coverage_at_90_percent(self, validation_report):
        """At 90% confidence, observed coverage should be ~0.90."""
        result = validation_report.results[2]
        assert result.confidence_level == 0.90
        assert abs(result.error) < 0.005

    def test_coverage_at_95_percent(self, validation_report):
        """At 95% confidence, observed coverage should be ~0.95."""
        result = validation_report.results[3]
        assert result.confidence_level == 0.95
        assert abs(result.error) < 0.005

    def test_coverage_at_99_percent(self, validation_report):
        """At 99% confidence, observed coverage should be ~0.99."""
        result = validation_report.results[4]
        assert result.confidence_level == 0.99
        assert abs(result.error) < 0.005

    def test_validation_passes(self, validation_report):
        """The full validation should pass (max error < tolerance)."""
        assert validation_report.passed, (
            f"Validation failed: max_error={validation_report.max_error:.6f}\n"
            f"{validation_report}"
        )

    def test_report_to_dict(self, validation_report):
        """The report can be serialized to dict."""
        d = validation_report.to_dict()
        assert d['n_samples'] == 100_000
        assert 'results' in d
        assert len(d['results']) == 5
        assert 'max_error' in d
        assert 'passed' in d

    def test_report_str(self, validation_report):
        """The report has a readable string representation."""
        s = str(validation_report)
        assert 'Monte Carlo Validation Report' in s
        assert 'samples' in s
        assert 'passed' in s

    def test_distribution_free_property(self, validation_report):
        """Gott's theorem is distribution-free: coverage should match
        regardless of the lifetime distribution used."""
        assert validation_report.max_error < 0.005

    def test_small_sample_validation(self):
        """A smaller validation should also work (with larger tolerance)."""
        report = validate_gott_coverage(
            n_samples=10_000,
            confidence_levels=[0.50, 0.95],
            distributions=['uniform', 'exponential'],
            seed=123,
            tolerance=0.02,
        )
        assert report.passed
        assert report.n_samples == 10_000

    def test_coverage_result_str(self):
        """CoverageResult has a readable string representation."""
        cr = CoverageResult(
            confidence_level=0.95,
            expected_coverage=0.95,
            observed_coverage=0.9487,
            error=-0.0013,
            n_samples=100000,
        )
        s = str(cr)
        assert 'c=0.95' in s
        assert 'expected=0.9500' in s
        assert 'observed=0.9487' in s


# =====================================================================
# Three-layer separation tests
# =====================================================================

class TestThreeLayerSeparation:
    """Verify that the three layers are properly separated."""

    def test_layer1_does_not_use_layer2(self):
        """Layer 1 functions should not depend on the sigmoid midpoint."""
        import scripts.decision_engine.gott_engine as ge

        original = ge.MATURITY_SIGMOID_MIDPOINT
        ge.MATURITY_SIGMOID_MIDPOINT = 999.0

        try:
            assert gott_remaining_lower(100, 0.95) == pytest.approx(100 * 0.05 / 0.95)
            assert gott_remaining_upper(100, 0.95) == pytest.approx(100 * 0.95 / 0.05)
            assert gott_survival_probability(100, 100) == 0.5
            assert gott_median_remaining(100) == 100
        finally:
            ge.MATURITY_SIGMOID_MIDPOINT = original

    def test_layer2_depends_on_sigmoid(self):
        """Layer 2 functions should change when the sigmoid midpoint changes."""
        # At midpoint=90, sigmoid(90) = 0.5
        assert seo_sigmoid(90, midpoint=90) == pytest.approx(0.5, abs=1e-6)
        # At midpoint=200, sigmoid(200) = 0.5 (new midpoint)
        assert seo_sigmoid(200, midpoint=200) == pytest.approx(0.5, abs=1e-6)
        # At midpoint=200, sigmoid(90) < 0.5 (90 is below new midpoint)
        assert seo_sigmoid(90, midpoint=200) < 0.5

    def test_layer3_uses_both_layers(self):
        """Layer 3 decision policy uses both Gott interval and SEO maturity."""
        gi = gott_interval(100, 0.95)
        decision = policy_decide(gi, 0.1, 50, 100,
                                 config.LEARNING_LOOP_EVALUATION_WINDOW_DAYS)
        assert decision == DecisionAction.OBSERVE

        decision = policy_decide(gi, 0.9, 50, 100,
                                 config.LEARNING_LOOP_EVALUATION_WINDOW_DAYS)
        assert decision == DecisionAction.EVALUATE

    def test_backward_compat_wrappers_match_new_api(self):
        """Backward-compatible wrappers produce identical results to new API."""
        for t in [10, 50, 100, 500]:
            assert _copernican_remaining_lower(t, 0.95) == gott_remaining_lower(t, 0.95)
            assert _copernican_remaining_upper(t, 0.95) == gott_remaining_upper(t, 0.95)
            assert _compute_maturity_score(t) == seo_maturity_score(t)
            assert _compute_remaining_growth_probability(t) == seo_remaining_growth_probability(t)
            assert _compute_retirement_probability(t) == seo_retirement_probability(t)
            assert _compute_confidence(t) == policy_confidence(t)
            assert _sigmoid(t) == seo_sigmoid(t)
