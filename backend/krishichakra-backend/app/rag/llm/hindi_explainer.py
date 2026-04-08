from __future__ import annotations

from app.domain.models import RotationPlan


def explain_in_hindi(plan: RotationPlan) -> str:
    _ = plan
    # TODO: call Hindi LLM chain
    return "Yeh ek demo plan hai."
