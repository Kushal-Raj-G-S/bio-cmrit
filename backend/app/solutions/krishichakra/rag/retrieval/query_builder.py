from __future__ import annotations

from app.solutions.krishichakra.domain.models import FieldMetadata


def build_retrieval_query(field: FieldMetadata) -> dict:
    disease = ", ".join(field.disease_issues) if field.disease_issues else (field.disease_history or "none")
    natural_query = (
        f"3-year crop rotation recommendation for {field.soil_type} soil in {field.location}. "
        f"Season {field.season}, current crop {field.current_crop}, irrigation {field.irrigation_type}, "
        f"disease issues {disease}. Objective: break pest cycle, improve soil health, maintain profit."
    )
    filters = {
        "zone": field.zone or field.climate_zone,
        "soil": field.soil_type,
        "irrigation": field.irrigation_type,
        "current_crop": field.current_crop,
    }
    return {"natural_query": natural_query, "filters": filters}
