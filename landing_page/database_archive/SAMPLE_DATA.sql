-- ================================================================
-- SAMPLE FARMING QUESTIONS FOR TESTING
-- Run this AFTER creating tables to populate with test data
-- ================================================================

-- First, we use the currently logged-in user or the first existing profile
DO $$
DECLARE
  farmer1_id UUID;
  crop_mgmt_id UUID;
  pest_ctrl_id UUID;
  soil_health_id UUID;
  water_mgmt_id UUID;
  market_id UUID;
BEGIN
  -- Get the first existing profile ID (or use current auth user)
  SELECT id INTO farmer1_id FROM profiles LIMIT 1;
  
  -- If no profiles exist, you need to login first or create a user through Supabase Auth
  IF farmer1_id IS NULL THEN
    RAISE EXCEPTION 'No profiles found. Please login or create a user account first.';
  END IF;

  -- Get category IDs
  SELECT id INTO crop_mgmt_id FROM community_categories WHERE slug = 'crop-management';
  SELECT id INTO pest_ctrl_id FROM community_categories WHERE slug = 'pest-control';
  SELECT id INTO soil_health_id FROM community_categories WHERE slug = 'soil-health';
  SELECT id INTO water_mgmt_id FROM community_categories WHERE slug = 'water-management';
  SELECT id INTO market_id FROM community_categories WHERE slug = 'market-access';

  -- Sample farming questions with realistic content (all using the same user for simplicity)
  INSERT INTO community_questions (title, content, author_id, category_id, tags, views, vote_count, comment_count, is_answered) VALUES
  -- Crop Management Questions
  ('Best organic fertilizers for tomato farming?', 
   'I am growing tomatoes in my 2-acre farm and want to switch to organic farming. What are the best organic fertilizers you recommend? Currently using DAP and Urea but want to go chemical-free.',
   farmer1_id,
   crop_mgmt_id,
   ARRAY['tomato', 'organic', 'fertilizer'],
   45, 8, 3, false),

  -- Pest Control Questions  
  ('Aphid infestation in wheat crops - urgent help needed!',
   'My wheat field is heavily infested with aphids. The attack started 3 days ago and is spreading fast. I have tried neem oil spray but no improvement. Please suggest immediate action. The crop is in heading stage.',
   farmer1_id,
   pest_ctrl_id,
   ARRAY['wheat', 'aphid', 'pest', 'urgent'],
   128, 15, 8, true),

  -- Soil Health Questions
  ('pH level of soil is 8.2 - how to reduce it for paddy cultivation?',
   'Soil test results show pH 8.2 which is too alkaline for rice. What are cost-effective methods to reduce soil pH? My field size is 5 acres. Should I use elemental sulfur or organic matter?',
   farmer1_id, 
   soil_health_id,
   ARRAY['soil-ph', 'paddy', 'rice', 'alkaline'],
   67, 11, 5, true),

  -- Water Management Questions
  ('Drip irrigation vs sprinkler system for sugarcane?',
   'Planning to install irrigation system for 10-acre sugarcane farm. Confused between drip and sprinkler. Which is more water-efficient and cost-effective for sugarcane? What is the initial investment difference?',
   farmer1_id,
   water_mgmt_id,
   ARRAY['irrigation', 'sugarcane', 'drip', 'sprinkler'],
   89, 6, 4, false),

  -- Market Access Questions
  ('Current market rate for onions in Nasik APMC?',
   'Can someone share today''s onion prices at Nasik Agricultural Produce Market Committee? My crop is ready for harvest and I want to decide the right timing. Also, any predictions for next month?',
   farmer1_id,
   market_id, 
   ARRAY['onion', 'market-price', 'nasik', 'apmc'],
   234, 3, 7, false);

  -- Initialize user stats
  INSERT INTO community_user_stats (user_id, questions_asked, reputation_score, badges) VALUES
    (farmer1_id, 5, 245, ARRAY['Early Adopter', 'Question Asker']::text[])
  ON CONFLICT (user_id) DO UPDATE SET
    questions_asked = EXCLUDED.questions_asked,
    reputation_score = EXCLUDED.reputation_score,
    badges = EXCLUDED.badges;

  RAISE NOTICE '✅ SUCCESS! Sample data added:';
  RAISE NOTICE '   • 5 realistic farming questions';
  RAISE NOTICE '   • Proper category assignments';
  RAISE NOTICE '   • Tags and engagement metrics';
  RAISE NOTICE '   • User reputation initialized';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Community hub is ready with real database questions!';

END $$;

-- ================================================================
-- NOTES:
-- ✅ Uses your existing profile ID (from your login)
-- ✅ 5 realistic farming questions  
-- ✅ Proper category assignments with tags
-- ✅ Pre-populated views, votes, and comment counts
-- ✅ User reputation tracking
-- 
-- Your community hub will now show real questions from the database!
-- ================================================================