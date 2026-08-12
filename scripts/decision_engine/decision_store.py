"""
Decision Store (SQLite persistence for PageDecisionRecord).

Purpose
-------
Persist one `page_profile.PageDecisionRecord` snapshot per page per
run/day so every other module in this package can move from "single
in-memory run" (today's `run_report.py`) to historical, queryable state —
the prerequisite for the trend engine and dashboard API described in
docs/DECISION_INTELLIGENCE_ENGINE_v1.0.md. This module does no scoring or
analysis itself; it only stores and retrieves what upstream engines
already computed, verbatim.

Storage choice: SQLite (stdlib `sqlite3`, zero new dependency), one file
at `config.DECISION_STORE_DB_PATH` (default
scripts/decision_engine/state/decisions.sqlite3, alongside
bayesian_state.json for consistency, per config.py's own comment).
Gated by `config.is_enabled('decision_store')` at the call sites that
choose to persist (this module itself has no flag check — it is a pure
storage layer, safe to import/exercise in tests regardless of flag state,
exactly like every other engine module in this package).

Inputs
------
- `PageDecisionRecord` instances (see page_profile.py) to save.
- `page_id` (str, normalized via page_profile.normalize_page_id) and
  `snapshot_date` (str, 'YYYY-MM-DD') to query.

Outputs
-------
- `save_snapshot` / `save_snapshots`: upsert one row per (page_id,
  snapshot_date). Calling this twice for the same page+date **updates**
  the existing row in place (incremental update) rather than creating a
  duplicate — enforced by a `UNIQUE(page_id, snapshot_date)` constraint
  plus `INSERT ... ON CONFLICT ... DO UPDATE`, not by an application-level
  check-then-write (which would race under concurrent writers).
- `get_snapshot`, `get_latest_snapshot`, `get_history`,
  `get_snapshots_for_date`, `get_all_page_ids`: read back
  `PageDecisionRecord` instances (via `PageDecisionRecord.from_dict`, so
  the same backward-compatibility handling for older schema versions
  applies uniformly here).

Schema / backward compatibility
--------------------------------
The full record is stored twice, deliberately:
    1. `record_json` — the complete, exact `PageDecisionRecord.to_dict()`
       output, so no field is ever lossy and adding new fields to
       `PageDecisionRecord` never requires an ALTER TABLE.
    2. A handful of duplicated scalar columns (`business_value_score`,
       `opportunity_gap_score`, `performance_score`, `impressions`,
       `clicks`) extracted at write time purely as a query/index
       optimization for the historical trend engine (Priority 2), so it
       is not forced to `json.loads` every row just to sort/filter by
       score or traffic. These columns are a derived cache of data that
       already lives in `record_json`, never the source of truth.
Schema evolution is handled via `PRAGMA user_version` + an explicit,
ordered `_MIGRATIONS` map (append-only: add a new `_MIGRATIONS[N]` entry
and bump nothing else) so opening an older database file with a newer
version of this module transparently migrates it forward exactly once.

Duplicate protection / stable IDs
-----------------------------------
`page_id` is always normalized via `page_profile.normalize_page_id`
before every read and write, so the same logical page cannot fragment
into two rows due to a trailing-slash or whitespace difference between
whatever upstream data source produced it that day. The
`UNIQUE(page_id, snapshot_date)` constraint is the actual duplicate
guard (enforced by SQLite, not by an application-level race-prone check).

Mathematics used
-----------------
None — persistence layer only.

Computational complexity
-------------------------
O(1) per single save/get (indexed lookup on the UNIQUE(page_id,
snapshot_date) constraint, or the explicit page_id/snapshot_date
indexes). O(n) for `save_snapshots`/`get_history`/`get_snapshots_for_date`
in the number of rows written/returned, all within a single transaction
for the batch write path.

Future extensions
------------------
- Retention/pruning policy for very old snapshots, once a product
  decision is made on how much history to keep (not assumed here).
- Migrate to a server-backed DB (Postgres) if/when this moves out of a
  single-process/cron context, per config.py's own "Governance/admin UI"
  future-extension note — `_MIGRATIONS`' explicit versioning is designed
  to make that swap mechanical rather than a rewrite.
"""
import json
import logging
import sqlite3
from contextlib import closing, contextmanager
from datetime import datetime, timezone

from . import config
from .logging_utils import traced, log
from .page_profile import PageDecisionRecord, normalize_page_id


_MIGRATIONS = {
    1: [
        """
        CREATE TABLE IF NOT EXISTS page_snapshots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            page_id TEXT NOT NULL,
            snapshot_date TEXT NOT NULL,
            schema_version INTEGER NOT NULL,
            business_value_score REAL,
            opportunity_gap_score REAL,
            performance_score REAL,
            impressions INTEGER,
            clicks INTEGER,
            record_json TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            UNIQUE(page_id, snapshot_date)
        )
        """,
        "CREATE INDEX IF NOT EXISTS idx_page_snapshots_page_id ON page_snapshots(page_id)",
        "CREATE INDEX IF NOT EXISTS idx_page_snapshots_date ON page_snapshots(snapshot_date)",
    ],
}


def _now_iso():
    return datetime.now(timezone.utc).isoformat()


def _connect(db_path=None):
    path = db_path or config.DECISION_STORE_DB_PATH
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path))
    conn.row_factory = sqlite3.Row
    conn.execute('PRAGMA foreign_keys = ON')
    conn.execute('PRAGMA busy_timeout = 5000')
    _ensure_schema(conn)
    return conn


def _ensure_schema(conn):
    current = conn.execute('PRAGMA user_version').fetchone()[0]
    target = max(_MIGRATIONS)
    for version in range(current + 1, target + 1):
        for stmt in _MIGRATIONS[version]:
            conn.execute(stmt)
        conn.execute(f'PRAGMA user_version = {version}')
        log(logging.INFO, 'decision_store_migrated', to_version=version)
    conn.commit()


@contextmanager
def connection(db_path=None):
    """Context manager yielding a connection; commits on success, closes always."""
    conn = _connect(db_path)
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def _index_columns(record):
    opp = record.opportunity_score or {}
    gsc = record.gsc_metrics or {}
    return {
        'business_value_score': record.business_value_score,
        'opportunity_gap_score': opp.get('opportunity_gap_score'),
        'performance_score': opp.get('performance_score'),
        'impressions': gsc.get('impressions'),
        'clicks': gsc.get('clicks'),
    }


@traced('decision_store')
def save_snapshot(record, conn=None):
    """
    Upsert one PageDecisionRecord. Safe to call repeatedly for the same
    (page_id, snapshot_date) — updates the existing row (incremental
    update), never creates a duplicate.
    """
    owns_conn = conn is None
    conn = conn or _connect()
    try:
        page_id = normalize_page_id(record.page_id)
        cols = _index_columns(record)
        now = _now_iso()
        conn.execute(
            """
            INSERT INTO page_snapshots (
                page_id, snapshot_date, schema_version, business_value_score,
                opportunity_gap_score, performance_score, impressions, clicks,
                record_json, created_at, updated_at
            ) VALUES (:page_id, :snapshot_date, :schema_version, :business_value_score,
                :opportunity_gap_score, :performance_score, :impressions, :clicks,
                :record_json, :created_at, :updated_at)
            ON CONFLICT(page_id, snapshot_date) DO UPDATE SET
                schema_version = excluded.schema_version,
                business_value_score = excluded.business_value_score,
                opportunity_gap_score = excluded.opportunity_gap_score,
                performance_score = excluded.performance_score,
                impressions = excluded.impressions,
                clicks = excluded.clicks,
                record_json = excluded.record_json,
                updated_at = excluded.updated_at
            """,
            {
                'page_id': page_id,
                'snapshot_date': record.snapshot_date,
                'schema_version': record.schema_version,
                'record_json': json.dumps(record.to_dict(), default=str),
                'created_at': now,
                'updated_at': now,
                **cols,
            },
        )
        if owns_conn:
            conn.commit()
    finally:
        if owns_conn:
            conn.close()


@traced('decision_store')
def save_snapshots(records, conn=None):
    """Batch upsert, all within a single transaction for atomicity/speed."""
    owns_conn = conn is None
    conn = conn or _connect()
    try:
        for record in records:
            save_snapshot(record, conn=conn)
        if owns_conn:
            conn.commit()
    finally:
        if owns_conn:
            conn.close()
    log(logging.INFO, 'decision_store_saved_snapshots', n=len(records))


def _row_to_record(row):
    return PageDecisionRecord.from_dict(json.loads(row['record_json']))


@traced('decision_store')
def get_snapshot(page_id, snapshot_date, conn=None):
    owns_conn = conn is None
    conn = conn or _connect()
    try:
        row = conn.execute(
            'SELECT record_json FROM page_snapshots WHERE page_id = ? AND snapshot_date = ?',
            (normalize_page_id(page_id), snapshot_date),
        ).fetchone()
        return _row_to_record(row) if row else None
    finally:
        if owns_conn:
            conn.close()


@traced('decision_store')
def get_latest_snapshot(page_id, conn=None):
    owns_conn = conn is None
    conn = conn or _connect()
    try:
        row = conn.execute(
            """
            SELECT record_json FROM page_snapshots WHERE page_id = ?
            ORDER BY snapshot_date DESC LIMIT 1
            """,
            (normalize_page_id(page_id),),
        ).fetchone()
        return _row_to_record(row) if row else None
    finally:
        if owns_conn:
            conn.close()


@traced('decision_store')
def get_history(page_id, start_date=None, end_date=None, conn=None):
    """All snapshots for one page, ascending by snapshot_date, optionally
    bounded to an inclusive [start_date, end_date] range."""
    owns_conn = conn is None
    conn = conn or _connect()
    try:
        query = 'SELECT record_json FROM page_snapshots WHERE page_id = ?'
        params = [normalize_page_id(page_id)]
        if start_date:
            query += ' AND snapshot_date >= ?'
            params.append(start_date)
        if end_date:
            query += ' AND snapshot_date <= ?'
            params.append(end_date)
        query += ' ORDER BY snapshot_date ASC'
        rows = conn.execute(query, params).fetchall()
        return [_row_to_record(r) for r in rows]
    finally:
        if owns_conn:
            conn.close()


@traced('decision_store')
def get_snapshots_for_date(snapshot_date, conn=None):
    """All pages' snapshots for one date (e.g. for a dashboard's daily view)."""
    owns_conn = conn is None
    conn = conn or _connect()
    try:
        rows = conn.execute(
            'SELECT record_json FROM page_snapshots WHERE snapshot_date = ? ORDER BY page_id ASC',
            (snapshot_date,),
        ).fetchall()
        return [_row_to_record(r) for r in rows]
    finally:
        if owns_conn:
            conn.close()


@traced('decision_store')
def get_all_page_ids(conn=None):
    owns_conn = conn is None
    conn = conn or _connect()
    try:
        rows = conn.execute('SELECT DISTINCT page_id FROM page_snapshots ORDER BY page_id ASC').fetchall()
        return [r['page_id'] for r in rows]
    finally:
        if owns_conn:
            conn.close()


@traced('decision_store')
def get_all_snapshot_dates(conn=None):
    owns_conn = conn is None
    conn = conn or _connect()
    try:
        rows = conn.execute('SELECT DISTINCT snapshot_date FROM page_snapshots ORDER BY snapshot_date ASC').fetchall()
        return [r['snapshot_date'] for r in rows]
    finally:
        if owns_conn:
            conn.close()


def count_snapshots(conn=None):
    owns_conn = conn is None
    conn = conn or _connect()
    try:
        return conn.execute('SELECT COUNT(*) AS n FROM page_snapshots').fetchone()['n']
    finally:
        if owns_conn:
            conn.close()
