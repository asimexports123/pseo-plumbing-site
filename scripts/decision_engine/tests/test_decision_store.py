import tempfile
import unittest
from pathlib import Path

from .. import decision_store
from ..page_profile import PageDecisionRecord


class DecisionStoreTestCase(unittest.TestCase):
    def setUp(self):
        self._tmpdir = tempfile.TemporaryDirectory()
        self.db_path = Path(self._tmpdir.name) / 'decisions.sqlite3'
        self.conn = decision_store._connect(self.db_path)

    def tearDown(self):
        self.conn.close()
        self._tmpdir.cleanup()


class TestSaveAndGetSnapshot(DecisionStoreTestCase):
    def test_save_then_get_snapshot_roundtrip(self):
        record = PageDecisionRecord(
            page_id='/foo/', snapshot_date='2024-01-01',
            gsc_metrics={'clicks': 10, 'impressions': 100},
            business_value_score=5.0,
        )
        decision_store.save_snapshot(record, conn=self.conn)
        fetched = decision_store.get_snapshot('/foo', '2024-01-01', conn=self.conn)
        self.assertIsNotNone(fetched)
        self.assertEqual(fetched.page_id, '/foo')
        self.assertEqual(fetched.gsc_metrics, {'clicks': 10, 'impressions': 100})
        self.assertEqual(fetched.business_value_score, 5.0)

    def test_get_snapshot_missing_returns_none(self):
        self.assertIsNone(decision_store.get_snapshot('/nope', '2024-01-01', conn=self.conn))

    def test_save_snapshot_upserts_same_page_and_date(self):
        record_v1 = PageDecisionRecord(page_id='/foo', snapshot_date='2024-01-01', business_value_score=1.0)
        record_v2 = PageDecisionRecord(page_id='/foo', snapshot_date='2024-01-01', business_value_score=2.0)
        decision_store.save_snapshot(record_v1, conn=self.conn)
        decision_store.save_snapshot(record_v2, conn=self.conn)
        self.assertEqual(decision_store.count_snapshots(conn=self.conn), 1)
        fetched = decision_store.get_snapshot('/foo', '2024-01-01', conn=self.conn)
        self.assertEqual(fetched.business_value_score, 2.0)

    def test_trailing_slash_normalized_to_same_row(self):
        decision_store.save_snapshot(
            PageDecisionRecord(page_id='/foo/', snapshot_date='2024-01-01'), conn=self.conn,
        )
        decision_store.save_snapshot(
            PageDecisionRecord(page_id='/foo', snapshot_date='2024-01-01'), conn=self.conn,
        )
        self.assertEqual(decision_store.count_snapshots(conn=self.conn), 1)


class TestHistoryQueries(DecisionStoreTestCase):
    def setUp(self):
        super().setUp()
        for date in ('2024-01-01', '2024-01-05', '2024-01-10'):
            decision_store.save_snapshot(
                PageDecisionRecord(page_id='/foo', snapshot_date=date), conn=self.conn,
            )
        decision_store.save_snapshot(
            PageDecisionRecord(page_id='/bar', snapshot_date='2024-01-05'), conn=self.conn,
        )

    def test_get_history_ascending_order(self):
        history = decision_store.get_history('/foo', conn=self.conn)
        dates = [r.snapshot_date for r in history]
        self.assertEqual(dates, ['2024-01-01', '2024-01-05', '2024-01-10'])

    def test_get_history_bounded_range(self):
        history = decision_store.get_history('/foo', start_date='2024-01-02', end_date='2024-01-09', conn=self.conn)
        dates = [r.snapshot_date for r in history]
        self.assertEqual(dates, ['2024-01-05'])

    def test_get_latest_snapshot(self):
        latest = decision_store.get_latest_snapshot('/foo', conn=self.conn)
        self.assertEqual(latest.snapshot_date, '2024-01-10')

    def test_get_snapshots_for_date(self):
        snaps = decision_store.get_snapshots_for_date('2024-01-05', conn=self.conn)
        page_ids = sorted(r.page_id for r in snaps)
        self.assertEqual(page_ids, ['/bar', '/foo'])

    def test_get_all_page_ids(self):
        self.assertEqual(decision_store.get_all_page_ids(conn=self.conn), ['/bar', '/foo'])

    def test_get_all_snapshot_dates(self):
        self.assertEqual(
            decision_store.get_all_snapshot_dates(conn=self.conn),
            ['2024-01-01', '2024-01-05', '2024-01-10'],
        )

    def test_count_snapshots(self):
        self.assertEqual(decision_store.count_snapshots(conn=self.conn), 4)


class TestSaveSnapshots(DecisionStoreTestCase):
    def test_batch_save_persists_all_records(self):
        records = [
            PageDecisionRecord(page_id='/a', snapshot_date='2024-01-01'),
            PageDecisionRecord(page_id='/b', snapshot_date='2024-01-01'),
        ]
        decision_store.save_snapshots(records, conn=self.conn)
        self.assertEqual(decision_store.count_snapshots(conn=self.conn), 2)


if __name__ == '__main__':
    unittest.main()
