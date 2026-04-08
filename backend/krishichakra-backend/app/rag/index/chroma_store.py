from __future__ import annotations

from app.rag.index.vector_store import VectorStore


class ChromaVectorStore(VectorStore):
    def __init__(self) -> None:
        self._docs: list[dict] = []

    def index_documents(self, docs: list[dict]) -> None:
        # TODO: wire actual Chroma client
        self._docs.extend(docs)

    def query(self, query_vector: list[float], top_k: int) -> list[dict]:
        _ = query_vector
        return self._docs[:top_k]
