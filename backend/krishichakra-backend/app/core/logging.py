from __future__ import annotations

import sys

from loguru import logger

from app.core.config import settings


logger.remove()
logger.add(
    sys.stdout,
    level=settings.log_level.upper(),
    serialize=True,
    backtrace=False,
    diagnose=False,
)


def get_logger(name: str):
    return logger.bind(logger_name=name)
