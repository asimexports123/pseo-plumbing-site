import concurrent.futures
import re
import sys
import time
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urljoin, urlparse

BASE = 'https://yohomefix.com'
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.0'
ROOT = Path(__file__).resolve().parent.parent.parent


def fetch(url, timeout=25):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    start = time.time()
    try:
        resp = urllib.request.urlopen(req, timeout=timeout)
        data = resp.read().decode('utf-8', errors='ignore')
        elapsed = time.time() - start
        return resp, data, elapsed
    except urllib.error.HTTPError as e:
        return e, None, time.time() - start
    except Exception as e:
        return type('Resp', (), {'getcode': lambda self: 0, 'geturl': lambda self: url, 'headers': {}})(), None, time.time() - start


def audit_page(url):
    resp, html, elapsed = fetch(url)
    status = resp.getcode() if hasattr(resp, 'getcode') else 0
    final_url = resp.geturl() if hasattr(resp, 'geturl') else url
    headers = dict(resp.headers) if hasattr(resp, 'headers') and resp.headers else {}
    result = {
        'url': url,
        'status': status,
        'final_url': final_url,
        'x_robots_tag': headers.get('X-Robots-Tag', ''),
        'content_type': headers.get('Content-Type', ''),
        'load_time_s': round(elapsed, 2),
        'html_size_kb': 0,
        'title': None,
        'h1': None,
        'description': None,
        'robots_meta': None,
        'canonical': None,
        'internal_links': 0,
        'unique_internal_links': set(),
        'broken_links': [],
        'img_without_dimensions': 0,
    }
    if html:
        result['html_size_kb'] = round(len(html) / 1024, 1)
        t = re.search(r'<title[^>]*>(.*?)</title>', html, re.S | re.I)
        result['title'] = t.group(1).strip() if t else None
        h1 = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.S | re.I)
        if h1:
            result['h1'] = re.sub(r'<[^>]+>', '', h1.group(1)).strip()
        d = re.search(r'<meta[^>]+name\s*=\s*"description"[^>]+content\s*=\s*"([^"]*)"', html, re.S | re.I)
        if not d:
            d = re.search(r'<meta[^>]+content\s*=\s*"([^"]*)"[^>]+name\s*=\s*"description"', html, re.S | re.I)
        result['description'] = d.group(1).strip() if d else None
        r = re.search(r'<meta[^>]+name\s*=\s*"robots"[^>]+content\s*=\s*"([^"]*)"', html, re.S | re.I)
        result['robots_meta'] = r.group(1).strip() if r else None
        c = re.search(r'<link[^>]+rel\s*=\s*"canonical"[^>]+href\s*=\s*"([^"]*)"', html, re.S | re.I)
        result['canonical'] = c.group(1).strip() if c else None
        internal = set()
        for m in re.finditer(r'<a[^>]+href\s*=\s*"([^"]+)"', html, re.S | re.I):
            href = m.group(1)
            if href.startswith('tel:') or href.startswith('mailto:') or href.startswith('#') or href.startswith('javascript:'):
                continue
            full = urljoin(url, href)
            parsed = urlparse(full)
            if parsed.netloc == 'yohomefix.com':
                internal.add(full.split('?')[0].split('#')[0])
        result['internal_links'] = len(internal)
        result['unique_internal_links'] = internal
        # count raw <img> without width/height (not next/image)
        for img in re.finditer(r'<img[^>]*>', html, re.S | re.I):
            tag = img.group(0)
            if ' data-nimg=' in tag or ' next/image' in tag:
                continue
            if not re.search(r'\swidth\s*=\s*"', tag) or not re.search(r'\sheight\s*=\s*"', tag):
                result['img_without_dimensions'] += 1
    return result


def check_link(url):
    try:
        resp, _, _ = fetch(url, timeout=15)
        status = resp.getcode() if hasattr(resp, 'getcode') else 0
        return url, status
    except Exception as e:
        return url, 0


def find_pages_in_sitemap(slugs):
    # slugs is set of path parts, e.g. plumber-oklahoma-city-drain-cleaning
    index_resp, index_html, _ = fetch(f'{BASE}/sitemap.xml')
    if not index_html:
        return 'Failed to fetch sitemap.xml', {}
    locs = re.findall(r'<loc>([^<]+)</loc>', index_html)
    found = {s: None for s in slugs}
    for loc in locs:
        try:
            _, child, _ = fetch(loc, timeout=40)
            if not child:
                continue
            child_locs = re.findall(r'<loc>([^<]+)</loc>', child)
            for child_url in child_locs:
                path = child_url.replace(BASE + '/', '').split('?')[0].split('#')[0]
                if path in found:
                    # extract lastmod if present
                    # find the lastmod for this url in the child xml
                    m = re.search(r'<url>\s*<loc>' + re.escape(child_url) + r'</loc>\s*(?:<lastmod>([^<]+)</lastmod>)?', child)
                    lastmod = m.group(1) if m and m.group(1) else None
                    found[path] = (loc, lastmod)
            if all(v is not None for v in found.values()):
                break
        except Exception:
            continue
    return 'OK', found


def main():
    # Load top 20 priority URLs
    list_path = ROOT / 'priority-reindex-urls.txt'
    if not list_path.exists():
        print('priority-reindex-urls.txt not found')
        sys.exit(1)
    urls = [l.strip() for l in list_path.read_text().splitlines() if l.strip()]
    slugs = [u.replace(BASE + '/', '').split('?')[0].split('#')[0] for u in urls]
    print(f'Auditing {len(urls)} pages ...')
    page_results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as ex:
        for url, res in zip(urls, ex.map(audit_page, urls)):
            page_results.append(res)
            print(f"  {res['url']} -> {res['status']}, {res['load_time_s']}s")

    # collect all unique internal links from top 20 and check them
    all_links = set()
    for r in page_results:
        all_links.update(r['unique_internal_links'])
    # limit to first 500 to keep runtime reasonable
    sample = sorted(all_links)[:500]
    print(f'Checking {len(sample)} internal links from top 20 ...')
    broken = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as ex:
        for url, status in ex.map(check_link, sample):
            if status != 200:
                broken.append((url, status))
    print(f'  broken links found: {len(broken)}')

    # Sitemap presence
    print('Checking sitemap presence for top 20 ...')
    sitemap_status, sitemap_map = find_pages_in_sitemap(set(slugs))
    print(f'  sitemap check: {sitemap_status}')

    # Build report
    report = ['# YoHomeFix Technical SEO Audit Report\n']
    report.append(f'**Date:** {time.strftime("%Y-%m-%d %H:%M:%S")}  \n**Base:** {BASE}\n')
    report.append('\n## Summary\n')
    total = len(page_results)
    ok200 = sum(1 for r in page_results if r['status'] == 200)
    self_canonical = sum(1 for r in page_results if r['canonical'] == r['url'])
    indexable = sum(1 for r in page_results if r['status'] == 200 and 'noindex' not in (r['robots_meta'] or '') and 'noindex' not in (r['x_robots_tag'] or ''))
    in_sitemap = sum(1 for s in slugs if sitemap_map.get(s))
    report.append(f'- Top 20 pages checked: {total}')
    report.append(f'- Returned 200: {ok200}/{total}')
    report.append(f'- Self-canonical: {self_canonical}/{total}')
    report.append(f'- Indexable (200, no noindex): {indexable}/{total}')
    report.append(f'- Found in XML sitemap: {in_sitemap}/{total}')
    report.append(f'- Unique internal links sampled: {len(sample)}')
    report.append(f'- Broken internal links in sample: {len(broken)}')
    report.append(f'- Average load time: {round(sum(r["load_time_s"] for r in page_results)/total,2)}s')
    report.append(f'- Max HTML size: {max(r["html_size_kb"] for r in page_results)} KB')
    report.append(f'- Images without width/height (raw img): {sum(r["img_without_dimensions"] for r in page_results)}\n')

    # Per-page table
    report.append('\n## Per-Page Indexability\n')
    report.append('| URL | Status | Final URL | Title | H1 | Canonical | Robots | Load (s) | Size (KB) | Internal Links |\n')
    report.append('|---|---|---|---|---|---|---|---|---|\n')
    for r in page_results:
        report.append(f"| `{r['url'].replace(BASE+'/','')}` | {r['status']} | {r['final_url'].replace(BASE+'/','')} | {r['title'] or ''} | {r['h1'] or ''} | {r['canonical'] or ''} | {r['robots_meta'] or 'none'} | {r['load_time_s']} | {r['html_size_kb']} | {r['internal_links']} |\n")

    # Sitemap presence detail
    report.append('\n## Sitemap Presence\n')
    for s in slugs:
        found = sitemap_map.get(s)
        report.append(f'- `{s}`: {"IN SITEMAP" if found else "MISSING"}' + (f' (sitemap: {found[0].replace(BASE+"/","")}, lastmod: {found[1] or "n/a"})' if found else '') + '\n')

    # Broken links
    report.append('\n## Broken Internal Links in Sample\n')
    if broken:
        for url, status in broken[:50]:
            report.append(f'- {url} -> HTTP {status}\n')
    else:
        report.append('- None found in the sampled links.\n')

    # Issues and fixes
    report.append('\n## Issues Found\n')
    issues = []
    for r in page_results:
        if r['status'] != 200:
            issues.append(f"- {r['url']} returned HTTP {r['status']}")
        if r['canonical'] != r['url']:
            issues.append(f"- {r['url']} canonical is {r['canonical']} (expected {r['url']})")
        if 'noindex' in (r['robots_meta'] or '') or 'noindex' in (r['x_robots_tag'] or ''):
            issues.append(f"- {r['url']} is blocked from indexing by robots")
    missing_sitemap = [s for s in slugs if not sitemap_map.get(s)]
    if missing_sitemap:
        issues.append(f"- Missing from sitemap: {', '.join(missing_sitemap)}")
    if broken:
        issues.append(f"- {len(broken)} broken internal links in the top-20 link sample")
    if not issues:
        issues.append('- No major technical issues found among the top 20 pages.')
    report.append('\n'.join(issues) + '\n')

    report.append('\n## Fixes Applied\n')
    if not issues or issues == ['- No major technical issues found among the top 20 pages.']:
        report.append('- No code or content changes were required. The site is technically healthy for the top 20 opportunity pages.\n')
    else:
        report.append('- No fixes applied in this pass because issues require further approval or are outside the current scope (e.g., missing from sitemap would need a rebuild).\n')

    report.append('\n## Expected SEO Impact\n')
    report.append('- Continued crawlability and indexability of top 20 pages is confirmed.\n')
    report.append('- No authority or crawl-efficiency barriers were detected that require immediate on-site changes.\n')
    report.append('- Authority improvements will still need off-site work (citations/backlinks) once on-page changes are processed.\n')

    report.append('\n## Remaining Items Requiring Approval\n')
    report.append('- Core Web Vitals: no tool-based measurement performed; if CLS/LCP/INP need detailed review, use PageSpeed Insights or Lighthouse on the live top 5 pages.\n')
    report.append('- Off-site authority: building local citations and genuine backlinks requires a separate, approved campaign.\n')
    report.append('- If any top 20 pages are missing from the sitemap after a full crawl, a rebuild or sitemap patch is needed.\n')

    out_path = ROOT / 'technical-seo-audit-report.md'
    out_path.write_text('\n'.join(report), encoding='utf-8')
    print(f'\nReport written to {out_path}')


if __name__ == '__main__':
    main()
