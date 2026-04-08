from __future__ import annotations

import json
from pathlib import Path

from app.solutions.krishichakra.core.config import settings

DEFAULT_ROTATIONS = [
    {"id": "rot-ka-red-jowar-sprinkler", "zone": "karnataka", "soil": "red", "irrigation": "sprinkler", "base_crop": "jowar", "years": ["finger millet", "pigeon pea", "groundnut"], "source_refs": ["Improved Agronomic Practices.pdf:p119", "Pulse-based cropping systems for soil health restoration.pdf:p20"]},
    {"id": "rot-ka-red-maize-sprinkler", "zone": "karnataka", "soil": "red", "irrigation": "sprinkler", "base_crop": "maize", "years": ["sorghum", "chickpea", "sesame"], "source_refs": ["Field Crops Kharif.pdf:p59", "Legume-based crop rotation.pdf:p2"]},
    {"id": "rot-ka-clay-rice-canal", "zone": "karnataka", "soil": "clay", "irrigation": "canal", "base_crop": "rice", "years": ["wheat", "green gram", "sunflower"], "source_refs": ["Rice-based Cropping Systems.pdf:p12", "Legume-based crop rotation.pdf:p5"]},
    {"id": "rot-ka-black-cotton-rainfed", "zone": "karnataka", "soil": "black", "irrigation": "rainfed", "base_crop": "cotton", "years": ["sorghum", "chickpea", "safflower"], "source_refs": ["Principles of Agronomy & Agricultural Meteorology.pdf:p46", "ECONOMICS OF CROPPING SYSTEMS UNDER.pdf:p3"]},
    {"id": "rot-india-alluvial-wheat-canal", "zone": "india", "soil": "alluvial", "irrigation": "canal", "base_crop": "wheat", "years": ["rice", "lentil", "mustard"], "source_refs": ["Rice-wheat system in the northwest Indo-Gangetic plains of South.pdf:p7", "Legumes in rich n wheat system.pdf:p163"]},
    {"id": "rot-india-red-rainfed-any", "zone": "india", "soil": "red", "irrigation": "rainfed", "base_crop": "any", "years": ["pearl millet", "chickpea", "sesame"], "source_refs": ["Field Crops Kharif.pdf:p59", "Farming-Systems-26_0.pdf:p14"]},
    {"id": "rot-india-black-irrigated-any", "zone": "india", "soil": "black", "irrigation": "any", "base_crop": "any", "years": ["sorghum", "pigeon pea", "sunflower"], "source_refs": ["Pulse-based cropping systems for soil health restoration.pdf:p22", "ECONOMIC OPTIMUM CROP PLANNING FOR RESOURCE.pdf:p8"]},
]


def build_rotations_catalog() -> list[dict]:
    path = Path(settings.rotations_catalog_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        for row in DEFAULT_ROTATIONS:
            f.write(json.dumps(row, ensure_ascii=True) + "\n")
    return DEFAULT_ROTATIONS
