from __future__ import annotations


def build_rotations_catalog() -> list[dict]:
    return [
        {
            "id": "rot-1",
            "years": ["Rice", "Chickpea", "Mung Bean"],
            "soil_type": "red",
            "irrigation": "sprinkler",
        },
        {
            "id": "rot-2",
            "years": ["Maize", "Mustard", "Groundnut"],
            "soil_type": "black",
            "irrigation": "canal",
        },
        {
            "id": "rot-3",
            "years": ["Sorghum", "Pigeon Pea", "Sesame"],
            "soil_type": "alluvial",
            "irrigation": "rainfed",
        },
    ]
