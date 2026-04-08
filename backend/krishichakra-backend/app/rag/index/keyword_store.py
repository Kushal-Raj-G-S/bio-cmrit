from __future__ import annotations


class KeywordStore:
    def __init__(self) -> None:
        self._docs: list[dict] = []

    def index_documents(self, docs: list[dict]) -> None:
        self._docs.extend(docs)

    def search(self, text: str, top_k: int) -> list[dict]:
        query = text.lower()
        matches = [d for d in self._docs if query in str(d.get("text", "")).lower()]
        return matches[:top_k]
