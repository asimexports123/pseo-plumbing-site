import unittest

from ..graph_engine import (
    DirectedGraph, pagerank, hits, degree_centrality,
    betweenness_centrality, orphan_nodes, weakly_connected_components,
)


class TestPageRank(unittest.TestCase):
    def test_pagerank_sums_to_one(self):
        g = DirectedGraph()
        g.add_edge('A', 'B')
        g.add_edge('B', 'C')
        g.add_edge('C', 'A')
        g.add_edge('A', 'C')
        ranks = pagerank(g)
        self.assertAlmostEqual(sum(ranks.values()), 1.0, places=6)

    def test_pagerank_empty_graph(self):
        g = DirectedGraph()
        self.assertEqual(pagerank(g), {})

    def test_pagerank_symmetric_cycle_is_uniform(self):
        # A simple directed cycle A->B->C->A should yield equal PageRank
        # for all three nodes by symmetry.
        g = DirectedGraph()
        g.add_edge('A', 'B')
        g.add_edge('B', 'C')
        g.add_edge('C', 'A')
        ranks = pagerank(g)
        values = list(ranks.values())
        for v in values:
            self.assertAlmostEqual(v, 1 / 3, places=4)

    def test_pagerank_hub_gets_more_rank(self):
        g = DirectedGraph()
        # Many nodes link to 'HUB'
        for i in range(5):
            g.add_edge(f'leaf{i}', 'HUB')
            g.add_edge('HUB', f'leaf{i}')  # keep leaves non-dangling
        ranks = pagerank(g)
        self.assertGreater(ranks['HUB'], ranks['leaf0'])

    def test_dangling_node_does_not_leak_rank(self):
        g = DirectedGraph()
        g.add_edge('A', 'B')
        g.add_node('C')  # dangling: no outgoing edges
        ranks = pagerank(g)
        self.assertAlmostEqual(sum(ranks.values()), 1.0, places=6)


class TestHits(unittest.TestCase):
    def test_hits_normalized(self):
        g = DirectedGraph()
        g.add_edge('hub1', 'auth1')
        g.add_edge('hub1', 'auth2')
        g.add_edge('hub2', 'auth1')
        hub, auth = hits(g)
        norm_hub = sum(v * v for v in hub.values()) ** 0.5
        norm_auth = sum(v * v for v in auth.values()) ** 0.5
        self.assertAlmostEqual(norm_hub, 1.0, places=4)
        self.assertAlmostEqual(norm_auth, 1.0, places=4)
        self.assertGreater(auth['auth1'], auth['auth2'])


class TestCentrality(unittest.TestCase):
    def test_degree_centrality_star_graph(self):
        g = DirectedGraph()
        for i in range(4):
            g.add_edge('center', f'leaf{i}')
        dc = degree_centrality(g)
        self.assertGreater(dc['center'], dc['leaf0'])

    def test_betweenness_centrality_path_graph(self):
        # A -> B -> C: B lies on the only shortest path from A to C.
        g = DirectedGraph()
        g.add_edge('A', 'B')
        g.add_edge('B', 'C')
        bc = betweenness_centrality(g)
        self.assertGreater(bc['B'], bc['A'])
        self.assertGreater(bc['B'], bc['C'])


class TestOrphansAndComponents(unittest.TestCase):
    def test_orphan_detection(self):
        g = DirectedGraph()
        g.add_edge('root', 'a')
        g.add_node('isolated')
        orphans = orphan_nodes(g, exclude=['root'])
        self.assertIn('isolated', orphans)
        self.assertNotIn('a', orphans)
        self.assertNotIn('root', orphans)

    def test_weakly_connected_components(self):
        g = DirectedGraph()
        g.add_edge('a', 'b')
        g.add_edge('c', 'd')  # separate component
        components = weakly_connected_components(g)
        self.assertEqual(len(components), 2)
        sizes = sorted(len(c) for c in components)
        self.assertEqual(sizes, [2, 2])

    def test_single_component_when_fully_connected(self):
        g = DirectedGraph()
        g.add_edge('a', 'b')
        g.add_edge('b', 'c')
        components = weakly_connected_components(g)
        self.assertEqual(len(components), 1)


if __name__ == '__main__':
    unittest.main()
