import os
import unittest
from types import SimpleNamespace

from .. import ga4_ingestion
from ..page_profile import build_page_decision_record
from ..attribution_engine import evidence_from_ga4_page, AttributionResolver


def _val(v):
    return SimpleNamespace(value=v)


def _engagement_row(landing_page, sessions, engaged_sessions, engagement_rate,
                     engagement_duration, users, new_users, conversions):
    return SimpleNamespace(
        dimension_values=[_val(landing_page)],
        metric_values=[
            _val(str(sessions)), _val(str(engaged_sessions)), _val(str(engagement_rate)),
            _val(str(engagement_duration)), _val(str(users)), _val(str(new_users)),
            _val(str(conversions)),
        ],
    )


def _event_row(landing_page, event_name, count):
    return SimpleNamespace(
        dimension_values=[_val(landing_page), _val(event_name)],
        metric_values=[_val(str(count))],
    )


SAMPLE_ENGAGEMENT_ROWS = [
    _engagement_row('/plumber-austin-tx-emergency', 100, 60, 0.6, 3000, 90, 80, 2),
    _engagement_row('/plumber-dallas-leak-repair', 50, 20, 0.4, 900, 45, 40, 0),
]

SAMPLE_EVENT_ROWS = [
    _event_row('/plumber-austin-tx-emergency', 'call_click', 5),
]


class LandingPageToPathTestCase(unittest.TestCase):
    def test_strips_query_string(self):
        self.assertEqual(ga4_ingestion._landing_page_to_path('/foo?utm_source=x'), '/foo')

    def test_strips_scheme_and_host(self):
        self.assertEqual(ga4_ingestion._landing_page_to_path('https://yohomefix.com/foo'), '/foo')

    def test_bare_path_unchanged(self):
        self.assertEqual(ga4_ingestion._landing_page_to_path('/foo'), '/foo')

    def test_empty_input(self):
        self.assertEqual(ga4_ingestion._landing_page_to_path(''), '')
        self.assertIsNone(ga4_ingestion._landing_page_to_path(None))


class SummarizeEngagementRowsTestCase(unittest.TestCase):
    def test_basic_summary(self):
        by_page = ga4_ingestion._summarize_engagement_rows(SAMPLE_ENGAGEMENT_ROWS)
        austin = by_page['/plumber-austin-tx-emergency']
        self.assertEqual(austin['sessions'], 100)
        self.assertEqual(austin['engaged_sessions'], 60)
        self.assertAlmostEqual(austin['engagement_rate'], 0.6)
        self.assertAlmostEqual(austin['average_engagement_time_seconds'], 30.0)
        self.assertEqual(austin['users'], 90)
        self.assertEqual(austin['new_users'], 80)
        self.assertEqual(austin['conversions'], 2.0)

    def test_zero_sessions_gives_none_average_engagement_time(self):
        row = _engagement_row('/x', 0, 0, 0, 0, 0, 0, 0)
        by_page = ga4_ingestion._summarize_engagement_rows([row])
        self.assertIsNone(by_page['/x']['average_engagement_time_seconds'])

    def test_duplicate_landing_page_rows_are_summed_not_overwritten(self):
        rows = [
            _engagement_row('/x', 10, 5, 0.5, 100, 8, 4, 1),
            _engagement_row('/x', 20, 10, 0.5, 200, 15, 6, 2),
        ]
        by_page = ga4_ingestion._summarize_engagement_rows(rows)
        self.assertEqual(by_page['/x']['sessions'], 30)
        self.assertEqual(by_page['/x']['users'], 23)
        self.assertEqual(by_page['/x']['conversions'], 3.0)


class SummarizeEventRowsTestCase(unittest.TestCase):
    def test_basic_summary(self):
        by_page = ga4_ingestion._summarize_event_rows(SAMPLE_EVENT_ROWS, ['call_click'])
        self.assertEqual(by_page['/plumber-austin-tx-emergency'], 5)

    def test_unlisted_event_name_excluded(self):
        rows = [_event_row('/x', 'page_view', 100)]
        by_page = ga4_ingestion._summarize_event_rows(rows, ['call_click'])
        self.assertEqual(by_page, {})

    def test_empty_rows(self):
        self.assertEqual(ga4_ingestion._summarize_event_rows([], ['call_click']), {})


class DefaultDateRangeTestCase(unittest.TestCase):
    def test_explicit_dates(self):
        start, end = ga4_ingestion._default_date_range('2024-01-01', '2024-01-31')
        self.assertEqual(start, '2024-01-01')
        self.assertEqual(end, '2024-01-31')

    def test_start_after_end_raises(self):
        with self.assertRaises(ValueError):
            ga4_ingestion._default_date_range('2024-01-31', '2024-01-01')


class LoadGA4PageMetricsTestCase(unittest.TestCase):
    def setUp(self):
        self._prev = os.environ.get('DECISION_ENGINE_ENABLE_GA4')
        os.environ['DECISION_ENGINE_ENABLE_GA4'] = '1'

    def tearDown(self):
        if self._prev is None:
            os.environ.pop('DECISION_ENGINE_ENABLE_GA4', None)
        else:
            os.environ['DECISION_ENGINE_ENABLE_GA4'] = self._prev

    def _fake_client(self, engagement_rows, event_rows, property_id='546859196',
                      raise_on_fetch=None):
        def fetch_landing_page_engagement(start, end):
            if raise_on_fetch:
                raise raise_on_fetch
            return engagement_rows

        def fetch_events_by_landing_page(start, end, event_names):
            return event_rows

        return SimpleNamespace(
            fetch_landing_page_engagement=fetch_landing_page_engagement,
            fetch_events_by_landing_page=fetch_events_by_landing_page,
            GA4_PROPERTY_ID=property_id,
        )

    def test_returns_metrics_for_successful_fetch(self):
        client = self._fake_client(SAMPLE_ENGAGEMENT_ROWS, SAMPLE_EVENT_ROWS)
        result = ga4_ingestion.load_ga4_page_metrics('2026-08-01', '2026-08-06', client=client)
        self.assertIsNotNone(result)
        self.assertIn('/plumber-austin-tx-emergency', result)
        austin = result['/plumber-austin-tx-emergency']
        self.assertEqual(austin['attribution_level'], 'page')
        self.assertEqual(austin['source'], 'ga4_api')
        self.assertEqual(austin['sessions'], 100)
        self.assertEqual(austin['phone_click_events'], 5)
        dallas = result['/plumber-dallas-leak-repair']
        self.assertEqual(dallas['phone_click_events'], 0)

    def test_disabled_returns_none(self):
        os.environ.pop('DECISION_ENGINE_ENABLE_GA4', None)
        client = self._fake_client(SAMPLE_ENGAGEMENT_ROWS, SAMPLE_EVENT_ROWS)
        self.assertIsNone(ga4_ingestion.load_ga4_page_metrics(client=client))

    def test_not_configured_returns_none(self):
        client = self._fake_client(SAMPLE_ENGAGEMENT_ROWS, SAMPLE_EVENT_ROWS, property_id='')
        self.assertIsNone(ga4_ingestion.load_ga4_page_metrics('2026-08-01', '2026-08-06', client=client))

    def test_empty_engagement_returns_empty_dict_not_none(self):
        client = self._fake_client([], [])
        result = ga4_ingestion.load_ga4_page_metrics('2026-08-01', '2026-08-06', client=client)
        self.assertEqual(result, {})

    def test_fetch_error_returns_none(self):
        client = self._fake_client([], [], raise_on_fetch=Exception('network timeout'))
        result = ga4_ingestion.load_ga4_page_metrics('2026-08-01', '2026-08-06', client=client)
        self.assertIsNone(result)

    def test_page_missing_from_ga4_is_absent_not_fabricated(self):
        client = self._fake_client(SAMPLE_ENGAGEMENT_ROWS, SAMPLE_EVENT_ROWS)
        result = ga4_ingestion.load_ga4_page_metrics('2026-08-01', '2026-08-06', client=client)
        self.assertNotIn('/some-page-ga4-never-reported', result)


class PageDecisionRecordCompatibilityTestCase(unittest.TestCase):
    def test_ga4_metrics_preserved(self):
        client_metrics = ga4_ingestion._summarize_engagement_rows(SAMPLE_ENGAGEMENT_ROWS)['/plumber-austin-tx-emergency']
        record = build_page_decision_record('/plumber-austin-tx-emergency', '2026-08-06', ga4_metrics=client_metrics)
        self.assertEqual(record.ga4_metrics['sessions'], 100)


class AttributionIntegrationTestCase(unittest.TestCase):
    def test_ga4_page_evidence_resolves_alongside_gsc(self):
        from ..attribution_engine import evidence_from_gsc_page
        resolver = AttributionResolver()
        resolver.add_evidence(evidence_from_gsc_page('/plumber-austin-tx-emergency', {'impressions': 500}))
        resolver.add_evidence(evidence_from_ga4_page('/plumber-austin-tx-emergency', {'sessions': 100}))
        resolved = resolver.resolve_page('/plumber-austin-tx-emergency')
        self.assertEqual(sorted(resolved.sources), ['ga4', 'gsc'])
        self.assertTrue(resolved.has_page_level_evidence)


if __name__ == '__main__':
    unittest.main()
