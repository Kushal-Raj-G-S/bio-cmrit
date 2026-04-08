from __future__ import annotations

from pydantic import BaseModel, Field


class FieldMetadata(BaseModel):
    location: str
    zone: str | None = None
    soil_type: str
    irrigation: str
    season: str
    current_crop: str
    disease_issues: list[str] = Field(default_factory=list)


class RotationYear(BaseModel):
    year_index: int
    season: str
    crop: str
    notes: str | None = None


class RotationPlan(BaseModel):
    id: str
    years: list[RotationYear]
    confidence: str
    sources: list[str]


class RotationScore(BaseModel):
    rotation_id: str
    profit_score: float
    soil_health_score: float
    water_risk_score: float
    pest_break_score: float
    overall_score: float
