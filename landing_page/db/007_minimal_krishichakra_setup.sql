-- ============================================================================
-- KRISHICHAKRA MINIMAL SETUP - QUICK START 
-- ============================================================================
-- Creates only the essential tables needed for KrishiChakra frontend to work
-- Use this if you get errors with the complete migration
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TABLES ONLY
-- ============================================================================

-- 1. Profiles table (if not exists)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  experience_years TEXT,
  farm_name TEXT,
  farm_size TEXT,
  primary_crops TEXT,
  city TEXT,
  district TEXT,
  state TEXT,
  pincode TEXT,
  phone_verified BOOLEAN DEFAULT false,
  onboarding_complete BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 0,
  courses_completed INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Field batches table (main KrishiChakra requirement)
CREATE TABLE IF NOT EXISTS field_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  size DECIMAL(10, 2) NOT NULL,
  soil_type TEXT NOT NULL,
  season TEXT NOT NULL,
  climate_zone TEXT,
  current_crop TEXT,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('active', 'planning', 'fallow', 'harvested')),
  planted_date DATE,
  expected_harvest DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ESSENTIAL SECURITY & PERFORMANCE
-- ============================================================================

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_batches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own field batches" ON field_batches;
DROP POLICY IF EXISTS "Users can insert own field batches" ON field_batches;
DROP POLICY IF EXISTS "Users can update own field batches" ON field_batches;
DROP POLICY IF EXISTS "Users can delete own field batches" ON field_batches;

-- Create fresh policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles  
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own field batches" ON field_batches
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own field batches" ON field_batches
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own field batches" ON field_batches
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own field batches" ON field_batches
    FOR DELETE USING (auth.uid() = user_id);

-- Essential indexes
CREATE INDEX IF NOT EXISTS idx_field_batches_user_id ON field_batches(user_id);
CREATE INDEX IF NOT EXISTS idx_field_batches_status ON field_batches(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ============================================================================
-- UPDATE TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist (to avoid conflicts)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_field_batches_updated_at ON field_batches;

-- Create fresh triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_field_batches_updated_at
    BEFORE UPDATE ON field_batches  
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VERIFICATION FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION verify_minimal_setup()
RETURNS TEXT AS $$
DECLARE
    profiles_exists BOOLEAN;
    field_batches_exists BOOLEAN;
BEGIN
    -- Check if tables exist
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'profiles'
    ) INTO profiles_exists;
    
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'field_batches'
    ) INTO field_batches_exists;
    
    RETURN 'Setup Status: ' ||
           CASE WHEN profiles_exists THEN 'Profiles ✓' ELSE 'Profiles ✗' END ||
           ' | ' ||
           CASE WHEN field_batches_exists THEN 'Field Batches ✓' ELSE 'Field Batches ✗' END ||
           ' | Ready for KrishiChakra!';
END;
$$ LANGUAGE plpgsql;

-- Run verification
SELECT verify_minimal_setup();