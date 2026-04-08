from app.domain.models import FieldMetadata
from app.services.crop_planner import generate_crop_plan


def test_generate_crop_plan_returns_three_year_plan_and_valid_score() -> None:
    field = FieldMetadata(
        location="Harohalli, Karnataka",
        zone="Southern Karnataka",
        soil_type="Red loam",
        irrigation="Sprinkler",
        season="Rabi",
        current_crop="Barley",
    )

    plan, score, _trace = generate_crop_plan(field)

    assert len(plan.years) == 3
    assert 0.0 <= score.overall_score <= 1.0
