"""
Markov Transition Engine.

Purpose
-------
Model the YoHomeFix conversion funnel as a discrete-time absorbing Markov
chain over a caller-defined, ordered sequence of stages (the canonical
funnel requested is: Impression -> Click -> Landing Page -> Call ->
Approved Call -> Revenue, but the engine itself is generic over any
ordered stage list so it can also model sub-funnels per cluster/page).

Given observed counts at each stage for a period, this engine computes:
    - the stage-to-stage transition matrix (empirical conditional
      probabilities, Laplace-smoothed)
    - drop-off probability at each step
    - the single highest-loss step (both by absolute count and by rate)
    - the expected end-to-end conversion probability (product of all
      per-step transition probabilities)

Inputs
------
`stage_counts`: an ordered dict/list of (stage_name, count) pairs, e.g.
    [('impression', 10000), ('click', 400), ('landing_page', 390),
     ('call', 18), ('approved_call', 14), ('revenue', 14)]
Counts must be non-increasing along the chain (a later stage cannot have
more occurrences than an earlier one it is downstream of) — this is
validated and raises ValueError if violated, since a violation indicates
a data/attribution bug upstream, not something to silently paper over.

Outputs
-------
`MarkovFunnelResult`:
    stages                 list of stage names, in order
    transition_matrix      list of per-step {'from', 'to', 'p', 'raw_from', 'raw_to'}
    drop_off               list of per-step {'from', 'to', 'drop_off_rate', 'absolute_loss'}
    highest_loss_step_by_rate       the step with max drop_off_rate
    highest_loss_step_by_absolute   the step with max absolute_loss
    expected_conversion_path        product of all per-step transition
                                     probabilities (P(reach final stage |
                                     enter first stage))

Mathematics used
-----------------
For an ordered stage sequence S_0, S_1, ..., S_n with observed counts
c_0, c_1, ..., c_n:

    P(S_i -> S_{i+1}) = (c_{i+1} + 1) / (c_i + 2)     [Laplace-smoothed
                                                        Bernoulli MLE, same
                                                        Beta(1,1)-equivalent
                                                        convention as
                                                        bayesian_engine.py,
                                                        applied here as a
                                                        point estimate
                                                        rather than a full
                                                        posterior, to avoid
                                                        divide-by-zero when
                                                        c_i = 0]

    drop_off_rate_i    = 1 - P(S_i -> S_{i+1})
    absolute_loss_i    = c_i - c_{i+1}
    expected_conversion_path = Product_{i=0}^{n-1} P(S_i -> S_{i+1})
                              = (c_n + smoothing terms) / (c_0 + smoothing terms),
                                computed as the product of smoothed
                                per-step ratios rather than the raw
                                end-to-end ratio, so it stays well-defined
                                even when an intermediate stage has c_i = 0.

Computational complexity
-------------------------
O(n) in the number of stages for both transition-matrix construction and
drop-off analysis.

Future extensions
------------------
- Full transition-matrix formulation with multiple absorbing states (e.g.
  "left site" as an explicit absorbing state at every stage) instead of
  treating drop-off as implicit — needed once per-session clickstream data
  (not just stage totals) is available.
- Time-inhomogeneous transitions (different matrices per day-of-week or
  per traffic source) once enough volume exists to estimate them reliably.
"""
from dataclasses import dataclass

from .logging_utils import traced


@dataclass
class StepTransition:
    from_stage: str
    to_stage: str
    p: float
    raw_from_count: float
    raw_to_count: float


@dataclass
class StepDropOff:
    from_stage: str
    to_stage: str
    drop_off_rate: float
    absolute_loss: float


@dataclass
class MarkovFunnelResult:
    stages: list
    transition_matrix: list
    drop_off: list
    highest_loss_step_by_rate: StepDropOff
    highest_loss_step_by_absolute: StepDropOff
    expected_conversion_path: float

    def to_dict(self):
        return {
            'stages': self.stages,
            'transition_matrix': [t.__dict__ for t in self.transition_matrix],
            'drop_off': [d.__dict__ for d in self.drop_off],
            'highest_loss_step_by_rate': self.highest_loss_step_by_rate.__dict__,
            'highest_loss_step_by_absolute': self.highest_loss_step_by_absolute.__dict__,
            'expected_conversion_path': self.expected_conversion_path,
        }


@traced('markov_engine')
def analyze_funnel(stage_counts):
    """
    stage_counts: list of (stage_name, count) tuples, ordered from the
    top of the funnel to the bottom. Returns a MarkovFunnelResult.
    """
    if len(stage_counts) < 2:
        raise ValueError('stage_counts must contain at least 2 stages')

    stages = [s for s, _ in stage_counts]
    counts = [float(c) for _, c in stage_counts]

    for c in counts:
        if c < 0:
            raise ValueError('stage counts must be >= 0')
    for i in range(len(counts) - 1):
        if counts[i + 1] > counts[i]:
            raise ValueError(
                f"Stage '{stages[i + 1]}' count ({counts[i + 1]}) exceeds "
                f"upstream stage '{stages[i]}' count ({counts[i]}) — this "
                "indicates a data/attribution bug and is not silently "
                "corrected."
            )

    transitions = []
    drop_offs = []
    for i in range(len(counts) - 1):
        c_from, c_to = counts[i], counts[i + 1]
        p = (c_to + 1.0) / (c_from + 2.0)  # Laplace-smoothed conditional MLE
        transitions.append(StepTransition(
            from_stage=stages[i], to_stage=stages[i + 1],
            p=p, raw_from_count=c_from, raw_to_count=c_to,
        ))
        drop_offs.append(StepDropOff(
            from_stage=stages[i], to_stage=stages[i + 1],
            drop_off_rate=1.0 - p, absolute_loss=c_from - c_to,
        ))

    highest_by_rate = max(drop_offs, key=lambda d: d.drop_off_rate)
    highest_by_absolute = max(drop_offs, key=lambda d: d.absolute_loss)

    expected_conversion = 1.0
    for t in transitions:
        expected_conversion *= t.p

    return MarkovFunnelResult(
        stages=stages,
        transition_matrix=transitions,
        drop_off=drop_offs,
        highest_loss_step_by_rate=highest_by_rate,
        highest_loss_step_by_absolute=highest_by_absolute,
        expected_conversion_path=expected_conversion,
    )
