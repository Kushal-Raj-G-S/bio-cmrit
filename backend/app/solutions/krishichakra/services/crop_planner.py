from __future__ import annotations

import json
from pathlib import Path

from fastapi import HTTPException

from app.solutions.krishichakra.core.config import settings
from app.solutions.krishichakra.core.logging import get_logger
from app.solutions.krishichakra.domain.models import CropPlanResponse, FieldMetadata, RotationPlan, RotationScore, RotationYear
from app.solutions.krishichakra.domain.scoring import score_rotation
from app.solutions.krishichakra.rag.embedding_client import get_local_embeddings
from app.solutions.krishichakra.rag.index.chroma_store import ChromaVectorStore
from app.solutions.krishichakra.rag.index.keyword_store import KeywordStore
from app.solutions.krishichakra.rag.ingestion.pipelines import build_corpus_pipeline, build_rotations_pipeline
from app.solutions.krishichakra.rag.llm.client import get_last_model_used
from app.solutions.krishichakra.rag.llm.hindi_explainer import explain_in_hindi
from app.solutions.krishichakra.rag.llm.plan_constructor import construct_plan
from app.solutions.krishichakra.rag.llm.safety_client import run_safety_check
from app.solutions.krishichakra.rag.retrieval.hybrid_retriever import HybridRetriever
from app.solutions.krishichakra.rag.retrieval.rotations_retriever import RotationsCatalog

logger = get_logger(__name__)

CROP_ADVISORY = {
    "finger millet": {
        "soil": "Maintain soil organic matter; apply FYM 5t/ha before sowing. Ragi fixes no N - follow with a legume.",
        "water": "Critical irrigation at tillering (21 DAS) and grain filling (55 DAS); 25-30mm each. Avoid waterlogging.",
        "pest": "Watch for blast (Pyricularia) in humid spells - use Tricyclazole spray at boot stage. Stem borer scouting from 30 DAS.",
        "economic": "Finger millet yields stable even in drought years. 3-year rotation with pulse reduces input cost by ~18%.",
    },
    "pigeon pea": {
        "soil": "Deep-rooted legume; improves soil structure and fixes 40-80 kg N/ha. Ideal second-year break crop.",
        "water": "Largely rainfed; one rescue irrigation at flowering (60-70 DAS) if dry spell extends beyond 3 weeks.",
        "pest": "Scout for pod borer (Helicoverpa armigera) at 50% flowering; use Ha-NPV or Indoxacarb if crossing ETL.",
        "economic": "Pigeon pea commands Rs6000-7000/qtl MSP. Nitrogen credit reduces next year's fertilizer cost by Rs2500-3000/ha.",
    },
    "groundnut": {
        "soil": "Needs well-drained sandy loam; apply gypsum 250 kg/ha at pegging for pod fill. Avoid back-to-back oilseed.",
        "water": "Critical stages: pegging (35-40 DAS) and pod development (70-80 DAS); 30mm each; avoid water stress in late pod fill.",
        "pest": "Leaf spot and collar rot risk on heavy soils - treat seed with Thiram + Carbendazim. Scout for leaf miner from 20 DAS.",
        "economic": "Groundnut pod yield 1.5-2.0 t/ha; TMV 2 variety gives higher oil content and premium price in Karnataka mandis.",
    },
    "chickpea": {
        "soil": "Improves soil N by 30-40 kg/ha; grows well on residual moisture in black soils after kharif cereals.",
        "water": "Largely rainfed; pre-sowing irrigation if moisture deficit; one irrigation at pod filling (75-80 DAS) boosts yield 20%.",
        "pest": "Fusarium wilt is key risk - use resistant variety (JG 11, JAKI 9218). Pod borer Helicoverpa scouting mandatory after flowering.",
        "economic": "Chickpea MSP Rs5440/qtl (2024-25); low input cost makes it high-margin in rotation.",
    },
    "sorghum": {
        "soil": "Deep-rooted; good for breaking hardpan in black soils. Leaves residue that improves organic matter.",
        "water": "Drought tolerant; irrigation only at boot stage (45-50 DAS) and grain filling if dry; avoid over-irrigation.",
        "pest": "Shoot fly is primary concern - treat seed with Imidacloprid. Stem borer from 30 DAS; use Carbofuran granules.",
        "economic": "Dual-purpose crop (grain + fodder); fodder value adds Rs4000-5000/ha income beyond grain MSP.",
    },
    "maize": {
        "soil": "Exhaustive crop; must be followed by legume to restore N. Apply FYM 10t/ha + NPK 120:60:60 kg/ha.",
        "water": "Critical stages: knee-high (25-30 DAS), tasseling (60 DAS), grain fill (80 DAS); 40mm each. Drought at tasseling = 50% yield loss.",
        "pest": "Fall army worm (Spodoptera frugiperda) is now primary pest in Karnataka; scout weekly from 10 DAS; use Emamectin benzoate.",
        "economic": "Hybrid maize yields 5-7 t/ha; contract farming available in Karnataka. High input cost - use only in irrigated rotation.",
    },
}

GENERIC_ADVISORY = {
    "soil": "Maintain residue cover and include at least one pulse in the 3-year cycle to rebuild soil nitrogen and organic matter.",
    "water": "Use stage-based irrigation scheduling; irrigate at critical growth stages only. Avoid over-irrigation to prevent nutrient leaching.",
    "pest": "Rotate crop families to break pest and disease cycles. Use preventive seed treatment and IPM practices.",
    "economic": "Diversified 3-year cereal-pulse-oilseed rotation stabilizes income and reduces downside risk vs monocropping.",
}

YIELD_BOUNDS_KG_HA = {
    "finger millet": (1500, 2800),
    "ragi": (1500, 2800),
    "pigeon pea": (800, 1900),
    "arhar": (800, 1900),
    "groundnut": (1200, 2200),
    "chickpea": (800, 1500),
    "sorghum": (2000, 3800),
    "jowar": (2000, 3800),
    "maize": (3500, 7500),
    "sunflower": (1200, 2200),
    "mustard": (1000, 1900),
    "pearl millet": (1500, 2700),
    "bajra": (1500, 2700),
    "sesame": (400, 900),
    "wheat": (3000, 5500),
    "rice": (3000, 6000),
    "green gram": (500, 1200),
    "black gram": (500, 1100),
    "lentil": (700, 1500),
    "cotton": (1500, 3000),
}

YIELD_DISPLAY = {
    "finger millet": "2.0-2.8 t/ha",
    "ragi": "2.0-2.8 t/ha",
    "pigeon pea": "1.3-1.9 t/ha",
    "arhar": "1.3-1.9 t/ha",
    "groundnut": "1.5-2.2 t/ha pods",
    "chickpea": "1.0-1.5 t/ha",
    "sorghum": "2.5-3.5 t/ha grain + 5-8 t/ha fodder",
    "jowar": "2.5-3.5 t/ha grain",
    "maize": "5.0-7.0 t/ha",
    "sunflower": "1.5-2.2 t/ha",
    "mustard": "1.4-1.8 t/ha",
    "pearl millet": "1.8-2.5 t/ha",
    "bajra": "1.8-2.5 t/ha",
    "sesame": "0.5-0.8 t/ha",
    "wheat": "3.5-5.5 t/ha",
    "rice": "4.0-6.0 t/ha",
    "green gram": "0.6-1.2 t/ha",
    "black gram": "0.5-1.1 t/ha",
    "lentil": "0.8-1.5 t/ha",
    "cotton": "1.5-3.0 t/ha kapas",
}

LEGUMES = {
    "pigeon pea",
    "arhar",
    "chickpea",
    "green gram",
    "black gram",
    "groundnut",
    "lentil",
    "cowpea",
    "soybean",
    "moong",
}

OILSEEDS = {"sunflower", "mustard", "sesame", "safflower", "linseed", "castor"}

RATIONALE_TEMPLATES = {
    "opener": (
        "{crop} opens the 3-year rotation. It suits the current {soil} soil and "
        "{irrigation} irrigation conditions. Starting with this crop establishes a "
        "strong nutrient and structural base for the seasons ahead."
    ),
    "legume": (
        "{crop} is grown in Year {year} because it is a legume - it absorbs "
        "nitrogen from the air and fixes it into the soil (40-80 kg N/ha). "
        "This reduces fertilizer cost {next_year_phrase} by Rs2,500-3,500/ha. "
        "It also breaks pest and disease cycles left by {prev_crop}."
    ),
    "oilseed": (
        "{crop} diversifies the rotation in Year {year}. As an oilseed crop, "
        "it commands a good market price and prevents the buildup of pests "
        "that attack cereals like {prev_crop}. Its taproot also loosens subsoil "
        "compaction left by shallow-rooted crops."
    ),
    "cereal_followup": (
        "{crop} follows {prev_crop} in Year {year} to maintain rotational "
        "diversity. It has a different root depth and nutrient demand than "
        "{prev_crop}, which helps the soil recover and reduces the need "
        "for heavy fertilizer inputs."
    ),
}

CROP_RISK_ACTIONS = {
    "finger millet": (
        "Watch for blast (Pyricularia) in humid spells - spray Tricyclazole 0.06% "
        "at boot stage. Apply lime 500 kg/ha if soil pH < 5.5 to correct acidity."
    ),
    "ragi": (
        "Watch for blast (Pyricularia) in humid spells - spray Tricyclazole 0.06% "
        "at boot stage. Apply lime 500 kg/ha if soil pH < 5.5 to correct acidity."
    ),
    "pigeon pea": (
        "Scout for pod borer (Helicoverpa) at 50% flowering - spray Ha-NPV "
        "biocontrol or Indoxacarb if 1+ larva/plant. Use wilt-resistant variety "
        "and avoid waterlogging to prevent Fusarium wilt."
    ),
    "groundnut": (
        "Treat seed with Thiram + Carbendazim before sowing to prevent collar rot. "
        "Apply gypsum 250 kg/ha at pegging. Store pods in dry conditions "
        "to prevent aflatoxin contamination."
    ),
    "chickpea": (
        "Use Fusarium wilt-resistant variety (JG 11 or JAKI 9218) - no chemical "
        "cure once infected. Scout for pod borer (Helicoverpa) after flowering; "
        "spray Emamectin benzoate at larval stage."
    ),
    "sorghum": (
        "Treat seed with Imidacloprid 48 FS (7 ml/kg) before sowing to control "
        "shoot fly. Apply Carbofuran 3G granules (10 kg/ha) in whorl at 30 DAS "
        "if stem borer dead hearts exceed 5%."
    ),
    "maize": (
        "Scout weekly from 10 DAS for Fall Army Worm (Spodoptera) - spray "
        "Emamectin benzoate 5% SG at first instar in whorl. Use Turcicum "
        "leaf blight-resistant hybrid; avoid overhead irrigation."
    ),
    "sunflower": (
        "Avoid overhead irrigation during flowering to prevent Sclerotinia head "
        "rot - no effective spray exists. Spray Imidacloprid on aphid colonies "
        "on stem and undersides of leaves at early infestation."
    ),
    "mustard": (
        "Spray Imidacloprid or Dimethoate on aphid (Lipaphis erysimi) colonies "
        "at stem - early action critical. Spray Metalaxyl at bud initiation "
        "in humid conditions to prevent white rust."
    ),
    "pearl millet": (
        "Treat seed with Metalaxyl 35 WS (6 g/kg) every season without fail "
        "to prevent downy mildew. Remove ergot-infected earheads early; "
        "do not allow honeydew spread in humid conditions."
    ),
    "sesame": (
        "Remove and destroy phyllody-infected plants (twisted, small leaves) "
        "early to stop leafhopper spread. Spray Malathion 50 EC from 20 DAS "
        "if leaf webber (Antigastra) webbing is seen."
    ),
    "wheat": (
        "Scout for yellow rust in early morning - spray Propiconazole 25 EC "
        "at first sign. Apply Cartap hydrochloride for termite if soil infestation "
        "seen. Use certified disease-free seed every season."
    ),
    "rice": (
        "Scout for blast (neck rot at panicle stage) - spray Tricyclazole 75 WP. "
        "Maintain 2-5 cm standing water during tillering to suppress weeds. "
        "Use pheromone traps for stem borer monitoring from 30 DAS."
    ),
}


def build_field_advisory(rotation_cards: list[dict], soil: str, irrigation: str) -> dict:
    def _note(crop: str, key: str) -> str:
        c = (crop or "").lower().strip()
        return CROP_ADVISORY.get(c, {}).get(key, GENERIC_ADVISORY[key])

    crops = [str(c.get("recommended_crop", "")).strip() for c in rotation_cards if isinstance(c, dict)]
    if not crops:
        return dict(GENERIC_ADVISORY)

    def _compose(key: str) -> str:
        lines: list[str] = []
        for idx, crop in enumerate(crops[:3], start=1):
            lines.append(f"Year {idx} ({crop.title()}): {_note(crop, key)}")
        prefix = f"For {soil} soil and {irrigation} irrigation, follow this 3-year guidance: "
        return prefix + " ".join(lines)

    return {
        "soil": _compose("soil"),
        "water": _compose("water"),
        "pest": _compose("pest"),
        "economic": _compose("economic"),
    }


def sanitize_yield(crop_name: str, llm_yield_str: str) -> str:
    key = (crop_name or "").lower().strip()
    if key in YIELD_DISPLAY:
        return YIELD_DISPLAY[key]
    if llm_yield_str and ("-" in llm_yield_str or " to " in llm_yield_str.lower()):
        return llm_yield_str
    return llm_yield_str or "Refer local KVK district average"


def needs_rationale_override(text: str) -> bool:
    if not text or len(text) < 30:
        return True
    bad_phrases = [
        "was found to be",
        "promising and remunerative",
        "intercropping of",
        "relatively tolerant",
        "selected from deterministic",
        "fallback",
    ]
    return any(p in text.lower() for p in bad_phrases)


def build_rationale(crop: str, year_idx: int, all_crops: list[str], soil: str = "", irrigation: str = "") -> str:
    c = (crop or "").lower().strip()
    prev = all_crops[year_idx - 2].lower().strip() if year_idx > 1 and len(all_crops) >= (year_idx - 1) else None
    next_year = year_idx + 1 if year_idx < 3 else "the following season"
    next_year_phrase = f"in Year {year_idx + 1}" if year_idx < 3 else "in the next season when you restart the rotation"

    if year_idx == 1:
        return RATIONALE_TEMPLATES["opener"].format(
            crop=(crop or "Crop").title(),
            soil=soil or "field",
            irrigation=irrigation or "available",
        )
    if c in LEGUMES:
        return RATIONALE_TEMPLATES["legume"].format(
            crop=(crop or "Crop").title(),
            year=year_idx,
            next_year=next_year,
            next_year_phrase=next_year_phrase,
            prev_crop=prev.title() if prev else "the previous crop",
        )
    if c in OILSEEDS:
        return RATIONALE_TEMPLATES["oilseed"].format(
            crop=(crop or "Crop").title(),
            year=year_idx,
            prev_crop=prev.title() if prev else "the previous crop",
        )
    return RATIONALE_TEMPLATES["cereal_followup"].format(
        crop=(crop or "Crop").title(),
        year=year_idx,
        prev_crop=prev.title() if prev else "the previous crop",
    )


def sanitize_risk(crop: str, llm_risk: str) -> str:
    action_words = ["spray", "apply", "use ", "scout", "treat", "avoid", "remove", "monitor weekly", "check"]
    text = llm_risk or ""
    has_action = any(w in text.lower() for w in action_words)
    if has_action and len(text) > 60:
        return text
    key = (crop or "").lower().strip()
    return CROP_RISK_ACTIONS.get(key, text or "Scout weekly and follow local KVK pest calendar.")

_vector_store = ChromaVectorStore()
_keyword_store = KeywordStore()
_retriever = HybridRetriever(_vector_store, _keyword_store, logger)
_rotations_catalog = RotationsCatalog()
_bootstrapped = False


def _load_corpus_rows() -> list[dict]:
    corpus_path = Path(settings.corpus_jsonl_path)
    if not corpus_path.exists() and settings.build_corpus_on_start:
        logger.info("corpus jsonl missing, building from PDFs", path=str(corpus_path))
        build_corpus_pipeline()
    rows: list[dict] = []

    def read_jsonl(path: Path) -> list[dict]:
        out: list[dict] = []
        if not path.exists():
            return out
        with path.open("r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                obj = json.loads(line)
                meta = obj.get("metadata", {})
                if "source_pdf" not in meta and "source" in meta:
                    meta["source_pdf"] = meta.get("source")
                obj["metadata"] = meta
                out.append(obj)
                if len(out) >= settings.max_index_docs:
                    break
        return out

    if corpus_path.exists():
        rows = read_jsonl(corpus_path)
        if rows:
            logger.info(f"CORPUS_SOURCE primary_jsonl_loaded rows={len(rows)} path={corpus_path}")

    if not rows:
        legacy = Path(settings.legacy_corpus_jsonl_path)
        if legacy.exists():
            logger.info(f"CORPUS_SOURCE fallback_jsonl_loaded rows_from_fallback path={legacy}")
            rows = read_jsonl(legacy)

    return rows


async def _bootstrap_retrieval_once() -> None:
    global _bootstrapped
    if _bootstrapped:
        return

    build_rotations_pipeline()

    rows = _load_corpus_rows()
    if not rows:
        logger.warning("no corpus rows loaded; retrieval will rely on rotations catalog")
        _keyword_store.index_documents([])
        _bootstrapped = True
        return

    _keyword_store.index_documents(rows)

    try:
        existing = _vector_store.collection.count()
    except Exception:
        existing = 0

    if existing == 0:
        logger.info("vector collection empty, indexing corpus rows", rows=len(rows))
        embeddings = get_local_embeddings([r["text"] for r in rows])
        to_index = []
        for i, (row, emb) in enumerate(zip(rows, embeddings), start=1):
            to_index.append(
                {
                    "id": row["id"],
                    "text": row["text"],
                    "metadata": row.get("metadata", {}),
                    "embedding": emb,
                }
            )
            if i % 100 == 0:
                logger.info("embedding progress", done=i, total=len(rows))
        _vector_store.index_documents(to_index)
    else:
        logger.info(f"VECTOR_STORE_REUSE already_populated vectors={existing}")

    _bootstrapped = True


def _template_to_rotation_plan(template: dict, start_season: str) -> RotationPlan:
    seasons = [start_season, "Rabi", "Kharif"]
    years: list[RotationYear] = []
    for idx, crop in enumerate(template.get("years", []), start=1):
        years.append(
            RotationYear(
                year_index=idx,
                season=seasons[(idx - 1) % len(seasons)],
                crop=str(crop).title(),
                variety_suggestion=None,
                rationale="Template candidate from agronomy catalog",
                expected_yield=None,
                input_requirements=None,
                risk_notes=None,
                source_refs=template.get("source_refs", []),
            )
        )

    return RotationPlan(
        id=template.get("id", f"tmpl-{abs(hash(str(template)))%99999}"),
        years=years,
        confidence="Medium",
        summary="Template candidate",
        sources=template.get("source_refs", []),
    )


def _to_frontend_plan(field: FieldMetadata, plan: RotationPlan, trace: dict) -> dict:
    rotation_plan = []
    all_crops = [y.crop for y in plan.years]
    for y in plan.years:
        crop_name = y.crop
        expected_yield = sanitize_yield(crop_name, y.expected_yield or "")
        rationale = y.rationale or ""
        if needs_rationale_override(rationale):
            rationale = build_rationale(
                crop_name,
                y.year_index,
                all_crops,
                soil=field.soil_type,
                irrigation=field.irrigation_type,
            )
        risk_notes = sanitize_risk(crop_name, y.risk_notes or "")
        rotation_plan.append(
            {
                "season": y.season,
                "year_index": y.year_index,
                "recommended_crop": crop_name,
                "variety_suggestion": y.variety_suggestion or "Region-specific certified seed",
                "rationale": rationale,
                "expected_yield": expected_yield,
                "input_requirements": y.input_requirements or "Soil-test based nutrients and seed treatment",
                "risk_notes": risk_notes,
            }
        )

    advisory = build_field_advisory(rotation_plan, field.soil_type, field.irrigation_type)

    return {
        "field_id": field.id or "generated-field",
        "field_name": field.name or "Field",
        "location": field.location,
        "generated_at": trace.get("generated_at"),
        "rotation_plan": rotation_plan,
        "soil_health_advisory": advisory["soil"],
        "water_management_tip": advisory["water"],
        "pest_disease_management": advisory["pest"],
        "economic_outlook": advisory["economic"],
        "field_advisory": advisory,
        "retrieved_sources": plan.sources,
        "model_used": trace.get("model_used"),
        "confidence": plan.confidence,
    }


async def generate_crop_plan(field: FieldMetadata) -> CropPlanResponse:
    await _bootstrap_retrieval_once()

    safety_input = f"location={field.location}; crop={field.current_crop}; soil={field.soil_type}"
    safety = await run_safety_check(safety_input)
    if not safety.get("safe", True):
        raise HTTPException(status_code=400, detail=f"Request blocked by safety policy: {safety.get('reason')}")

    context_chunks = await _retriever.retrieve(field, top_k=6)
    retrieved_chars = sum(len((c.get("text") or "")) for c in context_chunks)
    chunk_ids = [c.get("id") for c in context_chunks]
    logger.info(f"RAG_RETRIEVAL chunks={len(context_chunks)} text_chars={retrieved_chars} chunk_ids={chunk_ids}")
    candidate_templates = _rotations_catalog.get_candidate_rotations(field, max_k=4)
    candidate_ids = [t.get("id") for t in candidate_templates]
    logger.info(f"RAG_CANDIDATES count={len(candidate_templates)} candidate_ids={candidate_ids}")

    candidate_plans = [_template_to_rotation_plan(t, field.season) for t in candidate_templates]
    candidate_scores: list[RotationScore] = [score_rotation(p, field) for p in candidate_plans]

    candidate_payload = []
    for tmpl, sc in zip(candidate_templates, candidate_scores):
        d = dict(tmpl)
        d["scores"] = sc.model_dump()
        candidate_payload.append(d)

    score_payload = [s.model_dump() for s in candidate_scores]
    final_plan = await construct_plan(field, context_chunks, candidate_payload, score_payload)
    chosen_score = score_rotation(final_plan, field)
    hindi = await explain_in_hindi(final_plan)

    trace = {
        "model_used": get_last_model_used(),
        "retrieval_chunk_ids": [c.get("id") for c in context_chunks],
        "retrieval_text_chars": retrieved_chars,
        "rotation_candidate_ids": [t.get("id") for t in candidate_templates],
        "safety_reason": safety.get("reason"),
        "generated_at": __import__("datetime").datetime.utcnow().isoformat() + "Z",
    }

    frontend_plan = _to_frontend_plan(field, final_plan, trace)

    return CropPlanResponse(
        success=True,
        field=field,
        plan=final_plan,
        scores=chosen_score,
        hindi_explanation=hindi,
        trace={**trace, "frontend_plan": frontend_plan},
    )
