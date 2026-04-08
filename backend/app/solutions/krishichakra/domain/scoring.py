from __future__ import annotations

from app.solutions.krishichakra.domain.models import FieldMetadata, RotationPlan, RotationScore

YIELD_TON_HA = {
    "rice": 4.2,
    "wheat": 3.8,
    "maize": 4.5,
    "finger millet": 2.4,
    "sorghum": 2.7,
    "pearl millet": 2.3,
    "chickpea": 1.5,
    "pigeon pea": 1.6,
    "green gram": 1.1,
    "groundnut": 1.8,
    "sunflower": 1.7,
    "mustard": 1.6,
    "sesame": 0.9,
}

PRICE_RS_TON = {
    "rice": 23000,
    "wheat": 24000,
    "maize": 22000,
    "finger millet": 30000,
    "sorghum": 26000,
    "pearl millet": 25000,
    "chickpea": 62000,
    "pigeon pea": 70000,
    "green gram": 78000,
    "groundnut": 56000,
    "sunflower": 52000,
    "mustard": 56000,
    "sesame": 90000,
}

LEGUMES = {"chickpea", "pigeon pea", "green gram", "black gram", "lentil", "cowpea", "groundnut"}
DEEP_ROOTED = {"pigeon pea", "sunflower", "cotton"}

CROP_FAMILY = {
    "rice": "poaceae",
    "wheat": "poaceae",
    "maize": "poaceae",
    "finger millet": "poaceae",
    "sorghum": "poaceae",
    "pearl millet": "poaceae",
    "chickpea": "fabaceae",
    "pigeon pea": "fabaceae",
    "green gram": "fabaceae",
    "groundnut": "fabaceae",
    "sunflower": "asteraceae",
    "mustard": "brassicaceae",
    "sesame": "pedaliaceae",
}

WATER_DEMAND = {
    "rice": 0.95,
    "wheat": 0.75,
    "maize": 0.7,
    "finger millet": 0.45,
    "sorghum": 0.5,
    "pearl millet": 0.4,
    "chickpea": 0.35,
    "pigeon pea": 0.45,
    "green gram": 0.3,
    "groundnut": 0.55,
    "sunflower": 0.5,
    "mustard": 0.4,
    "sesame": 0.35,
}


def _norm(value: float, low: float, high: float) -> float:
    if high <= low:
        return 0.0
    return max(0.0, min(1.0, (value - low) / (high - low)))


def score_rotation(rotation: RotationPlan, field: FieldMetadata) -> RotationScore:
    crops = [y.crop.strip().lower() for y in rotation.years]

    rev = 0.0
    for c in crops:
        yld = YIELD_TON_HA.get(c, 1.8)
        price = PRICE_RS_TON.get(c, 30000)
        rev += yld * price
    profit_score = _norm(rev / 3.0, 30000, 200000)

    has_legume = any(c in LEGUMES for c in crops)
    families = {CROP_FAMILY.get(c, c) for c in crops}
    has_deep = any(c in DEEP_ROOTED for c in crops)
    soil_health_score = min(1.0, (0.3 if has_legume else 0.0) + (0.3 if len(families) >= 3 else 0.0) + (0.4 if has_deep else 0.0))

    demand = sum(WATER_DEMAND.get(c, 0.6) for c in crops) / max(len(crops), 1)
    irrigation = (field.irrigation_type or "").lower()
    reliability = (field.water_reliability or "medium").lower()
    supply_factor = 0.9 if "drip" in irrigation else 0.8 if "sprinkler" in irrigation else 0.7 if "canal" in irrigation else 0.5
    supply_factor += 0.15 if reliability == "high" else 0.0
    supply_factor -= 0.15 if reliability == "low" else 0.0
    water_risk_score = max(0.0, min(1.0, demand - supply_factor + 0.5))

    back_to_back_same_family = 0
    for i in range(1, len(crops)):
        if CROP_FAMILY.get(crops[i]) == CROP_FAMILY.get(crops[i - 1]):
            back_to_back_same_family += 1
    second_year_legume = len(crops) > 1 and crops[1] in LEGUMES
    pest_break_score = (0.5 if second_year_legume else 0.0) + (0.5 if back_to_back_same_family == 0 else 0.0)

    overall_score = (
        0.35 * profit_score
        + 0.35 * soil_health_score
        + 0.15 * (1.0 - water_risk_score)
        + 0.15 * pest_break_score
    )

    return RotationScore(
        rotation_id=rotation.id,
        profit_score=round(profit_score, 4),
        soil_health_score=round(soil_health_score, 4),
        water_risk_score=round(water_risk_score, 4),
        pest_break_score=round(pest_break_score, 4),
        overall_score=round(overall_score, 4),
    )
