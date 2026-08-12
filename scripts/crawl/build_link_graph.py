#!/usr/bin/env python3
"""
Real Internal Link Graph Crawler.

Purpose
-------
Produce the *actual* internal link graph — edges extracted from the real
rendered HTML the site serves — as a read-only artifact that
`scripts/decision_engine/link_ingestion.py` can consume. This is the
concrete implementation of the "Future extensions" item documented in
`scripts/decision_engine/data_ingestion.py`:

    "Replace the regex-based taxonomy inference and hierarchy-approximation
    graph with a real internal-link extraction pass over the rendered
    Next.js routes/components (Epic C1 ...), which would produce the
    *actual* internal link graph instead of an inferred hierarchy."

This script does not modify any production code, route, or component. It
is a standalone, external HTTP crawler — it only ever reads bytes the site
already serves to any visitor (or Googlebot). It is intentionally kept
outside `scripts/decision_engine/` because it performs live network I/O,
matching how `scripts/analytics/` (gsc_client.py, ga4_client.py,
marketcall_client.py) already separates I/O-heavy adapters from the
pure-Python decision_engine package.

Inputs
------
- `--base-url` (default: https://www.yohomefix.com, override via
  LINK_GRAPH_BASE_URL env var) — the origin to crawl. Point this at a
  staging/preview URL for testing without hitting production.
- `public/sitemap.xml` and the shard sitemaps it references
  (`public/sitemap-*/...`) — used only to build a *seed* URL list (not as
  a substitute for real crawling); every page actually visited is
  discovered by following real `<a href>` tags from those seeds, exactly
  as a search engine crawler would.
- `--max-pages` (default 2000) — hard cap on pages fetched. Given the
  ~422k-URL sitemap scale, crawling every URL is neither necessary nor
  affordable for a link-graph *sample*; this mirrors the same
  "cluster/sample scale, not full 422k-URL scale" principle already
  documented in `graph_engine.py`'s docstring. Increase deliberately, not
  by default.
- `--delay-seconds` (default 0.25) — politeness delay between requests.

Outputs
-------
- `link-graph-data/edges.jsonl` — one `{"source": path, "target": path}`
  JSON object per line, one per discovered internal link.
- `link-graph-data/crawl_meta.json` — `{"crawled_at", "base_url",
  "pages_crawled", "pages_failed", "max_pages", "seed_count"}`.

Mathematics used
-----------------
None (I/O + HTML parsing only).

Computational complexity
-------------------------
O(max_pages) HTTP requests; O(bytes of HTML) parsing per page via the
stdlib `html.parser` (no new dependency).

Future extensions
------------------
- Respect robots.txt crawl-delay directives explicitly (currently just a
  fixed configurable delay).
- Parallelize with a bounded worker pool once single-threaded crawl time
  becomes a bottleneck (not the case yet at max_pages=2000).
"""
import argparse
import json
import os
import sys
import time
import urllib.parse
import xml.etree.ElementTree as ET
from collections import deque
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path

import requests

REPO_ROOT = Path(__file__).resolve().parents[2]
PUBLIC_DIR = REPO_ROOT / 'public'
OUTPUT_DIR = REPO_ROOT / 'link-graph-data'
EDGES_FILE = OUTPUT_DIR / 'edges.jsonl'
META_FILE = OUTPUT_DIR / 'crawl_meta.json'

DEFAULT_BASE_URL = os.environ.get('LINK_GRAPH_BASE_URL', 'https://www.yohomefix.com')
_STATIC_EXTENSIONS = ('.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico',
                       '.css', '.js', '.json', '.xml', '.pdf', '.txt', '.woff', '.woff2')


class _LinkExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.hrefs = []

    def handle_starttag(self, tag, attrs):
        if tag != 'a':
            return
        for name, value in attrs:
            if name == 'href' and value:
                self.hrefs.append(value)


def _normalize_path(href, base_url):
    """
    Resolve `href` (absolute or relative) against `base_url` and return the
    bare path (no scheme/host/query/fragment) if it points to the same
    origin, else None (external/mailto/tel links are not part of the
    *internal* link graph by definition).
    """
    if href.startswith(('mailto:', 'tel:', 'javascript:', '#')):
        return None
    resolved = urllib.parse.urljoin(base_url, href)
    parsed = urllib.parse.urlparse(resolved)
    base_parsed = urllib.parse.urlparse(base_url)
    if parsed.netloc and parsed.netloc != base_parsed.netloc:
        return None
    path = parsed.path or '/'
    if path.lower().endswith(_STATIC_EXTENSIONS):
        return None
    return path


def load_sitemap_seeds(max_seeds):
    """
    Parse public/sitemap.xml (and any shard sitemaps it references) for a
    representative sample of seed URLs. Falls back to just the homepage if
    no sitemap files are present.
    """
    seeds = []
    index_path = PUBLIC_DIR / 'sitemap.xml'
    if not index_path.exists():
        return ['/']

    def _urls_from_xml(path):
        try:
            root = ET.parse(path).getroot()
        except ET.ParseError:
            return []
        ns = {'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        return [loc.text.strip() for loc in root.findall('.//sm:loc', ns) if loc.text]

    top_level_urls = _urls_from_xml(index_path)
    sitemap_files = [u for u in top_level_urls if u.endswith('.xml')]
    direct_urls = [u for u in top_level_urls if not u.endswith('.xml')]
    seeds.extend(direct_urls)

    if sitemap_files:
        per_shard = max(1, max_seeds // max(1, len(sitemap_files)))
        for shard_url in sitemap_files:
            shard_path_name = urllib.parse.urlparse(shard_url).path.lstrip('/')
            shard_path = REPO_ROOT / shard_path_name
            if not shard_path.exists():
                continue
            urls = _urls_from_xml(shard_path)[:per_shard]
            seeds.extend(urls)
            if len(seeds) >= max_seeds:
                break

    paths = []
    for u in seeds[:max_seeds]:
        parsed = urllib.parse.urlparse(u)
        paths.append(parsed.path or '/')
    return paths or ['/']


def crawl(base_url, max_pages, delay_seconds, seed_paths):
    session = requests.Session()
    session.headers.update({'User-Agent': 'YoHomeFixLinkGraphCrawler/1.0 (internal SEO audit)'})

    visited = set()
    queue = deque(seed_paths or ['/'])
    edges = []
    pages_crawled = 0
    pages_failed = 0

    while queue and pages_crawled < max_pages:
        path = queue.popleft()
        if path in visited:
            continue
        visited.add(path)

        url = urllib.parse.urljoin(base_url, path)
        try:
            resp = session.get(url, timeout=10)
            resp.raise_for_status()
        except requests.RequestException as e:
            pages_failed += 1
            print(f'[warn] failed to fetch {url}: {e}', file=sys.stderr)
            continue

        pages_crawled += 1
        extractor = _LinkExtractor()
        extractor.feed(resp.text)
        for href in extractor.hrefs:
            target_path = _normalize_path(href, base_url)
            if target_path is None:
                continue
            edges.append({'source': path, 'target': target_path})
            if target_path not in visited and len(visited) + len(queue) < max_pages * 3:
                queue.append(target_path)

        if delay_seconds:
            time.sleep(delay_seconds)

    return edges, pages_crawled, pages_failed


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url', default=DEFAULT_BASE_URL)
    parser.add_argument('--max-pages', type=int, default=2000)
    parser.add_argument('--delay-seconds', type=float, default=0.25)
    args = parser.parse_args()

    seed_paths = load_sitemap_seeds(max_seeds=args.max_pages)
    edges, pages_crawled, pages_failed = crawl(
        args.base_url, args.max_pages, args.delay_seconds, seed_paths,
    )

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(EDGES_FILE, 'w', encoding='utf-8') as f:
        for edge in edges:
            f.write(json.dumps(edge) + '\n')

    meta = {
        'crawled_at': datetime.now(timezone.utc).isoformat(),
        'base_url': args.base_url,
        'pages_crawled': pages_crawled,
        'pages_failed': pages_failed,
        'max_pages': args.max_pages,
        'seed_count': len(seed_paths),
        'n_edges': len(edges),
    }
    META_FILE.write_text(json.dumps(meta, indent=2), encoding='utf-8')
    print(f'Crawled {pages_crawled} pages ({pages_failed} failed), {len(edges)} edges -> {EDGES_FILE}')


if __name__ == '__main__':
    main()
