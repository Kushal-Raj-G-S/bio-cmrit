from __future__ import annotations

import json

from app.solutions.krishichakra.domain.models import FieldMetadata


def build_plan_constructor_messages(field: FieldMetadata, candidate_rotations: list[dict], context_chunks: list[dict], scores: list[dict]) -> list[dict]:
    system = (
        "You are KrishiChakra, an agronomy planner for Indian smallholders. "
        "Choose the best 1-3 year rotation plan from candidate templates using provided deterministic scores and evidence chunks. "
        "Output STRICT JSON only with keys: id, confidence, summary, years, sources. "
        "Each entry in years must include: year_index, season, crop, variety_suggestion, rationale, expected_yield, input_requirements, risk_notes, source_refs. "
        "Never invent crops outside Indian context and always include source_refs as source_pdf:page style refs."
    )

    chunk_pack = []
    for c in context_chunks:
        m = c.get("metadata", {})
        chunk_pack.append(
            {
                "id": c.get("id"),
                "text": c.get("text", "")[:1400],
                "source_pdf": m.get("source_pdf"),
                "page": m.get("page"),
            }
        )

    user = {
        "field": field.model_dump(),
        "candidate_rotations": candidate_rotations,
        "scores": scores,
        "top_context_chunks": chunk_pack,
        "required_schema_hint": {
            "id": "string",
            "confidence": "High|Medium|Low",
            "summary": "string",
            "years": [{
                "year_index": 1,
                "season": "Kharif|Rabi|Zaid",
                "crop": "string",
                "variety_suggestion": "string",
                "rationale": "string",
                "expected_yield": "string",
                "input_requirements": "string",
                "risk_notes": "string",
                "source_refs": ["pdf:page"],
            }],
            "sources": ["pdf:page"],
        },
    }

    return [
        {"role": "system", "content": system},
        {"role": "user", "content": json.dumps(user, ensure_ascii=True)},
    ]
