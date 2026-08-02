#!/usr/bin/env python3
"""
Manual CSV fallback for YoHomeFix daily lead analysis.

If GSC/GA4 API access is not available, export these CSVs and place them in
`scripts/analytics/csv/`:

- `gsc-pages.csv` — Search Console > Performance > Pages (last 7-28 days)
- `gsc-queries.csv` — Search Console > Performance > Queries (last 7-28 days)
- `ga4-events.csv` — GA4 > Explore > call_click by pageLocation
- `marketcall.csv` — Marketcall calls export (optional)

Then run:
    python scripts/analytics/csv_report.py
"""
import csv
import json
import sys
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from config import DOMAIN
from report_core import (
    build_gsc_page_report, build_gsc_query_report,
    identify_opportunities, build_markdown,
)


def load_csv(filename, required_cols):
    path = Path(__file__).parent / 'csv' / filename
    if not path.exists():
        print(f'Warning: {path} not found.')
        return []
    with open(path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = [row for row in reader if all(col in row for col in required_cols)]
    return rows


def parse_gsc_page_csv():
    rows = load_csv('gsc-pages.csv', ['Top pages', 'Impressions', 'Clicks', 'CTR', 'Position'])
    out = []
    for r in rows:
        out.append({
            'keys': [r['Top pages']],
            'impressions': int(r['Impressions'].replace(',', '') or 0),
            'clicks': int(r['Clicks'].replace(',', '') or 0),
            'ctr': float(r['CTR'].replace('%', '') or 0) / 100,
            'position': float(r['Position'] or 0),
        })
    return out


def parse_gsc_query_csv():
    rows = load_csv('gsc-queries.csv', ['Top queries', 'Impressions', 'Clicks', 'CTR', 'Position'])
    out = []
    for r in rows:
        out.append({
            'keys': [r['Top queries']],
            'impressions': int(r['Impressions'].replace(',', '') or 0),
            'clicks': int(r['Clicks'].replace(',', '') or 0),
            'ctr': float(r['CTR'].replace('%', '') or 0) / 100,
            'position': float(r['Position'] or 0),
        })
    return out


def parse_ga4_events_csv():
    rows = load_csv('ga4-events.csv', ['pageLocation', 'eventCount'])
    # Convert to a minimal mock of GA4 API row objects
    MockRow = type('MockRow', (), {})
    out = []
    for r in rows:
        m = MockRow()
        m.dimension_values = [type('V', (), {'value': 'call_click'}),
                              type('V', (), {'value': ''}),
                              type('V', (), {'value': r['pageLocation']})]
        m.metric_values = [type('V', (), {'value': r['eventCount']})]
        out.append(m)
    if not out:
        print('Note: ga4-events.csv not found. Call data will be empty until you add it.')
    return out


def main():
    end = datetime.utcnow().date().isoformat()
    start = (datetime.utcnow().date() - timedelta(days=6)).isoformat()

    gsc_pages = parse_gsc_page_csv()
    gsc_queries = parse_gsc_query_csv()
    ga_events = parse_ga4_events_csv()

    page_report = build_gsc_page_report(gsc_pages)
    query_report = build_gsc_query_report(gsc_queries)
    opportunities = identify_opportunities(page_report, query_report, ga_events)

    report_md = build_markdown(
        start, end, 'csv-fallback', page_report, query_report,
        opportunities, [], [],
    )

    reports_dir = Path(__file__).parent.parent.parent / 'reports'
    reports_dir.mkdir(exist_ok=True)
    end_dash = end.replace('-', '')
    md_path = reports_dir / f'csv-daily-{end_dash}.md'
    md_path.write_text(report_md, encoding='utf-8')
    print(f'CSV-based report saved to {md_path}')


if __name__ == '__main__':
    main()
