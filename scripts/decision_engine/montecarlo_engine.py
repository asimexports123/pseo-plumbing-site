"""
Monte Carlo Simulation Engine.

Purpose
-------
Answer forward-looking, uncertainty-aware questions such as "if we publish
N new pages of a given cluster, how many calls could result?" by drawing
repeated samples from the *actual* Bayesian posteriors already learned by
bayesian_engine.py (never from invented constants), propagating them
through the funnel structure produced by markov_engine.py, and reporting
the full outcome distribution (expected/worst/best/confidence interval)
rather than a single point estimate.

Inputs
------
- `n_new_pages` (int): how many new pages to simulate.
- `impressions_per_page_sampler`: a zero-arg callable returning one sampled
  monthly-impressions value for a single new page. Callers should build
  this from their *own* observed empirical distribution (e.g. bootstrap
  resampling from existing pages in the same cluster) — this engine does
  not assume any particular distribution shape.
- `ctr_posterior`, `call_cvr_posterior`, `approval_rate_posterior`: each
  either a `bayesian_engine.PosteriorSummary` (this engine reads its
  `.alpha`/`.beta` to sample from the *exact* posterior via
  `random.betavariate`) or a plain (alpha, beta) tuple.
- `n_simulations` (int, default config.MC_DEFAULT_SIMULATIONS)
- `seed` (int, default config.MC_DEFAULT_SEED) — every simulation run with
  the same seed and inputs is bit-for-bit reproducible, per the
  requirement that "everything should be reproducible with configurable
  simulation count."

Outputs
-------
`SimulationResult`:
    n_simulations, seed
    expected_calls, worst_case_calls, best_case_calls
    ci_low, ci_high, ci_level
    expected_approved_calls, ci_low_approved, ci_high_approved
    raw_samples (optional, only if `keep_samples=True`) for downstream
    inspection/plotting.

Mathematics used
-----------------
For each of `n_simulations` independent trials:
    impressions_p        ~ impressions_per_page_sampler()   (per page)
    ctr_p                ~ Beta(alpha_ctr, beta_ctr)
    clicks_p             ~ Binomial(impressions_p, ctr_p)
    call_cvr_p           ~ Beta(alpha_cvr, beta_cvr)
    calls_p              ~ Binomial(clicks_p, call_cvr_p)
    approval_rate_p      ~ Beta(alpha_appr, beta_appr)
    approved_calls_p     ~ Binomial(calls_p, approval_rate_p)
    total_calls_trial    = sum over the n_new_pages pages
    total_approved_trial = sum over the n_new_pages pages

Binomial(n, p) sampling is implemented via the standard sum-of-Bernoulli
definition for small n and a normal approximation with continuity
correction for large n (n * p * (1-p) > 100), consistent with standard
Monte Carlo practice, purely for performance — both paths sample from the
same underlying Binomial distribution.

Aggregation across trials:
    expected  = arithmetic mean of the trial totals
    worst     = min of the trial totals
    best      = max of the trial totals
    [ci_low, ci_high] = [numerics.percentile(sorted_totals, 100*(1-level)/2),
                          numerics.percentile(sorted_totals, 100*(1+level)/2)]
                  i.e. the empirical percentile interval of the simulated
                  distribution — no normality assumption.

Computational complexity
-------------------------
O(n_simulations * n_new_pages) sampling operations, each O(1) amortized
(Beta and Binomial sampling are O(1) or O(sqrt(n)) via Python's `random`
module). For n_simulations=10,000 and n_new_pages=500, this is 5,000,000
elementary operations — sub-second in CPython for the Binomial-normal-
approximation path, a few seconds for the exact sum-of-Bernoulli path;
the threshold is set automatically per trial (see `_sample_binomial`).

Future extensions
------------------
- Correlated sampling across pages within the same cluster/day (currently
  each page's draws are independent, which understates variance if there
  are cluster-wide shocks e.g. a Google algorithm update affecting all
  pages simultaneously) — this is exactly the role of the Trust Layer
  (Epic E) and BOCPD changepoint monitor (Epic F) in the broader plan.
- Revenue simulation once a confirmed dollars-per-approved-call figure is
  available from Marketcall payout data (see marketcall_client.py) —
  currently only call/approved-call *counts* are simulated, since no
  revenue-per-call field has been confirmed live.
"""
import math
import random
from dataclasses import dataclass, field

from . import config
from .logging_utils import traced
from .numerics import percentile


def _alpha_beta(posterior):
    """Accept either a bayesian_engine.PosteriorSummary or an (alpha, beta) tuple."""
    if hasattr(posterior, 'alpha') and hasattr(posterior, 'beta'):
        return posterior.alpha, posterior.beta
    alpha, beta = posterior
    return alpha, beta


def _sample_binomial(rng, n, p):
    """
    Sample one draw from Binomial(n, p).
    Exact sum-of-Bernoulli for small n*p*(1-p); normal approximation with
    continuity correction otherwise (standard Monte Carlo practice for
    performance — see module docstring).
    """
    n = int(round(n))
    if n <= 0:
        return 0
    p = min(max(p, 0.0), 1.0)
    variance = n * p * (1 - p)
    if variance <= 100:
        return sum(1 for _ in range(n) if rng.random() < p)
    mean = n * p
    sample = rng.gauss(mean, math.sqrt(variance))
    return max(0, min(n, int(round(sample))))


@dataclass
class SimulationResult:
    n_simulations: int
    seed: int
    n_new_pages: int
    expected_calls: float
    worst_case_calls: int
    best_case_calls: int
    ci_low: float
    ci_high: float
    ci_level: float
    expected_approved_calls: float
    ci_low_approved: float
    ci_high_approved: float
    raw_call_samples: list = field(default_factory=list, repr=False)
    raw_approved_samples: list = field(default_factory=list, repr=False)

    def to_dict(self, include_raw_samples=False):
        d = {
            'n_simulations': self.n_simulations, 'seed': self.seed,
            'n_new_pages': self.n_new_pages,
            'expected_calls': self.expected_calls,
            'worst_case_calls': self.worst_case_calls,
            'best_case_calls': self.best_case_calls,
            'ci_low': self.ci_low, 'ci_high': self.ci_high, 'ci_level': self.ci_level,
            'expected_approved_calls': self.expected_approved_calls,
            'ci_low_approved': self.ci_low_approved, 'ci_high_approved': self.ci_high_approved,
        }
        if include_raw_samples:
            d['raw_call_samples'] = self.raw_call_samples
            d['raw_approved_samples'] = self.raw_approved_samples
        return d


@traced('montecarlo_engine')
def simulate_new_page_calls(
    n_new_pages,
    impressions_per_page_sampler,
    ctr_posterior,
    call_cvr_posterior,
    approval_rate_posterior,
    n_simulations=None,
    seed=None,
    ci_level=None,
    keep_samples=False,
):
    n_simulations = n_simulations if n_simulations is not None else config.MC_DEFAULT_SIMULATIONS
    seed = seed if seed is not None else config.MC_DEFAULT_SEED
    ci_level = ci_level if ci_level is not None else config.DEFAULT_CI_LEVEL

    if n_new_pages < 0:
        raise ValueError('n_new_pages must be >= 0')
    if n_simulations < 1:
        raise ValueError('n_simulations must be >= 1')

    rng = random.Random(seed)  # explicit, isolated RNG instance -> reproducible
    a_ctr, b_ctr = _alpha_beta(ctr_posterior)
    a_cvr, b_cvr = _alpha_beta(call_cvr_posterior)
    a_appr, b_appr = _alpha_beta(approval_rate_posterior)

    call_totals = []
    approved_totals = []

    for _ in range(n_simulations):
        trial_calls = 0
        trial_approved = 0
        for _page in range(n_new_pages):
            impressions = max(0.0, impressions_per_page_sampler())
            ctr = rng.betavariate(a_ctr, b_ctr)
            clicks = _sample_binomial(rng, impressions, ctr)
            call_cvr = rng.betavariate(a_cvr, b_cvr)
            calls = _sample_binomial(rng, clicks, call_cvr)
            approval_rate = rng.betavariate(a_appr, b_appr)
            approved = _sample_binomial(rng, calls, approval_rate)
            trial_calls += calls
            trial_approved += approved
        call_totals.append(trial_calls)
        approved_totals.append(trial_approved)

    sorted_calls = sorted(call_totals)
    sorted_approved = sorted(approved_totals)
    tail = (1.0 - ci_level) / 2.0

    return SimulationResult(
        n_simulations=n_simulations, seed=seed, n_new_pages=n_new_pages,
        expected_calls=sum(call_totals) / n_simulations,
        worst_case_calls=sorted_calls[0],
        best_case_calls=sorted_calls[-1],
        ci_low=percentile(sorted_calls, 100 * tail),
        ci_high=percentile(sorted_calls, 100 * (1 - tail)),
        ci_level=ci_level,
        expected_approved_calls=sum(approved_totals) / n_simulations,
        ci_low_approved=percentile(sorted_approved, 100 * tail),
        ci_high_approved=percentile(sorted_approved, 100 * (1 - tail)),
        raw_call_samples=call_totals if keep_samples else [],
        raw_approved_samples=approved_totals if keep_samples else [],
    )


def empirical_bootstrap_sampler(observed_values, seed=None):
    """
    Helper: build an `impressions_per_page_sampler` (or any per-page metric
    sampler) that draws with replacement from a caller-supplied list of
    *observed* values (e.g. impressions of existing pages in the same
    cluster). This is how new-page projections stay grounded in real data
    instead of an assumed distribution family.
    """
    if not observed_values:
        raise ValueError('observed_values must be non-empty')
    rng = random.Random(seed)

    def sampler():
        return rng.choice(observed_values)

    return sampler
