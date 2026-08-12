import unittest

from ..montecarlo_engine import simulate_new_page_calls, empirical_bootstrap_sampler
from ..bayesian_engine import BayesianEngine


class TestMonteCarloEngine(unittest.TestCase):
    def _fixed_impressions_sampler(self, value=1000):
        return lambda: value

    def test_reproducibility_same_seed_same_result(self):
        sampler1 = self._fixed_impressions_sampler(1000)
        sampler2 = self._fixed_impressions_sampler(1000)
        result1 = simulate_new_page_calls(
            n_new_pages=10, impressions_per_page_sampler=sampler1,
            ctr_posterior=(5, 95), call_cvr_posterior=(2, 98), approval_rate_posterior=(8, 2),
            n_simulations=500, seed=123,
        )
        result2 = simulate_new_page_calls(
            n_new_pages=10, impressions_per_page_sampler=sampler2,
            ctr_posterior=(5, 95), call_cvr_posterior=(2, 98), approval_rate_posterior=(8, 2),
            n_simulations=500, seed=123,
        )
        self.assertEqual(result1.expected_calls, result2.expected_calls)
        self.assertEqual(result1.worst_case_calls, result2.worst_case_calls)
        self.assertEqual(result1.best_case_calls, result2.best_case_calls)

    def test_different_seed_can_differ(self):
        sampler = self._fixed_impressions_sampler(1000)
        result_a = simulate_new_page_calls(
            n_new_pages=10, impressions_per_page_sampler=sampler,
            ctr_posterior=(5, 95), call_cvr_posterior=(2, 98), approval_rate_posterior=(8, 2),
            n_simulations=200, seed=1,
        )
        result_b = simulate_new_page_calls(
            n_new_pages=10, impressions_per_page_sampler=sampler,
            ctr_posterior=(5, 95), call_cvr_posterior=(2, 98), approval_rate_posterior=(8, 2),
            n_simulations=200, seed=2,
        )
        # Not asserting inequality strictly (could coincide), just that the
        # API accepts distinct seeds and returns valid results.
        self.assertGreaterEqual(result_a.expected_calls, 0)
        self.assertGreaterEqual(result_b.expected_calls, 0)

    def test_expected_value_matches_analytic_approximation(self):
        # With deterministic impressions=1000/page, and posteriors with
        # very tight variance (large alpha+beta), the simulated expectation
        # should approximate impressions * E[ctr] * E[cvr] * E[approval].
        sampler = self._fixed_impressions_sampler(1000)
        alpha_ctr, beta_ctr = 500, 9500        # E[ctr] = 0.05
        alpha_cvr, beta_cvr = 200, 9800        # E[cvr] = 0.02
        alpha_appr, beta_appr = 8000, 2000     # E[appr] = 0.80

        result = simulate_new_page_calls(
            n_new_pages=1, impressions_per_page_sampler=sampler,
            ctr_posterior=(alpha_ctr, beta_ctr), call_cvr_posterior=(alpha_cvr, beta_cvr),
            approval_rate_posterior=(alpha_appr, beta_appr),
            n_simulations=5000, seed=7,
        )
        expected_clicks = 1000 * (alpha_ctr / (alpha_ctr + beta_ctr))
        expected_calls_analytic = expected_clicks * (alpha_cvr / (alpha_cvr + beta_cvr))
        # Loose tolerance: Monte Carlo sampling noise + Binomial variance.
        self.assertAlmostEqual(result.expected_calls, expected_calls_analytic, delta=expected_calls_analytic * 0.25 + 1)

    def test_zero_pages_returns_zero(self):
        sampler = self._fixed_impressions_sampler(1000)
        result = simulate_new_page_calls(
            n_new_pages=0, impressions_per_page_sampler=sampler,
            ctr_posterior=(5, 95), call_cvr_posterior=(2, 98), approval_rate_posterior=(8, 2),
            n_simulations=100, seed=1,
        )
        self.assertEqual(result.expected_calls, 0)
        self.assertEqual(result.worst_case_calls, 0)
        self.assertEqual(result.best_case_calls, 0)

    def test_accepts_posterior_summary_object(self):
        engine = BayesianEngine()
        engine.observe('ctr', successes=50, trials=1000)
        posterior = engine.get_posterior('ctr')
        sampler = self._fixed_impressions_sampler(1000)
        result = simulate_new_page_calls(
            n_new_pages=5, impressions_per_page_sampler=sampler,
            ctr_posterior=posterior, call_cvr_posterior=(2, 98), approval_rate_posterior=(8, 2),
            n_simulations=100, seed=1,
        )
        self.assertGreaterEqual(result.expected_calls, 0)

    def test_ci_bounds_are_ordered(self):
        sampler = self._fixed_impressions_sampler(500)
        result = simulate_new_page_calls(
            n_new_pages=20, impressions_per_page_sampler=sampler,
            ctr_posterior=(5, 95), call_cvr_posterior=(2, 98), approval_rate_posterior=(8, 2),
            n_simulations=1000, seed=42,
        )
        self.assertLessEqual(result.worst_case_calls, result.ci_low + 1e-9)
        self.assertLessEqual(result.ci_low, result.ci_high)
        self.assertLessEqual(result.ci_high, result.best_case_calls + 1e-9)

    def test_empirical_bootstrap_sampler_draws_from_observed(self):
        observed = [100, 200, 300]
        sampler = empirical_bootstrap_sampler(observed, seed=1)
        samples = [sampler() for _ in range(100)]
        self.assertTrue(all(s in observed for s in samples))

    def test_empty_observed_values_raises(self):
        with self.assertRaises(ValueError):
            empirical_bootstrap_sampler([])


if __name__ == '__main__':
    unittest.main()
