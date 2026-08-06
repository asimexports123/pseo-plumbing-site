import unittest

from ..attribution_engine import (
    AttributionEvidence, AttributionResolver,
    evidence_from_gsc_page, evidence_from_marketcall_campaign,
    evidence_from_ga4_page, evidence_from_ga4_event, evidence_unknown,
    ATTRIBUTION_LEVELS,
)


class AttributionEvidenceValidationTestCase(unittest.TestCase):
    def test_page_level_requires_target(self):
        with self.assertRaises(ValueError):
            AttributionEvidence(
                attribution_level='page', evidence_source='gsc', confidence=1.0,
                timestamp='2026-08-06T00:00:00+00:00', target=None,
            )

    def test_page_level_does_not_require_uncertainty_reason(self):
        e = AttributionEvidence(
            attribution_level='page', evidence_source='gsc', confidence=1.0,
            timestamp='2026-08-06T00:00:00+00:00', target='/foo',
        )
        self.assertIsNone(e.uncertainty_reason)

    def test_campaign_level_requires_uncertainty_reason(self):
        with self.assertRaises(ValueError):
            AttributionEvidence(
                attribution_level='campaign', evidence_source='marketcall', confidence=1.0,
                timestamp='2026-08-06T00:00:00+00:00', target='348734',
            )

    def test_unknown_level_must_not_carry_target(self):
        with self.assertRaises(ValueError):
            AttributionEvidence(
                attribution_level='unknown', evidence_source='x', confidence=0.0,
                timestamp='2026-08-06T00:00:00+00:00', target='/foo',
                uncertainty_reason='no info',
            )

    def test_unknown_level_requires_uncertainty_reason(self):
        with self.assertRaises(ValueError):
            AttributionEvidence(
                attribution_level='unknown', evidence_source='x', confidence=0.0,
                timestamp='2026-08-06T00:00:00+00:00', target=None,
            )

    def test_invalid_attribution_level_rejected(self):
        with self.assertRaises(ValueError):
            AttributionEvidence(
                attribution_level='bogus', evidence_source='x', confidence=1.0,
                timestamp='2026-08-06T00:00:00+00:00', target='/foo',
            )

    def test_confidence_out_of_range_rejected(self):
        with self.assertRaises(ValueError):
            AttributionEvidence(
                attribution_level='page', evidence_source='gsc', confidence=1.5,
                timestamp='2026-08-06T00:00:00+00:00', target='/foo',
            )

    def test_all_levels_are_recognized_constants(self):
        for level in ('page', 'campaign', 'session', 'event', 'call', 'unknown'):
            self.assertIn(level, ATTRIBUTION_LEVELS)

    def test_to_dict_from_dict_roundtrip(self):
        e = evidence_from_gsc_page('/foo', {'impressions': 100, 'clicks': 5})
        restored = AttributionEvidence.from_dict(e.to_dict())
        self.assertEqual(restored.target, '/foo')
        self.assertEqual(restored.metrics['impressions'], 100)


class ConstructorTestCase(unittest.TestCase):
    def test_evidence_from_gsc_page(self):
        e = evidence_from_gsc_page('/plumber-austin-tx-emergency', {'impressions': 1000, 'clicks': 40})
        self.assertEqual(e.attribution_level, 'page')
        self.assertEqual(e.evidence_source, 'gsc')
        self.assertEqual(e.confidence, 1.0)
        self.assertEqual(e.target, '/plumber-austin-tx-emergency')
        self.assertIsNone(e.uncertainty_reason)

    def test_evidence_from_gsc_page_requires_page_id(self):
        with self.assertRaises(ValueError):
            evidence_from_gsc_page('', {'impressions': 1})

    def test_evidence_from_marketcall_campaign(self):
        e = evidence_from_marketcall_campaign(348734, {'calls': 8, 'revenue': 47.23})
        self.assertEqual(e.attribution_level, 'campaign')
        self.assertEqual(e.evidence_source, 'marketcall')
        self.assertEqual(e.target, '348734')
        self.assertIn('page/URL field', e.uncertainty_reason)

    def test_evidence_from_marketcall_campaign_none_id(self):
        e = evidence_from_marketcall_campaign(None, {'calls': 0})
        self.assertIsNone(e.target)

    def test_evidence_from_ga4_page(self):
        e = evidence_from_ga4_page('/foo', {'sessions': 10})
        self.assertEqual(e.attribution_level, 'page')
        self.assertEqual(e.evidence_source, 'ga4')

    def test_evidence_from_ga4_event(self):
        e = evidence_from_ga4_event('call_click', {'eventCount': 3})
        self.assertEqual(e.attribution_level, 'event')
        self.assertIn('corroborating page dimension', e.uncertainty_reason)

    def test_evidence_unknown(self):
        e = evidence_unknown('legacy_csv', metrics={'rows': 3})
        self.assertEqual(e.attribution_level, 'unknown')
        self.assertIsNone(e.target)
        self.assertEqual(e.confidence, 0.0)


class ResolverPageAttributionTestCase(unittest.TestCase):
    def test_page_attribution_resolves_matching_evidence(self):
        resolver = AttributionResolver()
        resolver.add_evidence(evidence_from_gsc_page('/foo', {'impressions': 100, 'clicks': 5}))
        resolved = resolver.resolve_page('/foo')
        self.assertTrue(resolved.has_page_level_evidence)
        self.assertEqual(resolved.sources, ['gsc'])
        self.assertEqual(len(resolved.page_level_evidence), 1)
        self.assertFalse(resolved.conflict)

    def test_page_with_no_evidence_returns_empty_resolution(self):
        resolver = AttributionResolver()
        resolved = resolver.resolve_page('/nonexistent')
        self.assertFalse(resolved.has_page_level_evidence)
        self.assertEqual(resolved.page_level_evidence, [])
        self.assertEqual(resolved.sources, [])

    def test_campaign_only_attribution_never_appears_in_page_resolution(self):
        resolver = AttributionResolver()
        resolver.add_evidence(evidence_from_marketcall_campaign(348734, {'calls': 8}))
        resolved = resolver.resolve_page('/foo')
        self.assertFalse(resolved.has_page_level_evidence)
        self.assertEqual(resolved.page_level_evidence, [])

    def test_unknown_attribution_never_appears_in_page_resolution(self):
        resolver = AttributionResolver()
        resolver.add_evidence(evidence_unknown('legacy_csv'))
        resolved = resolver.resolve_page('/foo')
        self.assertFalse(resolved.has_page_level_evidence)

    def test_multiple_sources_merge_for_same_page(self):
        resolver = AttributionResolver()
        resolver.add_evidence(evidence_from_gsc_page('/foo', {'impressions': 100}))
        resolver.add_evidence(evidence_from_ga4_page('/foo', {'sessions': 90}))
        resolved = resolver.resolve_page('/foo')
        self.assertEqual(sorted(resolved.sources), ['ga4', 'gsc'])
        self.assertEqual(len(resolved.page_level_evidence), 2)

    def test_evidence_for_other_page_is_excluded(self):
        resolver = AttributionResolver()
        resolver.add_evidence(evidence_from_gsc_page('/foo', {'impressions': 100}))
        resolver.add_evidence(evidence_from_gsc_page('/bar', {'impressions': 50}))
        resolved = resolver.resolve_page('/foo')
        self.assertEqual(len(resolved.page_level_evidence), 1)
        self.assertEqual(resolved.page_level_evidence[0]['target'], '/foo')


class ConflictDetectionTestCase(unittest.TestCase):
    def test_no_conflict_when_values_agree(self):
        resolver = AttributionResolver()
        resolver.add_evidence(evidence_from_gsc_page('/foo', {'impressions': 100}))
        resolver.add_evidence(evidence_from_ga4_page('/foo', {'impressions': 100}))
        resolved = resolver.resolve_page('/foo')
        self.assertFalse(resolved.conflict)

    def test_conflict_flagged_for_large_relative_difference(self):
        resolver = AttributionResolver()
        resolver.add_evidence(evidence_from_gsc_page('/foo', {'sessions': 100}))
        resolver.add_evidence(evidence_from_ga4_page('/foo', {'sessions': 500}))
        resolved = resolver.resolve_page('/foo')
        self.assertTrue(resolved.conflict)
        self.assertTrue(any('sessions' in note for note in resolved.conflict_notes))

    def test_no_conflict_for_small_relative_difference(self):
        resolver = AttributionResolver()
        resolver.add_evidence(evidence_from_gsc_page('/foo', {'sessions': 100}))
        resolver.add_evidence(evidence_from_ga4_page('/foo', {'sessions': 105}))
        resolved = resolver.resolve_page('/foo')
        self.assertFalse(resolved.conflict)

    def test_conflict_ignores_non_numeric_metrics(self):
        resolver = AttributionResolver()
        resolver.add_evidence(evidence_from_gsc_page('/foo', {'label': 'a'}))
        resolver.add_evidence(evidence_from_ga4_page('/foo', {'label': 'b'}))
        resolved = resolver.resolve_page('/foo')
        self.assertFalse(resolved.conflict)

    def test_single_source_metric_never_conflicts(self):
        resolver = AttributionResolver()
        resolver.add_evidence(evidence_from_gsc_page('/foo', {'impressions': 100}))
        resolved = resolver.resolve_page('/foo')
        self.assertFalse(resolved.conflict)
        self.assertEqual(resolved.conflict_notes, [])


class UnattributedSummaryTestCase(unittest.TestCase):
    def test_campaign_and_unknown_appear_in_unattributed_summary(self):
        resolver = AttributionResolver()
        resolver.add_evidence(evidence_from_marketcall_campaign(348734, {'calls': 8}))
        resolver.add_evidence(evidence_unknown('legacy_csv'))
        summary = resolver.unattributed_summary()
        self.assertTrue(summary['has_unattributed_evidence'])
        self.assertEqual(summary['count'], 2)
        self.assertIn('marketcall', summary['by_source'])
        self.assertIn('legacy_csv', summary['by_source'])

    def test_page_level_evidence_excluded_from_unattributed_summary(self):
        resolver = AttributionResolver()
        resolver.add_evidence(evidence_from_gsc_page('/foo', {'impressions': 100}))
        summary = resolver.unattributed_summary()
        self.assertFalse(summary['has_unattributed_evidence'])
        self.assertEqual(summary['count'], 0)
        self.assertEqual(summary['by_source'], {})

    def test_empty_resolver_summary(self):
        resolver = AttributionResolver()
        summary = resolver.unattributed_summary()
        self.assertFalse(summary['has_unattributed_evidence'])
        self.assertEqual(summary['count'], 0)


class ResolverConstructionAndMiscTestCase(unittest.TestCase):
    def test_constructor_accepts_initial_evidence(self):
        resolver = AttributionResolver([evidence_from_gsc_page('/foo', {'impressions': 1})])
        self.assertEqual(len(resolver.all_evidence()), 1)

    def test_add_all(self):
        resolver = AttributionResolver()
        resolver.add_all([
            evidence_from_gsc_page('/foo', {'impressions': 1}),
            evidence_from_gsc_page('/bar', {'impressions': 2}),
        ])
        self.assertEqual(len(resolver.all_evidence()), 2)

    def test_add_evidence_rejects_non_evidence_objects(self):
        resolver = AttributionResolver()
        with self.assertRaises(TypeError):
            resolver.add_evidence({'not': 'an evidence object'})

    def test_page_ids_with_evidence(self):
        resolver = AttributionResolver()
        resolver.add_evidence(evidence_from_gsc_page('/foo', {'impressions': 1}))
        resolver.add_evidence(evidence_from_marketcall_campaign(1, {'calls': 1}))
        self.assertEqual(resolver.page_ids_with_evidence(), ['/foo'])


if __name__ == '__main__':
    unittest.main()
