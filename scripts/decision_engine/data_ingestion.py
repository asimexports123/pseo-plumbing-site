"""
Data Ingestion (read-only adapter layer).

Purpose
-------
Bridge the Decision Intelligence Engine to YoHomeFix's *existing* analytics
outputs without modifying, extending, or depending on changes to
scripts/analytics/ (gsc_client.py, ga4_client.py, marketcall_client.py,
report_core.py, csv_report.py) or any GSC/Marketcall integration, per the
explicit constraint that this task must not touch those systems. Every
function here only *reads* files/functions that already exist.

Inputs
------
- `scripts/analytics/csv/gsc-pages.csv` (if present) — parsed via the
  existing `csv_report.parse_gsc_page_csv` + `report_core.build_gsc_page_report`
  functions (imported, not duplicated or modified).
- `gsc-data/snapshot-*.json` (if present) — the existing daily GSC snapshot
  format written by the (unmodified) GSC cron job.
- A page URL path (e.g. '/plumber-austin-tx-emergency' or
  '/plumber/texas/emergency') — parsed into a best-effort taxonomy via
  regex against the URL structure actually observed in this repo's
  routing (city-service slugs of the form 'plumber-<city>-<service>' and
  state-service slugs of the form 'plumber/<state>/<service>', matching
  the patterns visible in lib/sitemap.js's own URL construction). This is
  an *approximation* of the real taxonomy (see engine/queue.js's
  `buildSlug` for the authoritative slug format) — see "Future extensions".

Outputs
-------
- `load_gsc_page_report()` -> list of page-report dicts (page, impressions,
  clicks, ctr, avg_position), or [] with a logged warning if no data source
  is found (never fabricated).
- `infer_taxonomy(page_path)` -> {'service': str|None, 'city_or_state': str|None,
  'kind': 'city_service'|'state_service'|'other'}
- `build_hierarchy_graph(page_reports)` -> graph_engine.DirectedGraph with
  edges ROOT -> service, service -> city/state, city/state -> page, based
  on the *inferred* taxonomy of the actual observed pages. This is a
  structural approximation, not a crawl of real rendered <a href> tags —
  see module docstring "Future extensions".

Mathematics used
-----------------
None — this module is a data adapter, not a computational engine.

Computational complexity
-------------------------
O(n) in the number of pages/rows processed.

Future extensions
------------------
- Replace the regex-based taxonomy inference and hierarchy-approximation
  graph with a real internal-link extraction pass over the rendered
  Next.js routes/components (Epic C1 in
  docs/YOHOMEFIX_AUTONOMOUS_OS_ENGINEERING_EXECUTION_PLAN_v1.0.md), which
  would produce the *actual* internal link graph instead of an inferred
  hierarchy.
- Read `page_clusters` / `page_graph_edges` tables directly (Epic B/C in
  the same plan) once they exist, instead of inferring structure from URL
  strings at ingestion time.
"""
import json
import logging
import re
import sys
from pathlib import Path

from .logging_utils import log
from .graph_engine import DirectedGraph

REPO_ROOT = Path(__file__).resolve().parents[2]
ANALYTICS_DIR = REPO_ROOT / 'scripts' / 'analytics'
GSC_DATA_DIR = REPO_ROOT / 'gsc-data'

# Matches the two URL shapes actually produced by lib/sitemap.js:
#   /plumber-<city-slug>-<service-slug>          (city-service pages)
#   /plumber/<state-slug>/<service-slug>         (state-service pages)
_STATE_SERVICE_RE = re.compile(r'^/plumber/([a-z-]+)/([a-z-]+)/?$')
_CITY_SERVICE_RE = re.compile(r'^/plumber-(.+)-(emergency|leak-repair|drain-cleaning|water-heater-repair|pipe-burst-repair|[a-z-]+)$')

ROOT_NODE = 'ROOT'


def _import_analytics_modules():
    """
    Import the existing, unmodified analytics modules lazily (only when
    ingestion is actually invoked) so this package remains importable even
    in environments without scripts/analytics/'s dependencies installed.
    """
    if str(ANALYTICS_DIR) not in sys.path:
        sys.path.insert(0, str(ANALYTICS_DIR))
    from report_core import build_gsc_page_report  # noqa: F401 (re-exported below)
    from csv_report import parse_gsc_page_csv  # noqa: F401
    return build_gsc_page_report, parse_gsc_page_csv


def load_gsc_page_report_from_csv():
    """
    Read scripts/analytics/csv/gsc-pages.csv via the existing, unmodified
    csv_report.parse_gsc_page_csv() + report_core.build_gsc_page_report(),
    returning [] (with a logged warning) if the CSV is absent.
    """
    try:
        build_gsc_page_report, parse_gsc_page_csv = _import_analytics_modules()
    except ImportError as e:
        log(logging.WARNING, 'data_ingestion_analytics_import_failed', error=str(e))
        return []

    raw_rows = parse_gsc_page_csv()
    if not raw_rows:
        log(logging.WARNING, 'data_ingestion_no_csv_rows',
            path=str(ANALYTICS_DIR / 'csv' / 'gsc-pages.csv'))
        return []
    report = build_gsc_page_report(raw_rows)
    log(logging.INFO, 'data_ingestion_loaded_csv_pages', n_pages=len(report))
    return report


def load_latest_gsc_snapshot():
    """
    Read the most recent gsc-data/snapshot-*.json (the existing, unmodified
    GSC cron output format). Returns None if no snapshot files exist.
    Does NOT attempt to fix or flag the known zero-data issue — that is
    explicitly out of scope for this task (see prompt constraints); this
    function simply surfaces whatever the existing pipeline last wrote.
    """
    if not GSC_DATA_DIR.exists():
        log(logging.WARNING, 'data_ingestion_no_gsc_data_dir', path=str(GSC_DATA_DIR))
        return None
    snapshots = sorted(GSC_DATA_DIR.glob('snapshot-*.json'))
    if not snapshots:
        return None
    latest = snapshots[-1]
    data = json.loads(latest.read_text(encoding='utf-8'))
    log(logging.INFO, 'data_ingestion_loaded_snapshot', path=str(latest),
        total_impressions=data.get('summary', {}).get('totalImpressions'))
    return data


def infer_taxonomy(page_path):
    """
    Best-effort taxonomy inference from a URL path. See module docstring
    for the regex basis and its "approximation, not ground truth" caveat.
    """
    m = _STATE_SERVICE_RE.match(page_path)
    if m:
        return {'kind': 'state_service', 'city_or_state': m.group(1), 'service': m.group(2)}
    m = _CITY_SERVICE_RE.match(page_path)
    if m:
        return {'kind': 'city_service', 'city_or_state': m.group(1), 'service': m.group(2)}
    return {'kind': 'other', 'city_or_state': None, 'service': None}


def build_hierarchy_graph(page_reports, page_id_field='page'):
    """
    Build an approximate ROOT -> service -> city/state -> page hierarchy
    graph from the taxonomy inferred for each page report. See module
    docstring's "Future extensions" for the real-crawl replacement plan.
    """
    graph = DirectedGraph()
    graph.add_node(ROOT_NODE)
    n_classified = 0

    for page in page_reports:
        path = page[page_id_field]
        taxonomy = infer_taxonomy(path)
        if taxonomy['kind'] == 'other':
            graph.add_edge(ROOT_NODE, path)
            continue
        n_classified += 1
        service_node = f"service:{taxonomy['service']}"
        location_node = f"{'state' if taxonomy['kind'] == 'state_service' else 'city'}:{taxonomy['city_or_state']}"
        graph.add_edge(ROOT_NODE, service_node)
        graph.add_edge(service_node, location_node)
        graph.add_edge(location_node, path)

    log(logging.INFO, 'data_ingestion_built_hierarchy_graph',
        n_pages=len(page_reports), n_classified=n_classified, n_edges=graph.n_edges())
    return graph
