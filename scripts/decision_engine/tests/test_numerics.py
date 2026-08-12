import unittest

from ..numerics import regularized_incomplete_beta, beta_ppf, percentile, percentile_rank


class TestRegularizedIncompleteBeta(unittest.TestCase):
    def test_uniform_prior_cdf_is_identity(self):
        # Beta(1,1) is Uniform(0,1); its CDF is F(x) = x exactly.
        for x in (0.0, 0.1, 0.25, 0.5, 0.75, 0.9, 1.0):
            self.assertAlmostEqual(regularized_incomplete_beta(x, 1.0, 1.0), x, places=9)

    def test_symmetric_beta_median_is_half(self):
        # Beta(a, a) is symmetric about 0.5, so CDF(0.5) == 0.5 exactly.
        for a in (2.0, 5.0, 10.0, 50.0):
            self.assertAlmostEqual(regularized_incomplete_beta(0.5, a, a), 0.5, places=9)

    def test_endpoints(self):
        self.assertEqual(regularized_incomplete_beta(0.0, 3.0, 4.0), 0.0)
        self.assertEqual(regularized_incomplete_beta(1.0, 3.0, 4.0), 1.0)

    def test_monotonic_nondecreasing(self):
        xs = [i / 20.0 for i in range(21)]
        cdfs = [regularized_incomplete_beta(x, 3.5, 7.2) for x in xs]
        for i in range(len(cdfs) - 1):
            self.assertLessEqual(cdfs[i], cdfs[i + 1] + 1e-12)

    def test_known_beta_2_3_value(self):
        # CDF of Beta(2,3) at x=0.5 has closed form: I_0.5(2,3) = 0.6875
        # (derivable from the Binomial-tail identity for integer params:
        # I_x(a,b) = P(Binomial(a+b-1, x) >= a)).
        self.assertAlmostEqual(regularized_incomplete_beta(0.5, 2, 3), 0.6875, places=6)


class TestBetaPpf(unittest.TestCase):
    def test_ppf_is_inverse_of_cdf(self):
        for a, b in [(1, 1), (2, 5), (10, 10), (0.5, 0.5)]:
            for p in (0.05, 0.25, 0.5, 0.75, 0.95):
                x = beta_ppf(p, a, b)
                cdf_x = regularized_incomplete_beta(x, a, b)
                self.assertAlmostEqual(cdf_x, p, places=6)

    def test_ppf_endpoints(self):
        self.assertEqual(beta_ppf(0.0, 2, 3), 0.0)
        self.assertEqual(beta_ppf(1.0, 2, 3), 1.0)

    def test_uniform_ppf_is_identity(self):
        for p in (0.1, 0.3, 0.6, 0.9):
            self.assertAlmostEqual(beta_ppf(p, 1.0, 1.0), p, places=6)


class TestPercentile(unittest.TestCase):
    def test_percentile_matches_numpy_linear_convention(self):
        values = [10, 20, 30, 40, 50]
        self.assertAlmostEqual(percentile(values, 0), 10)
        self.assertAlmostEqual(percentile(values, 100), 50)
        self.assertAlmostEqual(percentile(values, 50), 30)
        self.assertAlmostEqual(percentile(values, 25), 20)

    def test_percentile_single_value(self):
        self.assertEqual(percentile([42], 50), 42)


class TestPercentileRank(unittest.TestCase):
    def test_percentile_rank_bounds(self):
        pop = sorted([1, 2, 3, 4, 5])
        self.assertEqual(percentile_rank(pop, 5), 1.0)
        self.assertEqual(percentile_rank(pop, 0), 0.0)
        self.assertEqual(percentile_rank(pop, 3), 0.6)


if __name__ == '__main__':
    unittest.main()
