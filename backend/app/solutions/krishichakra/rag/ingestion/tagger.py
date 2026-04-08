from __future__ import annotations

import re

CROPS = [
    "rice", "wheat", "maize", "finger millet", "sorghum", "pearl millet", "chickpea", "pigeon pea", "green gram", "groundnut", "mustard", "sunflower", "sesame",
]
SOILS = ["red", "black", "alluvial", "sandy", "clay", "loam"]
SEASONS = ["kharif", "rabi", "zaid"]


def tag_chunk(text: str) -> dict:
    lowered = text.lower()
    crops = [c for c in CROPS if re.search(rf"\b{re.escape(c)}\b", lowered)]
    soils = [s for s in SOILS if re.search(rf"\b{s}\b", lowered)]
    seasons = [s.title() for s in SEASONS if re.search(rf"\b{s}\b", lowered)]
    return {"crops": crops, "soil": soils, "season": seasons}
