from __future__ import annotations

import chromadb

from app.solutions.krishichakra.core.config import settings
from app.solutions.krishichakra.core.logging import get_logger
from app.solutions.krishichakra.rag.index.vector_store import VectorStore

logger = get_logger(__name__)


class ChromaVectorStore(VectorStore):
    def __init__(self) -> None:
        self.client = chromadb.PersistentClient(path=settings.vector_db_path)
        self.collection = self.client.get_or_create_collection(settings.vector_collection_name)

    def index_documents(self, docs: list[dict]) -> None:
        if not docs:
            return
        ids = [d["id"] for d in docs]
        texts = [d["text"] for d in docs]
        metadatas = [d.get("metadata", {}) for d in docs]
        embeddings = [d["embedding"] for d in docs]
        self.collection.upsert(ids=ids, documents=texts, metadatas=metadatas, embeddings=embeddings)
        logger.info("indexed docs", count=len(docs), collection=settings.vector_collection_name)

    def query(self, vector: list[float], top_k: int, filters: dict | None = None) -> list[dict]:
        where = None
        if filters:
            clauses = []
            for key, value in filters.items():
                if value is None:
                    continue
                if isinstance(value, (str, int, float, bool)):
                    clauses.append({key: {"$eq": value}})
            if len(clauses) == 1:
                where = clauses[0]
            elif len(clauses) > 1:
                where = {"$and": clauses}

        res = self.collection.query(query_embeddings=[vector], n_results=top_k, where=where)
        ids = res.get("ids", [[]])[0]
        docs = res.get("documents", [[]])[0]
        metas = res.get("metadatas", [[]])[0]
        dists = res.get("distances", [[]])[0]

        out: list[dict] = []
        for i, doc_id in enumerate(ids):
            out.append(
                {
                    "id": doc_id,
                    "text": docs[i],
                    "score": float(1.0 / (1.0 + (dists[i] if i < len(dists) else 0.0))),
                    "metadata": metas[i] if i < len(metas) else {},
                }
            )
        return out
