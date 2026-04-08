from __future__ import annotations

import asyncio

from app.solutions.krishichakra.rag.ingestion.pipelines import build_corpus_pipeline, build_rotations_pipeline
from app.solutions.krishichakra.services.crop_planner import _bootstrap_retrieval_once


async def main() -> None:
    build_corpus_pipeline()
    build_rotations_pipeline()
    await _bootstrap_retrieval_once()


if __name__ == "__main__":
    asyncio.run(main())
