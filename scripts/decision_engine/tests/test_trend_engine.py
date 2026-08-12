import tempfile
import unittest
from pathlib import Path

from .. import decision_store, trend_engine
from ..page_profile import PageDecisionRecord


class TestComputeDelta(unittest.TestCase):
    def test_basic_up_delta(self):
        delta = trend_engine.compute_delta(15, 10)
        self.assertEqual(delta['absolute_change'], 5)
        self.assertEqual(delta['pct_change'], 50.0)
        self.assertEqual(delta['direction'], 'up')

    def test_basic_down_delta(self):
        delta = trend_engine.compute_delta(5, 10)
        self.assertEqual(delta['direction'], 'down')
        self.assertEqual(delta['pct_change'], -50.0)

    def test_flat_delta(self):
        delta = trend_engine.compute_delta(10, 10)
        self.assertEqual(delta['direction'], 'flat')
        self.assertEqual(delta['pct_change'], 0.0)

    def test_none_current_or_previous_returns_unknown(self):
        self.assertEqual(trend_engine.compute_delta(None, 10)['direction'], 'unknown')
        self.assertEqual(trend_engine.compute_delta(10, None)['direction'], 'unknown')
        self.assertIsNone(trend_engine.compute_delta(None, 10)['pct_change'])

    def test_zero_previous_gives_none_pct_change_not_divide_by_zero(self):
        delta = trend_engine.compute_delta(5, 0)
        self.assertEqual(delta['absolute_change'], 5)
        self.assertIsNone(delta['pct_change'])
        self.assertEqual(delta['direction'], 'up')


class TestClassifyDirection(unittest.TestCase):
    def test_unknown_when_delta_none(self):
        self.assertEqual(trend_engine.classify_direction(None), 'unknown')

    def test_unknown_when_pct_change_none(self):
        delta = trend_engine.compute_delta(5, 0)
        self.assertEqual(trend_engine.classify_direction(delta), 'unknown')

    def test_stable_below_threshold(self):
        delta = trend_engine.compute_delta(100.5, 100)
        self.assertEqual(trend_engine.classify_direction(delta), 'stable')

    def test_improving_above_threshold(self):
        delta = trend_engine.compute_delta(150, 100)
        self.assertEqual(trend_engine.classify_direction(delta), 'improving')

    def test_declining_above_threshold(self):
        delta = trend_engine.compute_delta(50, 100)
        self.assertEqual(trend_engine.classify_direction(delta), 'declining')


class TrendEngineStoreTestCase(unittest.TestCase):
    def setUp(self):
        self._tmpdir = tempfile.TemporaryDirectory()
        self.db_path = Path(self._tmpdir.name) / 'decisions.sqlite3'
        self.conn = decision_store._connect(self.db_path)

    def tearDown(self):
        self.conn.close()
        self._tmpdir.cleanup()

    def _save(self, page_id, date, **kwargs):
        decision_store.save_snapshot(
            PageDecisionRecord(page_id=page_id, snapshot_date=date, **kwargs), conn=self.conn,
        )


class TestComputePageTrends(TrendEngineStoreTestCase):
    def test_no_history_returns_none(self):
        self.assertIsNone(trend_engine.compute_page_trends('/nope', conn=self.conn))

    def test_single_snapshot_has_no_comparisons(self):
        self._save('/foo', '2024-01-10', gsc_metrics={'clicks': 10})
        trends = trend_engine.compute_page_trends('/foo', conn=self.conn)
        self.assertEqual(trends['current_snapshot_date'], '2024-01-10')
        for comparison in trends['comparisons'].values():
            self.assertIsNone(comparison)

    def test_vs_previous_snapshot_and_day_over_day(self):
        self._save('/foo', '2024-01-09', gsc_metrics={'clicks': 10})
        self._save('/foo', '2024-01-10', gsc_metrics={'clicks': 20})
        trends = trend_engine.compute_page_trends('/foo', conn=self.conn)
        vs_prev = trends['comparisons']['vs_previous_snapshot']
        self.assertEqual(vs_prev['baseline_date'], '2024-01-09')
        self.assertEqual(vs_prev['seo']['clicks']['absolute_change'], 10)
        dod = trends['comparisons']['day_over_day']
        self.assertEqual(dod['baseline_date'], '2024-01-09')
        self.assertEqual(dod['seo']['clicks']['absolute_change'], 10)

    def test_week_over_week_uses_nearest_snapshot_on_or_before_target(self):
        self._save('/foo', '2024-01-01', gsc_metrics={'clicks': 5})
        self._save('/foo', '2024-01-03', gsc_metrics={'clicks': 8})
        self._save('/foo', '2024-01-10', gsc_metrics={'clicks': 20})
        trends = trend_engine.compute_page_trends('/foo', conn=self.conn)
        wow = trends['comparisons']['week_over_week']
        # target = 2024-01-03; nearest snapshot on/before that is 2024-01-03 itself
        self.assertEqual(wow['baseline_date'], '2024-01-03')
        self.assertEqual(wow['seo']['clicks']['absolute_change'], 12)

    def test_no_baseline_before_target_gives_none_comparison(self):
        self._save('/foo', '2024-01-09', gsc_metrics={'clicks': 10})
        self._save('/foo', '2024-01-10', gsc_metrics={'clicks': 20})
        trends = trend_engine.compute_page_trends('/foo', conn=self.conn)
        self.assertIsNone(trends['comparisons']['month_over_month'])
        self.assertIsNone(trends['comparisons']['quarter_over_quarter'])

    def test_as_of_date_restricts_history(self):
        self._save('/foo', '2024-01-01', gsc_metrics={'clicks': 5})
        self._save('/foo', '2024-01-05', gsc_metrics={'clicks': 8})
        self._save('/foo', '2024-01-10', gsc_metrics={'clicks': 20})
        trends = trend_engine.compute_page_trends('/foo', as_of_date='2024-01-05', conn=self.conn)
        self.assertEqual(trends['current_snapshot_date'], '2024-01-05')

    def test_behavior_calls_and_decision_engine_diffs(self):
        self._save(
            '/foo', '2024-01-01',
            ga4_metrics={'sessions': 100},
            marketcall_metrics={'calls': 3, 'attribution_level': 'campaign'},
            opportunity_score={'opportunity_gap_score': 0.5, 'performance_score': 0.2},
            bayesian_posterior={'mean': 0.1, 'ci_low': 0.05, 'ci_high': 0.15, 'n_obs': 10},
            recommendations=[{'action': 'improve_title', 'target': '/foo'}],
            business_value_score=1.0,
        )
        self._save(
            '/foo', '2024-01-02',
            ga4_metrics={'sessions': 150},
            marketcall_metrics={'calls': 5, 'attribution_level': 'campaign'},
            opportunity_score={'opportunity_gap_score': 0.8, 'performance_score': 0.3},
            bayesian_posterior={'mean': 0.2, 'ci_low': 0.1, 'ci_high': 0.3, 'n_obs': 20},
            recommendations=[
                {'action': 'improve_title', 'target': '/foo'},
                {'action': 'add_schema', 'target': '/foo'},
            ],
            business_value_score=2.0,
        )
        trends = trend_engine.compute_page_trends('/foo', conn=self.conn)
        comp = trends['comparisons']['vs_previous_snapshot']
        self.assertEqual(comp['behavior']['sessions']['absolute_change'], 50)
        self.assertEqual(comp['calls']['calls']['absolute_change'], 2)
        de = comp['decision_engine']
        self.assertEqual(de['opportunity_gap_score']['absolute_change'], 0.30000000000000004)
        self.assertAlmostEqual(de['performance_score']['absolute_change'], 0.1)
        self.assertEqual(de['business_value_score']['absolute_change'], 1.0)
        self.assertEqual(de['bayesian_posterior']['mean']['absolute_change'], 0.1)
        self.assertEqual(de['recommendation_count']['absolute_change'], 1)
        self.assertEqual(de['new_recommended_actions'], ['add_schema'])
        self.assertEqual(de['resolved_recommended_actions'], [])


class TestDiffMetricDict(unittest.TestCase):
    def test_both_none_returns_none(self):
        self.assertIsNone(trend_engine._diff_metric_dict(None, None))

    def test_skips_non_numeric_keys(self):
        result = trend_engine._diff_metric_dict(
            {'clicks': 10, 'is_orphan': True, 'label': 'x'},
            {'clicks': 5, 'is_orphan': False, 'label': 'y'},
        )
        self.assertEqual(list(result.keys()), ['clicks'])


class TestRankPagesByMetricChange(TrendEngineStoreTestCase):
    def setUp(self):
        super().setUp()
        self._save('/a', '2024-01-01', gsc_metrics={'clicks': 10})
        self._save('/a', '2024-01-02', gsc_metrics={'clicks': 30})
        self._save('/b', '2024-01-01', gsc_metrics={'clicks': 10})
        self._save('/b', '2024-01-02', gsc_metrics={'clicks': 15})
        self._save('/c', '2024-01-01', gsc_metrics={'clicks': 10})

    def test_ranks_descending_by_absolute_change_by_default(self):
        ranked = trend_engine.rank_pages_by_metric_change(
            'seo.clicks', period='vs_previous_snapshot', conn=self.conn,
        )
        page_ids = [r['page_id'] for r in ranked]
        self.assertEqual(page_ids, ['/a', '/b'])

    def test_ascending_surfaces_declining_first(self):
        self._save('/a', '2024-01-03', gsc_metrics={'clicks': 5})
        ranked = trend_engine.rank_pages_by_metric_change(
            'seo.clicks', period='vs_previous_snapshot', ascending=True, conn=self.conn,
        )
        self.assertEqual(ranked[0]['page_id'], '/a')
        self.assertEqual(ranked[0]['absolute_change'], -25)

    def test_page_with_single_snapshot_is_skipped(self):
        ranked = trend_engine.rank_pages_by_metric_change(
            'seo.clicks', period='vs_previous_snapshot', conn=self.conn,
        )
        page_ids = {r['page_id'] for r in ranked}
        self.assertNotIn('/c', page_ids)

    def test_top_n_limits_results(self):
        ranked = trend_engine.rank_pages_by_metric_change(
            'seo.clicks', period='vs_previous_snapshot', top_n=1, conn=self.conn,
        )
        self.assertEqual(len(ranked), 1)

    def test_unknown_period_raises(self):
        with self.assertRaises(ValueError):
            trend_engine.rank_pages_by_metric_change('seo.clicks', period='bogus', conn=self.conn)


class TestComputePortfolioTrends(TrendEngineStoreTestCase):
    def test_omits_pages_without_history_and_includes_others(self):
        self._save('/a', '2024-01-01', gsc_metrics={'clicks': 10})
        result = trend_engine.compute_portfolio_trends(page_ids=['/a', '/never-saved'], conn=self.conn)
        self.assertIn('/a', result)
        self.assertNotIn('/never-saved', result)


if __name__ == '__main__':
    unittest.main()
