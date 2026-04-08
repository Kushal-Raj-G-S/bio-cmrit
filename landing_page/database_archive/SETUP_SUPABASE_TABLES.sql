-- ================================================================
-- BIOBLOOM COMMUNITY HUB DATABASE SETUP
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/mjpklbrzusbrocsluoum/sql
-- ================================================================

-- Categories table
CREATE TABLE IF NOT EXISTS community_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  color TEXT DEFAULT '#10b981',
  question_count INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions table  
CREATE TABLE IF NOT EXISTS community_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES community_categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  views INTEGER DEFAULT 0,
  vote_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_answered BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table  
CREATE TABLE IF NOT EXISTS community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES community_questions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  vote_count INTEGER DEFAULT 0,
  is_answer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Votes table
CREATE TABLE IF NOT EXISTS community_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id UUID REFERENCES community_questions(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id),
  UNIQUE(user_id, comment_id),
  CHECK ((question_id IS NOT NULL AND comment_id IS NULL) OR (question_id IS NULL AND comment_id IS NOT NULL))
);

-- User stats for community
CREATE TABLE IF NOT EXISTS community_user_stats (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  questions_asked INTEGER DEFAULT 0,
  comments_posted INTEGER DEFAULT 0,
  answers_given INTEGER DEFAULT 0,
  reputation_score INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- PERFORMANCE INDEXES
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_questions_author ON community_questions(author_id);
CREATE INDEX IF NOT EXISTS idx_questions_category ON community_questions(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_created ON community_questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_votes ON community_questions(vote_count DESC);
CREATE INDEX IF NOT EXISTS idx_comments_question ON community_comments(question_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON community_comments(author_id);

-- ================================================================
-- FARMING CATEGORIES (Starter Data)
-- ================================================================

INSERT INTO community_categories (name, slug, icon, color, description) VALUES
  ('Crop Management', 'crop-management', '🌾', '#10b981', 'Questions about planting, growing, and harvesting crops'),
  ('Pest Control', 'pest-control', '🐛', '#ef4444', 'Organic and chemical pest control strategies'), 
  ('Soil Health', 'soil-health', '🌱', '#8b5cf6', 'Soil testing, fertilization, and nutrient management'),
  ('Water Management', 'water-management', '💧', '#3b82f6', 'Irrigation systems, water conservation, and drainage'),
  ('Market Access', 'market-access', '🏪', '#f59e0b', 'Selling crops, pricing strategies, and connecting with buyers'),
  ('Equipment & Technology', 'equipment-tech', '🚜', '#6366f1', 'Farm machinery, tools, and agricultural technology'),
  ('Livestock', 'livestock', '🐄', '#ec4899', 'Animal husbandry, feeding, and animal health'),
  ('Government Schemes', 'govt-schemes', '🏛️', '#14b8a6', 'Government programs, subsidies, and support for farmers'),
  ('Weather & Climate', 'weather-climate', '⛅', '#06b6d4', 'Weather patterns, climate adaptation, and seasonal planning')
ON CONFLICT (slug) DO NOTHING;

-- ================================================================
-- ROW LEVEL SECURITY (Optional - for production)
-- ================================================================

ALTER TABLE community_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_questions ENABLE ROW LEVEL SECURITY; 
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_user_stats ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read categories and questions
CREATE POLICY "Categories are viewable by everyone" ON community_categories FOR SELECT USING (true);
CREATE POLICY "Questions are viewable by everyone" ON community_questions FOR SELECT USING (true);
CREATE POLICY "Comments are viewable by everyone" ON community_comments FOR SELECT USING (true);
CREATE POLICY "Votes are viewable by everyone" ON community_votes FOR SELECT USING (true);
CREATE POLICY "User stats are viewable by everyone" ON community_user_stats FOR SELECT USING (true);

-- Allow authenticated users to create content (we'll handle this in API for now)
CREATE POLICY "Anyone can create questions" ON community_questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create comments" ON community_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create votes" ON community_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update user stats" ON community_user_stats FOR ALL WITH CHECK (true);

-- ================================================================
-- SUCCESS! 🎉 
-- All tables created. Check the Table Editor to see:
-- - community_categories (9 farming categories)  
-- - community_questions (ready for real posts)
-- - community_comments (threaded discussions)
-- - community_votes (upvote/downvote system)
-- - community_user_stats (reputation/badges)
-- ================================================================