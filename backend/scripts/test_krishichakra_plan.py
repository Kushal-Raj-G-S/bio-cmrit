from __future__ import annotations

import asyncio
import json

from app.solutions.krishichakra.domain.models import FieldMetadata
from app.solutions.krishichakra.services.crop_planner import generate_crop_plan


async def main() -> None:
    field = FieldMetadata(
        id="field-001",
        user_id="demo",
        name="Jowar Plot",
        location="Harohalli, Karnataka",
        soil_type="Red Soil",
        irrigation_type="Sprinkler",
        season="Rabi",
        current_crop="Barley",
        climate_zone="Tropical",
        water_reliability="Medium",
        disease_issues=["leaf blight"],
    )
    result = await generate_crop_plan(field)
    print(json.dumps(result.model_dump(), indent=2))


if __name__ == "__main__":
    asyncio.run(main())
