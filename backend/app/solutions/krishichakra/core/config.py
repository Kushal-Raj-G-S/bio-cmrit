from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[4]


def _normalize_base_url(url: str) -> str:
    cleaned = (url or "https://integrate.api.nvidia.com").rstrip("/")
    if cleaned.endswith("/v1"):
        return cleaned[:-3]
    return cleaned


load_dotenv(BACKEND_DIR / ".env")
load_dotenv(BACKEND_DIR / ".env.example")


@dataclass(frozen=True)
class Settings:
    env: str = os.getenv("KRISHI_ENV", "dev")
    log_level: str = os.getenv("KRISHI_LOG_LEVEL", "INFO")
    http_client_log_level: str = os.getenv("KRISHI_HTTP_LOG_LEVEL", "WARNING")
    nvidia_base_url: str = _normalize_base_url(
        os.getenv("NVIDIA_BASE_URL") or os.getenv("BASE_URL") or "https://integrate.api.nvidia.com"
    )
    nvidia_api_key: str = os.getenv("NVIDIA_API_KEY", os.getenv("API_KEY", "")).strip()
    vector_collection_name: str = os.getenv("KRISHI_VECTOR_COLLECTION", "krishichakra_crops")
    vector_db_path: str = os.getenv(
        "KRISHI_VECTOR_DB_PATH",
        str((BACKEND_DIR / "krishichakra" / "vector_store").resolve()),
    )
    knowledge_base_dir: str = os.getenv(
        "KRISHI_KNOWLEDGE_BASE_DIR",
        str((BACKEND_DIR / "krishichakra" / "knowledge_base").resolve()),
    )
    corpus_jsonl_path: str = os.getenv(
        "KRISHI_CORPUS_JSONL",
        str((BACKEND_DIR / "krishichakra" / "corpus_chunks.jsonl").resolve()),
    )
    rotations_catalog_path: str = os.getenv(
        "KRISHI_ROTATIONS_CATALOG_PATH",
        str((BACKEND_DIR / "krishichakra" / "rotations_catalog.jsonl").resolve()),
    )
    legacy_corpus_jsonl_path: str = os.getenv(
        "KRISHI_LEGACY_CORPUS_JSONL",
        str((BACKEND_DIR.parent / "main_backend" / "krishichakra" / "processed" / "krishichakra_corpus" / "krishichakra_corpus.jsonl").resolve()),
    )
    max_index_docs: int = int(os.getenv("KRISHI_MAX_INDEX_DOCS", "250"))
    enable_reranker: bool = os.getenv("KRISHI_ENABLE_RERANKER", "0") == "1"
    plan_engine_tier: str = os.getenv("KRISHI_PLAN_ENGINE_TIER", "fast")
    build_corpus_on_start: bool = os.getenv("KRISHI_BUILD_CORPUS_ON_START", "1") == "1"


settings = Settings()
