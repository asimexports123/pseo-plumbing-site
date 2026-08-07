#!/usr/bin/env python3
"""
Scheduled Data Collection Layer.

Purpose
-------
Implements scheduled, cached data collection from external APIs:
  - Marketcall API: every 24 hours
  - GSC API: once per week
  - GA4 API: once per week

Data is cached locally as JSON files. Identical data is never re-downloaded.
Each cache file records the fetch timestamp, the data hash, and the data itself.
On each collection attempt, the cache is checked: if the data hasn't changed
and the cache is still fresh per the source's schedule, the cached copy is used.

No new mathematical models. No dashboards. No UI.

Cache layout (under scripts/decision_engine/state/data_cache/):
  marketcall_cache.json
  gsc_pages_cache.json
  gsc_queries_cache.json
  ga4_cache.json
  collection_log.json

Each cache file has the structure:
  {
    "fetched_at": "ISO timestamp",
    "data_hash": "sha256 of serialized data",
    "data": <the actual data>
  }
"""
import json
import hashlib
import logging
import os
from datetime import datetime, timezone, timedelta
from pathlib import Path

from . import config
from .logging_utils import log

STATE_DIR = config.STATE_DIR
CACHE_DIR = STATE_DIR / 'data_cache'
CACHE_DIR.mkdir(parents=True, exist_ok=True)

MARKETCALL_CACHE = CACHE_DIR / 'marketcall_cache.json'
GSC_PAGES_CACHE = CACHE_DIR / 'gsc_pages_cache.json'
GSC_QUERIES_CACHE = CACHE_DIR / 'gsc_queries_cache.json'
GA4_CACHE = CACHE_DIR / 'ga4_cache.json'
COLLECTION_LOG = CACHE_DIR / 'collection_log.json'

MARKETCALL_FRESH_HOURS = 24
GSC_FRESH_DAYS = 7
GA4_FRESH_DAYS = 7


def _data_hash(data):
    """SHA256 hash of serialized data for dedup detection."""
    serialized = json.dumps(data, sort_keys=True, default=str)
    return hashlib.sha256(serialized.encode('utf-8')).hexdigest()


def _read_cache(path):
    """Read a cache file. Returns (data, fetched_at, data_hash) or (None, None, None)."""
    if not path.exists():
        return None, None, None
    try:
        cached = json.loads(path.read_text(encoding='utf-8'))
        return cached.get('data'), cached.get('fetched_at'), cached.get('data_hash')
    except (json.JSONDecodeError, KeyError):
        return None, None, None


def _write_cache(path, data):
    """Write data to a cache file with timestamp and hash."""
    h = _data_hash(data)
    payload = {
        'fetched_at': datetime.now(timezone.utc).isoformat(),
        'data_hash': h,
        'data': data,
    }
    path.write_text(json.dumps(payload, indent=2, default=str), encoding='utf-8')
    return h


def _is_fresh(fetched_at, max_age_hours):
    """Check if a cache entry is still fresh."""
    if not fetched_at:
        return False
    try:
        fetched = datetime.fromisoformat(fetched_at)
        if fetched.tzinfo is None:
            fetched = fetched.replace(tzinfo=timezone.utc)
        age = datetime.now(timezone.utc) - fetched
        return age.total_seconds() < max_age_hours * 3600
    except (ValueError, TypeError):
        return False


def _log_collection(source, action, data_hash=None, error=None):
    """Append to the collection log."""
    log_entry = {
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'source': source,
        'action': action,
        'data_hash': data_hash,
        'error': error,
    }
    entries = []
    if COLLECTION_LOG.exists():
        try:
            entries = json.loads(COLLECTION_LOG.read_text(encoding='utf-8'))
            if not isinstance(entries, list):
                entries = []
        except json.JSONDecodeError:
            entries = []
    entries.append(log_entry)
    # Keep last 500 entries
    entries = entries[-500:]
    COLLECTION_LOG.write_text(json.dumps(entries, indent=2), encoding='utf-8')


# ============================================================
# Marketcall Collection (every 24 hours)
# ============================================================

def collect_marketcall(force=False):
    """
    Collect Marketcall data. Uses cache if fresh (< 24h) and data unchanged.
    Returns the metrics dict or None.
    """
    cached_data, cached_at, cached_hash = _read_cache(MARKETCALL_CACHE)

    if not force and _is_fresh(cached_at, MARKETCALL_FRESH_HOURS):
        if cached_data is not None:
            _log_collection('marketcall', 'cache_hit', cached_hash)
            return cached_data

    if not config.is_enabled('marketcall'):
        _log_collection('marketcall', 'skipped_flag_off')
        return cached_data

    try:
        from . import marketcall_ingestion
        data = marketcall_ingestion.load_marketcall_metrics()
        if data is None:
            _log_collection('marketcall', 'api_returned_none')
            return cached_data

        new_hash = _data_hash(data)
        if cached_hash == new_hash and cached_data is not None:
            # Data unchanged — update fetch time but don't re-write data
            _log_collection('marketcall', 'unchanged', new_hash)
            # Still update the cache timestamp so we know we checked
            _write_cache(MARKETCALL_CACHE, data)
            return cached_data

        _write_cache(MARKETCALL_CACHE, data)
        _log_collection('marketcall', 'fetched', new_hash)
        return data

    except Exception as e:
        _log_collection('marketcall', 'error', error=str(e))
        log(logging.WARNING, 'data_collection_marketcall_error', error=str(e))
        return cached_data


# ============================================================
# GSC Collection (once per week)
# ============================================================

def collect_gsc_pages(force=False):
    """
    Collect GSC page data. Uses cache if fresh (< 7 days) and data unchanged.
    Returns the list of page report dicts or [].
    """
    cached_data, cached_at, cached_hash = _read_cache(GSC_PAGES_CACHE)

    if not force and _is_fresh(cached_at, GSC_FRESH_DAYS * 24):
        if cached_data is not None:
            _log_collection('gsc_pages', 'cache_hit', cached_hash)
            return cached_data

    try:
        from .data_ingestion import load_gsc_page_report_from_csv
        data = load_gsc_page_report_from_csv()
        if not data:
            _log_collection('gsc_pages', 'no_data')
            return cached_data or []

        new_hash = _data_hash(data)
        if cached_hash == new_hash and cached_data is not None:
            _log_collection('gsc_pages', 'unchanged', new_hash)
            _write_cache(GSC_PAGES_CACHE, data)
            return cached_data

        _write_cache(GSC_PAGES_CACHE, data)
        _log_collection('gsc_pages', 'fetched', new_hash)
        return data

    except Exception as e:
        _log_collection('gsc_pages', 'error', error=str(e))
        log(logging.WARNING, 'data_collection_gsc_pages_error', error=str(e))
        return cached_data or []


def collect_gsc_queries(force=False):
    """
    Collect GSC query data. Uses cache if fresh (< 7 days).
    Returns the list of query dicts or [].
    """
    from .business_priority import load_gsc_queries

    cached_data, cached_at, cached_hash = _read_cache(GSC_QUERIES_CACHE)

    if not force and _is_fresh(cached_at, GSC_FRESH_DAYS * 24):
        if cached_data is not None:
            _log_collection('gsc_queries', 'cache_hit', cached_hash)
            return cached_data

    try:
        data = load_gsc_queries()
        if not data:
            _log_collection('gsc_queries', 'no_data')
            return cached_data or []

        new_hash = _data_hash(data)
        if cached_hash == new_hash and cached_data is not None:
            _log_collection('gsc_queries', 'unchanged', new_hash)
            _write_cache(GSC_QUERIES_CACHE, data)
            return cached_data

        _write_cache(GSC_QUERIES_CACHE, data)
        _log_collection('gsc_queries', 'fetched', new_hash)
        return data

    except Exception as e:
        _log_collection('gsc_queries', 'error', error=str(e))
        log(logging.WARNING, 'data_collection_gsc_queries_error', error=str(e))
        return cached_data or []


# ============================================================
# GA4 Collection (once per week)
# ============================================================

def collect_ga4(force=False):
    """
    Collect GA4 page metrics. Uses cache if fresh (< 7 days).
    Returns the dict of page_id -> metrics or None.
    """
    cached_data, cached_at, cached_hash = _read_cache(GA4_CACHE)

    if not force and _is_fresh(cached_at, GA4_FRESH_DAYS * 24):
        if cached_data is not None:
            _log_collection('ga4', 'cache_hit', cached_hash)
            return cached_data

    if not config.is_enabled('ga4'):
        _log_collection('ga4', 'skipped_flag_off')
        return cached_data

    try:
        from . import ga4_ingestion
        data = ga4_ingestion.load_ga4_page_metrics()
        if data is None:
            _log_collection('ga4', 'api_returned_none')
            return cached_data

        new_hash = _data_hash(data)
        if cached_hash == new_hash and cached_data is not None:
            _log_collection('ga4', 'unchanged', new_hash)
            _write_cache(GA4_CACHE, data)
            return cached_data

        _write_cache(GA4_CACHE, data)
        _log_collection('ga4', 'fetched', new_hash)
        return data

    except Exception as e:
        _log_collection('ga4', 'error', error=str(e))
        log(logging.WARNING, 'data_collection_ga4_error', error=str(e))
        return cached_data


# ============================================================
# Collection Status
# ============================================================

def get_collection_status():
    """Return the freshness status of all cached data sources."""
    status = {}
    for name, path, fresh_hours in [
        ('marketcall', MARKETCALL_CACHE, MARKETCALL_FRESH_HOURS),
        ('gsc_pages', GSC_PAGES_CACHE, GSC_FRESH_DAYS * 24),
        ('gsc_queries', GSC_QUERIES_CACHE, GSC_FRESH_DAYS * 24),
        ('ga4', GA4_CACHE, GA4_FRESH_DAYS * 24),
    ]:
        _, fetched_at, data_hash = _read_cache(path)
        status[name] = {
            'fetched_at': fetched_at,
            'data_hash': data_hash,
            'is_fresh': _is_fresh(fetched_at, fresh_hours),
        }
    return status


# ============================================================
# Main
# ============================================================

def run(force=False):
    """
    Run scheduled data collection for all sources.
    Each source is collected only if its cache is stale.
    """
    print('Scheduled Data Collection')
    print(f'  Cache dir: {CACHE_DIR}')
    print()

    # Marketcall (every 24h)
    mc = collect_marketcall(force=force)
    print(f'  Marketcall: {"loaded" if mc else "none"} ({mc.get("calls", 0) if mc else 0} calls)')

    # GSC (weekly)
    pages = collect_gsc_pages(force=force)
    print(f'  GSC pages: {len(pages) if pages else 0} pages')

    queries = collect_gsc_queries(force=force)
    print(f'  GSC queries: {len(queries) if queries else 0} queries')

    # GA4 (weekly)
    ga4 = collect_ga4(force=force)
    print(f'  GA4: {"loaded" if ga4 else "none"} ({len(ga4) if ga4 else 0} pages)')

    print()
    print('  Collection complete.')

    return {
        'marketcall': mc,
        'gsc_pages': pages,
        'gsc_queries': queries,
        'ga4': ga4,
    }


if __name__ == '__main__':
    run()
