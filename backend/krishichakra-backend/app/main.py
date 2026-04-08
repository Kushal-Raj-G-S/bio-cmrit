from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import admin, crop_plan, health
from app.core.errors import register_exception_handlers
from app.core.logging import get_logger

logger = get_logger(__name__)

app = FastAPI(
    title="KrishiChakra Crop Rotation RAG",
    version="0.1.0",
)

# TODO tighten CORS in prod
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(crop_plan.router, prefix="/api/v1", tags=["crop-plan"])
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])

register_exception_handlers(app)


@app.on_event("startup")
async def on_startup() -> None:
    logger.info("startup complete")


@app.on_event("shutdown")
async def on_shutdown() -> None:
    logger.info("shutdown complete")
