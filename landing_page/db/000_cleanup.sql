-- ================================================
-- BIOBLOOM DATABASE CLEANUP SCRIPT
-- ================================================
-- WARNING: This will DELETE ALL DATA in the profiles table
-- Run this FIRST before running 001_profiles_schema.sql
-- ================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

-- Drop triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Drop functions
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop indexes
DROP INDEX IF EXISTS idx_profiles_phone;
DROP INDEX IF EXISTS idx_profiles_email;
DROP INDEX IF EXISTS idx_profiles_onboarding_complete;

-- Drop table
DROP TABLE IF EXISTS profiles CASCADE;

-- ================================================
-- CLEANUP COMPLETE
-- Now run 001_profiles_schema.sql to recreate everything
-- ================================================
