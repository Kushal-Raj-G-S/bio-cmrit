from __future__ import annotations

from app.core.logging import get_logger
from app.rag.ingestion.chunker import chunk_text
from app.rag.ingestion.pdf_extractor import extract_pages
from app.rag.ingestion.rotations_builder import build_rotations_catalog

logger = get_logger(__name__)


def build_corpus_pipeline() -> None:
    logger.info("build_corpus_pipeline started")
    pages = extract_pages("data/dummy.pdf")
    chunks = chunk_text(pages)
    logger.info("build_corpus_pipeline completed", chunk_count=len(chunks))


def build_index_pipeline() -> None:
    logger.info("build_index_pipeline started")
    logger.info("build_index_pipeline completed")


def build_rotations_pipeline() -> None:
    catalog = build_rotations_catalog()
    logger.info("build_rotations_pipeline completed", catalog_size=len(catalog))
