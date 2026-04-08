from __future__ import annotations

import logging
import sys

from loguru import logger

from app.solutions.krishichakra.core.config import settings

logger.remove()
logger.add(
    sys.stdout,
    level=settings.log_level.upper(),
    serialize=False,
    backtrace=False,
    diagnose=False,
)

logging.getLogger("httpx").setLevel(settings.http_client_log_level.upper())
logging.getLogger("httpcore").setLevel(settings.http_client_log_level.upper())
logging.getLogger("urllib3").setLevel(settings.http_client_log_level.upper())


def get_logger(name: str):
    return logger.bind(module=name)
