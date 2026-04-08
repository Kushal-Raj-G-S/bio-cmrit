from __future__ import annotations

import json
from pathlib import Path

from app.solutions.krishichakra.core.config import settings
from app.solutions.krishichakra.core.logging import get_logger
from app.solutions.krishichakra.rag.embedding_client import get_local_embeddings
from app.solutions.krishichakra.rag.index.chroma_store import ChromaVectorStore
from app.solutions.krishichakra.rag.ingestion.chunker import chunk_text
from app.solutions.krishichakra.rag.ingestion.pdf_extractor import extract_pages, list_pdf_files
from app.solutions.krishichakra.rag.ingestion.rotations_builder import build_rotations_catalog
from app.solutions.krishichakra.rag.ingestion.tagger import tag_chunk

logger = get_logger(__name__)


def build_corpus_pipeline() -> int:
    corpus_path = Path(settings.corpus_jsonl_path)
    corpus_path.parent.mkdir(parents=True, exist_ok=True)
    pdfs = list_pdf_files(settings.knowledge_base_dir)
    count = 0
    temp_path = corpus_path.with_suffix(".jsonl.tmp")
    with temp_path.open("w", encoding="utf-8") as out:
        for i, pdf in enumerate(pdfs, start=1):
            print(f"[{i}/{len(pdfs)}] Extracting text from {pdf.name}...")
            try:
                pages = extract_pages(str(pdf))
                chunks = chunk_text(pages, pdf.name)
                for ch in chunks:
                    ch["metadata"].update(tag_chunk(ch["text"]))
                    out.write(json.dumps(ch, ensure_ascii=True) + "\n")
                    count += 1
            except Exception as e:
                logger.error("Failed to process pdf", pdf=pdf.name, error=str(e))
    temp_path.replace(corpus_path)
    logger.info("corpus built", chunk_count=count, corpus_path=str(corpus_path))
    return count


def build_rotations_pipeline() -> int:
    rows = build_rotations_catalog()
    logger.info("rotations catalog built", count=len(rows))
    return len(rows)


def build_vector_pipeline() -> int:
    corpus_path = Path(settings.corpus_jsonl_path)
    if not corpus_path.exists():
        logger.warning("corpus jsonl missing; skipping vector index", corpus_path=str(corpus_path))
        return 0

    rows: list[dict] = []
    with corpus_path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            rows.append(json.loads(line))

    if not rows:
        logger.warning("corpus jsonl empty; skipping vector index", corpus_path=str(corpus_path))
        return 0

    store = ChromaVectorStore()
    vectors = get_local_embeddings([r["text"] for r in rows])
    docs = []
    for row, emb in zip(rows, vectors):
        meta = row.get("metadata", {})
        meta_clean = {k: v for k, v in meta.items() if not (isinstance(v, list) and len(v) == 0)}
        docs.append(
            {
                "id": row["id"],
                "text": row["text"],
                "metadata": meta_clean,
                "embedding": emb,
            }
        )
    store.index_documents(docs)
    return int(store.collection.count())


def run_all_pipelines() -> dict:
    pdfs = list_pdf_files(settings.knowledge_base_dir)
    unique_pdfs = len({p.resolve() for p in pdfs})
    chunk_count = build_corpus_pipeline()
    rotations_count = build_rotations_pipeline()
    vector_count = build_vector_pipeline()

    logger.info(f"UNIQUE_PDFS={unique_pdfs}")
    logger.info(f"CHUNK_COUNT={chunk_count}")
    logger.info(f"VECTOR_COUNT={vector_count}")
    logger.info(f"ROTATIONS_COUNT={rotations_count}")

    return {
        "unique_pdfs": unique_pdfs,
        "chunk_count": chunk_count,
        "vector_count": vector_count,
        "rotations_count": rotations_count,
    }


if __name__ == "__main__":
    summary = run_all_pipelines()
    print(json.dumps(summary, ensure_ascii=True))
