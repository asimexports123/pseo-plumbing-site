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
