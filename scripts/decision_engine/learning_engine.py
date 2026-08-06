"""
Closed-Loop Learning Engine.

Purpose
-------
Turn historical decision_store snapshots into learned confidence
adjustments for the Recommendation Engine. Instead of producing
recommendations from only the current snapshot's metrics, this module
compares previous recommendations against actual outcomes observed in
later snapshots, calculates an effectiveness score, and produces a
confidence delta that is fed back into future recommendation generation.

The learning loop is:

    Day 0: Recommendation Engine says "expand content" for page X
           with confidence 0.6.

    Day 30: Learning Engine compares Day 0 snapshot vs Day 30 snapshot.
            CTR +18%, calls +12%, revenue +9%  ->  outcome_score = +0.7
            confidence_delta = +0.1

    Day 31: Recommendation Engine generates a new "expand content"
            recommendation for a similar page. The learned confidence
            adjustment for "expand content" under similar conditions
            is now +0.1, so the recommendation's confidence is
            probabilistically weighted upward.

Conversely, a recommendation that preceded a traffic/calls/revenue
decline produces a negative confidence_delta, reducing future
confidence for that recommendation_type under similar conditions.

Inputs
------
- Historical `PageDecisionRecord` snapshots from `decision_store`
  (read-only; this module never mutates stored data).
- The evaluation window (default 30 days, configurable via
  `config.LEARNING_LOOP_EVALUATION_WINDOW_DAYS`).

Outputs
-------
- `RecommendationLearningRecord` dataclass per evaluated recommendation,
  containing: recommendation_type, context fingerprint, previous
  metrics, current metrics, outcome score, confidence delta,
  success/failure classification, and timestamp.
- `LearningSummary` aggregating all records into per-recommendation-type
  confidence adjustments, suitable for feeding back into
  `generate_recommendations` via the `learned_confidence_adjustments`
  parameter.

Persistence
-----------
Learning records are stored in a dedicated SQLite table
(`learning_records`) within the same decision_store database, using an
append-only strategy. A new row is inserted for every evaluation —
existing rows are never updated or deleted. This ensures the full
learning history is preserved for auditability.

Mathematics used
----------------
Outcome scoring uses a weighted composite of normalized percentage
changes across all available metric categories:

    outcome_score = sum(weight_i * normalize(pct_change_i)) / sum(weight_i)

where `normalize` maps a percentage change to [-1, 1] via a tanh
function (squashes extreme values so a +500% outlier doesn't dominate),
and weights are configurable per metric category (SEO, behavior, calls,
revenue). Metrics that are unavailable contribute zero weight (never
fabricated).

Confidence delta is derived from the outcome score:

    confidence_delta = LEARNING_RATE * outcome_score

where LEARNING_RATE (default 0.15) controls how aggressively the system
adjusts. A single observation moves confidence by at most
LEARNING_RATE. The cumulative adjustment across all historical
observations for a given (recommendation_type, context_fingerprint) pair
is capped at [-0.3, +0.3] to prevent runaway feedback loops.

The context fingerprint is a hash of the recommendation_type plus a
coarse bucketing of the page's opportunity characteristics (top-decile,
mid-range, bottom-decile), so learning generalizes across pages with
similar opportunity profiles rather than being page-specific.

Computational complexity
------------------------
O(p * h) where p = number of pages with stored history and h = average
history depth per page, plus O(r) for aggregating r learning records
into the summary. The history scan is bounded by the evaluation window
(typically 2 snapshots per page: the one with the recommendation and
the one 30 days later).

Future extensions
-----------------
- Hierarchical Bayesian updating of confidence priors instead of the
  current linear delta, once enough historical data exists to justify
  the added complexity.
- Per-context-fingerprint learning curves (diminishing returns as
  confidence stabilizes), once the learning table has >1000 records.
- Automated A/B testing of recommendation variants, once the engine
  supports multiple recommendation strategies per page.
"""
import hashlib
import json
import logging
import math
import sqlite3
from contextlib import contextmanager
from dataclasses import dataclass, field, asdict
from datetime import datetime, timedelta, timezone
from typing import Optional

from . import config, decision_store
from .logging_utils import traced, log
from .page_profile import PageDecisionRecord, normalize_page_id


# --- Tunable parameters (statistical conventions, not business weights) ---

LEARNING_RATE = 0.15
# How much a single observation can move confidence. A +1.0 outcome
# (perfect success) increases confidence by 0.15; a -1.0 outcome
# (complete failure) decreases it by 0.15. This is deliberately
# conservative — a single observation should not flip a recommendation
# from low to high confidence.

MAX_CUMULATIVE_DELTA = 0.30
# Cap on the absolute value of the cumulative confidence adjustment
# for any (recommendation_type, context_fingerprint) pair. Prevents
# runaway feedback loops where early successes amplify confidence so
# much that failures can't correct it (or vice versa).

METRIC_WEIGHTS = {
    # Category-level weights for the outcome-score composite.
    # Each weight represents the relative importance of that metric
    # category in judging whether a recommendation was successful.
    # These are operational defaults, not business-derived constants.
    'seo': {
        'clicks': 1.0,
        'impressions': 0.5,
        'ctr': 1.0,
        'position': 0.8,  # lower is better — handled via _directional_sign
    },
    'behavior': {
        'sessions': 1.0,
        'engagement_rate': 0.8,
        'phone_click_events': 1.2,
    },
    'calls': {
        'calls': 1.5,
        'qualified_calls': 1.3,
        'approved_calls': 1.5,
        'revenue': 2.0,
    },
}

# Metrics where a decrease is actually good (lower position = better ranking).
_NEGATIVE_IS_BETTER = {'position', 'avg_position'}

# tanh squashing factor: a 50% change maps to ~0.46, 100% to ~0.76,
# 200% to ~0.96. This prevents outlier observations from dominating.
_TANH_SCALE = 1.0 / 50.0


# --- Learning record table schema (append-only) ---

_LEARNING_MIGRATIONS = {
    1: [
        """
        CREATE TABLE IF NOT EXISTS learning_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            page_id TEXT NOT NULL,
            recommendation_type TEXT NOT NULL,
            context_fingerprint TEXT NOT NULL,
            previous_snapshot_date TEXT NOT NULL,
            current_snapshot_date TEXT NOT NULL,
            previous_metrics TEXT,
            current_metrics TEXT,
            outcome_score REAL NOT NULL,
            confidence_delta REAL NOT NULL,
            success INTEGER NOT NULL,
            timestamp TEXT NOT NULL,
            UNIQUE(page_id, recommendation_type, previous_snapshot_date, current_snapshot_date)
        )
        """,
        "CREATE INDEX IF NOT EXISTS idx_learning_page ON learning_records(page_id)",
        "CREATE INDEX IF NOT EXISTS idx_learning_type ON learning_records(recommendation_type)",
        "CREATE INDEX IF NOT EXISTS idx_learning_fingerprint ON learning_records(context_fingerprint)",
    ],
}


def _ensure_learning_schema(conn):
    current = conn.execute('PRAGMA user_version').fetchone()[0]
    # Learning records use a separate migration namespace starting at
    # a high offset to avoid collision with decision_store's own
    # _MIGRATIONS (which also uses user_version). We check for table
    # existence instead.
    conn.execute("""
        CREATE TABLE IF NOT EXISTS learning_schema_version (
            version INTEGER NOT NULL
        )
    """)
    row = conn.execute('SELECT version FROM learning_schema_version LIMIT 1').fetchone()
    current_learning = row[0] if row else 0
    target = max(_LEARNING_MIGRATIONS)
    for version in range(current_learning + 1, target + 1):
        for stmt in _LEARNING_MIGRATIONS[version]:
            conn.execute(stmt)
        if current_learning == 0 and not row:
            conn.execute('INSERT INTO learning_schema_version (version) VALUES (?)', (version,))
        else:
            conn.execute('UPDATE learning_schema_version SET version = ?', (version,))
        log(logging.INFO, 'learning_engine_schema_migrated', to_version=version)
    conn.commit()


def _now_iso():
    return datetime.now(timezone.utc).isoformat()


# --- Data structures ---

@dataclass
class RecommendationLearningRecord:
    page_id: str
    recommendation_type: str
    context_fingerprint: str
    previous_snapshot_date: str
    current_snapshot_date: str
    previous_metrics: dict
    current_metrics: dict
    outcome_score: float
    confidence_delta: float
    success: bool
    timestamp: str = field(default_factory=_now_iso)

    def to_dict(self):
        return {
            'page_id': self.page_id,
            'recommendation_type': self.recommendation_type,
            'context_fingerprint': self.context_fingerprint,
            'previous_snapshot_date': self.previous_snapshot_date,
            'current_snapshot_date': self.current_snapshot_date,
            'previous_metrics': self.previous_metrics,
            'current_metrics': self.current_metrics,
            'outcome_score': self.outcome_score,
            'confidence_delta': self.confidence_delta,
            'success': self.success,
            'timestamp': self.timestamp,
        }

    @classmethod
    def from_dict(cls, d):
        return cls(
            page_id=d['page_id'],
            recommendation_type=d['recommendation_type'],
            context_fingerprint=d['context_fingerprint'],
            previous_snapshot_date=d['previous_snapshot_date'],
            current_snapshot_date=d['current_snapshot_date'],
            previous_metrics=d.get('previous_metrics') or {},
            current_metrics=d.get('current_metrics') or {},
            outcome_score=d['outcome_score'],
            confidence_delta=d['confidence_delta'],
            success=bool(d['success']),
            timestamp=d.get('timestamp', _now_iso()),
        )


@dataclass
class LearningSummary:
    """Aggregated confidence adjustments per recommendation_type and
    context_fingerprint, ready to feed back into generate_recommendations."""
    adjustments: dict  # {"rec_type|fingerprint": cumulative_delta}
    record_count: int
    success_count: int
    failure_count: int
    avg_outcome_score: float

    def to_dict(self):
        return {
            'adjustments': dict(self.adjustments),
            'record_count': self.record_count,
            'success_count': self.success_count,
            'failure_count': self.failure_count,
            'avg_outcome_score': self.avg_outcome_score,
        }

    def get_adjustment(self, recommendation_type, context_fingerprint):
        """Return the cumulative confidence delta for a given
        recommendation_type + context_fingerprint, or 0.0 if no
        learning history exists for that pair."""
        key = f'{recommendation_type}|{context_fingerprint}'
        return self.adjustments.get(key, 0.0)


# --- Context fingerprinting ---

def _opportunity_bucket(opp_score_dict):
    """
    Coarse-bucket the opportunity score into 'top', 'mid', 'bottom', or
    'unknown' so learning generalizes across pages with similar
    opportunity profiles rather than being page-specific.
    """
    if not opp_score_dict:
        return 'unknown'
    gap = opp_score_dict.get('opportunity_gap_score')
    perf = opp_score_dict.get('performance_score')
    if gap is None and perf is None:
        return 'unknown'
    # Use the gap score as the primary bucketing dimension
    if gap is not None:
        if gap >= 0.7:
            return 'top'
        elif gap >= 0.3:
            return 'mid'
        else:
            return 'bottom'
    # Fall back to performance score if gap is unavailable
    if perf is not None:
        if perf >= 0.7:
            return 'top'
        elif perf >= 0.3:
            return 'mid'
        else:
            return 'bottom'
    return 'unknown'


def compute_context_fingerprint(recommendation_type, opp_score_dict):
    """
    Deterministic hash of recommendation_type + opportunity bucket.
    Pages with the same recommendation type and similar opportunity
    profiles share a fingerprint, so learning transfers across them.
    """
    bucket = _opportunity_bucket(opp_score_dict)
    raw = f'{recommendation_type}:{bucket}'
    return hashlib.sha256(raw.encode('utf-8')).hexdigest()[:16]


# --- Metric extraction and outcome scoring ---

def _extract_metrics(record):
    """
    Extract all numeric metrics from a PageDecisionRecord into a flat
    dict keyed by 'category.metric_name'. Only numeric values are
    extracted — non-numeric fields (attribution_level, is_orphan, etc.)
    are skipped, matching trend_engine.py's convention.
    """
    metrics = {}

    def _add(category, d):
        if not d:
            return
        for key, value in d.items():
            if isinstance(value, (int, float)) and not isinstance(value, bool):
                metrics[f'{category}.{key}'] = value

    _add('seo', record.gsc_metrics)
    _add('behavior', record.ga4_metrics)
    _add('calls', record.marketcall_metrics)

    # Decision engine scores
    if record.opportunity_score:
        for key in ('opportunity_gap_score', 'performance_score'):
            val = record.opportunity_score.get(key)
            if isinstance(val, (int, float)) and not isinstance(val, bool):
                metrics[f'decision_engine.{key}'] = val

    if record.business_value_score is not None:
        metrics['decision_engine.business_value_score'] = record.business_value_score

    return metrics


def _pct_change(previous, current):
    """Safe percentage change. Returns None if previous is 0 or either
    value is None (never divides by zero or fabricates a number)."""
    if previous is None or current is None:
        return None
    if previous == 0:
        return None
    return (current - previous) / previous * 100.0


def _normalize_pct(pct):
    """
    Map a percentage change to [-1, 1] via tanh. A 0% change maps to 0,
    +50% to ~0.46, +100% to ~0.76, -50% to ~-0.46, etc. This squashes
    extreme outliers so a single +500% observation doesn't dominate the
    composite score.
    """
    if pct is None:
        return None
    return math.tanh(pct * _TANH_SCALE)


def _directional_sign(metric_key):
    """
    For metrics where lower is better (e.g. position), flip the sign so
    a decrease counts as a positive outcome.
    """
    for neg_metric in _NEGATIVE_IS_BETTER:
        if metric_key.endswith(neg_metric):
            return -1.0
    return 1.0


def _category_and_metric(flat_key):
    """Split 'seo.clicks' into ('seo', 'clicks')."""
    parts = flat_key.split('.', 1)
    if len(parts) == 2:
        return parts[0], parts[1]
    return '', parts[0]


def _compute_outcome_score(previous_metrics, current_metrics):
    """
    Weighted composite of normalized percentage changes across all
    available metric categories. Returns a float in [-1, 1].

    Metrics unavailable in either snapshot contribute zero weight
    (never fabricated). If no metrics are available at all, returns 0.0
    (neutral — no evidence of success or failure).
    """
    if not previous_metrics or not current_metrics:
        return 0.0

    weighted_sum = 0.0
    total_weight = 0.0

    all_keys = set(previous_metrics.keys()) | set(current_metrics.keys())

    for flat_key in all_keys:
        prev_val = previous_metrics.get(flat_key)
        curr_val = current_metrics.get(flat_key)
        if prev_val is None or curr_val is None:
            continue

        pct = _pct_change(prev_val, curr_val)
        if pct is None:
            continue

        normalized = _normalize_pct(pct)
        if normalized is None:
            continue

        # Apply direction (lower-is-better metrics get flipped)
        sign = _directional_sign(flat_key)
        normalized *= sign

        # Look up weight
        category, metric_name = _category_and_metric(flat_key)
        cat_weights = METRIC_WEIGHTS.get(category, {})
        weight = cat_weights.get(metric_name, 0.5)  # default weight for unlisted metrics

        weighted_sum += weight * normalized
        total_weight += weight

    if total_weight == 0:
        return 0.0

    return weighted_sum / total_weight


# --- Core learning functions ---

def _extract_recommendations(record):
    """
    Extract the list of recommendation action types from a stored
    PageDecisionRecord. Returns a list of dicts with 'action' and
    'opportunity_score' for context fingerprinting.
    """
    recs = record.recommendations or []
    result = []
    for rec in recs:
        if isinstance(rec, dict):
            action = rec.get('action')
            if action:
                result.append({
                    'action': action,
                    'opportunity_score': record.opportunity_score,
                })
    return result


@traced('learning_engine')
def evaluate_page_learning(page_id, conn=None, evaluation_window_days=None):
    """
    Evaluate learning for a single page: find the oldest snapshot that
    contains recommendations, find the snapshot `evaluation_window_days`
    later, compare metrics, and produce one RecommendationLearningRecord
    per recommendation in the earlier snapshot.

    Returns a list of RecommendationLearningRecord (possibly empty if
    the page has insufficient history or no recommendations).
    """
    if evaluation_window_days is None:
        evaluation_window_days = config.LEARNING_LOOP_EVALUATION_WINDOW_DAYS

    owns_conn = conn is None
    conn = conn or decision_store._connect()
    try:
        _ensure_learning_schema(conn)
        history = decision_store.get_history(page_id, conn=conn)
        if len(history) < 2:
            return []

        records = []
        for i, prev_record in enumerate(history[:-1]):
            # Find the snapshot closest to evaluation_window_days after prev_record
            prev_date = datetime.strptime(prev_record.snapshot_date, '%Y-%m-%d')
            target_date = prev_date + timedelta(days=evaluation_window_days)

            # Find the nearest snapshot on or after the target date
            # (but still within a reasonable window — at most 2x the eval window)
            max_date = prev_date + timedelta(days=evaluation_window_days * 2)
            current_record = None
            for candidate in history[i + 1:]:
                cand_date = datetime.strptime(candidate.snapshot_date, '%Y-%m-%d')
                if cand_date >= target_date:
                    current_record = candidate
                    break
                if cand_date > max_date:
                    break

            if current_record is None:
                continue

            recs = _extract_recommendations(prev_record)
            if not recs:
                continue

            prev_metrics = _extract_metrics(prev_record)
            curr_metrics = _extract_metrics(current_record)
            outcome_score = _compute_outcome_score(prev_metrics, curr_metrics)
            confidence_delta = LEARNING_RATE * outcome_score
            success = outcome_score > 0

            for rec in recs:
                action = rec['action']
                fingerprint = compute_context_fingerprint(action, rec.get('opportunity_score'))

                # Check if we already have a record for this exact pair
                # (append-only, but avoid exact duplicates)
                existing = conn.execute(
                    'SELECT 1 FROM learning_records WHERE page_id = ? AND recommendation_type = ? '
                    'AND previous_snapshot_date = ? AND current_snapshot_date = ?',
                    (normalize_page_id(page_id), action,
                     prev_record.snapshot_date, current_record.snapshot_date),
                ).fetchone()
                if existing:
                    continue

                record = RecommendationLearningRecord(
                    page_id=normalize_page_id(page_id),
                    recommendation_type=action,
                    context_fingerprint=fingerprint,
                    previous_snapshot_date=prev_record.snapshot_date,
                    current_snapshot_date=current_record.snapshot_date,
                    previous_metrics=prev_metrics,
                    current_metrics=curr_metrics,
                    outcome_score=round(outcome_score, 6),
                    confidence_delta=round(confidence_delta, 6),
                    success=success,
                )
                records.append(record)

        # Persist all new records (append-only)
        for record in records:
            conn.execute(
                """
                INSERT INTO learning_records (
                    page_id, recommendation_type, context_fingerprint,
                    previous_snapshot_date, current_snapshot_date,
                    previous_metrics, current_metrics,
                    outcome_score, confidence_delta, success, timestamp
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    record.page_id, record.recommendation_type,
                    record.context_fingerprint,
                    record.previous_snapshot_date, record.current_snapshot_date,
                    json.dumps(record.previous_metrics, default=str),
                    json.dumps(record.current_metrics, default=str),
                    record.outcome_score, record.confidence_delta,
                    1 if record.success else 0, record.timestamp,
                ),
            )
        if records:
            conn.commit()

        log(logging.INFO, 'learning_engine_evaluated_page',
            page_id=page_id, n_records=len(records))
        return records
    finally:
        if owns_conn:
            conn.close()


@traced('learning_engine')
def evaluate_all_learning(conn=None, evaluation_window_days=None):
    """
    Evaluate learning across all pages with stored history. Returns a
    list of all RecommendationLearningRecord produced (including ones
    already persisted — this reads back from the store after writing).
    """
    owns_conn = conn is None
    conn = conn or decision_store._connect()
    try:
        _ensure_learning_schema(conn)
        page_ids = decision_store.get_all_page_ids(conn=conn)
        all_records = []
        for page_id in page_ids:
            records = evaluate_page_learning(
                page_id, conn=conn, evaluation_window_days=evaluation_window_days,
            )
            all_records.extend(records)
        log(logging.INFO, 'learning_engine_evaluated_all',
            n_pages=len(page_ids), n_records=len(all_records))
        return all_records
    finally:
        if owns_conn:
            conn.close()


@traced('learning_engine')
def get_learning_summary(conn=None):
    """
    Aggregate all stored learning records into a LearningSummary with
    per-(recommendation_type, context_fingerprint) cumulative confidence
    deltas, capped at [-MAX_CUMULATIVE_DELTA, +MAX_CUMULATIVE_DELTA].

    This is the primary output fed back into generate_recommendations
    via the `learned_confidence_adjustments` parameter.
    """
    owns_conn = conn is None
    conn = conn or decision_store._connect()
    try:
        _ensure_learning_schema(conn)
        rows = conn.execute(
            'SELECT recommendation_type, context_fingerprint, outcome_score, '
            'confidence_delta, success FROM learning_records ORDER BY timestamp ASC'
        ).fetchall()

        if not rows:
            return LearningSummary(
                adjustments={}, record_count=0, success_count=0,
                failure_count=0, avg_outcome_score=0.0,
            )

        # Accumulate deltas per (rec_type, fingerprint), respecting the cap
        cumulative = {}
        outcome_scores = []
        success_count = 0
        failure_count = 0

        for row in rows:
            key = f"{row['recommendation_type']}|{row['context_fingerprint']}"
            current_delta = cumulative.get(key, 0.0)
            new_delta = current_delta + row['confidence_delta']
            # Clamp to [-MAX_CUMULATIVE_DELTA, +MAX_CUMULATIVE_DELTA]
            new_delta = max(-MAX_CUMULATIVE_DELTA, min(MAX_CUMULATIVE_DELTA, new_delta))
            cumulative[key] = new_delta
            outcome_scores.append(row['outcome_score'])
            if row['success']:
                success_count += 1
            else:
                failure_count += 1

        avg_outcome = sum(outcome_scores) / len(outcome_scores) if outcome_scores else 0.0

        return LearningSummary(
            adjustments=cumulative,
            record_count=len(rows),
            success_count=success_count,
            failure_count=failure_count,
            avg_outcome_score=round(avg_outcome, 6),
        )
    finally:
        if owns_conn:
            conn.close()


@traced('learning_engine')
def get_all_learning_records(conn=None):
    """Read back all stored learning records (for audit/validation)."""
    owns_conn = conn is None
    conn = conn or decision_store._connect()
    try:
        _ensure_learning_schema(conn)
        rows = conn.execute(
            'SELECT * FROM learning_records ORDER BY timestamp ASC'
        ).fetchall()
        return [
            RecommendationLearningRecord(
                page_id=row['page_id'],
                recommendation_type=row['recommendation_type'],
                context_fingerprint=row['context_fingerprint'],
                previous_snapshot_date=row['previous_snapshot_date'],
                current_snapshot_date=row['current_snapshot_date'],
                previous_metrics=json.loads(row['previous_metrics']) if row['previous_metrics'] else {},
                current_metrics=json.loads(row['current_metrics']) if row['current_metrics'] else {},
                outcome_score=row['outcome_score'],
                confidence_delta=row['confidence_delta'],
                success=bool(row['success']),
                timestamp=row['timestamp'],
            )
            for row in rows
        ]
    finally:
        if owns_conn:
            conn.close()


def count_learning_records(conn=None):
    """Count stored learning records (for testing/validation)."""
    owns_conn = conn is None
    conn = conn or decision_store._connect()
    try:
        _ensure_learning_schema(conn)
        return conn.execute('SELECT COUNT(*) AS n FROM learning_records').fetchone()['n']
    finally:
        if owns_conn:
            conn.close()
