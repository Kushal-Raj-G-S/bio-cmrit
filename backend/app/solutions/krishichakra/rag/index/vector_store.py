from __future__ import annotations

from typing import Protocol


class VectorStore(Protocol):
    def index_documents(self, docs: list[dict]) -> None:
        ...

    def query(self, vector: list[float], top_k: int, filters: dict | None = None) -> list[dict]:
        ...
