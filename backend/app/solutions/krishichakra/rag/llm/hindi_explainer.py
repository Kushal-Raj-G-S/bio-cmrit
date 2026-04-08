from __future__ import annotations

from app.solutions.krishichakra.domain.models import RotationPlan
from app.solutions.krishichakra.rag.llm.client import generate_single_model_completion

PRIMARY_HINDI_MODEL = "nvidia/nemotron-4-mini-hindi-4b-instruct"
SECONDARY_HINDI_MODEL = "meta/llama-3.3-70b-instruct"


def _plan_summary(plan: RotationPlan) -> str:
    parts = []
    for y in plan.years:
        parts.append(f"Year {y.year_index} {y.season}: {y.crop}")
    return "; ".join(parts)


async def explain_in_hindi(plan: RotationPlan) -> str:
    summary = _plan_summary(plan)

    prompt_en = f"Explain this crop rotation plan in simple Hindi for a small farmer in 3-5 sentences: {summary}"
    prompt_hi = f"Is fasal rotation plan ko chhote kisan ke liye asaan Hindi mein 3-5 vaakyon mein samjhao: {summary}"

    try:
        return await generate_single_model_completion(PRIMARY_HINDI_MODEL, [{"role": "user", "content": prompt_en}], timeout_s=25)
    except Exception:
        pass

    try:
        return await generate_single_model_completion(SECONDARY_HINDI_MODEL, [{"role": "user", "content": prompt_hi}], timeout_s=20)
    except Exception:
        return "Yeh 3 saal ka rotation plan mitti ki sehat aur aay ko sthir rakhne ke liye taiyar kiya gaya hai."
