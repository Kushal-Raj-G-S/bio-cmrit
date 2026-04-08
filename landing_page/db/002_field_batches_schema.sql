-- ================================================
-- KRISHICHAKRA FIELD BATCHES SCHEMA
-- ================================================
-- Run this in Supabase SQL Editor: https://app.supabase.com
-- Database -> SQL Editor -> New Query -> Paste & Run
-- ================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- TABLE: field_batches
-- Stores field batch information for crop rotation AI
-- ================================================
CREATE TABLE IF NOT EXISTS field_batches (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- User Reference (linked to Supabase auth.users)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Field Information
  name TEXT NOT NULL,
  location TEXT,
  size DECIMAL(10, 2) NOT NULL, -- Size in hectares
  
  -- AI Recommendation Inputs (Required for crop rotation)
  soil_type TEXT NOT NULL,
  season TEXT NOT NULL,
  climate_zone TEXT NOT NULL,
  current_crop TEXT,
  
  -- Field Status
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('active', 'planning', 'fallow', 'harvested')),
  
  -- Optional Tracking
  planted_date TIMESTAMP WITH TIME ZONE,
  expected_harvest TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- INDEXES for better query performance
-- ================================================
CREATE INDEX IF NOT EXISTS idx_field_batches_user_id ON field_batches(user_id);
CREATE INDEX IF NOT EXISTS idx_field_batches_status ON field_batches(status);
CREATE INDEX IF NOT EXISTS idx_field_batches_season ON field_batches(season);
CREATE INDEX IF NOT EXISTS idx_field_batches_soil_type ON field_batches(soil_type);

-- ================================================
-- TRIGGER: Auto-update updated_at timestamp
-- ================================================
CREATE OR REPLACE FUNCTION update_field_batches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_field_batches_updated_at
  BEFORE UPDATE ON field_batches
  FOR EACH ROW
  EXECUTE FUNCTION update_field_batches_updated_at();

-- ================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures users can only access their own field batches
-- ================================================

-- Enable RLS
ALTER TABLE field_batches ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own field batches
CREATE POLICY "Users can view own field batches" 
  ON field_batches
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own field batches
CREATE POLICY "Users can insert own field batches" 
  ON field_batches
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own field batches
CREATE POLICY "Users can update own field batches" 
  ON field_batches
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own field batches
CREATE POLICY "Users can delete own field batches" 
  ON field_batches
  FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Check if table exists and view structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'field_batches'
ORDER BY ordinal_position;

-- Check if indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'field_batches';

-- Check if RLS policies exist
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'field_batches';

-- ================================================
-- SAMPLE DATA (Optional - for testing)
-- ================================================

-- Uncomment below to insert sample data (replace USER_ID with actual user ID)
/*
INSERT INTO field_batches (user_id, name, location, size, soil_type, season, climate_zone, current_crop, status, notes)
VALUES 
  ('USER_ID', 'North Field', 'North Section', 2.5, 'Clay Loam', 'Kharif', 'Tropical', 'Rice', 'active', 'Main field for rice cultivation'),
  ('USER_ID', 'South Field', 'South Section', 1.8, 'Sandy Loam', 'Rabi', 'Sub-tropical', 'Wheat', 'planning', 'Planning wheat rotation'),
  ('USER_ID', 'East Field', 'East Section', 3.2, 'Black Soil', 'Kharif', 'Tropical', 'Fallow (No Crop)', 'fallow', 'Resting for next season');
*/
