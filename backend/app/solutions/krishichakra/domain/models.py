from __future__ import annotations

from pydantic import BaseModel, Field


class FieldMetadata(BaseModel):
    id: str | None = None
    user_id: str | None = None
    name: str | None = None
    location: str
    zone: str | None = None
    soil_type: str
    irrigation_type: str
    season: str
    current_crop: str
    climate_zone: str | None = None
    size: float | None = None
    size_unit: str | None = None
    water_reliability: str | None = None
    pest_history: bool | None = None
    disease_issues: list[str] = Field(default_factory=list)
    disease_history: str | None = None
    flood_drought_risk: str | None = None
    status: str | None = None
    farmer_preferences: list[str] = Field(default_factory=list)
    language: str = "en"


class RotationYear(BaseModel):
    year_index: int
    season: str
    crop: str
    variety_suggestion: str | None = None
    rationale: str
    expected_yield: str | None = None
    input_requirements: str | None = None
    risk_notes: str | None = None
    source_refs: list[str] = Field(default_factory=list)


class RotationPlan(BaseModel):
    id: str
    years: list[RotationYear]
    confidence: str
    summary: str
    sources: list[str] = Field(default_factory=list)


class RotationScore(BaseModel):
    rotation_id: str
    profit_score: float
    soil_health_score: float
    water_risk_score: float
    pest_break_score: float
    overall_score: float


class CropPlanResponse(BaseModel):
    success: bool
    field: FieldMetadata
    plan: RotationPlan
    scores: RotationScore | None
    hindi_explanation: str | None
    trace: dict
    error: str | None = None
