from __future__ import annotations


def chunk_text(pages: list[str]) -> list[dict]:
    chunks: list[dict] = []
    for idx, page in enumerate(pages):
        chunks.append({"id": f"chunk-{idx}", "text": page})
    return chunks
