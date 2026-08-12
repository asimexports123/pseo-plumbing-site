"""
Marketcall Affiliate API — read-only polling client.

Confirmed official contract for this account (do not extend beyond this
without re-verifying against the real docs first):
    Base path : https://www.marketcall.com/api/v1/affiliate/
    Auth      : header `X-Api-Key: <key>`
    Endpoints : GET /calls
                GET /calls/count
                GET /calls/{id}/record
    Rate limit: 60 requests/minute (enforced client-side below)

Isolation note: this module owns polling only. A future postback/webhook
receiver (real-time push from Marketcall) is a separate concern — e.g. a
Next.js API route accepting inbound POSTs — and can be added independently
without touching this file or the classes/functions below.

The API key is read from the MARKETCALL_API_KEY environment variable only.
It is never hardcoded and there is no fallback default — constructing a
client without it set raises MarketcallConfigError immediately.
"""
import json
import logging
import os
import time
from collections import deque
from pathlib import Path

import requests

from config import MARKETCALL_API_BASE, CAMPAIGN_ID

RATE_LIMIT_PER_MINUTE = 60
DEFAULT_PAGE_SIZE = 100
MAX_RETRIES = 3
RETRY_BACKOFF_BASE_SECONDS = 1.5
RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 504}
RATE_LIMIT_HEADER_NAMES = (
    'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset',
    'RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset', 'Retry-After',
)

logger = logging.getLogger('marketcall_client')
if not logger.handlers:
    _handler = logging.StreamHandler()
    _handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s %(name)s %(message)s'))
    logger.addHandler(_handler)
logger.setLevel(os.environ.get('MARKETCALL_LOG_LEVEL', 'INFO'))


def _log(level, event, **fields):
    """Structured logging: one JSON object per line, always includes `event`."""
    logger.log(level, json.dumps({'event': event, **fields}, default=str))


class MarketcallConfigError(Exception):
    """Raised when required configuration (e.g. the API key) is missing."""


class MarketcallAPIError(Exception):
    """
    Raised on any non-2xx HTTP response or transport failure.
    Callers must handle this explicitly — it is never swallowed into an
    empty list, so a broken integration surfaces immediately instead of
    silently reporting zero calls.
    """
    def __init__(self, message, status_code=None, endpoint=None, payload=None):
        super().__init__(message)
        self.status_code = status_code
        self.endpoint = endpoint
        self.payload = payload


class _RateLimiter:
    """Client-side sliding-window limiter respecting the documented 60 req/min cap."""

    def __init__(self, max_per_minute=RATE_LIMIT_PER_MINUTE):
        self.max_per_minute = max_per_minute
        self._timestamps = deque()

    def acquire(self):
        now = time.monotonic()
        window_start = now - 60
        while self._timestamps and self._timestamps[0] < window_start:
            self._timestamps.popleft()
        if len(self._timestamps) >= self.max_per_minute:
            sleep_for = 60 - (now - self._timestamps[0])
            if sleep_for > 0:
                _log(logging.INFO, 'marketcall_rate_limit_wait', seconds=round(sleep_for, 2))
                time.sleep(sleep_for)
            while self._timestamps and self._timestamps[0] < time.monotonic() - 60:
                self._timestamps.popleft()
        self._timestamps.append(time.monotonic())


def _safe_body(response, limit=2000):
    try:
        return response.text[:limit]
    except Exception:
        return None


def _to_datetime_str(date_str, end_of_day=False):
    """
    Marketcall requires date_from/date_to as 'Y-m-d H:i:s' (confirmed via a
    live 422 validation error). Accepts a plain 'YYYY-MM-DD' and expands it;
    passes through anything that already looks like a full datetime.
    """
    if date_str is None:
        return None
    if ' ' in date_str:
        return date_str
    return f'{date_str} 23:59:59' if end_of_day else f'{date_str} 00:00:00'


def _extract_rate_limit_headers(response):
    """Capture any rate-limit-related headers Marketcall returns, for logging/reporting."""
    found = {}
    for name in RATE_LIMIT_HEADER_NAMES:
        if name in response.headers:
            found[name] = response.headers[name]
    return found


def _extract_page(data, page, per_page):
    """
    Normalize the /calls response into (records, has_more).

    Confirmed live shape:
        {"data": [...], "paginator": {"total_count", "total_pages",
         "current_page", "limit", "next", "prev"}, "request_id": ...}
    Falls back to older heuristics defensively in case the shape ever
    changes for a different account/endpoint version.
    """
    if isinstance(data, list):
        return data, False

    records = data.get('data', data.get('calls', []))
    paginator = data.get('paginator') or data.get('meta') or {}

    if 'current_page' in paginator and 'total_pages' in paginator:
        has_more = paginator['current_page'] < paginator['total_pages']
    elif 'current_page' in paginator and 'last_page' in paginator:
        has_more = paginator['current_page'] < paginator['last_page']
    elif 'next' in paginator:
        has_more = bool(paginator['next'])
    elif 'has_more' in data:
        has_more = bool(data['has_more'])
    elif 'next_page_url' in data:
        has_more = bool(data['next_page_url'])
    else:
        has_more = len(records) >= per_page

    return records, has_more


class MarketcallClient:
    def __init__(self, api_key=None, base_url=None, session=None, rate_limiter=None):
        self.api_key = api_key if api_key is not None else os.environ.get('MARKETCALL_API_KEY')
        if not self.api_key:
            raise MarketcallConfigError(
                'MARKETCALL_API_KEY is not set. Set it in the environment '
                '(.env / .env.local, or the deployment secrets) — this client '
                'never hardcodes or falls back on a credential.'
            )
        self.base_url = (base_url or MARKETCALL_API_BASE).rstrip('/') + '/'
        self.session = session or requests.Session()
        self.rate_limiter = rate_limiter or _RateLimiter()
        self.last_rate_limit_headers = {}

    def _request(self, method, path, params=None, parse_json=True):
        """
        Issue one logical request, transparently retrying transient failures
        (connection errors, timeouts, 429/500/502/503/504) up to MAX_RETRIES
        times with exponential backoff. Non-retryable errors, and retryable
        errors that exhaust all attempts, are always raised — never swallowed.
        The API key is never included in any logged field.

        parse_json=False returns the raw requests.Response (used for
        /calls/{id}/record, which is confirmed to return binary audio,
        e.g. audio/mpeg, not JSON).
        """
        url = self.base_url + path.lstrip('/')
        headers = {'X-Api-Key': self.api_key, 'Accept': 'application/json'}
        last_error = None

        for attempt in range(1, MAX_RETRIES + 1):
            self.rate_limiter.acquire()
            started = time.monotonic()
            try:
                response = self.session.request(method, url, headers=headers, params=params or {}, timeout=30)
            except requests.RequestException as e:
                last_error = MarketcallAPIError(f'Transport error calling {path}: {e}', endpoint=path)
                _log(
                    logging.WARNING, 'marketcall_transport_error', endpoint=path, params=params,
                    attempt=attempt, max_retries=MAX_RETRIES, error=str(e),
                )
                if attempt < MAX_RETRIES:
                    self._sleep_backoff(attempt)
                    continue
                raise last_error from e

            duration_ms = round((time.monotonic() - started) * 1000, 1)
            rate_limit_headers = _extract_rate_limit_headers(response)
            if rate_limit_headers:
                self.last_rate_limit_headers = rate_limit_headers

            if response.ok:
                _log(
                    logging.INFO, 'marketcall_request_ok', endpoint=path,
                    status_code=response.status_code, duration_ms=duration_ms,
                    attempt=attempt, rate_limit_headers=rate_limit_headers or None,
                    content_type=response.headers.get('Content-Type'),
                )
                if not parse_json:
                    return response
                try:
                    return response.json()
                except ValueError as e:
                    raise MarketcallAPIError(
                        f'Non-JSON response from {path}: {e}', status_code=response.status_code, endpoint=path,
                    ) from e

            retryable = response.status_code in RETRYABLE_STATUS_CODES
            _log(
                logging.WARNING if retryable else logging.ERROR,
                'marketcall_http_error', endpoint=path, status_code=response.status_code,
                duration_ms=duration_ms, attempt=attempt, max_retries=MAX_RETRIES,
                retryable=retryable, rate_limit_headers=rate_limit_headers or None,
                body=_safe_body(response),
            )
            last_error = MarketcallAPIError(
                f'Marketcall API returned {response.status_code} for {path}',
                status_code=response.status_code, endpoint=path, payload=_safe_body(response),
            )
            if retryable and attempt < MAX_RETRIES:
                retry_after = response.headers.get('Retry-After')
                self._sleep_backoff(attempt, retry_after_header=retry_after)
                continue
            raise last_error

        raise last_error

    def _sleep_backoff(self, attempt, retry_after_header=None):
        if retry_after_header:
            try:
                delay = float(retry_after_header)
            except ValueError:
                delay = RETRY_BACKOFF_BASE_SECONDS * (2 ** (attempt - 1))
        else:
            delay = RETRY_BACKOFF_BASE_SECONDS * (2 ** (attempt - 1))
        _log(logging.INFO, 'marketcall_retry_backoff', attempt=attempt, delay_seconds=round(delay, 2))
        time.sleep(delay)

    def get_calls_page(self, start_date=None, end_date=None, page=1, per_page=DEFAULT_PAGE_SIZE, **filters):
        """GET /calls — a single page."""
        params = {'page': page, 'per_page': per_page, **filters}
        if start_date:
            params['date_from'] = _to_datetime_str(start_date)
        if end_date:
            params['date_to'] = _to_datetime_str(end_date, end_of_day=True)
        return self._request('GET', '/calls', params=params)

    def iter_calls(self, start_date=None, end_date=None, per_page=DEFAULT_PAGE_SIZE, max_pages=None, **filters):
        """GET /calls — generator over every page for the given filters."""
        page = 1
        while True:
            data = self.get_calls_page(
                start_date=start_date, end_date=end_date, page=page, per_page=per_page, **filters,
            )
            records, has_more = _extract_page(data, page, per_page)
            for record in records:
                yield record
            if not has_more:
                break
            page += 1
            if max_pages and page > max_pages:
                _log(logging.WARNING, 'marketcall_pagination_capped', max_pages=max_pages)
                break

    def get_calls(self, start_date=None, end_date=None, **filters):
        """GET /calls — fully materialized across all pages."""
        return list(self.iter_calls(start_date=start_date, end_date=end_date, **filters))

    def get_calls_count(self, start_date=None, end_date=None, **filters):
        """GET /calls/count"""
        params = {**filters}
        if start_date:
            params['date_from'] = _to_datetime_str(start_date)
        if end_date:
            params['date_to'] = _to_datetime_str(end_date, end_of_day=True)
        return self._request('GET', '/calls/count', params=params)

    def get_call_recording(self, call_id, save_path=None):
        """
        GET /calls/{id}/record — returns binary audio (confirmed audio/mpeg),
        not JSON. Returns (audio_bytes, content_type). If save_path is given,
        also writes the audio to that path and includes it in the return
        tuple as a third element.
        """
        if not call_id:
            raise ValueError('call_id is required')
        response = self._request('GET', f'/calls/{call_id}/record', parse_json=False)
        content_type = response.headers.get('Content-Type')
        audio_bytes = response.content
        if save_path:
            Path(save_path).write_bytes(audio_bytes)
            return audio_bytes, content_type, save_path
        return audio_bytes, content_type


_default_client = None


def _client():
    global _default_client
    if _default_client is None:
        _default_client = MarketcallClient()
    return _default_client


# ── Backward-compatible module-level functions (used by weekly_report.py) ──
# These no longer catch-and-return-[] on failure: MarketcallAPIError and
# MarketcallConfigError propagate to the caller, per the "surface errors"
# requirement. Callers that want a report to keep running despite a
# Marketcall outage must catch these explicitly at the call site.

def fetch_calls(start_date, end_date, campaign_id=None):
    filters = {'campaign_id': campaign_id or CAMPAIGN_ID} if (campaign_id or CAMPAIGN_ID) else {}
    return _client().get_calls(start_date=start_date, end_date=end_date, **filters)


def fetch_qualified_calls(start_date, end_date, campaign_id=None):
    """
    Returns calls whose confirmed `state_en` is 'approved' — the only state
    Marketcall's own help center (help.marketcall.com/en/article/call-statuses)
    describes as billable/withdrawable ("Approved - This call is approved and
    you can withdraw money for it.").

    Note: there is no confirmed server-side filter for this. /calls accepts a
    `state[]` array param but every state_en value observed live (no-target,
    non-key, no-connect, approved) and every guess tried (approved, pending,
    qualified, converted, sale, connected) was rejected with "The selected
    state is invalid" — the accepted enum for this account/endpoint is not
    established, so filtering is done client-side on the confirmed field.
    """
    filters = {'campaign_id': campaign_id or CAMPAIGN_ID} if (campaign_id or CAMPAIGN_ID) else {}
    calls = _client().get_calls(start_date=start_date, end_date=end_date, **filters)
    return [c for c in calls if c.get('state_en') == 'approved']


def fetch_calls_count(start_date, end_date, campaign_id=None):
    filters = {'campaign_id': campaign_id or CAMPAIGN_ID} if (campaign_id or CAMPAIGN_ID) else {}
    return _client().get_calls_count(start_date=start_date, end_date=end_date, **filters)


def fetch_call_recording(call_id):
    return _client().get_call_recording(call_id)
