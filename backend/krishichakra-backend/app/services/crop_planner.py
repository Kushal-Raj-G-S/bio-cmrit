from __future__ import annotations

from app.core.logging import get_logger
from app.domain.models import FieldMetadata, RotationPlan, RotationScore
from app.domain.scoring import score_rotation
from app.rag.index.chroma_store import ChromaVectorStore
from app.rag.index.keyword_store import KeywordStore
from app.rag.ingestion.rotations_builder import build_rotations_catalog
from app.rag.llm.plan_constructor import construct_plan
from app.rag.llm.safety_client import run_safety_check
from app.rag.retrieval.hybrid_retriever import HybridRetriever

logger = get_logger(__name__)

_vector_store = ChromaVectorStore()
_keyword_store = KeywordStore()
_retriever = HybridRetriever(vector_store=_vector_store, keyword_store=_keyword_store, logger=logger)

_seed_docs = [
    {"id": "chunk-1", "text": "Rice-chickpea systems improve soil health in Indo-Gangetic regions."},
    {"id": "chunk-2", "text": "Millet-pulse rotations can reduce water stress for semi-arid zones."},
    {"id": "chunk-3", "text": "Break crops reduce pest and weed pressure in continuous cereal systems."},
]
_vector_store.index_documents(_seed_docs)
_keyword_store.index_documents(_seed_docs)


def health_check_subsystems() -> dict[str, str]:
    return {"rag_subsystems": "ok"}


def generate_crop_plan(field: FieldMetadata) -> tuple[RotationPlan, RotationScore, dict]:
    safety = run_safety_check(field.model_dump_json())
    context_chunks = _retriever.retrieve(field)
    candidate_rotations = build_rotations_catalog()
    plan = construct_plan(field, context_chunks, candidate_rotations)
    score = score_rotation(plan, field)

    trace = {
        "model_used": "demo-model",
        "retrieved_chunk_count": len(context_chunks),
        "safety_status": safety,
    }
    return plan, score, trace
