from __future__ import annotations

import json

from app.core.errors import PlanConstructionError
from app.domain.models import FieldMetadata, RotationPlan
from app.rag.llm.client import ENGINES, generate_chat_completion
from app.rag.llm.prompts import build_plan_messages


def construct_plan(field: FieldMetadata, context_chunks: list[dict], candidate_rotations: list[dict]) -> RotationPlan:
    messages = build_plan_messages(field, context_chunks, candidate_rotations)
    model, timeout = ENGINES["fast"][0]
    raw = generate_chat_completion(model=model, messages=messages, timeout=timeout)

    try:
        payload = json.loads(raw)
        return RotationPlan.model_validate(payload)
    except Exception as exc:  # noqa: BLE001
        raise PlanConstructionError(f"Unable to parse plan JSON: {exc}") from exc
