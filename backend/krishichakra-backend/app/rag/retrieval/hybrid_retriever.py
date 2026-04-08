from __future__ import annotations

from app.domain.models import FieldMetadata
from app.rag.index.keyword_store import KeywordStore
from app.rag.index.vector_store import VectorStore
from app.rag.retrieval.query_builder import build_retrieval_query
from app.rag.retrieval.reranker import rerank


class HybridRetriever:
    def __init__(self, vector_store: VectorStore, keyword_store: KeywordStore, logger) -> None:
        self.vector_store = vector_store
        self.keyword_store = keyword_store
        self.logger = logger

    def retrieve(self, field: FieldMetadata) -> list[dict]:
        query_obj = build_retrieval_query(field)
        q = query_obj["natural_query"]
        vector_hits = self.vector_store.query([0.1, 0.2, 0.3], top_k=5)
        keyword_hits = self.keyword_store.search(q, top_k=5)

        merged: dict[str, dict] = {}
        for doc in vector_hits + keyword_hits:
            doc_id = str(doc.get("id", "unknown"))
            merged[doc_id] = doc

        docs = list(merged.values())
        self.logger.info("hybrid retrieval complete", retrieved=len(docs))
        return rerank(q, docs)
