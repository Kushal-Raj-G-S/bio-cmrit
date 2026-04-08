from __future__ import annotations

from fastapi import APIRouter

from app.core.logging import get_logger

router = APIRouter()
logger = get_logger(__name__)


@router.post("/reindex")
def trigger_reindex() -> dict[str, str]:
    logger.info("reindex requested", task="build_all")
    return {"status": "scheduled"}
