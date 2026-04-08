from __future__ import annotations

import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    host: str = os.getenv("BACKEND_HOST", "0.0.0.0")
    port: int = int(os.getenv("BACKEND_PORT", "9000"))
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    enabled_solutions: tuple[str, ...] = tuple(
        s.strip() for s in os.getenv("ENABLED_SOLUTIONS", "krishichakra,pashudhansakhi").split(",") if s.strip()
    )


settings = Settings()
