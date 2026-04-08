from __future__ import annotations

from fastapi import FastAPI

from app.solutions.krishichakra.api.v1.crop_plan import router as crop_plan_router
from app.solutions.krishichakra.api.v1.crop_plan import prewarm_translation_runtime


def create_solution_app() -> FastAPI:
    app = FastAPI(title="KrishiChakra", version="3.0.0")

    @app.on_event("startup")
    async def _startup_prewarm() -> None:
        prewarm_translation_runtime()

    app.include_router(crop_plan_router)
    return app
