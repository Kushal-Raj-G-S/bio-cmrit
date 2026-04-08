-- ================================================
-- Add app_password column to profiles
-- Run in Supabase SQL Editor
-- ================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS app_password TEXT;

-- Set password for Ramesh (plain text: 'ramesh')
UPDATE profiles SET app_password = 'ramesh' WHERE phone = '+919686293233' OR phone = '919686293233' OR phone = '9686293233';
