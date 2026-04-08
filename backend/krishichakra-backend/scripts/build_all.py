from __future__ import annotations

from app.core.logging import get_logger
from app.rag.ingestion.pipelines import (
    build_corpus_pipeline,
    build_index_pipeline,
    build_rotations_pipeline,
)

logger = get_logger(__name__)


def main() -> None:
    logger.info("build_all started")
    build_corpus_pipeline()
    build_index_pipeline()
    build_rotations_pipeline()
    logger.info("build_all executed (stub)")


if __name__ == "__main__":
    main()
