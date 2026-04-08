-- ================================================================
-- UPDATE RAMESH SHARMA TO REALISTIC FARMER PROFILE
-- ================================================================
-- This updates the test user to have realistic Indian farmer data
-- Run this in Supabase SQL Editor

UPDATE profiles 
SET 
  full_name = 'Ramesh Kumar Sharma',
  bio = 'Traditional farmer with 15 years of experience in paddy and wheat cultivation. Passionate about organic farming and sustainable agriculture practices.',
  experience_years = '10-20',
  farm_name = 'Sharma Krishi Farm',
  farm_size = 'medium',
  primary_crops = ARRAY['Rice', 'Wheat', 'Sugarcane'],
  city = 'Devanahalli',
  district = 'Bangalore Rural',
  state = 'Karnataka',
  pincode = '562110',
  phone_verified = true,
  onboarding_complete = true,
  onboarding_step = 5,
  updated_at = NOW()
WHERE id = '485625cc-7f8d-48f3-b293-9b47cb9f6a62';

-- Add some realistic community activity for this user
-- (These will make the profile look more authentic when others see it)

-- Update existing questions to have better content
UPDATE community_questions
SET 
  title = CASE 
    WHEN title LIKE '%Aphid%' THEN 'Aphid infestation in wheat crops - need urgent organic solution'
    WHEN title LIKE '%pH%' THEN 'High soil pH (8.2) affecting paddy growth - best way to reduce it?'
    WHEN title LIKE '%irrigation%' THEN 'Drip irrigation vs sprinkler for 5 acre sugarcane farm - which is better?'
    ELSE title
  END,
  content = CASE 
    WHEN title LIKE '%Aphid%' THEN 'Namaste farmers! I am facing severe aphid attack on my 3 acre wheat field. The infestation started last week and is spreading fast. I prefer organic methods. Has anyone tried neem oil spray? What concentration works best? Please share your experience. Thanks!'
    WHEN title LIKE '%pH%' THEN 'My soil test shows pH level of 8.2 which is too alkaline for paddy cultivation. The crop growth is slow and leaves are turning yellow. I tried adding organic compost but no improvement yet. Should I use sulfur or gypsum? How much quantity per acre? Please guide.'
    WHEN title LIKE '%irrigation%' THEN 'Planning to install irrigation system for my 5 acre sugarcane farm in Devanahalli. Water table is 40 feet deep. Confused between drip and sprinkler. Which one is more water efficient and cost effective? What is the maintenance cost? Please share your suggestions based on real experience.'
    ELSE content
  END,
  updated_at = NOW()
WHERE author_id = '485625cc-7f8d-48f3-b293-9b47cb9f6a62';

-- Verify the update
SELECT 
  full_name,
  phone,
  farm_name,
  farm_size,
  city,
  district,
  state,
  primary_crops,
  experience_years,
  bio
FROM profiles 
WHERE id = '485625cc-7f8d-48f3-b293-9b47cb9f6a62';

-- Show updated questions
SELECT 
  title,
  LEFT(content, 100) as content_preview,
  vote_count,
  views,
  created_at
FROM community_questions 
WHERE author_id = '485625cc-7f8d-48f3-b293-9b47cb9f6a62'
ORDER BY created_at DESC;
