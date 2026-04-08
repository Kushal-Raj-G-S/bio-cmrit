from __future__ import annotations

import os
import time
import threading

import httpx
from sentence_transformers import SentenceTransformer

from app.solutions.krishichakra.core.config import settings
from app.solutions.krishichakra.core.logging import get_logger

logger = get_logger(__name__)

EMBED_MODELS = []
LOCAL_FALLBACK = "all-MiniLM-L6-v2"

_local_model = None
_local_model_lock = threading.Lock()


def _allow_local_download() -> bool:
    return (os.getenv("KRISHI_ALLOW_LOCAL_EMBED_DOWNLOAD", "0") or "0").strip() in {"1", "true", "True"}


def _get_local_model() -> SentenceTransformer:
    global _local_model
    if _local_model is not None:
        return _local_model

    with _local_model_lock:
        if _local_model is not None:
            return _local_model

        # Prefer cache-only load first to avoid startup/request delays from network calls.
        try:
            _local_model = SentenceTransformer(LOCAL_FALLBACK, local_files_only=True)
            return _local_model
        except Exception:
            if not _allow_local_download():
                raise RuntimeError(
                    "Local embedding fallback model not cached. "
                    "Set KRISHI_ALLOW_LOCAL_EMBED_DOWNLOAD=1 once to download it."
                )

        _local_model = SentenceTransformer(LOCAL_FALLBACK)
        return _local_model


async def _call_remote(model_name: str, text: str, input_type: str) -> list[float]:
    if not settings.nvidia_api_key:
        raise RuntimeError("NVIDIA_API_KEY is missing")

    url = f"{settings.nvidia_base_url.rstrip('/')}/v1/embeddings"
    headers = {
        "Authorization": f"Bearer {settings.nvidia_api_key}",
        "Content-Type": "application/json",
    }
    # Model-specific request options improve compatibility across NVIDIA embedding endpoints.
    payload = {
        "model": model_name,
        "input": text,
        "input_type": input_type,
        "truncate": "NONE",
    }
    if "embed-vl" in model_name:
        payload["modality"] = ["text"]

    started = time.perf_counter()
    async with httpx.AsyncClient(timeout=25) as client:
        resp = await client.post(url, headers=headers, json=payload)
    latency_ms = round((time.perf_counter() - started) * 1000, 2)

    if resp.status_code != 200:
        raise RuntimeError(f"{model_name} embeddings failed: {resp.status_code} {resp.text[:300]}")

    data = resp.json()
    emb = data["data"][0]["embedding"]
    logger.debug("embedding success", model=model_name, latency_ms=latency_ms)
    return emb


async def get_embedding(text: str, input_type: str = "query") -> list[float]:
    text = (text or "").strip()
    if not text:
        return [0.0] * 384

    for model_name in EMBED_MODELS:
        try:
            return await _call_remote(model_name, text, input_type=input_type)
        except Exception as exc:
            logger.warning("embedding model failed", model=model_name, error=str(exc))

    try:
        started = time.perf_counter()
        local_model = _get_local_model()
        emb = local_model.encode(text, show_progress_bar=False).tolist()
        latency_ms = round((time.perf_counter() - started) * 1000, 2)
        logger.warning("embedding fallback local", model=LOCAL_FALLBACK, latency_ms=latency_ms)
        return emb
    except Exception as exc:
        logger.warning("embedding fallback local unavailable", model=LOCAL_FALLBACK, error=str(exc))
        # Final safe fallback keeps sparse retrieval path alive instead of hard-failing request.
        return [0.0] * 384


def get_local_embeddings(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    local_model = _get_local_model()
    vectors = local_model.encode(texts, show_progress_bar=True)
    return vectors.tolist()
