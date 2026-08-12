import unittest

from ..page_profile import (
    PageDecisionRecord,
    build_page_decision_record,
    build_page_decision_records,
    normalize_page_id,
)


class TestNormalizePageId(unittest.TestCase):
    def test_strips_whitespace(self):
        self.assertEqual(normalize_page_id('  /foo  '), '/foo')

    def test_collapses_trailing_slash(self):
        self.assertEqual(normalize_page_id('/foo/'), '/foo')

    def test_preserves_bare_root(self):
        self.assertEqual(normalize_page_id('/'), '/')

    def test_none_becomes_empty_string(self):
        self.assertEqual(normalize_page_id(None), '')


class TestPageDecisionRecord(unittest.TestCase):
    def test_business_value_score_defaults_to_max_recommendation_score(self):
        record = PageDecisionRecord(
            page_id='/foo',
            snapshot_date='2024-01-01',
            recommendations=[
                {'action': 'a', 'business_value_score': 1.0},
                {'action': 'b', 'business_value_score': 3.0},
            ],
        )
        self.assertEqual(record.business_value_score, 3.0)

    def test_explicit_business_value_score_not_overridden(self):
        record = PageDecisionRecord(
            page_id='/foo',
            snapshot_date='2024-01-01',
            business_value_score=9.0,
            recommendations=[{'action': 'a', 'business_value_score': 1.0}],
        )
        self.assertEqual(record.business_value_score, 9.0)

    def test_to_dict_from_dict_roundtrip(self):
        record = PageDecisionRecord(
            page_id='/foo/',
            snapshot_date='2024-01-01',
            gsc_metrics={'clicks': 10},
            opportunity_score={'opportunity_gap_score': 0.5},
        )
        restored = PageDecisionRecord.from_dict(record.to_dict())
        self.assertEqual(restored.page_id, '/foo')
        self.assertEqual(restored.gsc_metrics, {'clicks': 10})
        self.assertEqual(restored.opportunity_score, {'opportunity_gap_score': 0.5})

    def test_from_dict_tolerates_missing_keys(self):
        restored = PageDecisionRecord.from_dict({'page_id': '/foo', 'snapshot_date': '2024-01-01'})
        self.assertIsNone(restored.gsc_metrics)
        self.assertEqual(restored.recommendations, [])
        self.assertEqual(restored.schema_version, 1)


class TestBuildPageDecisionRecord(unittest.TestCase):
    def test_missing_inputs_stay_none(self):
        record = build_page_decision_record('/foo', '2024-01-01')
        self.assertIsNone(record.gsc_metrics)
        self.assertIsNone(record.ga4_metrics)
        self.assertEqual(record.recommendations, [])

    def test_serializes_dataclass_like_objects(self):
        class Fake:
            def to_dict(self):
                return {'x': 1}

        record = build_page_decision_record('/foo', '2024-01-01', opportunity_score=Fake())
        self.assertEqual(record.opportunity_score, {'x': 1})


class TestBuildPageDecisionRecords(unittest.TestCase):
    def test_bulk_build_merges_optional_structures(self):
        page_reports = [{'page': '/a'}, {'page': '/b'}]
        records = build_page_decision_records(
            page_reports,
            '2024-01-01',
            ga4_metrics_by_page={'/a': {'sessions': 5}},
            graph_metrics={'/a': {'pagerank': 0.1}},
            real_link_graph_metrics={'/a': {'in_degree': 2}},
            marketcall_metrics={'calls': 3},
        )
        by_id = {r.page_id: r for r in records}
        self.assertEqual(by_id['/a'].ga4_metrics, {'sessions': 5})
        self.assertEqual(by_id['/a'].link_graph_metrics, {'pagerank': 0.1, 'in_degree': 2})
        self.assertIsNone(by_id['/b'].ga4_metrics)
        self.assertEqual(by_id['/a'].marketcall_metrics['attribution_level'], 'campaign')
        self.assertEqual(by_id['/b'].marketcall_metrics['attribution_level'], 'campaign')

    def test_recommendations_grouped_by_target_skips_non_page_targets(self):
        class Rec:
            def __init__(self, target):
                self.target = target

            def to_dict(self):
                return {'target': self.target}

        page_reports = [{'page': '/a'}]
        records = build_page_decision_records(
            page_reports,
            '2024-01-01',
            recommendations=[Rec('/a'), Rec('cluster:foo')],
        )
        self.assertEqual(len(records[0].recommendations), 1)


if __name__ == '__main__':
    unittest.main()
