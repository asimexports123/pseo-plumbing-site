"""
Dependency-free numerical primitives.

Purpose
-------
Provide the small set of numerical building blocks the engines need
(regularized incomplete beta function, its inverse, and percentile/quantile
helpers) without adding a scipy/numpy dependency to a codebase that
currently has none in its Python analytics stack. Every formula here is a
standard, textbook numerical method — nothing is invented.

Inputs / Outputs
-----------------
See each function's docstring.

Mathematics used
-----------------
- `regularized_incomplete_beta(x, a, b)`: I_x(a, b), computed via the
  continued-fraction expansion from Numerical Recipes (Press et al.,
  "Numerical Recipes in C", 3rd ed., §6.4). This is the same algorithm
  scipy.special.betainc uses internally (Cephes library, same continued
  fraction). It is the CDF of the Beta(a, b) distribution.
- `beta_ppf(p, a, b)`: inverse CDF (quantile function) of Beta(a, b),
  found by bisection on the monotonic `regularized_incomplete_beta`
  (bisection is guaranteed to converge for any continuous monotonic CDF).
- `percentile(sorted_values, p)`: linear-interpolation percentile, the
  same convention used by numpy.percentile's default ('linear') method.

Computational complexity
-------------------------
- `regularized_incomplete_beta`: O(k) where k is iterations to converge
  (bounded by MAX_ITERATIONS, typically converges in <100 for any inputs
  encountered here).
- `beta_ppf`: O(log(1/tolerance)) calls to `regularized_incomplete_beta`.
- `percentile`: O(1) given already-sorted input; O(n log n) to sort.

Future extensions
------------------
- Swap in scipy.stats.beta if/when scipy becomes an accepted dependency;
  the public function signatures here are designed to be drop-in
  compatible with scipy.stats.beta.cdf / .ppf.
"""
import math

MAX_ITERATIONS = 200
EPSILON = 1e-14
FPMIN = 1e-300


def _beta_continued_fraction(x, a, b):
    """Lentz's algorithm for the continued fraction part of I_x(a, b)."""
    qab = a + b
    qap = a + 1.0
    qam = a - 1.0
    c = 1.0
    d = 1.0 - qab * x / qap
    if abs(d) < FPMIN:
        d = FPMIN
    d = 1.0 / d
    h = d

    for m in range(1, MAX_ITERATIONS + 1):
        m2 = 2 * m
        aa = m * (b - m) * x / ((qam + m2) * (a + m2))
        d = 1.0 + aa * d
        if abs(d) < FPMIN:
            d = FPMIN
        c = 1.0 + aa / c
        if abs(c) < FPMIN:
            c = FPMIN
        d = 1.0 / d
        h *= d * c

        aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2))
        d = 1.0 + aa * d
        if abs(d) < FPMIN:
            d = FPMIN
        c = 1.0 + aa / c
        if abs(c) < FPMIN:
            c = FPMIN
        d = 1.0 / d
        delta = d * c
        h *= delta
        if abs(delta - 1.0) < EPSILON:
            break
    return h


def regularized_incomplete_beta(x, a, b):
    """
    I_x(a, b) = CDF of Beta(a, b) at x, for a, b > 0 and x in [0, 1].
    Returns P(X <= x) for X ~ Beta(a, b).
    """
    if x < 0.0 or x > 1.0:
        raise ValueError(f'x must be in [0, 1], got {x}')
    if a <= 0 or b <= 0:
        raise ValueError(f'a and b must be > 0, got a={a}, b={b}')
    if x == 0.0 or x == 1.0:
        return x

    ln_beta = math.lgamma(a + b) - math.lgamma(a) - math.lgamma(b)
    front = math.exp(ln_beta + a * math.log(x) + b * math.log(1.0 - x))

    if x < (a + 1.0) / (a + b + 2.0):
        return front * _beta_continued_fraction(x, a, b) / a
    else:
        return 1.0 - front * _beta_continued_fraction(1.0 - x, b, a) / b


def beta_ppf(p, a, b, tolerance=1e-10, max_iter=200):
    """
    Inverse CDF (quantile function) of Beta(a, b) at probability p.
    Found by bisection on regularized_incomplete_beta, which is monotonic
    non-decreasing in x, so bisection is guaranteed to converge.
    """
    if not (0.0 <= p <= 1.0):
        raise ValueError(f'p must be in [0, 1], got {p}')
    if p == 0.0:
        return 0.0
    if p == 1.0:
        return 1.0

    lo, hi = 0.0, 1.0
    for _ in range(max_iter):
        mid = (lo + hi) / 2.0
        cdf_mid = regularized_incomplete_beta(mid, a, b)
        if abs(cdf_mid - p) < tolerance:
            return mid
        if cdf_mid < p:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2.0


def percentile(sorted_values, p):
    """
    Linear-interpolation percentile (numpy.percentile default convention).
    `sorted_values` must already be sorted ascending. `p` in [0, 100].
    """
    if not sorted_values:
        raise ValueError('sorted_values must be non-empty')
    if not (0.0 <= p <= 100.0):
        raise ValueError(f'p must be in [0, 100], got {p}')
    n = len(sorted_values)
    if n == 1:
        return sorted_values[0]
    rank = (p / 100.0) * (n - 1)
    lo_idx = math.floor(rank)
    hi_idx = math.ceil(rank)
    if lo_idx == hi_idx:
        return sorted_values[lo_idx]
    frac = rank - lo_idx
    return sorted_values[lo_idx] * (1 - frac) + sorted_values[hi_idx] * frac


def percentile_rank(sorted_values, value):
    """
    Empirical percentile rank of `value` within `sorted_values` (ascending),
    i.e. the fraction of the population <= value, in [0, 1]. Used by
    opportunity_score.py to normalize raw metrics without any hand-picked
    weight — the population itself defines the scale.
    """
    if not sorted_values:
        raise ValueError('sorted_values must be non-empty')
    n = len(sorted_values)
    # Count of values <= `value`, via binary search (bisect) for O(log n).
    import bisect
    count_le = bisect.bisect_right(sorted_values, value)
    return count_le / n
