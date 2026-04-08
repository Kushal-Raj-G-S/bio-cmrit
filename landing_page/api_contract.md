# KrishiChakra RAG – Frontend API Contract
**Base URL:** `http://<server>:8000`

---

## POST `/api/v1/crop-plan`
Triggered when the user clicks **"AI Plan"** on a field card.

### Request
`Content-Type: application/json`

```json
{
  "id":            "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "user_id":       "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name":          "North Field A",

  "soil_type":     "Red Soil",
  "season":        "Kharif",
  "climate_zone":  "Tropical",
  "current_crop":  "Rice",

  "size":          2.5,
  "size_unit":     "hectares",

  "irrigation_type":   "Drip",
  "water_reliability": "Medium",

  "pest_history":       true,
  "disease_history":    "Leaf blight in 2024",
  "flood_drought_risk": "Low Risk — drip-irrigated field with stable water supply",

  "ai_soil_detected":    "Red Soil",
  "ai_climate_detected": "Tropical",
  "ai_season_detected":  "Kharif",

  "location": "Tumkur, Karnataka",
  "status":   "active",
  "notes":    "Red Soil field, Tropical zone, drip irrigated, Kharif season, currently growing Rice.",

  "created_at": "2026-02-25T12:00:00Z",
  "updated_at": "2026-02-25T12:00:00Z"
}
```

#### Field constraints
| Field | Type | Allowed values |
|---|---|---|
| `season` | string | `"Kharif"` · `"Rabi"` · `"Zaid"` |
| `size_unit` | string | `"hectares"` · `"acres"` |
| `water_reliability` | string | `"Low"` · `"Medium"` · `"High"` |
| `status` | string | `"active"` · `"planning"` · `"fallow"` · `"harvested"` |
| `pest_history` | boolean | `true` / `false` |

---

### Response `200 OK`
```json
{
  "success": true,
  "plan": {
    "field_id":    "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "field_name":  "North Field A",
    "location":    "Tumkur, Karnataka",
    "generated_at": "2026-02-25T14:32:10.123456+00:00",

    "rotation_plan": [
      {
        "season":             "Rabi 2026-27",
        "recommended_crop":   "Chickpea (Cicer arietinum)",
        "variety_suggestion": "JG 11",
        "rationale":          "Chickpea is a drought-tolerant legume that fixes atmospheric nitrogen, replenishing soil fertility depleted by rice. It is well suited to Red Soils in Karnataka with drip irrigation.",
        "expected_yield":     "1.2–1.5 t/ha",
        "input_requirements": "20:40:20 kg NPK/ha, 1 drip irrigation at flowering. Seed rate 60–75 kg/ha.",
        "risk_notes":         "Monitor for pod borer (Helicoverpa armigera). Avoid waterlogging — well-drained drip beds preferred."
      },
      {
        "season":             "Kharif 2027",
        "recommended_crop":   "Finger Millet (Eleusine coracana)",
        "variety_suggestion": "GPU 28",
        "rationale":          "Finger millet is a staple cereal for Karnataka, tolerates Red Soils, and breaks the rice–disease cycle that caused the 2024 leaf blight.",
        "expected_yield":     "2.5–3.0 t/ha",
        "input_requirements": "60:40:40 kg NPK/ha. Seed rate 10 kg/ha. Drip scheduling every 4–5 days.",
        "risk_notes":         "Blast disease risk — treat seed with Carbendazim 2 g/kg. Avoid dense sowing."
      },
      {
        "season":             "Rabi 2027-28",
        "recommended_crop":   "Mustard (Brassica juncea)",
        "variety_suggestion": "Pusa Bold",
        "rationale":          "Mustard is an oilseed break crop that diversifies income and suppresses root-rot pathogens carryover from finger millet.",
        "expected_yield":     "1.0–1.3 t/ha",
        "input_requirements": "40:20:20 kg NPK/ha + 20 kg S/ha. Seed rate 5 kg/ha. 1–2 irrigations.",
        "risk_notes":         "Aphid pressure possible in Feb. Use imidacloprid spray at bud stage if infestation >25%."
      }
    ],

    "soil_health_advisory":    "Red Soils are inherently low in organic matter and nitrogen. Incorporate chickpea crop residue after harvest. Apply 5 t/ha FYM before each Kharif season to sustain soil organic carbon above 0.6%.",
    "water_management_tip":    "With drip irrigation and medium water reliability, schedule chickpea at 60% field capacity trigger. Finger millet requires 450–500 mm over the season — rely on monsoon with supplemental drip at panicle initiation.",
    "pest_disease_management": "Given the 2024 leaf blight history (likely Rhizoctonia solani), avoid transplanted rice for at least 2 seasons. The chickpea–finger millet–mustard rotation is an effective break cycle. Apply Trichoderma viride 2.5 kg/ha as soil treatment before each crop.",
    "economic_outlook":        "This 3-season rotation on 2.5 ha is estimated to generate ₹1.8–2.2 lakh gross income. Chickpea and mustard attract MSP support. Finger millet has strong local demand in Karnataka markets.",

    "retrieved_sources": [
      "Legume-based crop rotation.pdf",
      "ICAR-En-Kharif-Agro-Advisories-for-Farmers-2025.pdf",
      "Improved Agronomic Practices.pdf"
    ],
    "model_used":  "provider-5/gemini-2.5-pro",
    "confidence":  "High"
  },
  "error": null
}
```

---

### Response `503` – All LLM models failed
```json
{
  "success": false,
  "plan": null,
  "error": "All 5 models failed. Last error: provider-6/llama-3.3-70b-versatile timed out"
}
```

### Response `500` – Internal error (retrieval / parse failure)
```json
{
  "success": false,
  "plan": null,
  "error": "LLM returned unstructured response: Could not extract valid JSON..."
}
```

---

## GET `/health`
Quick liveness + readiness check.

### Response `200 OK`
```json
{
  "status": "ok",
  "vector_count": 12685,
  "embedding_model": "sentence-transformers/all-MiniLM-L6-v2",
  "index_dir": "D:\\BioBloom_final\\main_backend\\krishichakra\\vector_store\\krishichakra_chroma"
}
```

---

## GET `/docs`
Auto-generated **Swagger UI** — open in browser for interactive testing.

---

## Response field reference

| Field | Type | Description |
|---|---|---|
| `plan.field_id` | string | Echoed from request `id` |
| `plan.field_name` | string | Echoed from request `name` |
| `plan.generated_at` | ISO 8601 string | UTC timestamp of generation |
| `plan.rotation_plan` | array[3] | Always exactly 3 seasonal entries |
| `plan.rotation_plan[].season` | string | e.g. `"Rabi 2026-27"` |
| `plan.rotation_plan[].recommended_crop` | string | Common + scientific name |
| `plan.rotation_plan[].variety_suggestion` | string | Region-specific variety |
| `plan.rotation_plan[].rationale` | string | Agronomic justification |
| `plan.rotation_plan[].expected_yield` | string | Range in t/ha |
| `plan.rotation_plan[].input_requirements` | string | Fertiliser, water, seed rate |
| `plan.rotation_plan[].risk_notes` | string | Pest/disease/climate caution |
| `plan.soil_health_advisory` | string | Long-term soil management |
| `plan.water_management_tip` | string | Irrigation-specific advice |
| `plan.pest_disease_management` | string | IPM advisory |
| `plan.economic_outlook` | string | Income/market estimate |
| `plan.retrieved_sources` | string[] | PDF filenames used as RAG context |
| `plan.model_used` | string | Which LLM answered |
| `plan.confidence` | `"High"` · `"Medium"` · `"Low"` | Model self-assessment |

---

## Typical frontend flow

```
User clicks "AI Plan" on field card
  │
  ▼
POST /api/v1/crop-plan  { FieldBatch }
  │
  ├─ Show loading spinner
  │
  ▼
200 OK  { success: true, plan: {...} }
  │
  ├─ Render rotation_plan[0..2] as season cards
  ├─ Render soil_health_advisory in "Soil" tab
  ├─ Render pest_disease_management in "Risks" tab
  ├─ Render economic_outlook in "Economics" tab
  └─ Show confidence badge + model_used in footer
```
