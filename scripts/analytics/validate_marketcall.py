#!/usr/bin/env python3
"""
Live validation of the Marketcall Affiliate API client (marketcall_client.py).

Run:
    python scripts/analytics/validate_marketcall.py [days]

Confirms authentication, lists/paginates calls, cross-checks /calls vs
/calls/count, and reports any rate-limit headers seen. Writes a redacted
Markdown report to reports/marketcall-validation-<timestamp>.md.

The API key is read only via marketcall_client/config (MARKETCALL_API_KEY
env var) and is never printed, logged, or written to the report.
"""
import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from marketcall_client import (  # noqa: E402
    MarketcallClient, MarketcallAPIError, MarketcallConfigError,
)
from config import CAMPAIGN_ID  # noqa: E402

REPORTS_DIR = Path(__file__).parent.parent.parent / 'reports'

# Field-name fragments that should never appear in plaintext in the report.
REDACT_KEY_FRAGMENTS = (
    'caller', 'from_number', 'phone', 'customer', 'recording', 'record_url', 'api_key', 'apikey',
)


def redact(obj, sample_limit=3):
    if isinstance(obj, dict):
        out = {}
        for k, v in obj.items():
            if any(frag in k.lower() for frag in REDACT_KEY_FRAGMENTS):
                out[k] = '[REDACTED]'
            else:
                out[k] = redact(v, sample_limit)
        return out
    if isinstance(obj, list):
        return [redact(v, sample_limit) for v in obj[:sample_limit]]
    return obj


def main():
    days = int(sys.argv[1]) if len(sys.argv) > 1 else 30
    lines = [
        '# Marketcall API Validation Report',
        '',
        f'Generated: {datetime.now(timezone.utc).isoformat()}',
        f'Campaign ID: {CAMPAIGN_ID}',
        f'Window: last {days} day(s)',
        '',
        '_API key is never included in this report or in any log line produced by this run._',
        '',
    ]

    try:
        client = MarketcallClient()
    except MarketcallConfigError as e:
        lines += ['## Authentication: FAILED (configuration)', '', f'`{e}`']
        _write(lines)
        return 1

    end = datetime.now(timezone.utc).date()
    start = end - timedelta(days=days)
    start_s, end_s = start.isoformat(), end.isoformat()

    # 1. Authentication + /calls/count
    try:
        count_resp = client.get_calls_count(start_date=start_s, end_date=end_s, campaign_id=CAMPAIGN_ID)
        lines += [
            '## 1. Authentication: SUCCESS',
            '',
            f'`GET /calls/count` returned HTTP 200 for campaign `{CAMPAIGN_ID}`, {start_s} to {end_s}.',
            '',
            '### /calls/count response (redacted)',
            '```json',
            json.dumps(redact(count_resp), indent=2),
            '```',
            '',
        ]
    except MarketcallAPIError as e:
        lines += [
            '## 1. Authentication: FAILED',
            '',
            f'- status_code: `{e.status_code}`',
            f'- endpoint: `{e.endpoint}`',
            f'- message: {e}',
        ]
        _write(lines)
        return 1

    # 2. Pagination: force small pages to guarantee >1 page if enough records exist
    try:
        page_size = 5
        page1 = client.get_calls_page(start_date=start_s, end_date=end_s, page=1, per_page=page_size, campaign_id=CAMPAIGN_ID)
        all_calls = client.get_calls(start_date=start_s, end_date=end_s, per_page=page_size, campaign_id=CAMPAIGN_ID, max_pages=50)

        lines += [
            '## 2. Pagination',
            '',
            f'- Page size used: {page_size}',
            f'- Total records retrieved across all pages: **{len(all_calls)}**',
            f'- Multiple pages were fetched: **{"yes" if len(all_calls) > page_size else "no (fits in one page)"}**',
            '',
            '### /calls page 1 response shape (redacted, truncated)',
            '```json',
            json.dumps(redact(page1), indent=2)[:4000],
            '```',
            '',
        ]
    except MarketcallAPIError as e:
        lines += [
            '## 2. Pagination: FAILED',
            '',
            f'- status_code: `{e.status_code}`',
            f'- endpoint: `{e.endpoint}`',
            f'- message: {e}',
        ]
        _write(lines)
        return 1

    # 3. Sample record structure (first record only, redacted)
    if all_calls:
        lines += [
            '## 3. Sample call record structure (redacted)',
            '',
            '```json',
            json.dumps(redact(all_calls[0], sample_limit=1), indent=2),
            '```',
            '',
        ]
    else:
        lines += ['## 3. Sample call record structure', '', 'No call records in this window to sample.', '']

    # 4. Cross-check /calls count vs /calls/count
    count_value = None
    if isinstance(count_resp, dict):
        data_field = count_resp.get('data')
        if isinstance(data_field, dict) and isinstance(data_field.get('count'), (int, float)):
            count_value = data_field['count']
        elif isinstance(count_resp.get('count'), (int, float)):
            count_value = count_resp['count']
    lines += [
        '## 4. /calls vs /calls/count cross-check',
        '',
        f'- `/calls/count` reported: **{count_value if count_value is not None else "(field not recognized — see raw response in section 1)"}**',
        f'- `/calls` pagination total: **{len(all_calls)}**',
        f'- Match: **{"yes" if count_value == len(all_calls) else "unknown/mismatch — verify field names in raw response above"}**',
        '',
    ]

    # 5. Rate-limit headers
    lines += [
        '## 5. Rate-limit headers detected',
        '',
    ]
    if client.last_rate_limit_headers:
        lines.append('```')
        for k, v in client.last_rate_limit_headers.items():
            lines.append(f'{k}: {v}')
        lines.append('```')
    else:
        lines.append('No rate-limit headers were present on any response observed during this run.')
    lines.append('')

    # 6. Dashboard cross-check (cannot be automated — requires manual confirmation)
    lines += [
        '## 6. Dashboard match confirmation',
        '',
        '**Not automatable from this environment** — I do not have login access to the '
        'Marketcall dashboard. Please manually compare the totals above '
        f'(campaign `{CAMPAIGN_ID}`, {start_s} to {end_s}) against '
        '`track.marketcall.com` / the Marketcall reports UI for the same filters and confirm they match.',
        '',
        '---',
        '_Generated by scripts/analytics/validate_marketcall.py. Read-only — no data was modified._',
    ]

    _write(lines)
    return 0


def _write(lines):
    REPORTS_DIR.mkdir(exist_ok=True)
    path = REPORTS_DIR / f'marketcall-validation-{datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")}.md'
    path.write_text('\n'.join(lines), encoding='utf-8')
    print(f'Validation report written to {path}')


if __name__ == '__main__':
    sys.exit(main())
