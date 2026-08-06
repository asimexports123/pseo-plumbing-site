import os
import unittest
from types import SimpleNamespace

from .. import marketcall_ingestion
from ..page_profile import build_page_decision_record


SAMPLE_CALLS = [
    {'id': 1, 'state_en': 'approved', 'price': 35.0, 'duration': 120, 'currency': 'usd', 'calldate': '2026-08-01 12:00:00'},
    {'id': 2, 'state_en': 'approved', 'price': 40.0, 'duration': 90, 'currency': 'usd', 'calldate': '2026-08-02 12:00:00'},
    {'id': 3, 'state_en': 'no-target', 'price': 0, 'duration': 20, 'currency': 'usd', 'calldate': '2026-08-03 12:00:00'},
    {'id': 4, 'state_en': 'non-key', 'price': 0, 'duration': 45, 'currency': 'usd', 'calldate': '2026-08-04 12:00:00'},
]


class SummarizeCallsTestCase(unittest.TestCase):
    def test_basic_aggregates(self):
        fetched_at = '2026-08-06T00:00:00+00:00'
        m = marketcall_ingestion._summarize_calls(SAMPLE_CALLS, 348734, '2026-08-01', '2026-08-06', fetched_at)
        self.assertEqual(m['attribution_level'], 'campaign')
        self.assertEqual(m['campaign_id'], 348734)
        self.assertEqual(m['calls'], 4)
        self.assertEqual(m['approved_calls'], 2)
        self.assertEqual(m['qualified_calls'], 2)
        self.assertAlmostEqual(m['revenue'], 75.0)
        self.assertAlmostEqual(m['payout'], 75.0)
        self.assertAlmostEqual(m['revenue_per_approved_call'], 37.5)
        self.assertAlmostEqual(m['revenue_per_call'], 18.75)
        self.assertAlmostEqual(m['approval_rate'], 0.5)
        self.assertEqual(m['total_duration'], 275)
        self.assertAlmostEqual(m['average_duration'], 68.75)
        self.assertEqual(m['currency'], 'usd')
        self.assertIn('attribution_uncertainty_note', m)
        self.assertEqual(m['state_counts']['approved'], 2)
        self.assertEqual(m['state_counts']['no-target'], 1)
        self.assertEqual(m['state_counts']['non-key'], 1)

    def test_no_calls(self):
        m = marketcall_ingestion._summarize_calls([], 348734, '2026-08-01', '2026-08-06', '2026-08-06T00:00:00+00:00')
        self.assertEqual(m['calls'], 0)
        self.assertIsNone(m['approval_rate'])
        self.assertIsNone(m['revenue_per_approved_call'])
        self.assertEqual(m['revenue'], 0.0)
        self.assertEqual(m['average_duration'], 0.0)

    def test_currency_detection_defaults_to_usd(self):
        m = marketcall_ingestion._summarize_calls(SAMPLE_CALLS, 348734, '2026-08-01', '2026-08-06', '2026-08-06T00:00:00+00:00')
        self.assertEqual(m['currency'], 'usd')

    def test_empty_calls_defaults_currency_usd(self):
        m = marketcall_ingestion._summarize_calls([], 348734, '2026-08-01', '2026-08-06', '2026-08-06T00:00:00+00:00')
        self.assertEqual(m['currency'], 'usd')


class DefaultDateRangeTestCase(unittest.TestCase):
    def test_explicit_dates(self):
        start, end = marketcall_ingestion._default_date_range('2024-01-01', '2024-01-31')
        self.assertEqual(start, '2024-01-01')
        self.assertEqual(end, '2024-01-31')

    def test_start_after_end_raises(self):
        with self.assertRaises(ValueError):
            marketcall_ingestion._default_date_range('2024-01-31', '2024-01-01')


class LoadMarketcallMetricsTestCase(unittest.TestCase):
    def setUp(self):
        self._prev = os.environ.get('DECISION_ENGINE_ENABLE_MARKETCALL')
        os.environ['DECISION_ENGINE_ENABLE_MARKETCALL'] = '1'

    def tearDown(self):
        if self._prev is None:
            os.environ.pop('DECISION_ENGINE_ENABLE_MARKETCALL', None)
        else:
            os.environ['DECISION_ENGINE_ENABLE_MARKETCALL'] = self._prev

    def _fake_client(self, calls, campaign_id=348734, raise_on_fetch=None):
        def fetch_calls(start, end, campaign_id=None):
            if raise_on_fetch:
                raise raise_on_fetch
            return calls
        return SimpleNamespace(fetch_calls=fetch_calls, CAMPAIGN_ID=campaign_id)

    def test_returns_metrics_for_successful_fetch(self):
        client = self._fake_client(SAMPLE_CALLS)
        m = marketcall_ingestion.load_marketcall_metrics('2026-08-01', '2026-08-06', client=client)
        self.assertIsNotNone(m)
        self.assertEqual(m['calls'], 4)
        self.assertEqual(m['approved_calls'], 2)
        self.assertEqual(m['campaign_id'], 348734)
        self.assertEqual(m['date_from'], '2026-08-01')
        self.assertEqual(m['date_to'], '2026-08-06')
        self.assertEqual(m['source'], 'marketcall_api')
        self.assertEqual(m['attribution_level'], 'campaign')

    def test_disabled_returns_none(self):
        os.environ.pop('DECISION_ENGINE_ENABLE_MARKETCALL', None)
        client = self._fake_client(SAMPLE_CALLS)
        self.assertIsNone(marketcall_ingestion.load_marketcall_metrics(client=client))

    def test_empty_fetch_returns_none(self):
        client = self._fake_client([])
        self.assertIsNone(marketcall_ingestion.load_marketcall_metrics('2026-08-01', '2026-08-06', client=client))

    def test_fetch_error_returns_none(self):
        client = self._fake_client([], raise_on_fetch=Exception('network timeout'))
        self.assertIsNone(marketcall_ingestion.load_marketcall_metrics('2026-08-01', '2026-08-06', client=client))

    def test_campaign_id_override(self):
        client = self._fake_client(SAMPLE_CALLS, campaign_id=999999)
        m = marketcall_ingestion.load_marketcall_metrics('2026-08-01', '2026-08-06', campaign_id=111111, client=client)
        self.assertEqual(m['campaign_id'], 111111)

    def test_uses_client_campaign_id_when_no_override(self):
        client = self._fake_client(SAMPLE_CALLS, campaign_id=555555)
        m = marketcall_ingestion.load_marketcall_metrics('2026-08-01', '2026-08-06', client=client)
        self.assertEqual(m['campaign_id'], 555555)


class PageDecisionRecordCompatibilityTestCase(unittest.TestCase):
    def test_marketcall_metrics_preserved(self):
        metrics = marketcall_ingestion._summarize_calls(SAMPLE_CALLS, 348734, '2026-08-01', '2026-08-06', '2026-08-06T00:00:00+00:00')
        record = build_page_decision_record('/plumber-austin-tx-emergency', '2026-08-06', marketcall_metrics=metrics)
        self.assertEqual(record.marketcall_metrics['attribution_level'], 'campaign')
        self.assertEqual(record.marketcall_metrics['calls'], 4)
        self.assertEqual(record.marketcall_metrics['approved_calls'], 2)
        self.assertIn('attribution_uncertainty_note', record.marketcall_metrics)


if __name__ == '__main__':
    unittest.main()
