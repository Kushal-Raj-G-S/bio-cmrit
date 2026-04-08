from __future__ import annotations

import time
from collections.abc import Callable
from functools import wraps

from app.core.logging import get_logger

logger = get_logger(__name__)


def trace_span(name: str) -> Callable:
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            start = time.perf_counter()
            logger.info("trace start", span=name)
            result = func(*args, **kwargs)
            elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
            logger.info("trace end", span=name, elapsed_ms=elapsed_ms)
            return result

        return wrapper

    return decorator
