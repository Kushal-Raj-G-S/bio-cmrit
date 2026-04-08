from __future__ import annotations

from app.domain.models import FieldMetadata


def build_plan_messages(field: FieldMetadata, context_chunks: list[dict], candidate_rotations: list[dict]) -> list[dict]:
    context_preview = "\n".join(str(c.get("text", ""))[:200] for c in context_chunks[:3])
    return [
        {
            "role": "system",
            "content": "You are an agronomy assistant. Return only JSON matching the RotationPlan schema.",
        },
        {
            "role": "user",
            "content": (
                f"Field={field.model_dump()}\n"
                f"Candidates={candidate_rotations[:3]}\n"
                f"Context={context_preview}"
            ),
        },
    ]


def build_hindi_messages(plan_text: str) -> list[dict]:
    return [
        {"role": "system", "content": "Explain crop plan in simple Hindi/Hinglish."},
        {"role": "user", "content": plan_text},
    ]
