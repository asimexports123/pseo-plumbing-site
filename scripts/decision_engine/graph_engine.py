"""
Graph Engine.

Purpose
-------
Represent the site (or, per the scalability principle carried over from
docs/YOHOMEFIX_AUTONOMOUS_OS_ENGINEERING_EXECUTION_PLAN_v1.0.md §Epic C,
the cluster-level rollup of the site) as a directed graph and compute the
standard structural-importance metrics used to find under-linked
high-value nodes and single points of failure.

Nodes: pages, cities, states, services, or clusters — the engine is
       generic over the node identifier (any hashable value).
Edges: internal links, hierarchy relationships (state->city, city->service
       page), or any other directed relationship the caller supplies.

Inputs
------
`DirectedGraph.add_edge(source, target, weight=1.0)` — build the graph
incrementally from any edge list (e.g. derived from observed URL path
structure in data_ingestion.py, or from a sitemap crawl).

Outputs
-------
- `pagerank(damping=0.85)` -> {node: score}, scores sum to 1.0.
- `hits()` -> ({node: hub_score}, {node: authority_score}), both L2-normalized.
- `degree_centrality()` -> {node: (in_degree + out_degree) / (n - 1)}.
- `betweenness_centrality()` -> {node: score}, Brandes' algorithm, exact.
- `orphan_nodes(exclude=())` -> nodes with in-degree 0, excluding any
  caller-designated root nodes (e.g. the homepage, which legitimately has
  in-degree 0 from *internal* links while still being reachable).
- `weakly_connected_components()` -> list of node sets; any component that
  is not the single largest one is a "weak cluster" (structurally isolated
  from the main site graph — a real defensibility/indexability risk).

Mathematics used
-----------------
PageRank (Brin & Page, 1998): iterative power method solving
    PR(v) = (1-d)/N + d * sum_{u in in_neighbors(v)} PR(u) / out_degree(u)
until L1 change between iterations < tolerance or max_iter reached.
Dangling nodes (out_degree = 0) redistribute their rank uniformly across
all nodes, per the standard formulation (otherwise total rank leaks out
of the system and stops summing to 1).

HITS (Kleinberg, 1999): iterative mutual reinforcement
    authority(v) = sum_{u -> v} hub(u)
    hub(v)       = sum_{v -> w} authority(w)
followed by L2 normalization each iteration, until convergence.

Degree centrality: (in_degree(v) + out_degree(v)) / (N - 1), the standard
normalized definition (Freeman, 1979).

Betweenness centrality: Brandes' algorithm (Brandes, 2001), O(VE) exact
computation of
    C_B(v) = sum_{s != v != t} sigma_st(v) / sigma_st
where sigma_st is the number of shortest paths from s to t and sigma_st(v)
is the number of those passing through v.

Weakly connected components: standard BFS/union-find over the
undirected view of the graph.

Computational complexity
-------------------------
- pagerank: O(max_iter * E)
- hits: O(max_iter * E)
- degree_centrality: O(V + E)
- betweenness_centrality: O(V * E) (Brandes' algorithm)
- weakly_connected_components: O(V + E)
- orphan_nodes: O(V)

For a cluster-level graph (hundreds to low thousands of nodes, per the
scalability principle), all of the above run in well under a second in
pure Python. Betweenness centrality is the only one that could become
slow if ever run at full per-URL scale (422k+ pages) — this is called out
explicitly as a non-goal; run it on the cluster graph, not the page graph.

Future extensions
------------------
- Louvain modularity-based community detection (currently only weak
  connected-components are computed, which is the simplest possible
  notion of "cluster" — anything connected at all, however weakly, counts
  as one component). True Louvain community detection is Epic C3/B2 in
  the broader Autonomous OS plan and is intentionally deferred here rather
  than faked with a shortcut that would be mislabeled as Louvain.
"""
from collections import defaultdict, deque

from . import config
from .logging_utils import traced


class DirectedGraph:
    def __init__(self):
        self._out = defaultdict(dict)  # node -> {neighbor: weight}
        self._in = defaultdict(dict)   # node -> {neighbor: weight}
        self._nodes = set()

    def add_node(self, node):
        self._nodes.add(node)

    def add_edge(self, source, target, weight=1.0):
        self._nodes.add(source)
        self._nodes.add(target)
        self._out[source][target] = self._out[source].get(target, 0.0) + weight
        self._in[target][source] = self._in[target].get(source, 0.0) + weight

    @property
    def nodes(self):
        return list(self._nodes)

    def out_neighbors(self, node):
        return self._out.get(node, {})

    def in_neighbors(self, node):
        return self._in.get(node, {})

    def out_degree(self, node):
        return len(self._out.get(node, {}))

    def in_degree(self, node):
        return len(self._in.get(node, {}))

    def n_edges(self):
        return sum(len(v) for v in self._out.values())


@traced('graph_engine')
def pagerank(graph, damping=None, max_iter=None, tolerance=None):
    damping = damping if damping is not None else config.PAGERANK_DEFAULT_DAMPING
    max_iter = max_iter if max_iter is not None else config.PAGERANK_DEFAULT_MAX_ITER
    tolerance = tolerance if tolerance is not None else config.PAGERANK_DEFAULT_TOLERANCE

    nodes = graph.nodes
    n = len(nodes)
    if n == 0:
        return {}
    rank = {node: 1.0 / n for node in nodes}

    for _ in range(max_iter):
        dangling_mass = sum(rank[node] for node in nodes if graph.out_degree(node) == 0)
        new_rank = {}
        for node in nodes:
            incoming = 0.0
            for src, weight in graph.in_neighbors(node).items():
                out_deg_weight = sum(graph.out_neighbors(src).values())
                if out_deg_weight > 0:
                    incoming += rank[src] * (weight / out_deg_weight)
            new_rank[node] = (1 - damping) / n + damping * (incoming + dangling_mass / n)

        delta = sum(abs(new_rank[node] - rank[node]) for node in nodes)
        rank = new_rank
        if delta < tolerance:
            break

    return rank


@traced('graph_engine')
def hits(graph, max_iter=None, tolerance=None):
    max_iter = max_iter if max_iter is not None else config.PAGERANK_DEFAULT_MAX_ITER
    tolerance = tolerance if tolerance is not None else config.PAGERANK_DEFAULT_TOLERANCE

    nodes = graph.nodes
    n = len(nodes)
    if n == 0:
        return {}, {}
    hub = {node: 1.0 for node in nodes}
    auth = {node: 1.0 for node in nodes}

    for _ in range(max_iter):
        new_auth = {node: sum(hub[src] for src in graph.in_neighbors(node)) for node in nodes}
        norm = (sum(v * v for v in new_auth.values())) ** 0.5 or 1.0
        new_auth = {k: v / norm for k, v in new_auth.items()}

        new_hub = {node: sum(new_auth[dst] for dst in graph.out_neighbors(node)) for node in nodes}
        norm = (sum(v * v for v in new_hub.values())) ** 0.5 or 1.0
        new_hub = {k: v / norm for k, v in new_hub.items()}

        delta = sum(abs(new_hub[n_] - hub[n_]) for n_ in nodes) + \
                sum(abs(new_auth[n_] - auth[n_]) for n_ in nodes)
        hub, auth = new_hub, new_auth
        if delta < tolerance:
            break

    return hub, auth


@traced('graph_engine')
def degree_centrality(graph):
    nodes = graph.nodes
    n = len(nodes)
    if n <= 1:
        return {node: 0.0 for node in nodes}
    return {
        node: (graph.in_degree(node) + graph.out_degree(node)) / (n - 1)
        for node in nodes
    }


def _undirected_neighbors(graph, node):
    neighbors = set(graph.out_neighbors(node).keys())
    neighbors |= set(graph.in_neighbors(node).keys())
    return neighbors


@traced('graph_engine')
def betweenness_centrality(graph):
    """
    Brandes' algorithm (unweighted, treats edges as directed for shortest
    path counting, which is the correct treatment for a link graph where
    A -> B does not imply B -> A is traversable).
    """
    nodes = graph.nodes
    centrality = {node: 0.0 for node in nodes}

    for s in nodes:
        stack = []
        preds = {node: [] for node in nodes}
        sigma = {node: 0.0 for node in nodes}
        sigma[s] = 1.0
        dist = {node: -1 for node in nodes}
        dist[s] = 0
        queue = deque([s])

        while queue:
            v = queue.popleft()
            stack.append(v)
            for w in graph.out_neighbors(v):
                if dist[w] < 0:
                    dist[w] = dist[v] + 1
                    queue.append(w)
                if dist[w] == dist[v] + 1:
                    sigma[w] += sigma[v]
                    preds[w].append(v)

        delta = {node: 0.0 for node in nodes}
        while stack:
            w = stack.pop()
            for v in preds[w]:
                if sigma[w] > 0:
                    delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w])
            if w != s:
                centrality[w] += delta[w]

    return centrality


def orphan_nodes(graph, exclude=()):
    """Nodes with in-degree 0, excluding caller-designated root nodes."""
    exclude = set(exclude)
    return [node for node in graph.nodes if graph.in_degree(node) == 0 and node not in exclude]


@traced('graph_engine')
def weakly_connected_components(graph):
    """
    Returns a list of node sets (weakly connected components), largest
    first. Any component beyond the first is a structurally isolated
    "weak cluster" per the module docstring.
    """
    visited = set()
    components = []
    for start in graph.nodes:
        if start in visited:
            continue
        component = set()
        queue = deque([start])
        visited.add(start)
        while queue:
            node = queue.popleft()
            component.add(node)
            for neighbor in _undirected_neighbors(graph, node):
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        components.append(component)
    components.sort(key=len, reverse=True)
    return components
