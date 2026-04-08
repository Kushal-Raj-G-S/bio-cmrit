from __future__ import annotations

from app.domain.models import FieldMetadata, RotationPlan, RotationScore


def score_rotation(rotation: RotationPlan, field: FieldMetadata) -> RotationScore:
    # TODO implement real agronomic scoring logic
    _ = field
    profit_score = 0.72
    soil_health_score = 0.78
    water_risk_score = 0.65
    pest_break_score = 0.74
    overall_score = (profit_score + soil_health_score + water_risk_score + pest_break_score) / 4.0

    return RotationScore(
        rotation_id=rotation.id,
        profit_score=profit_score,
        soil_health_score=soil_health_score,
        water_risk_score=water_risk_score,
        pest_break_score=pest_break_score,
        overall_score=overall_score,
    )
