"""
Feature flags and defaults for the Decision Intelligence Engine.

Purpose
-------
Every module in this package must be independently enable-able/disable-able
without code changes, and must default to OFF so that installing this
package causes zero behavior change to production until a human explicitly
flips a flag. This is the single source of truth for that gating.

Inputs
------
Environment variables (all optional; all default to disabled/safe values):
    DECISION_ENGINE_ENABLE_BAYESIAN
    DECISION_ENGINE_ENABLE_MARKOV
    DECISION_ENGINE_ENABLE_MONTECARLO
    DECISION_ENGINE_ENABLE_GRAPH
    DECISION_ENGINE_ENABLE_OPPORTUNITY_SCORE
    DECISION_ENGINE_ENABLE_RECOMMENDATION
    DECISION_ENGINE_ENABLE_LINK_GRAPH
    DECISION_ENGINE_ENABLE_DECISION_STORE
    DECISION_ENGINE_ENABLE_LEARNING_LOOP
    DECISION_ENGINE_ENABLE_DASHBOARD
    DECISION_ENGINE_LOG_LEVEL          (default INFO)
    DECISION_ENGINE_STATE_DIR          (default scripts/decision_engine/state)
    DECISION_ENGINE_MC_SIMULATIONS     (default 10000)
    DECISION_ENGINE_MC_SEED            (default 42 — reproducibility)
    DECISION_ENGINE_CI_LEVEL           (default 0.95)

Outputs
-------
`is_enabled(name)` -> bool
`FLAG_NAMES` -> tuple of recognized flag names (for CLI/status reporting)

Mathematics used
-----------------
None (configuration only).

Computational complexity
-------------------------
O(1) per lookup.

Future extensions
------------------
- Move flags into a versioned DB table (utility_weights-style) once a
  Governance/admin UI exists (Epic M in the broader Autonomous OS plan),
  so flags can be flipped without a redeploy.
"""
import os
from pathlib import Path

PACKAGE_DIR = Path(__file__).parent

FLAG_NAMES = (
    'bayesian',
    'markov',
    'montecarlo',
    'graph',
    'opportunity_score',
    'recommendation',
    'link_graph',
    'decision_store',
    'learning_loop',
    'dashboard',
    'marketcall',
    'attribution',
    'ga4',
    'learning',
)


def is_enabled(name):
    """
    Return True only if DECISION_ENGINE_ENABLE_<NAME> is explicitly set to
    a truthy string ('1', 'true', 'yes', 'on', case-insensitive).
    Unknown names raise ValueError (fail loud, never silently allow a typo
    to disable a module unexpectedly).
    """
    if name not in FLAG_NAMES:
        raise ValueError(f'Unknown feature flag: {name!r}. Known flags: {FLAG_NAMES}')
    env_name = f'DECISION_ENGINE_ENABLE_{name.upper()}'
    return os.environ.get(env_name, '').strip().lower() in ('1', 'true', 'yes', 'on')


def all_flag_status():
    return {name: is_enabled(name) for name in FLAG_NAMES}


LOG_LEVEL = os.environ.get('DECISION_ENGINE_LOG_LEVEL', 'INFO')

STATE_DIR = Path(os.environ.get('DECISION_ENGINE_STATE_DIR', str(PACKAGE_DIR / 'state')))

# Monte Carlo defaults. The simulation count and seed are operational
# parameters (how precise / how reproducible), not business weights —
# they do not influence *what* is computed, only how many samples are
# drawn and whether repeated runs are bit-for-bit identical.
MC_DEFAULT_SIMULATIONS = int(os.environ.get('DECISION_ENGINE_MC_SIMULATIONS', '10000'))
MC_DEFAULT_SEED = int(os.environ.get('DECISION_ENGINE_MC_SEED', '42'))

# Credible-interval / confidence-interval level used throughout (Bayesian
# posteriors, Monte Carlo percentile intervals). 0.95 is the conventional
# statistical default (95% central interval), not a business weight.
DEFAULT_CI_LEVEL = float(os.environ.get('DECISION_ENGINE_CI_LEVEL', '0.95'))

# Standard, uninformative Beta(1,1) prior == Laplace smoothing == uniform
# prior over [0,1]. This is a well-known statistical convention (Laplace's
# rule of succession), not a business-derived weight. It is used as the
# *default* prior only; any module updating an existing posterior uses the
# previous posterior as the new prior (true sequential Bayesian updating).
LAPLACE_PRIOR_ALPHA = 1.0
LAPLACE_PRIOR_BETA = 1.0

# Conventional PageRank damping factor from Brin & Page (1998), "The
# Anatomy of a Large-Scale Hypertextual Web Search Engine". Standard
# literature default, not a business weight. Configurable per-call.
PAGERANK_DEFAULT_DAMPING = 0.85
PAGERANK_DEFAULT_MAX_ITER = 100
PAGERANK_DEFAULT_TOLERANCE = 1e-10

# Decision-store (Phase 2) and learning-loop (Phase 3) defaults. The DB path
# lives under STATE_DIR alongside bayesian_state.json for consistency. The
# evaluation window is an operational parameter (how long to wait before
# judging an outcome), not a statistical weight — 30 days is chosen because
# it is the same window GSC's own UI defaults to for trend comparison.
DECISION_STORE_DB_PATH = Path(os.environ.get('DECISION_ENGINE_STORE_PATH', str(STATE_DIR / 'decisions.sqlite3')))
LEARNING_LOOP_EVALUATION_WINDOW_DAYS = int(os.environ.get('DECISION_ENGINE_EVAL_WINDOW_DAYS', '30'))
