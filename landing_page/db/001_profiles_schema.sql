-- ================================================
-- BIOBLOOM DATABASE SCHEMA - FARMER PROFILE ONLY
-- ================================================
-- Run this in Supabase SQL Editor: https://app.supabase.com
-- Database -> SQL Editor -> New Query -> Paste & Run
-- ================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- TABLE: profiles
-- Stores farmer profile information
-- Extends Supabase auth.users table (1:1 relationship)
-- ================================================
CREATE TABLE IF NOT EXISTS profiles (
  -- Primary Key (linked to Supabase auth.users)
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Information
  full_name TEXT,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  
  -- Farming Experience
  experience_years TEXT, -- '0-2', '3-5', '6-10', '11-20', '20+'
  
  -- Farm Details
  farm_name TEXT,
  farm_size TEXT, -- 'small', 'medium', 'large', 'commercial'
  primary_crops TEXT, -- Comma-separated: "Wheat, Rice, Cotton"
  
  -- Location
  city TEXT,
  district TEXT,
  state TEXT,
  pincode TEXT,
  
  -- Verification Status
  phone_verified BOOLEAN DEFAULT false,
  aadhaar_verified BOOLEAN DEFAULT false,
  aadhaar_last_4 TEXT, -- Store only last 4 digits for security
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Onboarding Status
  onboarding_complete BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 0, -- Track which step user is on
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- INDEXES for better query performance
-- ================================================
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_complete ON profiles(onboarding_complete);

-- ================================================
-- TRIGGER: Auto-update updated_at timestamp
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures users can only access their own data
-- ================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" 
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" 
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" 
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete own profile" 
  ON profiles
  FOR DELETE
  USING (auth.uid() = id);

-- ================================================
-- TRIGGER: Auto-create profile on user signup
-- Creates a profile entry when a new user signs up
-- Handles both phone and email signups
-- ================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone, full_name, phone_verified, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE WHEN NEW.phone IS NOT NULL THEN true ELSE false END,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ================================================
-- SAMPLE QUERIES (for testing)
-- ================================================

-- Get current user's profile
-- SELECT * FROM profiles WHERE id = auth.uid();

-- Update user's farm details
-- UPDATE profiles 
-- SET farm_name = 'Green Valley Farms', 
--     farm_size = 'medium', 
--     primary_crops = 'Wheat, Rice'
-- WHERE id = auth.uid();

-- Check onboarding status
-- SELECT onboarding_complete, onboarding_step 
-- FROM profiles 
-- WHERE id = auth.uid();

-- ================================================
-- CLEANUP (Run only if you need to reset)
-- ================================================
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
-- DROP FUNCTION IF EXISTS handle_new_user();
-- DROP FUNCTION IF EXISTS update_updated_at_column();
-- DROP TABLE IF EXISTS profiles CASCADE;
