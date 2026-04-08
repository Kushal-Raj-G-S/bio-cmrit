from __future__ import annotations

from fastapi import APIRouter

from app.services.crop_planner import health_check_subsystems

router = APIRouter()


@router.get("")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/deep")
def deep_health() -> dict[str, str]:
    return health_check_subsystems()
