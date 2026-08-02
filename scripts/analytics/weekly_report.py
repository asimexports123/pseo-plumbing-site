#!/usr/bin/env python3
"""
Daily/weekly lead-generation analysis for YoHomeFix.

Run:
    python scripts/analytics/weekly_report.py --daily
    python scripts/analytics/weekly_report.py --weekly
    python scripts/analytics/weekly_report.py 2026-07-24 2026-07-30

Outputs:
    - daily-YYYY-MM-DD.md / .json
    - weekly-YYYY-MM-DD.md / .json

Do not run until credentials are configured.
"""
import argparse
import json
import sys
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path

# Ensure the package can find config and clients
sys.path.insert(0, str(Path(__file__).parent))

from config import DOMAIN
from gsc_client import fetch_pages, fetch_queries
from ga4_client import (
    fetch_overview, fetch_landing_pages, fetch_call_click_events,
    fetch_traffic_sources, fetch_conversion_paths,
)
from marketcall_client import fetch_calls


REPORTS_DIR = Path(__file__).parent.parent.parent / 'reports'
REPORTS_DIR.mkdir(exist_ok=True)


def parse_cli_args():
    parser = argparse.ArgumentParser(description='YoHomeFix lead-generation report')
    parser.add_argument('--daily', action='store_true', help='Report on the last 1 day')
    parser.add_argument('--weekly', action='store_true', help='Report on the last 7 days')
    parser.add_argument('dates', nargs='*', help='Optional start and end dates (YYYY-MM-DD)')
    args = parser.parse_args()

    if len(args.dates) == 2:
        start, end = args.dates[0], args.dates[1]
        period = 'custom'
    elif args.daily:
        end = datetime.utcnow().date().isoformat()
        start = end
        period = 'daily'
    else:
        # default is daily because we are tracking toward 20 calls/day
        end = datetime.utcnow().date().isoformat()
        start = end
        period = 'daily'
    return start, end, period


def _gsc_url_to_path(url):
    return url.replace(DOMAIN, '') if url.startswith(DOMAIN) else url


def build_gsc_page_report(rows):
    report = []
    for r in rows:
        page = _gsc_url_to_path(r['keys'][0])
        clicks = int(r.get('clicks', 0))
        impressions = int(r.get('impressions', 0))
        ctr = r.get('ctr', 0)
        position = r.get('position', 0)
        report.append({
            'page': page,
            'clicks': clicks,
            'impressions': impressions,
            'ctr': round(ctr * 100, 2),
            'avg_position': round(position, 1),
        })
    return sorted(report, key=lambda x: x['impressions'], reverse=True)


def build_gsc_query_report(rows):
    report = []
    for r in rows:
        query = r['keys'][0]
        clicks = int(r.get('clicks', 0))
        impressions = int(r.get('impressions', 0))
        ctr = r.get('ctr', 0)
        position = r.get('position', 0)
        report.append({
            'query': query,
            'clicks': clicks,
            'impressions': impressions,
            'ctr': round(ctr * 100, 2),
            'avg_position': round(position, 1),
        })
    return sorted(report, key=lambda x: x['impressions'], reverse=True)


def identify_opportunities(page_report, query_report, ga_events):
    """Return data-backed opportunity lists."""
    # Pages with high impressions but low CTR
    high_imp_low_ctr = [
        p for p in page_report
        if p['impressions'] >= 100 and p['ctr'] < 2.0
    ]

    # Pages in ranking opportunity zone (avg position 5-30)
    ranking_opps = [
        p for p in page_report
        if 5 <= p['avg_position'] <= 30 and p['impressions'] >= 50
    ]

    # Pages with impressions but zero clicks
    zero_click_pages = [p for p in page_report if p['impressions'] >= 50 and p['clicks'] == 0]

    # Queries with high impressions but low CTR (potential title/meta optimization)
    high_imp_low_ctr_queries = [
        q for q in query_report
        if q['impressions'] >= 100 and q['ctr'] < 2.0
    ]

    # Pages generating calls
    calls_by_page = defaultdict(int)
    for row in ga_events:
        if row.dimension_values:
            page = row.dimension_values[2].value  # pageLocation
            calls_by_page[_gsc_url_to_path(page)] += int(row.metric_values[0].value or 0)

    # Pages with many impressions but no calls yet
    high_imp_no_calls = [
        p for p in page_report
        if p['impressions'] >= 100 and calls_by_page.get(p['page'], 0) == 0
    ]

    return {
        'high_impressions_low_ctr_pages': sorted(high_imp_low_ctr, key=lambda x: x['impressions'], reverse=True)[:30],
        'ranking_opportunities_5_30': sorted(ranking_opps, key=lambda x: x['avg_position'], reverse=True)[:30],
        'zero_click_pages': sorted(zero_click_pages, key=lambda x: x['impressions'], reverse=True)[:20],
        'high_impressions_low_ctr_queries': sorted(high_imp_low_ctr_queries, key=lambda x: x['impressions'], reverse=True)[:30],
        'calls_by_page': dict(sorted(calls_by_page.items(), key=lambda x: x[1], reverse=True)[:30]),
        'high_impressions_no_calls': sorted(high_imp_no_calls, key=lambda x: x['impressions'], reverse=True)[:30],
    }


def build_markdown(start, end, period, page_report, query_report, opportunities, ga_overview, marketcall_calls):
    lines = [
        f'# YoHomeFix Lead-Generation Report ({period}): {start} to {end}',
        '',
        '## Summary',
        f'- **Report period:** {start} to {end}',
        f'- **GSC pages analyzed:** {len(page_report)}',
        f'- **Marketcall calls:** {len(marketcall_calls)}',
        f'- **Daily call target:** 20 calls/day',
        '',
        '## Top 20 Landing Pages by Impressions',
        '',
        '| Page | Impressions | Clicks | CTR (%) | Avg Position |',
        '|---|---|---|---|---|',
    ]
    for p in page_report[:20]:
        lines.append(f"| `{p['page']}` | {p['impressions']:,} | {p['clicks']:,} | {p['ctr']} | {p['avg_position']} |")

    lines += [
        '',
        '## 20 Calls/Day Gap Analysis',
        '',
        'Formula: `impressions × CTR × call_conversion_rate = calls`',
        '',
        '| Metric | Value | Gap to 20/day | Action |',
        '|---|---|---|---|',
    ]
    total_impressions = sum(p['impressions'] for p in page_report)
    total_clicks = sum(p['clicks'] for p in page_report)
    total_calls = sum(opportunities['calls_by_page'].values())
    overall_ctr = (total_clicks / total_impressions * 100) if total_impressions else 0
    cvr = (total_calls / total_clicks * 100) if total_clicks else 0
    calls_needed = max(0, 20 - total_calls)
    lines.append(f"| Impressions | {total_impressions:,} | - | Increase rankings / expand pages |")
    lines.append(f"| Clicks | {total_clicks:,} | - | Improve CTR on high-impression pages |")
    lines.append(f"| Overall CTR | {overall_ctr:.2f}% | - | Optimize titles, meta, CTAs |")
    lines.append(f"| Call CVR | {cvr:.2f}% | - | Strengthen sticky CTAs, remove distractions |")
    lines.append(f"| Calls | {total_calls} | {calls_needed} short | Focus on highest-opportunity pages below |")

    lines += [
        '',
        '## Top Call-Generating Pages',
        '',
        '| Page | call_click Events |',
        '|---|---|',
    ]
    for page, calls in opportunities['calls_by_page'].items():
        lines.append(f"| `{page}` | {calls} |")

    lines += [
        '',
        '## CTR Opportunities (High Impressions, Low CTR)',
        '',
        '| Page | Impressions | Clicks | CTR (%) | Suggested Action |',
        '|---|---|---|---|---|',
    ]
    for p in opportunities['high_impressions_low_ctr_pages'][:15]:
        lines.append(f"| `{p['page']}` | {p['impressions']:,} | {p['clicks']:,} | {p['ctr']} | Improve title/meta/above-fold CTA |")

    lines += [
        '',
        '## Ranking Opportunities (Position 5-30)',
        '',
        '| Page | Avg Position | Impressions | Clicks | Notes |',
        '|---|---|---|---|---|',
    ]
    for p in opportunities['ranking_opportunities_5_30'][:15]:
        lines.append(f"| `{p['page']}` | {p['avg_position']} | {p['impressions']:,} | {p['clicks']:,} | Small SEO/content push can break into top 5 |")

    lines += [
        '',
        '## Pages Needing Improvement',
        '',
        '### High impressions, no calls',
        '',
        '| Page | Impressions | Clicks | CTR |',
        '|---|---|---|---|',
    ]
    for p in opportunities['high_impressions_no_calls'][:15]:
        lines.append(f"| `{p['page']}` | {p['impressions']:,} | {p['clicks']:,} | {p['ctr']}% |")

    lines += [
        '',
        '### Zero-click pages',
        '',
        '| Page | Impressions | Avg Position |',
        '|---|---|---|',
    ]
    for p in opportunities['zero_click_pages'][:10]:
        lines.append(f"| `{p['page']}` | {p['impressions']:,} | {p['avg_position']} |")

    lines += [
        '',
        '## Methodology',
        '',
        '- Data sources: Google Search Console, Google Analytics 4, Marketcall.',
        '- CTR opportunity threshold: impressions ≥ 100 and CTR < 2%.',
        '- Ranking opportunity threshold: average position 5-30 with impressions ≥ 50.',
        '- Call attribution: GA4 `call_click` events + Marketcall call records when available.',
        '',
        '---',
        '_This report is read-only and generated automatically. No site changes are made._',
    ]
    return '\n'.join(lines)


def main():
    start, end, period = parse_cli_args()
    print(f'Fetching {period} data for {start} to {end}...')

    gsc_pages = fetch_pages(start, end)
    gsc_queries = fetch_queries(start, end)
    page_report = build_gsc_page_report(gsc_pages)
    query_report = build_gsc_query_report(gsc_queries)

    ga_overview = fetch_overview(start, end)
    ga_events = fetch_call_click_events(start, end)
    ga_landing = fetch_landing_pages(start, end)

    marketcall_calls = fetch_calls(start, end)

    opportunities = identify_opportunities(page_report, query_report, ga_events)

    report_md = build_markdown(
        start, end, period, page_report, query_report, opportunities,
        ga_overview, marketcall_calls,
    )

    end_dash = end.replace('-', '')
    md_path = REPORTS_DIR / f'{period}-{end_dash}.md'
    json_path = REPORTS_DIR / f'{period}-{end_dash}.json'

    md_path.write_text(report_md, encoding='utf-8')
    json_path.write_text(json.dumps({
        'period': {'start': start, 'end': end},
        'pages': page_report,
        'queries': query_report[:500],
        'opportunities': opportunities,
        'ga_overview': [
            {'metrics': [m.value for m in row.metric_values]}
            for row in ga_overview
        ],
        'ga_landing_pages': [
            {
                'page': row.dimension_values[0].value,
                'sessions': row.metric_values[0].value,
                'users': row.metric_values[1].value,
                'events': row.metric_values[-1].value,
            }
            for row in ga_landing
        ],
        'marketcall_calls': marketcall_calls,
    }, indent=2, default=str), encoding='utf-8')

    print(f'Report saved to {md_path}')
    print(f'JSON summary saved to {json_path}')


if __name__ == '__main__':
    main()
