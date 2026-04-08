from __future__ import annotations

from fastapi import FastAPI

from app.solutions.krishichakra.api.v1.crop_plan import router as crop_plan_router


def create_solution_app() -> FastAPI:
    app = FastAPI(title="KrishiChakra", version="3.0.0")
    app.include_router(crop_plan_router)
    return app
