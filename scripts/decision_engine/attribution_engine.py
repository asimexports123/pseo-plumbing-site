"""
Attribution Engine.

Purpose
-------
Provide one normalized, production-safe layer for combining evidence from
heterogeneous analytics sources (Google Search Console today; Marketcall
today; GA4 and other call-tracking providers in the future) *without*
inventing a page-level fact that no source actually reported. Every other
module in this package that currently deals with attribution ambiguity
does so with its own ad hoc convention:
    - `marketcall_ingestion.py` labels its output `attribution_level:
      'campaign'` and writes a fixed `attribution_uncertainty_note`.
    - `data_ingestion.py` / `link_ingestion.py` note that their taxonomy
      inference is "an approximation, not ground truth."
`attribution_engine.py` generalizes that pattern into one reusable model
(`AttributionEvidence`) and one reconciliation object (`AttributionResolver`)
so that adding a new evidence source (GA4 page/session/event data, a new
call-tracking vendor) never requires changing how `recommendation_engine.py`
or `run_report.py` consume attribution — they always ask the resolver "what
page-level evidence exists for this page?" and "what evidence could not be
tied to any page?", regardless of how many sources feed in.

This module makes no network calls and reads no files; it is a pure,
in-memory reconciliation layer over `AttributionEvidence` objects that
calling code (currently `run_report.py`) constructs from data already
loaded by `data_ingestion.py` and `marketcall_ingestion.py`.

Inputs
------
`AttributionEvidence` instances, built via the `evidence_from_*` /
`evidence_unknown` constructors below, each carrying:
    attribution_level     one of ATTRIBUTION_LEVELS: 'page', 'campaign',
                           'session', 'event', 'call', 'unknown'
    evidence_source        e.g. 'gsc', 'marketcall', 'ga4', 'calltracking:<name>'
    confidence              float in [0, 1] -- confidence in the *evidence's
                           own numbers*, not in how precisely they can be
                           mapped down to a single page (that ambiguity is
                           what `attribution_level` + `uncertainty_reason`
                           capture instead of being folded into a lowered
                           confidence score)
    timestamp               ISO 8601 string
    target                  page id (attribution_level == 'page'), or a
                           source-specific identifier (campaign id, session
                           id, event name, call id) for lower-specificity
                           levels, or None for 'unknown'
    metrics                 arbitrary dict of the actual observed values
    uncertainty_reason      required for every level except 'page' --
                           explains *why* this evidence cannot be reliably
                           tied to one page

Outputs
-------
`AttributionResolver.resolve_page(page_id)` -> `ResolvedAttribution`:
    target                    the page id resolved
    page_level_evidence        list of evidence dicts whose attribution_level
                              == 'page' AND target == page_id (i.e. only
                              evidence that *is* about this exact page)
    has_page_level_evidence     bool
    sources                   sorted list of evidence_source values that
                              contributed page-level evidence
    conflict / conflict_notes  see "Mathematics used" below

`AttributionResolver.unattributed_summary()` -> dict:
    Every evidence entry whose attribution_level != 'page' (campaign,
    session, event, call, unknown), grouped by evidence_source. This is the
    honest home for aggregates like Marketcall's campaign-level totals:
    surfaced as portfolio-level context, *never* joined onto a specific
    page's numbers, by construction (there is no code path in this module
    that copies a non-page-level evidence entry into `page_level_evidence`).

Mathematics used
-----------------
No statistical modeling here (that lives in bayesian_engine.py /
opportunity_score.py). The only computed logic is a documented, symmetric
conflict-detection heuristic: for a given page's page-level evidence, if two
or more sources report the same numeric metric key with values whose
relative difference exceeds `CONFLICT_RELATIVE_THRESHOLD` (0.20, i.e. >20%),
the resolution is flagged `conflict=True` with a human-readable note --
never silently averaged, summed, or overwritten. Callers decide how to
handle a flagged conflict (e.g. surface both values, prefer the
higher-confidence source, or route to human review); this module only
detects and reports it.

Computational complexity
-------------------------
`resolve_page`: O(n) in the number of stored evidence entries (single
linear scan) plus O(m) for the conflict check, where m is the number of
distinct numeric metric keys reported by matching evidence -- negligible
for the per-report evidence volumes this package operates on.
`unattributed_summary`: O(n).

Future extensions
------------------
- `evidence_from_ga4_page` / `evidence_from_ga4_event` are ready-to-use
  constructors for the still-unimplemented `ga4_ingestion.py` (GA4
  credentials are not yet configured -- see
  docs/YOHOMEFIX_AUTONOMOUS_OS_ENGINEERING_EXECUTION_PLAN_v1.0.md Epic A).
  When that module is built, it only needs to call these constructors with
  its own already-fetched metrics dicts; no change to `AttributionResolver`,
  `recommendation_engine.py`, or `run_report.py`'s consumption pattern is
  required.
- A confidence-weighted reconciliation strategy (rather than flag-and-report)
  for conflicting page-level evidence, once a product decision is made on
  how to arbitrate between sources (e.g. GSC vs. GA4 session counts) -- not
  invented here since no such decision has been made yet.
- Joining campaign-level evidence down to specific pages, if a reliable
  mapping (e.g. per-page tracking numbers, UTM-to-page mapping) is ever
  confirmed -- explicitly out of scope until that evidence exists (see
  `marketcall_ingestion.py`'s own "Future extensions" section).
"""
import logging
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone

from .logging_utils import traced, log

ATTRIBUTION_LEVELS = ('page', 'campaign', 'session', 'event', 'call', 'unknown')

CONFLICT_RELATIVE_THRESHOLD = 0.20
# Two page-level sources reporting the same metric key with a relative
# difference greater than this are flagged as conflicting. 20% is a
# deliberately loose, documented default (not a business weight) chosen to
# avoid flagging routine measurement-methodology differences (e.g. GSC vs.
# GA4 session counting) as false conflicts while still catching genuine
# data-quality problems.


def _now_iso():
    return datetime.now(timezone.utc).isoformat()


@dataclass
class AttributionEvidence:
    attribution_level: str
    evidence_source: str
    confidence: float
    timestamp: str
    target: str | None = None
    metrics: dict = field(default_factory=dict)
    uncertainty_reason: str | None = None

    def __post_init__(self):
        if self.attribution_level not in ATTRIBUTION_LEVELS:
            raise ValueError(
                f'Unknown attribution_level: {self.attribution_level!r}. '
                f'Known: {ATTRIBUTION_LEVELS}'
            )
        if not (0.0 <= self.confidence <= 1.0):
            raise ValueError(f'confidence must be in [0, 1], got {self.confidence}')

        if self.attribution_level == 'page':
            if not self.target:
                raise ValueError('attribution_level="page" requires a non-empty target (the page id)')
        elif self.attribution_level == 'unknown':
            if self.target is not None:
                raise ValueError('attribution_level="unknown" must not carry a target -- nothing is known')
            if not self.uncertainty_reason:
                raise ValueError('attribution_level="unknown" requires uncertainty_reason')
        else:
            # campaign / session / event / call: real evidence, but at a
            # coarser-than-page granularity -- never to be silently treated
            # as a page id by any downstream consumer.
            if not self.uncertainty_reason:
                raise ValueError(
                    f'attribution_level={self.attribution_level!r} requires uncertainty_reason '
                    f'explaining why this evidence cannot be attributed to a specific page'
                )

    def to_dict(self):
        return asdict(self)

    @classmethod
    def from_dict(cls, d):
        return cls(
            attribution_level=d['attribution_level'],
            evidence_source=d['evidence_source'],
            confidence=d['confidence'],
            timestamp=d['timestamp'],
            target=d.get('target'),
            metrics=dict(d.get('metrics') or {}),
            uncertainty_reason=d.get('uncertainty_reason'),
        )


def evidence_from_gsc_page(page_id, metrics, timestamp=None):
    """
    GSC reports natively per-page (its own `page` dimension *is* the page),
    so this is the highest-confidence, ground-truth page attribution
    available to the Decision Engine today -- no inference or joining
    involved.
    """
    if not page_id:
        raise ValueError('page_id is required for GSC page evidence')
    return AttributionEvidence(
        attribution_level='page', evidence_source='gsc', confidence=1.0,
        timestamp=timestamp or _now_iso(), target=page_id,
        metrics=dict(metrics or {}), uncertainty_reason=None,
    )


def evidence_from_marketcall_campaign(campaign_id, metrics, timestamp=None, uncertainty_reason=None):
    """
    Marketcall's confirmed API contract has no page/URL field (see
    `marketcall_ingestion.py`'s module docstring) -- campaign-level only.
    `confidence` here reflects trust in the *numbers themselves* (Marketcall
    is the source of truth for its own call/revenue data); the fact that
    those numbers cannot be mapped to a specific page is captured entirely
    by `attribution_level='campaign'` plus `uncertainty_reason`, never by
    lowering confidence (which would conflate "how good is this data" with
    "how precisely is it located").
    """
    return AttributionEvidence(
        attribution_level='campaign', evidence_source='marketcall', confidence=1.0,
        timestamp=timestamp or _now_iso(),
        target=str(campaign_id) if campaign_id is not None else None,
        metrics=dict(metrics or {}),
        uncertainty_reason=uncertainty_reason or (
            'Marketcall records contain no page/URL field in the confirmed API '
            'contract; these figures are campaign-level aggregates and cannot be '
            'reliably attributed to an individual page.'
        ),
    )


def evidence_from_ga4_page(page_id, metrics, timestamp=None, confidence=1.0, uncertainty_reason=None):
    """
    Ready-to-use constructor for future GA4 page-level evidence (e.g. a
    `landingPage` dimensioned report). Not currently called anywhere in this
    package -- GA4 credentials are not yet configured (see
    docs/YOHOMEFIX_AUTONOMOUS_OS_ENGINEERING_EXECUTION_PLAN_v1.0.md Epic A)
    -- but exists now so that building `ga4_ingestion.py` later requires
    zero changes to `AttributionResolver` or any downstream consumer: it
    only needs to call this with its own already-fetched per-page metrics.
    """
    if not page_id:
        raise ValueError('page_id is required for GA4 page evidence')
    return AttributionEvidence(
        attribution_level='page', evidence_source='ga4', confidence=confidence,
        timestamp=timestamp or _now_iso(), target=page_id,
        metrics=dict(metrics or {}), uncertainty_reason=uncertainty_reason,
    )


def evidence_from_ga4_event(event_name, metrics, timestamp=None, confidence=1.0, uncertainty_reason=None):
    """
    Ready-to-use constructor for future GA4 event-level evidence (e.g.
    `call_click` events queried without a corroborating page dimension).
    Event-level evidence is intentionally never treated as page-level: a
    `landingPage`-dimensioned GA4 query should use `evidence_from_ga4_page`
    instead.
    """
    return AttributionEvidence(
        attribution_level='event', evidence_source='ga4', confidence=confidence,
        timestamp=timestamp or _now_iso(), target=event_name,
        metrics=dict(metrics or {}),
        uncertainty_reason=uncertainty_reason or (
            'Event-level evidence without a corroborating page dimension in the '
            'same query cannot be reliably attributed to a single page.'
        ),
    )


def evidence_unknown(evidence_source, metrics=None, timestamp=None,
                      uncertainty_reason='No attribution information available for this evidence.'):
    """Explicit placeholder for evidence whose origin is known but whose
    attribution is not -- never silently dropped, always visible in
    `unattributed_summary()`."""
    return AttributionEvidence(
        attribution_level='unknown', evidence_source=evidence_source, confidence=0.0,
        timestamp=timestamp or _now_iso(), target=None,
        metrics=dict(metrics or {}), uncertainty_reason=uncertainty_reason,
    )


def _detect_conflicts(page_level_evidence):
    """
    See module docstring "Mathematics used". Returns (conflict: bool,
    conflict_notes: list[str]).
    """
    by_key = {}
    for e in page_level_evidence:
        for k, v in (e.metrics or {}).items():
            if isinstance(v, (int, float)) and not isinstance(v, bool):
                by_key.setdefault(k, []).append((e.evidence_source, v))

    conflict = False
    notes = []
    for key, pairs in by_key.items():
        if len(pairs) < 2:
            continue
        values = [v for _, v in pairs]
        lo, hi = min(values), max(values)
        if lo == hi:
            continue
        relative_diff = (hi - lo) / abs(lo) if lo != 0 else float('inf')
        if relative_diff > CONFLICT_RELATIVE_THRESHOLD:
            conflict = True
            notes.append(
                f"metric '{key}' disagreement across sources > "
                f"{CONFLICT_RELATIVE_THRESHOLD:.0%}: {pairs}"
            )
    return conflict, notes


@dataclass
class ResolvedAttribution:
    target: str
    page_level_evidence: list
    has_page_level_evidence: bool
    sources: list
    conflict: bool
    conflict_notes: list

    def to_dict(self):
        return {
            'target': self.target,
            'page_level_evidence': self.page_level_evidence,
            'has_page_level_evidence': self.has_page_level_evidence,
            'sources': self.sources,
            'conflict': self.conflict,
            'conflict_notes': self.conflict_notes,
        }


class AttributionResolver:
    """
    Accumulates `AttributionEvidence` from any number of sources and
    resolves it per-page on demand. See module docstring for the full
    contract; the short version: `resolve_page(x)` only ever returns
    evidence that IS about page `x`; everything coarser than page-level
    lives exclusively in `unattributed_summary()`.
    """

    def __init__(self, evidence=None):
        self._evidence = []
        if evidence:
            self.add_all(evidence)

    def add_evidence(self, evidence):
        if not isinstance(evidence, AttributionEvidence):
            raise TypeError(
                f'add_evidence requires an AttributionEvidence instance, got {type(evidence).__name__}'
            )
        self._evidence.append(evidence)

    def add_all(self, evidence_list):
        for e in evidence_list:
            self.add_evidence(e)

    def all_evidence(self):
        return list(self._evidence)

    def page_ids_with_evidence(self):
        return sorted({e.target for e in self._evidence if e.attribution_level == 'page' and e.target})

    @traced('attribution_engine')
    def resolve_page(self, page_id):
        """
        Merge every page-level evidence entry (from any evidence_source)
        whose target == page_id. Evidence at any coarser granularity
        (campaign/session/event/call) or with attribution_level='unknown'
        is never included here, regardless of how it might superficially
        relate to this page -- see `unattributed_summary()` instead.
        """
        matches = [
            e for e in self._evidence
            if e.attribution_level == 'page' and e.target == page_id
        ]
        conflict, conflict_notes = _detect_conflicts(matches)
        return ResolvedAttribution(
            target=page_id,
            page_level_evidence=[e.to_dict() for e in matches],
            has_page_level_evidence=bool(matches),
            sources=sorted({e.evidence_source for e in matches}),
            conflict=conflict,
            conflict_notes=conflict_notes,
        )

    @traced('attribution_engine')
    def unattributed_summary(self):
        """
        Every evidence entry that is NOT page-level, grouped by
        evidence_source, so aggregates like Marketcall's campaign totals
        remain visible as honest portfolio-level context instead of being
        silently dropped or (worse) joined onto an arbitrary page.
        """
        other = [e for e in self._evidence if e.attribution_level != 'page']
        by_source = {}
        for e in other:
            by_source.setdefault(e.evidence_source, []).append(e.to_dict())
        summary = {
            'has_unattributed_evidence': bool(other),
            'count': len(other),
            'by_source': by_source,
        }
        if other:
            log(logging.INFO, 'attribution_engine_unattributed_summary',
                count=len(other), sources=sorted(by_source.keys()))
        return summary
