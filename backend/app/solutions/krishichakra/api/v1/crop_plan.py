from __future__ import annotations

import asyncio
import hashlib
import json
import os
import re
import time

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.solutions.krishichakra.core.logging import get_logger
from app.solutions.krishichakra.domain.models import FieldMetadata, RotationPlan, RotationYear
from app.solutions.krishichakra.rag.llm.client import generate_single_model_completion
from app.solutions.krishichakra.rag.llm.hindi_explainer import explain_in_hindi
from app.solutions.krishichakra.services.crop_planner import generate_crop_plan

router = APIRouter(prefix="/api/v1", tags=["krishichakra"])
logger = get_logger(__name__)


class PlanTranslationRequest(BaseModel):
    language: str = Field(..., pattern="^(hi|kn)$")
    plan: dict


def _csv_models(env_name: str, defaults: list[str]) -> list[str]:
    raw = (os.getenv(env_name) or "").strip()
    if not raw:
        return defaults
    out = [x.strip() for x in raw.split(",") if x.strip()]
    return out or defaults


def _translation_models(language: str) -> list[str]:
    if language == "hi":
        return _csv_models(
            "KRISHI_HINDI_TRANSLATION_MODELS",
            [
                "nvidia/nemotron-4-mini-hindi-4b-instruct",
                "meta/llama-3.3-70b-instruct",
            ],
        )
    return _csv_models(
        "KRISHI_KANNADA_TRANSLATION_MODELS",
        [
            "meta/llama-3.3-70b-instruct",
            "nvidia/nemotron-3-nano-30b-a3b",
        ],
    )


def _prewarm_languages() -> tuple[str, ...]:
    raw = (os.getenv("KRISHI_PREWARM_LANGUAGES") or "hi,kn").strip()
    langs = [x.strip().lower() for x in raw.split(",") if x.strip()]
    valid = [x for x in langs if x in {"hi", "kn"}]
    if not valid:
        return ("hi", "kn")
    return tuple(dict.fromkeys(valid))

TRANSLATION_CACHE_TTL_S = 30 * 60
_translation_cache: dict[str, dict[str, dict]] = {}
_translation_tasks: dict[str, dict[str, asyncio.Task]] = {}


@router.get("/health")
async def health() -> dict:
    return {"ok": True, "solution": "krishichakra"}


@router.post("/crop-plan")
async def crop_plan(payload: FieldMetadata) -> dict:
    response = await generate_crop_plan(payload)

    # Keep legacy frontend compatibility while returning richer response envelope.
    frontend_plan = response.trace.get("frontend_plan")
    translation_cache_key = _prewarm_translations(frontend_plan)
    return {
        "success": True,
        "plan": frontend_plan,
        "field": response.field.model_dump(),
        "structured_plan": response.plan.model_dump(),
        "scores": response.scores.model_dump() if response.scores else None,
        "hindi_explanation": response.hindi_explanation,
        "translation_cache_key": translation_cache_key,
        "trace": {k: v for k, v in response.trace.items() if k != "frontend_plan"},
    }


def _frontend_plan_to_rotation_plan(plan: dict) -> RotationPlan:
    years = []
    entries = plan.get("rotation_plan", [])
    for i, e in enumerate(entries, start=1):
        years.append(
            RotationYear(
                year_index=i,
                season=e.get("season", "Rabi"),
                crop=e.get("recommended_crop", "Crop"),
                variety_suggestion=e.get("variety_suggestion"),
                rationale=e.get("rationale", ""),
                expected_yield=e.get("expected_yield"),
                input_requirements=e.get("input_requirements"),
                risk_notes=e.get("risk_notes"),
                source_refs=plan.get("retrieved_sources", []),
            )
        )
    return RotationPlan(
        id=plan.get("field_id", "plan"),
        years=years,
        confidence=plan.get("confidence", "Medium"),
        summary=plan.get("economic_outlook", ""),
        sources=plan.get("retrieved_sources", []),
    )


def _extract_json_object(text: str) -> dict | None:
    stripped = (text or "").strip()
    if not stripped:
        return None

    try:
        parsed = json.loads(stripped)
        return parsed if isinstance(parsed, dict) else None
    except Exception:
        pass

    match = re.search(r"\{.*\}", stripped, flags=re.DOTALL)
    if not match:
        return None
    try:
        parsed = json.loads(match.group(0))
        return parsed if isinstance(parsed, dict) else None
    except Exception:
        return None


def _extract_json_array(text: str) -> list | None:
    stripped = (text or "").strip()
    if not stripped:
        return None

    try:
        parsed = json.loads(stripped)
        return parsed if isinstance(parsed, list) else None
    except Exception:
        pass

    match = re.search(r"\[.*\]", stripped, flags=re.DOTALL)
    if not match:
        return None
    try:
        parsed = json.loads(match.group(0))
        return parsed if isinstance(parsed, list) else None
    except Exception:
        return None


def _is_valid_frontend_plan_shape(plan: dict) -> bool:
    if not isinstance(plan, dict):
        return False
    rotation = plan.get("rotation_plan")
    return isinstance(rotation, list) and len(rotation) > 0


def _contains_target_script(text: str, language: str) -> bool:
    if not text:
        return False
    if language == "hi":
        return re.search(r"[\u0900-\u097F]", text) is not None
    if language == "kn":
        return re.search(r"[\u0C80-\u0CFF]", text) is not None
    return False


def _plan_contains_target_script(plan: dict, language: str) -> bool:
    checks: list[str] = [
        str(plan.get("soil_health_advisory", "")),
        str(plan.get("water_management_tip", "")),
        str(plan.get("pest_disease_management", "")),
        str(plan.get("economic_outlook", "")),
    ]
    for e in plan.get("rotation_plan", []):
        if not isinstance(e, dict):
            continue
        checks.extend(
            [
                str(e.get("recommended_crop", "")),
                str(e.get("variety_suggestion", "")),
                str(e.get("rationale", "")),
                str(e.get("input_requirements", "")),
                str(e.get("risk_notes", "")),
            ]
        )
    return any(_contains_target_script(t, language) for t in checks)


def _plan_cache_key(plan: dict) -> str:
    serialized = json.dumps(plan, ensure_ascii=False, sort_keys=True)
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()


def _get_cached_translation(cache_key: str, language: str) -> dict | None:
    bucket = _translation_cache.get(cache_key)
    if not bucket:
        return None
    row = bucket.get(language)
    if not row:
        return None
    expires_at = float(row.get("expires_at", 0.0))
    if expires_at <= time.time():
        bucket.pop(language, None)
        return None
    plan = row.get("plan")
    return plan if isinstance(plan, dict) else None


def _set_cached_translation(cache_key: str, language: str, plan: dict) -> None:
    now = time.time()
    bucket = _translation_cache.setdefault(cache_key, {})
    bucket[language] = {"plan": plan, "expires_at": now + TRANSLATION_CACHE_TTL_S}


def _get_inflight_translation_task(cache_key: str, language: str) -> asyncio.Task | None:
    return _translation_tasks.get(cache_key, {}).get(language)


def _set_inflight_translation_task(cache_key: str, language: str, task: asyncio.Task) -> None:
    bucket = _translation_tasks.setdefault(cache_key, {})
    bucket[language] = task

    def _cleanup(_task: asyncio.Task) -> None:
        lang_bucket = _translation_tasks.get(cache_key)
        if not lang_bucket:
            return
        if lang_bucket.get(language) is _task:
            lang_bucket.pop(language, None)
        if not lang_bucket:
            _translation_tasks.pop(cache_key, None)

    task.add_done_callback(_cleanup)


def _fallback_marked_translation(plan: dict, language: str) -> dict:
    out = dict(plan)
    fail_msg = "अनुवाद उपलब्ध नहीं" if language == "hi" else "ಅನುವಾದ ಲಭ್ಯವಿಲ್ಲ"
    out["soil_health_advisory"] = fail_msg
    out["water_management_tip"] = fail_msg
    out["pest_disease_management"] = fail_msg
    out["economic_outlook"] = fail_msg

    rotation = []
    for e in plan.get("rotation_plan", []):
        if not isinstance(e, dict):
            continue
        rotation.append(
            {
                **e,
                "recommended_crop": fail_msg,
                "variety_suggestion": fail_msg,
                "rationale": fail_msg,
                "input_requirements": fail_msg,
                "risk_notes": fail_msg,
            }
        )
    out["rotation_plan"] = rotation
    return out


async def _translate_text_value(text: str, language: str) -> str | None:
    value = (text or "").strip()
    if not value:
        return value
    if _contains_target_script(value, language):
        return value

    language_name = "Hindi" if language == "hi" else "Kannada"
    models = _translation_models(language)
    prompt = (
        f"Translate the following agronomy text to {language_name}. "
        f"Use only {language_name} script. "
        "Do not explain. Return only translated text.\n\n"
        f"TEXT:\n{value}"
    )

    for model in models:
        try:
            raw = await generate_single_model_completion(model, [{"role": "user", "content": prompt}], timeout_s=10)
            translated = (raw or "").strip().strip('"').strip("'")
            if translated and _contains_target_script(translated, language):
                return translated
        except Exception:
            continue

    return None


def _flatten_plan_texts(plan: dict) -> tuple[list[tuple], list[str]]:
    paths: list[tuple] = []
    texts: list[str] = []

    for key in [
        "soil_health_advisory",
        "water_management_tip",
        "pest_disease_management",
        "economic_outlook",
    ]:
        paths.append(("top", key))
        texts.append(str(plan.get(key, "")))

    for idx, row in enumerate(plan.get("rotation_plan", [])):
        if not isinstance(row, dict):
            continue
        for key in ["recommended_crop", "variety_suggestion", "rationale", "input_requirements", "risk_notes"]:
            paths.append(("row", idx, key))
            texts.append(str(row.get(key, "")))

    return paths, texts


def _apply_translated_texts(plan: dict, paths: list[tuple], values: list[str], missing_msg: str) -> dict:
    out = dict(plan)
    out["rotation_plan"] = [dict(r) if isinstance(r, dict) else r for r in plan.get("rotation_plan", [])]

    for p, v in zip(paths, values):
        final_val = (v or "").strip() or missing_msg
        if p[0] == "top":
            out[p[1]] = final_val
        else:
            _, idx, key = p
            if 0 <= idx < len(out["rotation_plan"]) and isinstance(out["rotation_plan"][idx], dict):
                out["rotation_plan"][idx][key] = final_val

    return out


async def _translate_text_batch(texts: list[str], language: str) -> list[str] | None:
    if not texts:
        return []

    language_name = "Hindi" if language == "hi" else "Kannada"
    models = _translation_models(language)
    prompt = (
        f"Translate each item in the JSON array to {language_name}. "
        f"Use only {language_name} script where possible. "
        "Keep order exactly the same and return ONLY a valid JSON array of strings with same length.\n\n"
        f"INPUT_ARRAY:\n{json.dumps(texts, ensure_ascii=False)}"
    )

    for model in models:
        try:
            raw = await generate_single_model_completion(model, [{"role": "user", "content": prompt}], timeout_s=10)
            parsed = _extract_json_array(raw)
            if not parsed or len(parsed) != len(texts):
                continue
            out = [str(x).strip() for x in parsed]
            script_hits = sum(1 for x in out if _contains_target_script(x, language))
            if script_hits == 0:
                continue
            return out
        except Exception:
            continue

    return None


async def _translate_plan_fieldwise(plan: dict, language: str) -> dict:
    missing_msg = "अनुवाद उपलब्ध नहीं" if language == "hi" else "ಅನುವಾದ ಲಭ್ಯವಿಲ್ಲ"

    paths, texts = _flatten_plan_texts(plan)
    batch = await _translate_text_batch(texts, language)
    if batch:
        return _apply_translated_texts(plan, paths, batch, missing_msg)

    out = dict(plan)
    sem = asyncio.Semaphore(6)

    async def _tx(value: str) -> str:
        async with sem:
            translated = await _translate_text_value(value, language)
            return translated or missing_msg

    top_keys = [
        "soil_health_advisory",
        "water_management_tip",
        "pest_disease_management",
        "economic_outlook",
    ]
    top_values = await asyncio.gather(*[_tx(str(plan.get(k, ""))) for k in top_keys])
    for key, val in zip(top_keys, top_values):
        out[key] = val

    translated_rotation = []
    for e in plan.get("rotation_plan", []):
        if not isinstance(e, dict):
            continue
        row = dict(e)
        row_keys = ["recommended_crop", "variety_suggestion", "rationale", "input_requirements", "risk_notes"]
        row_vals = await asyncio.gather(*[_tx(str(e.get(k, ""))) for k in row_keys])
        for k, v in zip(row_keys, row_vals):
            row[k] = v
        translated_rotation.append(row)
    out["rotation_plan"] = translated_rotation

    return out


async def _translate_full_plan(plan: dict, language: str) -> dict:
    language_name = "Hindi" if language == "hi" else "Kannada"
    models = _translation_models(language)

    prompt = (
        f"Translate this crop plan JSON to {language_name}. "
        "Translate all user-facing text values, including fields inside rotation_plan. "
        "Do not translate JSON keys, IDs, timestamps, numeric values, units, or URLs. "
        "Preserve the exact schema and all keys. Return ONLY valid JSON.\n\n"
        f"JSON:\n{json.dumps(plan, ensure_ascii=False)}"
    )

    for model in models:
        try:
            raw = await generate_single_model_completion(
                model,
                [{"role": "user", "content": prompt}],
                timeout_s=12,
            )
            parsed = _extract_json_object(raw)
            if parsed and _is_valid_frontend_plan_shape(parsed) and _plan_contains_target_script(parsed, language):
                return parsed
        except Exception:
            continue

    raise RuntimeError(f"Failed to translate plan to {language_name}")


async def _translate_and_cache(plan: dict, language: str) -> dict:
    cache_key = _plan_cache_key(plan)
    cached = _get_cached_translation(cache_key, language)
    if cached:
        return cached

    started = time.perf_counter()
    try:
        translated = await _translate_full_plan(plan, language)
    except Exception as exc:
        logger.warning(f"TRANSLATION_JSON_FAILED language={language} cache_key={cache_key[:12]} error={str(exc)}")
        translated = await _translate_plan_fieldwise(plan, language)
    _set_cached_translation(cache_key, language, translated)
    latency_ms = round((time.perf_counter() - started) * 1000, 2)
    logger.info(f"TRANSLATION_READY language={language} latency_ms={latency_ms} cache_key={cache_key[:12]}")
    return translated


def _prewarm_translations(plan: dict) -> str:
    cache_key = _plan_cache_key(plan)
    languages = _prewarm_languages()

    for language in languages:
        if _get_cached_translation(cache_key, language):
            continue
        existing = _get_inflight_translation_task(cache_key, language)
        if existing and not existing.done():
            continue

        async def _worker(lang: str) -> None:
            try:
                await _translate_and_cache(plan, lang)
            except Exception as exc:
                logger.warning(f"TRANSLATION_FAILED language={lang} cache_key={cache_key[:12]} error={str(exc)}")

        task = asyncio.create_task(_worker(language))
        _set_inflight_translation_task(cache_key, language, task)

    logger.info(f"TRANSLATION_PREWARM_STARTED languages={','.join(languages)} cache_key={cache_key[:12]}")
    return cache_key


@router.post("/crop-plan/translate")
async def translate_plan(payload: PlanTranslationRequest) -> dict:
    out = dict(payload.plan)
    cache_key = _plan_cache_key(payload.plan)

    cached = _get_cached_translation(cache_key, payload.language)
    if cached:
        logger.info(f"TRANSLATION_CACHE_HIT language={payload.language} cache_key={cache_key[:12]}")
        return {
            "success": True,
            "language": payload.language,
            "plan": cached,
            "translated_by": "krishichakra-translation-cache",
        }

    inflight = _get_inflight_translation_task(cache_key, payload.language)
    if inflight and not inflight.done():
        return {
            "success": True,
            "language": payload.language,
            "status": "processing",
            "plan": payload.plan,
            "translated_by": "krishichakra-translation-background",
            "translation_cache_key": cache_key,
        }

    try:
        running = _get_inflight_translation_task(cache_key, payload.language)
        if running and not running.done():
            return {
                "success": True,
                "language": payload.language,
                "status": "processing",
                "plan": payload.plan,
                "translated_by": "krishichakra-translation-background",
                "translation_cache_key": cache_key,
            }
        else:
            task = asyncio.create_task(_translate_and_cache(payload.plan, payload.language))
            _set_inflight_translation_task(cache_key, payload.language, task)
            return {
                "success": True,
                "language": payload.language,
                "status": "processing",
                "plan": payload.plan,
                "translated_by": "krishichakra-translation-background",
                "translation_cache_key": cache_key,
            }
    except Exception as exc:
        logger.warning(f"TRANSLATION_HARD_FAIL language={payload.language} cache_key={cache_key[:12]} error={str(exc)}")
        if payload.language == "hi":
            out = _fallback_marked_translation(payload.plan, "hi")
            rp = _frontend_plan_to_rotation_plan(payload.plan)
            translated = await explain_in_hindi(rp)
            if translated and _contains_target_script(translated, "hi"):
                out["soil_health_advisory"] = translated
            _set_cached_translation(cache_key, payload.language, out)
        else:
            out = _fallback_marked_translation(payload.plan, "kn")
            _set_cached_translation(cache_key, payload.language, out)

    return {
        "success": True,
        "language": payload.language,
        "plan": out,
        "translated_by": "krishichakra-translation-chain",
    }
