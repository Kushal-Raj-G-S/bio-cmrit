from __future__ import annotations

from app.core.logging import get_logger

logger = get_logger(__name__)


def log_eval_event(event: dict) -> None:
    # TODO: write to separate JSONL file for offline evaluation
    logger.info("eval event", event=event)
