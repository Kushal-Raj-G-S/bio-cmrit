from __future__ import annotations

import time

import httpx
from sentence_transformers import SentenceTransformer

from app.solutions.krishichakra.core.config import settings
from app.solutions.krishichakra.core.logging import get_logger

logger = get_logger(__name__)

EMBED_MODELS = [
    "nvidia/llama-nemotron-embed-vl-1b-v2",
    "nvidia/llama-nemotron-embed-1b-v2",
]
LOCAL_FALLBACK = "all-MiniLM-L6-v2"

_local_model = SentenceTransformer(LOCAL_FALLBACK)


async def _call_remote(model_name: str, text: str, input_type: str) -> list[float]:
    if not settings.nvidia_api_key:
        raise RuntimeError("NVIDIA_API_KEY is missing")

    url = f"{settings.nvidia_base_url.rstrip('/')}/v1/embeddings"
    headers = {
        "Authorization": f"Bearer {settings.nvidia_api_key}",
        "Content-Type": "application/json",
    }
    payload = {"model": model_name, "input": text, "input_type": input_type}

    started = time.perf_counter()
    async with httpx.AsyncClient(timeout=20) as client:
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

    started = time.perf_counter()
    emb = _local_model.encode(text, show_progress_bar=False).tolist()
    latency_ms = round((time.perf_counter() - started) * 1000, 2)
    logger.warning("embedding fallback local", model=LOCAL_FALLBACK, latency_ms=latency_ms)
    return emb


def get_local_embeddings(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    vectors = _local_model.encode(texts, show_progress_bar=False)
    return vectors.tolist()
