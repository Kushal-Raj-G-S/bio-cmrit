from __future__ import annotations

from app.core.logging import get_logger

logger = get_logger(__name__)


def inc_counter(name: str, **labels) -> None:
    logger.info("counter increment", counter=name, labels=labels)
