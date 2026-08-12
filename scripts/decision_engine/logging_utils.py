"""
Structured logging for the Decision Intelligence Engine.

Purpose
-------
Every calculation in every engine must be traceable: inputs, outputs,
execution time, errors, and (where applicable) confidence. This module
provides one shared structured JSON logger and a `@traced` decorator so
every public engine function gets this for free and consistently, instead
of each module hand-rolling its own logging (which drifts and gets
inconsistent over time).

Inputs
------
- `event` name (str) and arbitrary keyword fields (must be JSON-serializable
  or have a sane `repr`/`str`; `default=str` is used as a safety net).

Outputs
-------
- One JSON object per log line to stderr (via `logging.StreamHandler`),
  always including `event`, `module`, and, for `@traced` functions,
  `execution_time_ms`, a summary of args/kwargs, a summary of the return
  value, and `error` if one was raised (re-raised after logging — this
  module never swallows exceptions).

Mathematics used
-----------------
None.

Computational complexity
-------------------------
O(1) overhead per call plus O(size of summarized input/output), since
summaries are truncated (see `_summarize`) to avoid multi-megabyte log
lines when an engine is called with e.g. a 50,000-row page report.

Future extensions
------------------
- Ship logs to Sentry (already wired for the rest of the codebase) instead
  of stderr, once this package moves from shadow mode to production use.
"""
import functools
import json
import logging
import time

from . import config

logger = logging.getLogger('decision_engine')
if not logger.handlers:
    _handler = logging.StreamHandler()
    _handler.setFormatter(logging.Formatter('%(message)s'))
    logger.addHandler(_handler)
logger.setLevel(getattr(logging, config.LOG_LEVEL.upper(), logging.INFO))

_MAX_SUMMARY_ITEMS = 5
_MAX_STRING_LEN = 200


def _summarize(value, depth=0):
    """Truncate large/nested structures so log lines stay bounded in size."""
    if depth > 2:
        return '...'
    if isinstance(value, dict):
        items = list(value.items())[:_MAX_SUMMARY_ITEMS]
        out = {k: _summarize(v, depth + 1) for k, v in items}
        if len(value) > _MAX_SUMMARY_ITEMS:
            out['__truncated_keys__'] = len(value) - _MAX_SUMMARY_ITEMS
        return out
    if isinstance(value, (list, tuple)):
        out = [_summarize(v, depth + 1) for v in value[:_MAX_SUMMARY_ITEMS]]
        if len(value) > _MAX_SUMMARY_ITEMS:
            out.append(f'...(+{len(value) - _MAX_SUMMARY_ITEMS} more)')
        return out
    if isinstance(value, float):
        return round(value, 6)
    if isinstance(value, str) and len(value) > _MAX_STRING_LEN:
        return value[:_MAX_STRING_LEN] + '...(truncated)'
    return value


def log(level, event, **fields):
    """Emit one structured JSON log line."""
    payload = {'event': event, **{k: _summarize(v) for k, v in fields.items()}}
    logger.log(level, json.dumps(payload, default=str))


def traced(module_name):
    """
    Decorator factory: wraps a function so every call logs its inputs,
    outputs, execution time, and any error, tagged with `module_name`.

    Usage:
        @traced('bayesian_engine')
        def update_posterior(...): ...
    """
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            started = time.monotonic()
            try:
                result = fn(*args, **kwargs)
            except Exception as e:
                duration_ms = round((time.monotonic() - started) * 1000, 3)
                log(
                    logging.ERROR, 'decision_engine_call_error',
                    module=module_name, function=fn.__name__,
                    args=args, kwargs=kwargs,
                    execution_time_ms=duration_ms, error=str(e), error_type=type(e).__name__,
                )
                raise
            duration_ms = round((time.monotonic() - started) * 1000, 3)
            log(
                logging.INFO, 'decision_engine_call_ok',
                module=module_name, function=fn.__name__,
                args=args, kwargs=kwargs,
                execution_time_ms=duration_ms, result=result,
            )
            return result
        return wrapper
    return decorator
