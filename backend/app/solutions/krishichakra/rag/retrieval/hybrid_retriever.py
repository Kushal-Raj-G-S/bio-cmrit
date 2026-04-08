from __future__ import annotations

from app.solutions.krishichakra.domain.models import FieldMetadata
from app.solutions.krishichakra.rag.embedding_client import get_embedding
from app.solutions.krishichakra.rag.index.keyword_store import KeywordStore
from app.solutions.krishichakra.rag.index.vector_store import VectorStore
from app.solutions.krishichakra.rag.retrieval.query_builder import build_retrieval_query
from app.solutions.krishichakra.rag.retrieval.reranker import rerank


class HybridRetriever:
    def __init__(self, vector_store: VectorStore, keyword_store: KeywordStore, logger) -> None:
        self.vector_store = vector_store
        self.keyword_store = keyword_store
        self.logger = logger

    @staticmethod
    def _normalize_scores(docs: list[dict], key: str = "score") -> dict[str, float]:
        if not docs:
            return {}
        values = [float(d.get(key, 0.0)) for d in docs]
        mn, mx = min(values), max(values)
        if mx <= mn:
            return {d["id"]: 1.0 for d in docs}
        return {d["id"]: (float(d.get(key, 0.0)) - mn) / (mx - mn) for d in docs}

    async def retrieve(self, field: FieldMetadata, top_k: int = 8) -> list[dict]:
        query_obj = build_retrieval_query(field)
        natural_query = query_obj["natural_query"]
        filters = query_obj["filters"]

        qvec = await get_embedding(natural_query)
        dense_docs = self.vector_store.query(qvec, top_k=40, filters=None)
        sparse_docs = self.keyword_store.search(natural_query, top_k=40, filters=filters)

        dense_norm = self._normalize_scores(dense_docs)
        sparse_norm = self._normalize_scores(sparse_docs)

        merged: dict[str, dict] = {}
        for d in dense_docs + sparse_docs:
            doc_id = d["id"]
            if doc_id not in merged:
                merged[doc_id] = d
            merged[doc_id]["combined_score"] = 0.6 * dense_norm.get(doc_id, 0.0) + 0.4 * sparse_norm.get(doc_id, 0.0)

        top40 = sorted(merged.values(), key=lambda x: x.get("combined_score", 0.0), reverse=True)[:40]
        reranked = rerank(natural_query, top40)
        out = reranked[:top_k]

        self.logger.info("hybrid retrieve complete", dense=len(dense_docs), sparse=len(sparse_docs), returned=len(out))
        return out
