from __future__ import annotations

import json

from app.solutions.krishichakra.domain.models import FieldMetadata


def build_plan_constructor_messages(field: FieldMetadata, candidate_rotations: list[dict], context_chunks: list[dict], scores: list[dict]) -> list[dict]:
    system = (
        "You are KrishiChakra, an expert agronomy planner for Indian smallholders. "
        "Choose the best 1-3 year rotation plan from candidate templates using provided deterministic scores and evidence chunks.\n"
        "Output STRICT JSON only with keys: id, confidence, summary, years, sources.\n"
        "Each entry in years must include: year_index, season, crop, variety_suggestion, rationale, expected_yield, input_requirements, risk_notes, source_refs.\n"
        "CRITICAL REQUIREMENTS:\n"
        "1. Write highly detailed, rich, and informative descriptions for variety_suggestion, input_requirements, and risk_notes.\n"
        "2. The 'rationale' MUST be rich and highly informative (at least 2-3 full sentences) explaining exactly why this crop fits the specific soil, climate, and preceding crops.\n"
        "3. Never invent crops outside the Indian context.\n"
        "4. Always include source_refs as source_pdf:page style refs."
    )

    chunk_pack = []
    for c in context_chunks:
        m = c.get("metadata", {})
        chunk_pack.append(
            {
                "id": c.get("id"),
                "text": c.get("text", "")[:700],
                "source_pdf": m.get("source_pdf"),
                "page": m.get("page"),
            }
        )

    slim_candidates: list[dict] = []
    for row in candidate_rotations[:4]:
        slim_candidates.append(
            {
                "id": row.get("id"),
                "zone": row.get("zone"),
                "soil": row.get("soil"),
                "irrigation": row.get("irrigation"),
                "base_crop": row.get("base_crop"),
                "years": row.get("years", [])[:3],
                "source_refs": row.get("source_refs", [])[:3],
                "scores": row.get("scores", {}),
            }
        )

    user = {
        "field": field.model_dump(),
        "candidate_rotations": slim_candidates,
        "scores": scores[:4],
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
