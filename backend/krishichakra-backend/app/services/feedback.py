from __future__ import annotations

from app.core.logging import get_logger

logger = get_logger(__name__)


def submit_feedback(plan_id: str, rating: int, comment: str | None) -> None:
    logger.info("feedback received", plan_id=plan_id, rating=rating, comment=comment)
