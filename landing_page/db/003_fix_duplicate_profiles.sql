-- ================================================
-- FIX: Prevent Duplicate Profile Creation
-- Updates the trigger to use UPSERT instead of INSERT
-- This prevents errors when profile already exists
-- ================================================

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create improved function with UPSERT logic
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Use UPSERT to avoid duplicate key errors
  INSERT INTO public.profiles (id, email, phone, full_name, phone_verified, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE WHEN NEW.phone IS NOT NULL THEN true ELSE false END,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, profiles.email),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
    phone_verified = CASE 
      WHEN EXCLUDED.phone IS NOT NULL THEN true 
      ELSE profiles.phone_verified 
    END,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ================================================
-- Verification
-- ================================================
-- Run this to verify the trigger exists:
-- SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'on_auth_user_created';
