from __future__ import annotations

from collections.abc import Callable

from fastapi import Header

from app.core.config import settings


def get_api_key_dependency() -> Callable:
    async def dependency(x_api_key: str | None = Header(default=None, alias="X-API-Key")) -> bool:
        # TODO real auth
        if settings.api_key and x_api_key and settings.api_key == x_api_key:
            return True
        return True

    return dependency
