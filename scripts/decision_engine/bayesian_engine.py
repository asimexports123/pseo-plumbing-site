"""
Bayesian Learning Engine.

Purpose
-------
Continuously estimate the probability of a binary outcome (e.g. "this page
produced a call", "this city×service produced revenue-bearing approved
call") from YoHomeFix's own observed counts, using a Beta-Binomial
conjugate Bayesian model. Replaces any fixed/hardcoded conversion-rate
assumption with a value that (a) starts at an uninformative prior, (b)
updates exactly as more data arrives, and (c) always carries an honest
uncertainty interval — critical when some clusters have 10,000 impressions
and others have 12.

Examples this engine is designed for (caller supplies the observations;
this engine has no knowledge of "pages" or "cities" — it is a generic
named-rate tracker):
    page   -> call probability   (trials=impressions or clicks, successes=calls)
    city   -> call probability
    state  -> revenue probability (trials=calls, successes=revenue-bearing calls)
    service-> conversion probability

Inputs
------
- `key` (str): arbitrary identifier for the thing being tracked
  (e.g. 'page:/plumber-austin-tx/emergency', 'city:austin-tx',
  'state:tx', 'service:emergency').
- `successes` (int >= 0), `trials` (int >= successes): one batch of
  observed outcomes to fold into the posterior.
- Prior: defaults to Beta(1, 1) (uniform / Laplace's rule of succession —
  see config.LAPLACE_PRIOR_ALPHA/BETA) the first time a key is seen.
  Every subsequent update treats the *current posterior* as the new prior
  (true sequential Bayesian updating — order of batches does not matter
  because Beta-Binomial updating is commutative: the final posterior only
  depends on total successes/failures, not the order they arrived in).

Outputs
-------
`PosteriorSummary` per key:
    alpha, beta            posterior Beta parameters
    n_obs                  total trials folded in so far
    mean                   posterior mean = alpha / (alpha + beta)
    mode                   posterior mode (undefined/None if alpha,beta <= 1)
    ci_low, ci_high        credible interval at config.DEFAULT_CI_LEVEL
    ci_level               the interval level used (e.g. 0.95)

Mathematics used
-----------------
Beta-Binomial conjugacy:
    Prior:      theta ~ Beta(alpha0, beta0)
    Likelihood: successes ~ Binomial(trials, theta)
    Posterior:  theta | data ~ Beta(alpha0 + successes, beta0 + trials - successes)

Posterior mean:  E[theta] = alpha / (alpha + beta)
Posterior mode:  (alpha - 1) / (alpha + beta - 2), for alpha, beta > 1
Credible interval: [Beta_ppf((1-level)/2, alpha, beta),
                     Beta_ppf((1+level)/2, alpha, beta)]
                    i.e. the exact central credible interval, computed via
                    the incomplete-beta inversion in numerics.beta_ppf
                    (no normal approximation, exact for any alpha, beta).

Laplace smoothing is exactly the Beta(1,1) prior case: with alpha0=beta0=1,
the posterior mean is (successes + 1) / (trials + 2), which is the
classic Laplace's rule of succession.

Computational complexity
-------------------------
O(1) per observe() call (dict update). O(log(1/tol)) for each credible
interval computation (bisection in numerics.beta_ppf).

Future extensions
------------------
- Hierarchical shrinkage across clusters (partial pooling: cluster
  posteriors as a Beta-Binomial hierarchical model with a learned
  population-level prior instead of a fixed Beta(1,1)) — this is exactly
  Epic D1/D2 in the broader Autonomous OS Engineering Execution Plan
  (docs/YOHOMEFIX_AUTONOMOUS_OS_ENGINEERING_EXECUTION_PLAN_v1.0.md §2-3).
- Confounder-adjusted regression instead of a flat per-key rate (Epic D2).
- Persist state across process runs (see `save`/`load` below) into a real
  table (bayesian_posteriors, per §4 of the same plan) instead of a JSON
  file, once this moves out of shadow mode.
"""
import json
from dataclasses import dataclass, asdict
from pathlib import Path

from . import config
from .logging_utils import traced, log
from .numerics import beta_ppf
import logging


@dataclass
class PosteriorSummary:
    key: str
    alpha: float
    beta: float
    n_obs: int
    mean: float
    mode: float | None
    ci_low: float
    ci_high: float
    ci_level: float

    def to_dict(self):
        return asdict(self)


def _posterior_mean(alpha, beta):
    return alpha / (alpha + beta)


def _posterior_mode(alpha, beta):
    if alpha > 1 and beta > 1:
        return (alpha - 1) / (alpha + beta - 2)
    return None


def _credible_interval(alpha, beta, level):
    tail = (1.0 - level) / 2.0
    lo = beta_ppf(tail, alpha, beta)
    hi = beta_ppf(1.0 - tail, alpha, beta)
    return lo, hi


def posterior_from_counts(successes, trials, prior_alpha=None, prior_beta=None, ci_level=None):
    """
    One-off (non-persisted) posterior for a single (successes, trials)
    observation pair, using the exact same Beta-Binomial conjugate update
    as `BayesianEngine.observe`, without needing a keyed, stateful engine
    instance. Used where a caller has a single snapshot count pair and
    needs an evidence-weighted mean/credible-interval from it directly
    (e.g. recommendation_engine.py deriving a per-page confidence/impact
    estimate from that page's own impressions/clicks/calls counts, with no
    cross-run history to track).
    """
    if trials < 0 or successes < 0:
        raise ValueError('successes and trials must be >= 0')
    if successes > trials:
        raise ValueError(f'successes ({successes}) cannot exceed trials ({trials})')
    prior_alpha = prior_alpha if prior_alpha is not None else config.LAPLACE_PRIOR_ALPHA
    prior_beta = prior_beta if prior_beta is not None else config.LAPLACE_PRIOR_BETA
    ci_level = ci_level if ci_level is not None else config.DEFAULT_CI_LEVEL
    alpha = prior_alpha + successes
    beta = prior_beta + (trials - successes)
    ci_low, ci_high = _credible_interval(alpha, beta, ci_level)
    return PosteriorSummary(
        key='__ad_hoc__', alpha=alpha, beta=beta, n_obs=trials,
        mean=_posterior_mean(alpha, beta), mode=_posterior_mode(alpha, beta),
        ci_low=ci_low, ci_high=ci_high, ci_level=ci_level,
    )


class BayesianEngine:
    """
    Tracks one independent Beta-Binomial posterior per `key`.

    Not thread-safe by design (single-writer batch-job usage, matching the
    rest of scripts/analytics/'s cron-job execution model). If concurrent
    writers are ever needed, wrap `observe` calls with an external lock.
    """

    def __init__(self, prior_alpha=None, prior_beta=None):
        self.prior_alpha = prior_alpha if prior_alpha is not None else config.LAPLACE_PRIOR_ALPHA
        self.prior_beta = prior_beta if prior_beta is not None else config.LAPLACE_PRIOR_BETA
        self._state = {}  # key -> {'alpha': float, 'beta': float, 'n_obs': int}

    @traced('bayesian_engine')
    def observe(self, key, successes, trials):
        """Fold one batch of (successes, trials) into the posterior for `key`."""
        if trials < 0 or successes < 0:
            raise ValueError('successes and trials must be >= 0')
        if successes > trials:
            raise ValueError(f'successes ({successes}) cannot exceed trials ({trials})')

        if key not in self._state:
            self._state[key] = {'alpha': self.prior_alpha, 'beta': self.prior_beta, 'n_obs': 0}

        entry = self._state[key]
        entry['alpha'] += successes
        entry['beta'] += (trials - successes)
        entry['n_obs'] += trials
        return self.get_posterior(key)

    def get_posterior(self, key, ci_level=None):
        """Return the current PosteriorSummary for `key` (prior if unseen)."""
        ci_level = ci_level if ci_level is not None else config.DEFAULT_CI_LEVEL
        entry = self._state.get(key, {'alpha': self.prior_alpha, 'beta': self.prior_beta, 'n_obs': 0})
        alpha, beta, n_obs = entry['alpha'], entry['beta'], entry['n_obs']
        ci_low, ci_high = _credible_interval(alpha, beta, ci_level)
        return PosteriorSummary(
            key=key, alpha=alpha, beta=beta, n_obs=n_obs,
            mean=_posterior_mean(alpha, beta), mode=_posterior_mode(alpha, beta),
            ci_low=ci_low, ci_high=ci_high, ci_level=ci_level,
        )

    def all_keys(self):
        return list(self._state.keys())

    def rank_by_mean(self, keys=None, descending=True):
        """Rank the given keys (or all tracked keys) by posterior mean."""
        keys = keys if keys is not None else self.all_keys()
        summaries = [self.get_posterior(k) for k in keys]
        return sorted(summaries, key=lambda s: s.mean, reverse=descending)

    def save(self, path=None):
        """Persist state to JSON (interim store — see 'Future extensions')."""
        path = Path(path) if path else (config.STATE_DIR / 'bayesian_state.json')
        path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            'prior_alpha': self.prior_alpha,
            'prior_beta': self.prior_beta,
            'state': self._state,
        }
        path.write_text(json.dumps(payload, indent=2), encoding='utf-8')
        log(logging.INFO, 'bayesian_engine_saved', path=str(path), n_keys=len(self._state))
        return path

    @classmethod
    def load(cls, path=None):
        """Load previously persisted state, or return a fresh engine if none exists."""
        path = Path(path) if path else (config.STATE_DIR / 'bayesian_state.json')
        if not path.exists():
            log(logging.INFO, 'bayesian_engine_load_miss', path=str(path))
            return cls()
        payload = json.loads(path.read_text(encoding='utf-8'))
        engine = cls(prior_alpha=payload['prior_alpha'], prior_beta=payload['prior_beta'])
        engine._state = payload['state']
        log(logging.INFO, 'bayesian_engine_loaded', path=str(path), n_keys=len(engine._state))
        return engine
