from __future__ import annotations

import json
from pathlib import Path

from app.solutions.krishichakra.core.config import settings
from app.solutions.krishichakra.rag.ingestion.rotations_builder import build_rotations_catalog


class RotationsCatalog:
    def __init__(self) -> None:
        self.rows = self._load_rows()

    def _load_rows(self) -> list[dict]:
        p = Path(settings.rotations_catalog_path)
        if not p.exists():
            build_rotations_catalog()
        rows: list[dict] = []
        with p.open("r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    rows.append(json.loads(line))
        return rows

    def get_candidate_rotations(self, field, max_k: int = 5) -> list[dict]:
        soil = (field.soil_type or "").lower()
        zone = ((field.zone or field.climate_zone) or "").lower()
        irrigation = (field.irrigation_type or "").lower()
        base_crop = (field.current_crop or "").lower()

        def hit(r: dict, strict: bool) -> bool:
            rs = str(r.get("soil", "")).lower()
            rz = str(r.get("zone", "")).lower()
            ri = str(r.get("irrigation", "")).lower()
            rb = str(r.get("base_crop", "")).lower()
            if strict:
                return soil in rs and (not zone or zone in rz) and irrigation in ri and base_crop in rb
            return (
                (soil and soil in rs)
                or (zone and zone in rz)
                or (irrigation and irrigation in ri)
                or (base_crop and base_crop in rb)
                or rs == "any"
                or ri == "any"
                or rb == "any"
            )

        strict_rows = [r for r in self.rows if hit(r, strict=True)]
        if len(strict_rows) >= max_k:
            return strict_rows[:max_k]

        relaxed = strict_rows + [r for r in self.rows if r not in strict_rows and hit(r, strict=False)]
        return relaxed[:max_k]
