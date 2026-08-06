"""
Comprehensive unit tests for the Closed-Loop Learning Engine.

Tests cover:
- RecommendationLearningRecord creation and serialization
- Context fingerprinting (determinism, bucketing)
- Metric extraction from PageDecisionRecord
- Outcome score computation (positive, negative, neutral, edge cases)
- Confidence delta calculation and capping
- Full evaluate_page_learning workflow with mock historical snapshots
- LearningSummary aggregation and cumulative delta capping
- Append-only persistence (no overwrites)
- Integration with decision_store and recommendation_engine
- Edge cases: insufficient history, no recommendations, empty metrics
"""
import json
import os
import sqlite3
import tempfile
from datetime import datetime, timedelta
from unittest import mock

import pytest

from scripts.decision_engine import config, decision_store, learning_engine
from scripts.decision_engine.learning_engine import (
    RecommendationLearningRecord,
    LearningSummary,
    compute_context_fingerprint,
    _opportunity_bucket,
    _extract_metrics,
    _pct_change,
    _normalize_pct,
    _compute_outcome_score,
    _directional_sign,
    evaluate_page_learning,
    evaluate_all_learning,
    get_learning_summary,
    get_all_learning_records,
    count_learning_records,
    LEARNING_RATE,
    MAX_CUMULATIVE_DELTA,
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
    learning_engine._ensure_learning_schema(conn)
    yield conn
    conn.close()


def _make_record(page_id, snapshot_date, *, gsc=None, ga4=None, marketcall=None,
                 opp_score=None, recommendations=None, bvs=None):
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
    )


# --- RecommendationLearningRecord tests ---

class TestRecommendationLearningRecord:
    def test_creation(self):
        rec = RecommendationLearningRecord(
            page_id='/test-page',
            recommendation_type='expand_cluster',
            context_fingerprint='abc123',
            previous_snapshot_date='2025-01-01',
            current_snapshot_date='2025-01-31',
            previous_metrics={'seo.clicks': 100},
            current_metrics={'seo.clicks': 120},
            outcome_score=0.5,
            confidence_delta=0.075,
            success=True,
        )
        assert rec.page_id == '/test-page'
        assert rec.recommendation_type == 'expand_cluster'
        assert rec.outcome_score == 0.5
        assert rec.confidence_delta == pytest.approx(0.075)
        assert rec.success is True
        assert rec.timestamp is not None

    def test_serialization_roundtrip(self):
        rec = RecommendationLearningRecord(
            page_id='/test',
            recommendation_type='rewrite_title',
            context_fingerprint='def456',
            previous_snapshot_date='2025-01-01',
            current_snapshot_date='2025-02-01',
            previous_metrics={'seo.clicks': 50},
            current_metrics={'seo.clicks': 75},
            outcome_score=0.3,
            confidence_delta=0.045,
            success=True,
        )
        d = rec.to_dict()
        assert d['page_id'] == '/test'
        assert d['outcome_score'] == 0.3
        restored = RecommendationLearningRecord.from_dict(d)
        assert restored.page_id == rec.page_id
        assert restored.outcome_score == rec.outcome_score
        assert restored.success == rec.success

    def test_from_dict_missing_timestamp(self):
        d = {
            'page_id': '/test',
            'recommendation_type': 'test_action',
            'context_fingerprint': 'xyz',
            'previous_snapshot_date': '2025-01-01',
            'current_snapshot_date': '2025-02-01',
            'previous_metrics': {},
            'current_metrics': {},
            'outcome_score': 0.0,
            'confidence_delta': 0.0,
            'success': False,
        }
        rec = RecommendationLearningRecord.from_dict(d)
        assert rec.timestamp is not None


# --- Context fingerprinting tests ---

class TestContextFingerprint:
    def test_deterministic(self):
        opp = {'opportunity_gap_score': 0.85}
        fp1 = compute_context_fingerprint('expand_cluster', opp)
        fp2 = compute_context_fingerprint('expand_cluster', opp)
        assert fp1 == fp2

    def test_different_actions_different_fingerprints(self):
        opp = {'opportunity_gap_score': 0.85}
        fp1 = compute_context_fingerprint('expand_cluster', opp)
        fp2 = compute_context_fingerprint('rewrite_title', opp)
        assert fp1 != fp2

    def test_same_action_different_buckets_different_fingerprints(self):
        fp_top = compute_context_fingerprint('expand_cluster', {'opportunity_gap_score': 0.9})
        fp_mid = compute_context_fingerprint('expand_cluster', {'opportunity_gap_score': 0.5})
        fp_bottom = compute_context_fingerprint('expand_cluster', {'opportunity_gap_score': 0.1})
        assert fp_top != fp_mid
        assert fp_mid != fp_bottom
        assert fp_top != fp_bottom

    def test_same_bucket_same_fingerprint(self):
        fp1 = compute_context_fingerprint('expand_cluster', {'opportunity_gap_score': 0.85})
        fp2 = compute_context_fingerprint('expand_cluster', {'opportunity_gap_score': 0.75})
        assert fp1 == fp2  # both in 'top' bucket (>= 0.7)

    def test_none_opp_score(self):
        fp = compute_context_fingerprint('test', None)
        assert fp is not None
        assert len(fp) == 16

    def test_empty_opp_score(self):
        fp = compute_context_fingerprint('test', {})
        assert fp is not None

    def test_opportunity_bucket_boundaries(self):
        assert _opportunity_bucket({'opportunity_gap_score': 0.7}) == 'top'
        assert _opportunity_bucket({'opportunity_gap_score': 0.69}) == 'mid'
        assert _opportunity_bucket({'opportunity_gap_score': 0.3}) == 'mid'
        assert _opportunity_bucket({'opportunity_gap_score': 0.29}) == 'bottom'
        assert _opportunity_bucket({}) == 'unknown'
        assert _opportunity_bucket(None) == 'unknown'

    def test_opportunity_bucket_fallback_to_performance(self):
        assert _opportunity_bucket({'performance_score': 0.8}) == 'top'
        assert _opportunity_bucket({'performance_score': 0.2}) == 'bottom'


# --- Metric extraction tests ---

class TestExtractMetrics:
    def test_gsc_metrics(self):
        rec = _make_record('/test', '2025-01-01', gsc={
            'impressions': 1000, 'clicks': 50, 'ctr': 0.05, 'position': 12.5,
        })
        metrics = _extract_metrics(rec)
        assert 'seo.impressions' in metrics
        assert metrics['seo.impressions'] == 1000
        assert metrics['seo.clicks'] == 50
        assert metrics['seo.ctr'] == 0.05
        assert metrics['seo.position'] == 12.5

    def test_ga4_metrics(self):
        rec = _make_record('/test', '2025-01-01', ga4={
            'sessions': 200, 'engagement_rate': 0.65, 'phone_click_events': 10,
        })
        metrics = _extract_metrics(rec)
        assert metrics['behavior.sessions'] == 200
        assert metrics['behavior.phone_click_events'] == 10

    def test_marketcall_metrics(self):
        rec = _make_record('/test', '2025-01-01', marketcall={
            'calls': 30, 'approved_calls': 20, 'revenue': 5000,
        })
        metrics = _extract_metrics(rec)
        assert metrics['calls.calls'] == 30
        assert metrics['calls.approved_calls'] == 20
        assert metrics['calls.revenue'] == 5000

    def test_opportunity_score(self):
        rec = _make_record('/test', '2025-01-01', opp_score={
            'opportunity_gap_score': 0.8, 'performance_score': 0.3,
        })
        metrics = _extract_metrics(rec)
        assert metrics['decision_engine.opportunity_gap_score'] == 0.8
        assert metrics['decision_engine.performance_score'] == 0.3

    def test_business_value_score(self):
        rec = _make_record('/test', '2025-01-01', bvs=42.5)
        metrics = _extract_metrics(rec)
        assert metrics['decision_engine.business_value_score'] == 42.5

    def test_non_numeric_skipped(self):
        rec = _make_record('/test', '2025-01-01', gsc={
            'page': '/test', 'impressions': 100, 'is_orphan': True,
        })
        metrics = _extract_metrics(rec)
        assert 'seo.page' not in metrics
        assert 'seo.is_orphan' not in metrics
        assert 'seo.impressions' in metrics

    def test_empty_record(self):
        rec = _make_record('/test', '2025-01-01')
        metrics = _extract_metrics(rec)
        assert metrics == {}


# --- Outcome score computation tests ---

class TestOutcomeScore:
    def test_positive_growth(self):
        prev = {'seo.clicks': 100, 'calls.calls': 10, 'calls.revenue': 1000}
        curr = {'seo.clicks': 120, 'calls.calls': 12, 'calls.revenue': 1100}
        score = _compute_outcome_score(prev, curr)
        assert score > 0
        assert score <= 1.0

    def test_negative_growth(self):
        prev = {'seo.clicks': 100, 'calls.calls': 10, 'calls.revenue': 1000}
        curr = {'seo.clicks': 80, 'calls.calls': 8, 'calls.revenue': 900}
        score = _compute_outcome_score(prev, curr)
        assert score < 0
        assert score >= -1.0

    def test_no_change(self):
        prev = {'seo.clicks': 100, 'calls.calls': 10}
        curr = {'seo.clicks': 100, 'calls.calls': 10}
        score = _compute_outcome_score(prev, curr)
        assert score == pytest.approx(0.0, abs=1e-6)

    def test_empty_metrics(self):
        assert _compute_outcome_score({}, {}) == 0.0
        assert _compute_outcome_score(None, None) == 0.0

    def test_one_side_empty(self):
        score = _compute_outcome_score({'seo.clicks': 100}, {})
        assert score == 0.0

    def test_position_lower_is_better(self):
        prev = {'seo.position': 20.0}
        curr = {'seo.position': 10.0}
        score = _compute_outcome_score(prev, curr)
        assert score > 0

    def test_position_increase_is_negative(self):
        prev = {'seo.position': 10.0}
        curr = {'seo.position': 20.0}
        score = _compute_outcome_score(prev, curr)
        assert score < 0

    def test_extreme_outlier_squashed(self):
        prev = {'seo.clicks': 1}
        curr = {'seo.clicks': 11}
        score = _compute_outcome_score(prev, curr)
        assert score <= 1.0  # squashed by tanh, not unbounded

    def test_revenue_weighted_higher_than_clicks(self):
        prev_revenue = {'seo.clicks': 100, 'calls.revenue': 1000}
        curr_revenue = {'seo.clicks': 100, 'calls.revenue': 1500}
        prev_clicks = {'seo.clicks': 100, 'calls.revenue': 1000}
        curr_clicks = {'seo.clicks': 150, 'calls.revenue': 1000}
        score_revenue = _compute_outcome_score(prev_revenue, curr_revenue)
        score_clicks = _compute_outcome_score(prev_clicks, curr_clicks)
        assert score_revenue > score_clicks


class TestPctChange:
    def test_normal(self):
        assert _pct_change(100, 120) == pytest.approx(20.0)

    def test_decrease(self):
        assert _pct_change(100, 80) == pytest.approx(-20.0)

    def test_zero_previous(self):
        assert _pct_change(0, 100) is None

    def test_none_values(self):
        assert _pct_change(None, 100) is None
        assert _pct_change(100, None) is None

    def test_no_change(self):
        assert _pct_change(100, 100) == pytest.approx(0.0)


class TestNormalizePct:
    def test_zero(self):
        assert _normalize_pct(0.0) == pytest.approx(0.0)

    def test_positive(self):
        result = _normalize_pct(50.0)
        assert 0 < result < 1.0

    def test_negative(self):
        result = _normalize_pct(-50.0)
        assert -1.0 < result < 0

    def test_extreme_squashed(self):
        assert _normalize_pct(10000.0) <= 1.0
        assert _normalize_pct(-10000.0) >= -1.0

    def test_none(self):
        assert _normalize_pct(None) is None


class TestDirectionalSign:
    def test_normal_metric(self):
        assert _directional_sign('seo.clicks') == 1.0

    def test_position(self):
        assert _directional_sign('seo.position') == -1.0
        assert _directional_sign('seo.avg_position') == -1.0

    def test_revenue(self):
        assert _directional_sign('calls.revenue') == 1.0


# --- Evaluate page learning tests ---

class TestEvaluatePageLearning:
    def test_insufficient_history(self, temp_conn):
        record = _make_record('/test', '2025-01-01', gsc={'clicks': 100})
        decision_store.save_snapshot(record, conn=temp_conn)
        records = evaluate_page_learning('/test', conn=temp_conn)
        assert records == []

    def test_no_recommendations(self, temp_conn):
        rec1 = _make_record('/test', '2025-01-01', gsc={'clicks': 100})
        rec2 = _make_record('/test', '2025-02-01', gsc={'clicks': 120})
        decision_store.save_snapshot(rec1, conn=temp_conn)
        decision_store.save_snapshot(rec2, conn=temp_conn)
        records = evaluate_page_learning('/test', conn=temp_conn)
        assert records == []

    def test_successful_recommendation(self, temp_conn):
        rec1 = _make_record('/test', '2025-01-01',
            gsc={'clicks': 100, 'impressions': 1000, 'ctr': 0.1, 'position': 15.0},
            opp_score={'opportunity_gap_score': 0.85, 'performance_score': 0.6},
            recommendations=[{'action': 'expand_cluster', 'target': '/test'}],
        )
        rec2 = _make_record('/test', '2025-02-01',
            gsc={'clicks': 130, 'impressions': 1200, 'ctr': 0.108, 'position': 12.0},
            opp_score={'opportunity_gap_score': 0.85, 'performance_score': 0.7},
        )
        decision_store.save_snapshot(rec1, conn=temp_conn)
        decision_store.save_snapshot(rec2, conn=temp_conn)
        records = evaluate_page_learning('/test', conn=temp_conn, evaluation_window_days=30)
        assert len(records) == 1
        assert records[0].recommendation_type == 'expand_cluster'
        assert records[0].outcome_score > 0
        assert records[0].success is True
        assert records[0].confidence_delta > 0

    def test_failed_recommendation(self, temp_conn):
        rec1 = _make_record('/test', '2025-01-01',
            gsc={'clicks': 100, 'impressions': 1000, 'ctr': 0.1, 'position': 15.0},
            opp_score={'opportunity_gap_score': 0.85, 'performance_score': 0.6},
            recommendations=[{'action': 'rewrite_title_and_meta_description', 'target': '/test'}],
        )
        rec2 = _make_record('/test', '2025-02-01',
            gsc={'clicks': 70, 'impressions': 900, 'ctr': 0.078, 'position': 18.0},
        )
        decision_store.save_snapshot(rec1, conn=temp_conn)
        decision_store.save_snapshot(rec2, conn=temp_conn)
        records = evaluate_page_learning('/test', conn=temp_conn, evaluation_window_days=30)
        assert len(records) == 1
        assert records[0].outcome_score < 0
        assert records[0].success is False
        assert records[0].confidence_delta < 0

    def test_multiple_recommendations(self, temp_conn):
        rec1 = _make_record('/test', '2025-01-01',
            gsc={'clicks': 100, 'impressions': 1000},
            opp_score={'opportunity_gap_score': 0.85},
            recommendations=[
                {'action': 'expand_cluster', 'target': '/test'},
                {'action': 'increase_internal_links', 'target': '/test'},
                {'action': 'add_trust_schema_and_faqs', 'target': '/test'},
            ],
        )
        rec2 = _make_record('/test', '2025-02-01',
            gsc={'clicks': 120, 'impressions': 1100},
        )
        decision_store.save_snapshot(rec1, conn=temp_conn)
        decision_store.save_snapshot(rec2, conn=temp_conn)
        records = evaluate_page_learning('/test', conn=temp_conn, evaluation_window_days=30)
        assert len(records) == 3
        actions = {r.recommendation_type for r in records}
        assert actions == {'expand_cluster', 'increase_internal_links', 'add_trust_schema_and_faqs'}

    def test_append_only(self, temp_conn):
        rec1 = _make_record('/test', '2025-01-01',
            gsc={'clicks': 100},
            opp_score={'opportunity_gap_score': 0.85},
            recommendations=[{'action': 'expand_cluster', 'target': '/test'}],
        )
        rec2 = _make_record('/test', '2025-02-01',
            gsc={'clicks': 120},
        )
        decision_store.save_snapshot(rec1, conn=temp_conn)
        decision_store.save_snapshot(rec2, conn=temp_conn)

        records1 = evaluate_page_learning('/test', conn=temp_conn, evaluation_window_days=30)
        assert len(records1) == 1

        records2 = evaluate_page_learning('/test', conn=temp_conn, evaluation_window_days=30)
        assert len(records2) == 0

        assert count_learning_records(conn=temp_conn) == 1

    def test_no_snapshot_in_evaluation_window(self, temp_conn):
        rec1 = _make_record('/test', '2025-01-01',
            gsc={'clicks': 100},
            opp_score={'opportunity_gap_score': 0.85},
            recommendations=[{'action': 'expand_cluster', 'target': '/test'}],
        )
        rec2 = _make_record('/test', '2025-01-05',
            gsc={'clicks': 105},
        )
        decision_store.save_snapshot(rec1, conn=temp_conn)
        decision_store.save_snapshot(rec2, conn=temp_conn)
        records = evaluate_page_learning('/test', conn=temp_conn, evaluation_window_days=30)
        assert records == []


# --- Evaluate all learning tests ---

class TestEvaluateAllLearning:
    def test_multiple_pages(self, temp_conn):
        for page_id in ['/page-a', '/page-b', '/page-c']:
            rec1 = _make_record(page_id, '2025-01-01',
                gsc={'clicks': 100},
                opp_score={'opportunity_gap_score': 0.85},
                recommendations=[{'action': 'expand_cluster', 'target': page_id}],
            )
            rec2 = _make_record(page_id, '2025-02-01',
                gsc={'clicks': 120},
            )
            decision_store.save_snapshot(rec1, conn=temp_conn)
            decision_store.save_snapshot(rec2, conn=temp_conn)

        all_records = evaluate_all_learning(conn=temp_conn, evaluation_window_days=30)
        assert len(all_records) == 3
        page_ids = {r.page_id for r in all_records}
        assert page_ids == {'/page-a', '/page-b', '/page-c'}

    def test_empty_store(self, temp_conn):
        records = evaluate_all_learning(conn=temp_conn)
        assert records == []


# --- Learning summary tests ---

class TestLearningSummary:
    def test_empty_summary(self, temp_conn):
        summary = get_learning_summary(conn=temp_conn)
        assert summary.record_count == 0
        assert summary.success_count == 0
        assert summary.failure_count == 0
        assert summary.avg_outcome_score == 0.0
        assert summary.adjustments == {}

    def test_aggregation(self, temp_conn):
        for page_id in ['/page-a', '/page-b']:
            rec1 = _make_record(page_id, '2025-01-01',
                gsc={'clicks': 100, 'impressions': 1000},
                opp_score={'opportunity_gap_score': 0.85},
                recommendations=[{'action': 'expand_cluster', 'target': page_id}],
            )
            rec2 = _make_record(page_id, '2025-02-01',
                gsc={'clicks': 130, 'impressions': 1200},
            )
            decision_store.save_snapshot(rec1, conn=temp_conn)
            decision_store.save_snapshot(rec2, conn=temp_conn)

        evaluate_all_learning(conn=temp_conn, evaluation_window_days=30)
        summary = get_learning_summary(conn=temp_conn)
        assert summary.record_count == 2
        assert summary.success_count == 2
        assert summary.failure_count == 0
        assert summary.avg_outcome_score > 0
        assert len(summary.adjustments) == 1
        for key, delta in summary.adjustments.items():
            assert key.startswith('expand_cluster|')
            assert delta > 0

    def test_cumulative_delta_capped(self, temp_conn):
        for i in range(20):
            page_id = f'/page-{i}'
            rec1 = _make_record(page_id, '2025-01-01',
                gsc={'clicks': 100, 'impressions': 1000},
                opp_score={'opportunity_gap_score': 0.85},
                recommendations=[{'action': 'expand_cluster', 'target': page_id}],
            )
            rec2 = _make_record(page_id, '2025-02-01',
                gsc={'clicks': 200, 'impressions': 2000},
            )
            decision_store.save_snapshot(rec1, conn=temp_conn)
            decision_store.save_snapshot(rec2, conn=temp_conn)

        evaluate_all_learning(conn=temp_conn, evaluation_window_days=30)
        summary = get_learning_summary(conn=temp_conn)
        for key, delta in summary.adjustments.items():
            assert delta <= MAX_CUMULATIVE_DELTA
            assert delta >= -MAX_CUMULATIVE_DELTA

    def test_get_adjustment_method(self):
        summary = LearningSummary(
            adjustments={'expand_cluster|abc123': 0.15},
            record_count=5, success_count=3, failure_count=2,
            avg_outcome_score=0.1,
        )
        assert summary.get_adjustment('expand_cluster', 'abc123') == 0.15
        assert summary.get_adjustment('unknown_action', 'unknown_fp') == 0.0

    def test_mixed_success_failure(self, temp_conn):
        rec1a = _make_record('/page-a', '2025-01-01',
            gsc={'clicks': 100, 'impressions': 1000},
            opp_score={'opportunity_gap_score': 0.85},
            recommendations=[{'action': 'expand_cluster', 'target': '/page-a'}],
        )
        rec2a = _make_record('/page-a', '2025-02-01',
            gsc={'clicks': 150, 'impressions': 1200},
        )
        rec1b = _make_record('/page-b', '2025-01-01',
            gsc={'clicks': 100, 'impressions': 1000},
            opp_score={'opportunity_gap_score': 0.85},
            recommendations=[{'action': 'expand_cluster', 'target': '/page-b'}],
        )
        rec2b = _make_record('/page-b', '2025-02-01',
            gsc={'clicks': 70, 'impressions': 800},
        )
        for rec in [rec1a, rec2a, rec1b, rec2b]:
            decision_store.save_snapshot(rec, conn=temp_conn)

        evaluate_all_learning(conn=temp_conn, evaluation_window_days=30)
        summary = get_learning_summary(conn=temp_conn)
        assert summary.record_count == 2
        assert summary.success_count == 1
        assert summary.failure_count == 1


# --- Get all learning records tests ---

class TestGetAllLearningRecords:
    def test_retrieval(self, temp_conn):
        rec1 = _make_record('/test', '2025-01-01',
            gsc={'clicks': 100, 'impressions': 1000},
            opp_score={'opportunity_gap_score': 0.85},
            recommendations=[{'action': 'expand_cluster', 'target': '/test'}],
        )
        rec2 = _make_record('/test', '2025-02-01',
            gsc={'clicks': 120, 'impressions': 1100},
        )
        decision_store.save_snapshot(rec1, conn=temp_conn)
        decision_store.save_snapshot(rec2, conn=temp_conn)
        evaluate_page_learning('/test', conn=temp_conn, evaluation_window_days=30)

        all_records = get_all_learning_records(conn=temp_conn)
        assert len(all_records) == 1
        assert all_records[0].recommendation_type == 'expand_cluster'
        assert all_records[0].page_id == '/test'

    def test_empty(self, temp_conn):
        all_records = get_all_learning_records(conn=temp_conn)
        assert all_records == []


# --- Integration with recommendation engine tests ---

class TestRecommendationEngineIntegration:
    def test_learned_adjustments_applied(self):
        from scripts.decision_engine.recommendation_engine import generate_recommendations
        from scripts.decision_engine.opportunity_score import ScoreResult

        results = [
            ScoreResult(
                record_id='/test-page',
                opportunity_gap_score=0.95,
                performance_score=0.5,
                metrics_used={'impressions': 'observed', 'ctr': 'observed', 'calls': 'neutral_default'},
                percentiles={'ctr': 0.2, 'impressions': 0.8, 'avg_position': 0.5, 'calls': 0.5, 'approval_rate': 0.5},
            ),
        ]

        recs_base = generate_recommendations(results, raw_metrics={'/test-page': {'impressions': 1000, 'clicks': 50}})

        if recs_base:
            action = recs_base[0].action
            opp_score = {'opportunity_gap_score': 0.95}
            fp = compute_context_fingerprint(action, opp_score)
            adjustments = {f'{action}|{fp}': 0.2}

            recs_learned = generate_recommendations(
                results, raw_metrics={'/test-page': {'impressions': 1000, 'clicks': 50}},
                learned_confidence_adjustments=adjustments,
            )
            assert len(recs_learned) > 0
            base_match = next((r for r in recs_base if r.action == action), None)
            learned_match = next((r for r in recs_learned if r.action == action), None)
            if base_match and learned_match:
                assert learned_match.confidence >= base_match.confidence

    def test_no_adjustments_no_change(self):
        from scripts.decision_engine.recommendation_engine import generate_recommendations
        from scripts.decision_engine.opportunity_score import ScoreResult

        results = [
            ScoreResult(
                record_id='/test-page',
                opportunity_gap_score=0.95,
                performance_score=0.5,
                metrics_used={'impressions': 'observed', 'ctr': 'observed', 'calls': 'neutral_default'},
                percentiles={'ctr': 0.2, 'impressions': 0.8, 'avg_position': 0.5, 'calls': 0.5, 'approval_rate': 0.5},
            ),
        ]
        recs1 = generate_recommendations(results, raw_metrics={'/test-page': {'impressions': 1000, 'clicks': 50}})
        recs2 = generate_recommendations(
            results, raw_metrics={'/test-page': {'impressions': 1000, 'clicks': 50}},
            learned_confidence_adjustments={},
        )
        assert len(recs1) == len(recs2)
        for r1, r2 in zip(recs1, recs2):
            assert r1.confidence == r2.confidence


# --- PageDecisionRecord compatibility test ---

class TestPageDecisionRecordCompatibility:
    def test_learning_record_with_full_record(self, temp_conn):
        rec1 = _make_record('/test', '2025-01-01',
            gsc={'clicks': 100, 'impressions': 1000, 'ctr': 0.1, 'position': 15.0},
            ga4={'sessions': 200, 'engagement_rate': 0.65, 'phone_click_events': 10},
            marketcall={'calls': 30, 'approved_calls': 20, 'revenue': 5000},
            opp_score={'opportunity_gap_score': 0.85, 'performance_score': 0.6},
            recommendations=[{'action': 'expand_cluster', 'target': '/test'}],
            bvs=42.5,
        )
        rec2 = _make_record('/test', '2025-02-01',
            gsc={'clicks': 130, 'impressions': 1200, 'ctr': 0.108, 'position': 12.0},
            ga4={'sessions': 250, 'engagement_rate': 0.70, 'phone_click_events': 15},
            marketcall={'calls': 35, 'approved_calls': 25, 'revenue': 6500},
            opp_score={'opportunity_gap_score': 0.85, 'performance_score': 0.7},
            bvs=55.0,
        )
        decision_store.save_snapshot(rec1, conn=temp_conn)
        decision_store.save_snapshot(rec2, conn=temp_conn)

        records = evaluate_page_learning('/test', conn=temp_conn, evaluation_window_days=30)
        assert len(records) == 1
        rec = records[0]
        assert 'seo.clicks' in rec.previous_metrics
        assert 'behavior.sessions' in rec.previous_metrics
        assert 'calls.revenue' in rec.previous_metrics
        assert 'decision_engine.opportunity_gap_score' in rec.previous_metrics
        assert rec.outcome_score > 0
        assert rec.success is True
