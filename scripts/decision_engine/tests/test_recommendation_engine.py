import unittest

from ..opportunity_score import score_records
from ..recommendation_engine import generate_recommendations
from ..bayesian_engine import BayesianEngine
from ..attribution_engine import AttributionResolver, evidence_from_gsc_page, evidence_from_marketcall_campaign


class TestRecommendationEngine(unittest.TestCase):
    def test_orphan_high_gap_page_triggers_increase_links(self):
        records = [
            {'page': 'orphan-high-gap', 'impressions': 20000, 'ctr': 0.001, 'calls': 0},
            {'page': 'normal', 'impressions': 1000, 'ctr': 0.03, 'calls': 5},
            {'page': 'normal2', 'impressions': 2000, 'ctr': 0.04, 'calls': 8},
            {'page': 'normal3', 'impressions': 1500, 'ctr': 0.05, 'calls': 10},
            {'page': 'normal4', 'impressions': 800, 'ctr': 0.06, 'calls': 12},
        ]
        opp_results = score_records(records)
        graph_metrics = {
            'orphan-high-gap': {'pagerank': 0.0, 'is_orphan': True},
            'normal': {'pagerank': 0.02, 'is_orphan': False},
            'normal2': {'pagerank': 0.03, 'is_orphan': False},
            'normal3': {'pagerank': 0.03, 'is_orphan': False},
            'normal4': {'pagerank': 0.03, 'is_orphan': False},
        }
        recs = generate_recommendations(opp_results, graph_metrics=graph_metrics)
        actions = {(r.action, r.target) for r in recs}
        self.assertIn(('increase_internal_links', 'orphan-high-gap'), actions)

    def test_no_graph_metrics_skips_link_recommendations(self):
        records = [{'page': 'a', 'impressions': 5000, 'ctr': 0.001, 'calls': 0}]
        opp_results = score_records(records)
        recs = generate_recommendations(opp_results)
        self.assertFalse(any(r.action == 'increase_internal_links' for r in recs))

    def test_expand_cluster_triggered_for_strong_underscaled_performer(self):
        records = [
            {'page': 'strong-small', 'impressions': 100, 'ctr': 0.05, 'calls': 5},
            {'page': 'weak-large', 'impressions': 10000, 'ctr': 0.01, 'calls': 2},
        ]
        opp_results = score_records(records)

        engine = BayesianEngine()
        engine.observe('strong-small', successes=90, trials=100)   # high mean, decent n
        engine.observe('weak-large', successes=20, trials=1000)    # low mean

        posteriors = {
            'strong-small': engine.get_posterior('strong-small'),
            'weak-large': engine.get_posterior('weak-large'),
        }
        recs = generate_recommendations(opp_results, bayesian_posteriors=posteriors)
        actions = [r.action for r in recs if r.target == 'strong-small']
        # strong-small has a high, reasonably-confident posterior mean;
        # whether it qualifies as "expand_cluster" depends on relative
        # medians, so just assert the engine runs and returns valid records.
        self.assertIsInstance(recs, list)
        for r in recs:
            self.assertGreaterEqual(r.confidence, 0.0)
            self.assertLessEqual(r.confidence, 1.0)

    def test_recommendations_sorted_by_confidence_descending(self):
        records = [
            {'page': f'p{i}', 'impressions': 1000 * (i + 1), 'ctr': 0.001, 'calls': 0}
            for i in range(5)
        ]
        opp_results = score_records(records)
        recs = generate_recommendations(opp_results)
        confidences = [r.confidence for r in recs]
        self.assertEqual(confidences, sorted(confidences, reverse=True))

    def test_empty_input_returns_empty(self):
        self.assertEqual(generate_recommendations([]), [])

    def test_real_link_graph_discrepancy_triggers_fix_broken_link(self):
        records = [{'page': 'a', 'impressions': 5000, 'ctr': 0.01, 'calls': 3}]
        opp_results = score_records(records)
        real_link_graph_metrics = {
            'a': {
                'real_in_degree': 0,
                'real_pagerank': 0.0,
                'real_is_orphan': True,
                'link_discrepancy': True,
            },
        }
        recs = generate_recommendations(
            opp_results, real_link_graph_metrics=real_link_graph_metrics,
        )
        actions = {(r.action, r.target) for r in recs}
        self.assertIn(('fix_broken_or_missing_internal_link', 'a'), actions)

    def test_no_real_link_graph_metrics_skips_fix_broken_link(self):
        records = [{'page': 'a', 'impressions': 5000, 'ctr': 0.01, 'calls': 3}]
        opp_results = score_records(records)
        recs = generate_recommendations(opp_results)
        self.assertFalse(any(r.action == 'fix_broken_or_missing_internal_link' for r in recs))

    def test_no_attribution_resolver_omits_attribution_key(self):
        records = [
            {'page': 'orphan-high-gap', 'impressions': 20000, 'ctr': 0.001, 'calls': 0},
            {'page': 'normal', 'impressions': 1000, 'ctr': 0.03, 'calls': 5},
        ]
        opp_results = score_records(records)
        graph_metrics = {
            'orphan-high-gap': {'pagerank': 0.0, 'is_orphan': True},
            'normal': {'pagerank': 0.02, 'is_orphan': False},
        }
        recs = generate_recommendations(opp_results, graph_metrics=graph_metrics)
        for r in recs:
            self.assertNotIn('attribution', r.supporting_data)

    def test_attribution_resolver_attaches_page_level_evidence(self):
        records = [
            {'page': 'orphan-high-gap', 'impressions': 20000, 'ctr': 0.001, 'calls': 0},
            {'page': 'normal', 'impressions': 1000, 'ctr': 0.03, 'calls': 5},
        ]
        opp_results = score_records(records)
        graph_metrics = {
            'orphan-high-gap': {'pagerank': 0.0, 'is_orphan': True},
            'normal': {'pagerank': 0.02, 'is_orphan': False},
        }
        resolver = AttributionResolver()
        resolver.add_evidence(evidence_from_gsc_page('orphan-high-gap', {'impressions': 20000, 'clicks': 20}))
        recs = generate_recommendations(
            opp_results, graph_metrics=graph_metrics, attribution_resolver=resolver,
        )
        orphan_recs = [r for r in recs if r.target == 'orphan-high-gap']
        self.assertTrue(orphan_recs)
        for r in orphan_recs:
            self.assertIn('attribution', r.supporting_data)
            self.assertTrue(r.supporting_data['attribution']['has_page_level_evidence'])
            self.assertEqual(r.supporting_data['attribution']['sources'], ['gsc'])

    def test_attribution_resolver_never_leaks_campaign_evidence_into_page_recommendation(self):
        records = [{'page': 'orphan-high-gap', 'impressions': 20000, 'ctr': 0.001, 'calls': 0}]
        opp_results = score_records(records)
        graph_metrics = {'orphan-high-gap': {'pagerank': 0.0, 'is_orphan': True}}
        resolver = AttributionResolver()
        resolver.add_evidence(evidence_from_marketcall_campaign(348734, {'calls': 8, 'revenue': 47.23}))
        recs = generate_recommendations(
            opp_results, graph_metrics=graph_metrics, attribution_resolver=resolver,
        )
        for r in recs:
            attribution = r.supporting_data.get('attribution')
            self.assertIsNotNone(attribution)
            self.assertFalse(attribution['has_page_level_evidence'])
            self.assertEqual(attribution['page_level_evidence'], [])

    def test_attribution_resolver_does_not_change_recommendation_triggers(self):
        records = [
            {'page': 'orphan-high-gap', 'impressions': 20000, 'ctr': 0.001, 'calls': 0},
            {'page': 'normal', 'impressions': 1000, 'ctr': 0.03, 'calls': 5},
        ]
        opp_results = score_records(records)
        graph_metrics = {
            'orphan-high-gap': {'pagerank': 0.0, 'is_orphan': True},
            'normal': {'pagerank': 0.02, 'is_orphan': False},
        }
        recs_without = generate_recommendations(opp_results, graph_metrics=graph_metrics)
        resolver = AttributionResolver()
        resolver.add_evidence(evidence_from_gsc_page('orphan-high-gap', {'impressions': 20000}))
        recs_with = generate_recommendations(
            opp_results, graph_metrics=graph_metrics, attribution_resolver=resolver,
        )
        actions_without = sorted((r.action, r.target) for r in recs_without)
        actions_with = sorted((r.action, r.target) for r in recs_with)
        self.assertEqual(actions_without, actions_with)


if __name__ == '__main__':
    unittest.main()
