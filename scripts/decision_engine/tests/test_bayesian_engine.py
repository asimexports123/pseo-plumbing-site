import unittest

from ..bayesian_engine import BayesianEngine


class TestBayesianEngine(unittest.TestCase):
    def test_default_prior_is_uniform_mean_half(self):
        engine = BayesianEngine()
        posterior = engine.get_posterior('unseen_key')
        self.assertAlmostEqual(posterior.mean, 0.5)
        self.assertEqual(posterior.n_obs, 0)

    def test_laplace_rule_of_succession(self):
        engine = BayesianEngine()
        engine.observe('page:a', successes=0, trials=0)
        posterior = engine.get_posterior('page:a')
        self.assertAlmostEqual(posterior.mean, 0.5)

        engine.observe('page:b', successes=1, trials=1)
        posterior_b = engine.get_posterior('page:b')
        # Laplace's rule of succession: (successes+1)/(trials+2) = 2/3
        self.assertAlmostEqual(posterior_b.mean, 2 / 3)

    def test_sequential_updates_equal_batch_update(self):
        engine_sequential = BayesianEngine()
        engine_sequential.observe('k', successes=3, trials=10)
        engine_sequential.observe('k', successes=2, trials=5)
        posterior_sequential = engine_sequential.get_posterior('k')

        engine_batch = BayesianEngine()
        engine_batch.observe('k', successes=5, trials=15)
        posterior_batch = engine_batch.get_posterior('k')

        self.assertAlmostEqual(posterior_sequential.alpha, posterior_batch.alpha)
        self.assertAlmostEqual(posterior_sequential.beta, posterior_batch.beta)
        self.assertAlmostEqual(posterior_sequential.mean, posterior_batch.mean)

    def test_more_data_narrows_credible_interval(self):
        engine = BayesianEngine()
        engine.observe('small_sample', successes=5, trials=10)
        engine.observe('large_sample', successes=500, trials=1000)

        small = engine.get_posterior('small_sample')
        large = engine.get_posterior('large_sample')

        self.assertAlmostEqual(small.mean, large.mean, places=2)
        small_width = small.ci_high - small.ci_low
        large_width = large.ci_high - large.ci_low
        self.assertLess(large_width, small_width)

    def test_successes_exceeding_trials_raises(self):
        engine = BayesianEngine()
        with self.assertRaises(ValueError):
            engine.observe('bad', successes=10, trials=5)

    def test_save_and_load_roundtrip(self, tmp_path=None):
        import tempfile
        from pathlib import Path
        engine = BayesianEngine()
        engine.observe('page:x', successes=7, trials=20)
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / 'state.json'
            engine.save(path)
            reloaded = BayesianEngine.load(path)
            original = engine.get_posterior('page:x')
            restored = reloaded.get_posterior('page:x')
            self.assertAlmostEqual(original.mean, restored.mean)
            self.assertEqual(original.n_obs, restored.n_obs)

    def test_rank_by_mean(self):
        engine = BayesianEngine()
        engine.observe('low', successes=1, trials=100)
        engine.observe('high', successes=90, trials=100)
        ranked = engine.rank_by_mean()
        self.assertEqual(ranked[0].key, 'high')
        self.assertEqual(ranked[-1].key, 'low')


if __name__ == '__main__':
    unittest.main()
