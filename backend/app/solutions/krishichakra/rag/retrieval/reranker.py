from __future__ import annotations

from sentence_transformers import CrossEncoder

from app.solutions.krishichakra.core.config import settings
from app.solutions.krishichakra.core.logging import get_logger

logger = get_logger(__name__)
_cross_encoder = None


def _get_model() -> CrossEncoder | None:
    global _cross_encoder
    if not settings.enable_reranker:
        return None
    if _cross_encoder is not None:
        return _cross_encoder
    try:
        _cross_encoder = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-12-v2")
    except Exception as exc:
        logger.warning("cross-encoder unavailable; fallback ordering", error=str(exc))
        _cross_encoder = None
    return _cross_encoder


def rerank(query: str, docs: list[dict]) -> list[dict]:
    if not docs:
        return docs
    model = _get_model()
    if model is None:
        return sorted(docs, key=lambda x: x.get("combined_score", x.get("score", 0.0)), reverse=True)

    pairs = [[query, d.get("text", "")] for d in docs]
    scores = model.predict(pairs)
    for d, s in zip(docs, scores):
        d["rerank_score"] = float(s)
    return sorted(docs, key=lambda x: x.get("rerank_score", 0.0), reverse=True)
