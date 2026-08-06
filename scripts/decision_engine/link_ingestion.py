"""
Link Ingestion (read-only adapter layer).

Purpose
-------
Bridge the Decision Intelligence Engine to the *real* internal link graph
artifact produced by `scripts/crawl/build_link_graph.py`, without
performing any network I/O itself and without modifying
`data_ingestion.py`'s existing (unchanged, still-used) taxonomy-inference
graph. This module is the concrete implementation of the "Future
extensions" item documented in `data_ingestion.py`'s module docstring.

This is deliberately a *separate* graph from `data_ingestion.build_hierarchy_graph`
(the inferred ROOT->service->city/state->page hierarchy), not a
replacement for it — the two answer different questions:
    - hierarchy graph  : "what structure would we *expect* given the URL
                          taxonomy?" (cheap, always available, approximate)
    - real link graph  : "what does the site *actually* link to, in the
                          bytes it serves?" (ground truth, but requires a
                          crawl artifact to exist)
Comparing the two (see `diff_with_hierarchy`) surfaces a signal neither
graph can produce alone: pages the taxonomy implies should be linked but
which have no *real* incoming link — i.e. a genuinely broken or missing
internal link, not just a structurally sparse page.

Inputs
------
- `link-graph-data/edges.jsonl` (default path, override via
  `LINK_GRAPH_EDGES_PATH` env var or the `edges_path` argument) — one
  `{"source": path, "target": path}` JSON object per line, written by
  `scripts/crawl/build_link_graph.py`. Never fabricated: if the file is
  absent, `load_link_graph_edges()` returns `[]` with a logged warning,
  exactly like `data_ingestion.py`'s own "no source found" convention.
- `link-graph-data/crawl_meta.json` (optional) — crawl provenance
  (timestamp, pages crawled) surfaced via `load_crawl_meta()` so callers
  can decide whether the graph is stale.

Outputs
-------
- `load_link_graph_edges(edges_path=None)` -> list of (source, target) tuples.
- `build_real_link_graph(edges=None, edges_path=None)` -> graph_engine.DirectedGraph.
- `load_crawl_meta(meta_path=None)` -> dict or None.
- `diff_with_hierarchy(real_graph, taxonomy_orphans, page_ids)` -> dict keyed
  by page_id -> {'real_in_degree', 'real_pagerank', 'real_is_orphan',
  'link_discrepancy'} where `link_discrepancy` is True only when the page
  is NOT a taxonomy orphan but IS a real-graph orphan (i.e. expected to be
  linked, but is not, in the actual rendered site).

Mathematics used
-----------------
None here — PageRank/orphan detection itself is computed by the existing,
unmodified `graph_engine.py` functions on the graph this module builds.

Computational complexity
-------------------------
O(n) in the number of edge lines read/parsed.

Future extensions
------------------
- Read edges from a `page_graph_edges` DB table directly (Epic B/C in
  docs/YOHOMEFIX_AUTONOMOUS_OS_ENGINEERING_EXECUTION_PLAN_v1.0.md) once it
  exists, instead of a flat-file crawl artifact.
"""
import json
import logging
import os
from pathlib import Path

from .logging_utils import log
from .graph_engine import DirectedGraph

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_EDGES_PATH = Path(os.environ.get(
    'LINK_GRAPH_EDGES_PATH', str(REPO_ROOT / 'link-graph-data' / 'edges.jsonl')
))
DEFAULT_META_PATH = Path(os.environ.get(
    'LINK_GRAPH_META_PATH', str(REPO_ROOT / 'link-graph-data' / 'crawl_meta.json')
))


def load_link_graph_edges(edges_path=None):
    """
    Read the crawl-produced edges.jsonl artifact. Returns [] (with a
    logged warning) if the file is absent or empty — never fabricated.
    """
    path = Path(edges_path) if edges_path else DEFAULT_EDGES_PATH
    if not path.exists():
        log(logging.WARNING, 'link_ingestion_no_edges_file', path=str(path))
        return []

    edges = []
    with open(path, 'r', encoding='utf-8') as f:
        for line_no, line in enumerate(f, start=1):
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
                edges.append((obj['source'], obj['target']))
            except (json.JSONDecodeError, KeyError) as e:
                log(logging.WARNING, 'link_ingestion_bad_edge_line',
                    path=str(path), line_no=line_no, error=str(e))

    log(logging.INFO, 'link_ingestion_loaded_edges', path=str(path), n_edges=len(edges))
    return edges


def load_crawl_meta(meta_path=None):
    """Read crawl_meta.json. Returns None (not fabricated) if absent."""
    path = Path(meta_path) if meta_path else DEFAULT_META_PATH
    if not path.exists():
        log(logging.WARNING, 'link_ingestion_no_meta_file', path=str(path))
        return None
    return json.loads(path.read_text(encoding='utf-8'))


def build_real_link_graph(edges=None, edges_path=None):
    """
    Build a graph_engine.DirectedGraph from real crawled edges. If `edges`
    is not supplied, loads them via `load_link_graph_edges(edges_path)`.
    """
    if edges is None:
        edges = load_link_graph_edges(edges_path)
    graph = DirectedGraph()
    for source, target in edges:
        graph.add_edge(source, target)
    log(logging.INFO, 'link_ingestion_built_real_graph',
        n_edges=graph.n_edges(), n_nodes=len(graph.nodes))
    return graph


def diff_with_hierarchy(real_graph, taxonomy_orphans, page_ids):
    """
    Per-page comparison between the real crawled graph and the taxonomy
    graph's orphan set. `link_discrepancy` is True only for pages the
    taxonomy graph does NOT consider orphaned but the real graph shows
    zero real incoming links for — i.e. a page that *should* be reachable
    per the site's own routing structure but, in the bytes actually
    served, is not. This is a strictly additive signal: it never
    contradicts or overrides the existing taxonomy-based `is_orphan` used
    by `recommendation_engine.py` today.
    """
    from .graph_engine import pagerank, orphan_nodes

    has_real_graph = bool(real_graph.nodes)
    ranks = pagerank(real_graph) if has_real_graph else {}
    real_orphans = set(orphan_nodes(real_graph)) if has_real_graph else set()

    result = {}
    for page_id in page_ids:
        real_is_orphan = page_id in real_orphans or page_id not in real_graph.nodes
        taxonomy_is_orphan = page_id in taxonomy_orphans
        result[page_id] = {
            'real_in_degree': real_graph.in_degree(page_id) if page_id in real_graph.nodes else 0,
            'real_pagerank': ranks.get(page_id, 0.0),
            'real_is_orphan': real_is_orphan,
            'link_discrepancy': (real_is_orphan and not taxonomy_is_orphan) if has_real_graph else False,
        }
    return result
