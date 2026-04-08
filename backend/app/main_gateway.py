from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.solution_registry import load_solution_runtimes

logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
)
logger = logging.getLogger("main_gateway")


def create_app() -> FastAPI:
    app = FastAPI(title="BioBloom Unified Backend", version="1.0.0")

    # Allow frontend preflight requests for mounted solution APIs.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    async def health() -> dict:
        return {
            "ok": True,
            "service": "main_gateway",
            "enabled_solutions": list(settings.enabled_solutions),
        }

    runtimes = load_solution_runtimes()
    mounted: list[str] = []

    for key in settings.enabled_solutions:
        runtime = runtimes.get(key)
        if runtime is None:
            logger.warning("Skipping unknown solution key: %s", key)
            continue

        subapp = runtime.app_factory()
        mount_path = f"/api/gateway/{key}"
        app.mount(mount_path, subapp)
        mounted.append(key)
        logger.info("Mounted solution %s at %s", key, mount_path)

    @app.get("/health/deep")
    async def health_deep() -> dict:
        return {
            "ok": True,
            "gateway": "ready",
            "mounted_solutions": mounted,
            "mount_count": len(mounted),
        }

    return app


app = create_app()
