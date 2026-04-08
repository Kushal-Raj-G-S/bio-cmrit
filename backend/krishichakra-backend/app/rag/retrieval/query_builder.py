from __future__ import annotations

from app.domain.models import FieldMetadata


def build_retrieval_query(field: FieldMetadata) -> dict:
    natural_query = (
        f"3-year crop rotation for {field.soil_type} soil in {field.location}, "
        f"{field.season} season, current crop {field.current_crop}, irrigation {field.irrigation}."
    )
    return {
        "natural_query": natural_query,
        "filters": {
            "zone": field.zone,
            "soil_type": field.soil_type,
            "season": field.season,
            "current_crop": field.current_crop,
        },
    }
