import unittest

from ..markov_engine import analyze_funnel


class TestMarkovEngine(unittest.TestCase):
    def test_basic_funnel(self):
        result = analyze_funnel([
            ('impression', 10000),
            ('click', 400),
            ('landing_page', 390),
            ('call', 18),
            ('approved_call', 14),
            ('revenue', 14),
        ])
        self.assertEqual(result.stages, ['impression', 'click', 'landing_page', 'call', 'approved_call', 'revenue'])
        self.assertEqual(len(result.transition_matrix), 5)
        # click -> landing_page should have the smallest drop (390/400 ~ high transition)
        # call -> approved_call has the largest absolute+rate loss relative to volume among small counts
        self.assertTrue(0 <= result.expected_conversion_path <= 1)

    def test_perfect_conversion_approaches_one_not_exactly(self):
        # Laplace smoothing means even a "perfect" observed funnel has
        # transition probability strictly less than 1 (honest uncertainty
        # given finite sample size).
        result = analyze_funnel([('a', 100), ('b', 100)])
        self.assertLess(result.transition_matrix[0].p, 1.0)
        self.assertGreater(result.transition_matrix[0].p, 0.9)

    def test_zero_at_a_stage_does_not_crash(self):
        result = analyze_funnel([('a', 100), ('b', 0), ('c', 0)])
        self.assertEqual(result.transition_matrix[0].p, 1 / 102)
        self.assertAlmostEqual(result.expected_conversion_path, (1 / 102) * (1 / 2))

    def test_highest_loss_step_identification(self):
        result = analyze_funnel([
            ('a', 1000), ('b', 900), ('c', 100), ('d', 90),
        ])
        # b->c loses the most in absolute terms (800) and by rate.
        self.assertEqual(result.highest_loss_step_by_absolute.from_stage, 'b')
        self.assertEqual(result.highest_loss_step_by_rate.from_stage, 'b')

    def test_increasing_counts_raise_value_error(self):
        with self.assertRaises(ValueError):
            analyze_funnel([('a', 10), ('b', 20)])

    def test_negative_counts_raise(self):
        with self.assertRaises(ValueError):
            analyze_funnel([('a', -5), ('b', 0)])

    def test_requires_at_least_two_stages(self):
        with self.assertRaises(ValueError):
            analyze_funnel([('only_one', 10)])


if __name__ == '__main__':
    unittest.main()
