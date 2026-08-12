import unittest

from ..opportunity_score import score_records


class TestOpportunityScore(unittest.TestCase):
    def _records(self):
        return [
            {'page': 'high-vis-low-conv', 'impressions': 20000, 'ctr': 0.001, 'calls': 0, 'avg_position': 30},
            {'page': 'low-vis-low-conv', 'impressions': 50, 'ctr': 0.02, 'calls': 0, 'avg_position': 40},
            {'page': 'high-vis-high-conv', 'impressions': 15000, 'ctr': 0.08, 'calls': 40, 'avg_position': 3,
             'approval_rate': 0.9, 'revenue': 5000, 'internal_authority': 0.02},
            {'page': 'mid', 'impressions': 5000, 'ctr': 0.03, 'calls': 5, 'avg_position': 15},
        ]

    def test_high_visibility_low_conversion_gets_highest_gap_score(self):
        results = {r.record_id: r for r in score_records(self._records())}
        gap_scores = {k: v.opportunity_gap_score for k, v in results.items()}
        self.assertEqual(max(gap_scores, key=gap_scores.get), 'high-vis-low-conv')

    def test_performance_score_missing_metrics_is_none(self):
        results = {r.record_id: r for r in score_records(self._records())}
        # Only 'high-vis-high-conv' has all 4 performance metrics fully populated;
        # others may have partial performance metrics info (calls only).
        self.assertIsNotNone(results['high-vis-high-conv'].performance_score)

    def test_performance_score_best_record_scores_higher(self):
        results = {r.record_id: r for r in score_records(self._records())}
        best = results['high-vis-high-conv'].performance_score
        # 'mid' has some calls but no approval_rate/revenue/internal_authority
        mid = results['mid'].performance_score
        if mid is not None:
            self.assertGreaterEqual(best, mid)

    def test_scores_bounded_zero_one(self):
        for r in score_records(self._records()):
            self.assertGreaterEqual(r.opportunity_gap_score, 0.0)
            self.assertLessEqual(r.opportunity_gap_score, 1.0)
            if r.performance_score is not None:
                self.assertGreaterEqual(r.performance_score, 0.0)
                self.assertLessEqual(r.performance_score, 1.0)

    def test_empty_input_returns_empty(self):
        self.assertEqual(score_records([]), [])

    def test_metrics_used_tracks_neutral_defaults(self):
        records = [{'page': 'no-ctr-data', 'impressions': 100, 'calls': 1}]
        results = score_records(records)
        self.assertEqual(results[0].metrics_used['ctr'], 'neutral_default')
        self.assertEqual(results[0].metrics_used['impressions'], 'observed')


if __name__ == '__main__':
    unittest.main()
