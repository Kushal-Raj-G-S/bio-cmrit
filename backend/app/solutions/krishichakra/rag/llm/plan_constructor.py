from __future__ import annotations

import json
import re
import uuid

from app.solutions.krishichakra.core.config import settings
from app.solutions.krishichakra.core.logging import get_logger
from app.solutions.krishichakra.domain.models import FieldMetadata, RotationPlan
from app.solutions.krishichakra.rag.llm.client import generate_chat_completion
from app.solutions.krishichakra.rag.llm.prompts import build_plan_constructor_messages

logger = get_logger(__name__)


CROP_DEFAULTS = {
    "finger millet": {
        "variety_suggestion": "GPU 67 (Karnataka) or MR 6",
        "expected_yield": "2.0-2.8 t/ha",
        "input_requirements": "Seed 8-10 kg/ha; NPK 40:20:20 kg/ha; FYM 5t/ha; 2 irrigations",
        "risk_notes": "Blast risk in humid periods - spray Tricyclazole at boot stage",
    },
    "pigeon pea": {
        "variety_suggestion": "BRG 2 (medium duration) or ICPH 2671 (hybrid)",
        "expected_yield": "1.3-1.9 t/ha",
        "input_requirements": "Seed 12-15 kg/ha; Rhizobium + PSB inoculation; NPK 20:50:20 kg/ha",
        "risk_notes": "Pod borer (Helicoverpa) at 50% flowering - use Ha-NPV biocontrol",
    },
    "groundnut": {
        "variety_suggestion": "TMV 2 or Dharani (TCGS 1157) for Karnataka",
        "expected_yield": "1.4-2.0 t/ha pods",
        "input_requirements": "Seed 80-100 kg/ha; Gypsum 250 kg/ha at pegging; NPK 20:40:40 kg/ha",
        "risk_notes": "Collar rot and leaf spot - Thiram+Carbendazim seed treatment mandatory",
    },
    "chickpea": {
        "variety_suggestion": "JG 11 or JAKI 9218 (wilt-resistant)",
        "expected_yield": "1.0-1.5 t/ha",
        "input_requirements": "Seed 60-75 kg/ha; Rhizobium inoculation; P 40 kg/ha; minimal irrigation",
        "risk_notes": "Fusarium wilt - use resistant variety; pod borer scouting post-flowering",
    },
    "sorghum": {
        "variety_suggestion": "CSH 16 or SPV 2125 for Karnataka",
        "expected_yield": "2.5-3.5 t/ha grain + 5-8 t/ha fodder",
        "input_requirements": "Seed 8-10 kg/ha; NPK 80:40:40 kg/ha; Imidacloprid seed treatment",
        "risk_notes": "Shoot fly - early sowing + seed treatment; stem borer Carbofuran granules at 30 DAS",
    },
    "maize": {
        "variety_suggestion": "DKC 9144 or NK 6240 hybrid for Karnataka",
        "expected_yield": "5.0-7.0 t/ha",
        "input_requirements": "Seed 20-22 kg/ha; NPK 120:60:60 kg/ha; 3-4 irrigations at critical stages",
        "risk_notes": "Fall army worm - weekly scouting from 10 DAS; Emamectin benzoate at first instar",
    },
    "pearl millet": {
        "variety_suggestion": "HHB 67 Improved or GHB 558",
        "expected_yield": "1.8-2.5 t/ha",
        "input_requirements": "Seed 3-4 kg/ha; NPK 60:30:30 kg/ha; 1-2 irrigations",
        "risk_notes": "Downy mildew - Metalaxyl seed treatment; ergot in humid conditions",
    },
    "sunflower": {
        "variety_suggestion": "KBSH 44 or Sungold (hybrid)",
        "expected_yield": "1.5-2.2 t/ha",
        "input_requirements": "Seed 5-6 kg/ha; NPK 90:60:60 kg/ha; Boron 1 kg/ha foliar at bud stage",
        "risk_notes": "Head rot (Sclerotinia) in humid conditions - avoid overhead irrigation at flowering",
    },
    "sesame": {
        "variety_suggestion": "TMV 3 or Gujarat Til 1",
        "expected_yield": "0.5-0.8 t/ha",
        "input_requirements": "Seed 3-4 kg/ha; NPK 30:15:15 kg/ha; minimal irrigation (1-2)",
        "risk_notes": "Phyllody virus - use disease-free seed; leaf webber scouting from 20 DAS",
    },
    "mustard": {
        "variety_suggestion": "Pusa Bold or RH 30 (high oil content)",
        "expected_yield": "1.4-1.8 t/ha",
        "input_requirements": "Seed 4-5 kg/ha; NPK 60:30:30 kg/ha; Sulfur 30 kg/ha; Boron foliar",
        "risk_notes": "Aphid colonies on stem/leaves - Imidacloprid spray at early infestation",
    },
}

CROP_DEFAULTS_GENERIC = {
    "variety_suggestion": "Region-specific certified variety (consult local KVK)",
    "expected_yield": "As per district average - refer local KVK data",
    "input_requirements": "Soil-test based NPK; certified seed; timely interculture",
    "risk_notes": "Scout weekly; follow IPM; consult local extension for pest calendar",
}


def get_crop_defaults(crop_name: str) -> dict:
    return CROP_DEFAULTS.get((crop_name or "").lower().strip(), CROP_DEFAULTS_GENERIC)


class PlanConstructionError(RuntimeError):
    pass


def _extract_json(raw: str) -> dict:
    fence = re.search(r"```json\s*(\{.*?\})\s*```", raw, flags=re.DOTALL | re.IGNORECASE)
    if fence:
        return json.loads(fence.group(1))

    first = raw.find("{")
    last = raw.rfind("}")
    if first < 0 or last < 0 or last <= first:
        raise PlanConstructionError("No valid JSON object found in model response")
    return json.loads(raw[first : last + 1])


def _fallback_candidate(candidate_rotations: list[dict], field: FieldMetadata) -> RotationPlan:
    if candidate_rotations:
        top = max(candidate_rotations, key=lambda x: float((x.get("scores") or {}).get("overall_score", 0.0)))
        years = top.get("years") or [field.current_crop, field.current_crop, field.current_crop]
        return RotationPlan.model_validate(
            {
                "id": top.get("id") or f"fallback-{uuid.uuid4().hex[:8]}",
                "years": [
                    {
                        "year_index": idx,
                        "season": field.season if idx == 1 else ("Rabi" if idx == 2 else "Kharif"),
                        "crop": str(crop).title(),
                        "variety_suggestion": get_crop_defaults(str(crop)).get("variety_suggestion"),
                        "rationale": "Selected from deterministic high-score candidate due strict response-time fallback.",
                        "expected_yield": get_crop_defaults(str(crop)).get("expected_yield"),
                        "input_requirements": get_crop_defaults(str(crop)).get("input_requirements"),
                        "risk_notes": get_crop_defaults(str(crop)).get("risk_notes"),
                        "source_refs": top.get("source_refs") or [],
                    }
                    for idx, crop in enumerate(years, start=1)
                ],
                "confidence": "Medium",
                "summary": "Fast fallback plan selected from top-scoring candidate.",
                "sources": top.get("source_refs") or [],
            }
        )

    return RotationPlan.model_validate(
        {
            "id": f"fallback-{uuid.uuid4().hex[:8]}",
            "years": [
                {
                    "year_index": 1,
                    "season": field.season,
                    "crop": field.current_crop.title(),
                    "variety_suggestion": get_crop_defaults(field.current_crop).get("variety_suggestion"),
                    "rationale": "Fallback year based on current crop.",
                    "expected_yield": get_crop_defaults(field.current_crop).get("expected_yield"),
                    "input_requirements": get_crop_defaults(field.current_crop).get("input_requirements"),
                    "risk_notes": get_crop_defaults(field.current_crop).get("risk_notes"),
                    "source_refs": [],
                },
                {
                    "year_index": 2,
                    "season": "Rabi",
                    "crop": field.current_crop.title(),
                    "variety_suggestion": get_crop_defaults(field.current_crop).get("variety_suggestion"),
                    "rationale": "Fallback year based on current crop.",
                    "expected_yield": get_crop_defaults(field.current_crop).get("expected_yield"),
                    "input_requirements": get_crop_defaults(field.current_crop).get("input_requirements"),
                    "risk_notes": get_crop_defaults(field.current_crop).get("risk_notes"),
                    "source_refs": [],
                },
                {
                    "year_index": 3,
                    "season": "Kharif",
                    "crop": field.current_crop.title(),
                    "variety_suggestion": get_crop_defaults(field.current_crop).get("variety_suggestion"),
                    "rationale": "Fallback year based on current crop.",
                    "expected_yield": get_crop_defaults(field.current_crop).get("expected_yield"),
                    "input_requirements": get_crop_defaults(field.current_crop).get("input_requirements"),
                    "risk_notes": get_crop_defaults(field.current_crop).get("risk_notes"),
                    "source_refs": [],
                },
            ],
            "confidence": "Low",
            "summary": "Fallback plan generated due unavailable structured LLM output.",
            "sources": [],
        }
    )


async def construct_plan(field: FieldMetadata, context_chunks: list[dict], candidate_rotations: list[dict], scores: list[dict]) -> RotationPlan:
    messages = build_plan_constructor_messages(field, candidate_rotations, context_chunks, scores)
    try:
        raw = await generate_chat_completion(settings.plan_engine_tier, messages)
        logger.info(f"RAW_LLM_OUTPUT (first 800 chars): {raw[:800]}")
        parsed = _extract_json(raw)
        return RotationPlan.model_validate(parsed)
    except Exception as exc:
        try:
            return _fallback_candidate(candidate_rotations, field)
        except Exception as exc2:
            raise PlanConstructionError(f"Failed to parse plan JSON: {exc}; fallback_failed={exc2}") from exc2
