-- ============================================================================
-- Migration 010: Add missing columns to field_batches
-- Run this once in Supabase SQL Editor
-- ============================================================================

-- size_unit: 'hectares' or 'acres'
ALTER TABLE field_batches
  ADD COLUMN IF NOT EXISTS size_unit TEXT DEFAULT 'hectares'
    CHECK (size_unit IN ('hectares', 'acres'));

-- irrigation_type: Rainfed, Drip, Sprinkler, Canal, Borewell
ALTER TABLE field_batches
  ADD COLUMN IF NOT EXISTS irrigation_type TEXT;

-- water_reliability: Low, Medium, High
ALTER TABLE field_batches
  ADD COLUMN IF NOT EXISTS water_reliability TEXT
    CHECK (water_reliability IN ('Low', 'Medium', 'High'));

-- pest_history: boolean flag
ALTER TABLE field_batches
  ADD COLUMN IF NOT EXISTS pest_history BOOLEAN DEFAULT FALSE;

-- disease_history: free text e.g. "Leaf blight in 2024"
ALTER TABLE field_batches
  ADD COLUMN IF NOT EXISTS disease_history TEXT;

-- flood_drought_risk: AI-suggested risk string
ALTER TABLE field_batches
  ADD COLUMN IF NOT EXISTS flood_drought_risk TEXT;

-- ai_soil_detected: soil type detected by AI/Bhuvan
ALTER TABLE field_batches
  ADD COLUMN IF NOT EXISTS ai_soil_detected TEXT;

-- ai_climate_detected: climate zone detected by AI/Bhuvan
ALTER TABLE field_batches
  ADD COLUMN IF NOT EXISTS ai_climate_detected TEXT;

-- ai_season_detected: season detected by AI/Bhuvan
ALTER TABLE field_batches
  ADD COLUMN IF NOT EXISTS ai_season_detected TEXT;
