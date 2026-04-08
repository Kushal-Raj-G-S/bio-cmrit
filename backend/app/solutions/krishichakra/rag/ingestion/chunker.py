from __future__ import annotations

import re


def chunk_text(pages: list[str], source_name: str) -> list[dict]:
    chunks: list[dict] = []
    chunk_id = 0
    for page_idx, page_text in enumerate(pages, start=1):
        paragraphs = [p.strip() for p in re.split(r"\n\s*\n|(?<=[.?!])\s{2,}", page_text) if p.strip()]
        buf = ""
        for para in paragraphs:
            if len(buf) + len(para) + 1 <= 1200:
                buf = f"{buf} {para}".strip()
            else:
                if len(buf) >= 250:
                    chunks.append(
                        {
                            "id": f"{source_name}::p{page_idx}::c{chunk_id}",
                            "text": buf,
                            "metadata": {"source_pdf": source_name, "page": page_idx},
                        }
                    )
                    chunk_id += 1
                buf = para
        if buf and len(buf) >= 250:
            chunks.append(
                {
                    "id": f"{source_name}::p{page_idx}::c{chunk_id}",
                    "text": buf,
                    "metadata": {"source_pdf": source_name, "page": page_idx},
                }
            )
            chunk_id += 1
    return chunks
