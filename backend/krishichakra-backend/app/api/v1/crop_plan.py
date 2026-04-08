from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.domain.models import FieldMetadata, RotationPlan, RotationScore
from app.rag.llm.hindi_explainer import explain_in_hindi
from app.services.crop_planner import generate_crop_plan

router = APIRouter()


class CropPlanRequest(BaseModel):
    location: str
    zone: str | None = None
    soil_type: str
    irrigation: str
    season: str
    current_crop: str
    disease_issues: list[str] = Field(default_factory=list)


class CropPlanResponse(BaseModel):
    field: FieldMetadata
    plan: RotationPlan
    scores: RotationScore | None
    hindi_explanation: str | None
    trace: dict


@router.post("/crop-plan", response_model=CropPlanResponse)
def create_crop_plan(payload: CropPlanRequest) -> CropPlanResponse:
    field = FieldMetadata(**payload.model_dump())
    plan, score, trace = generate_crop_plan(field)
    hindi = explain_in_hindi(plan)
    return CropPlanResponse(
        field=field,
        plan=plan,
        scores=score,
        hindi_explanation=hindi,
        trace=trace,
    )
