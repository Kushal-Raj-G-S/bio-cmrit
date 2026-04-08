-- ================================================================
-- BIOBLOOM COMMUNITY HUB DATABASE SCHEMA
-- ================================================================
-- This creates the community discussion feature tables
-- Run this in Supabase SQL Editor to enable voting and discussions

-- ================================================================
-- CATEGORIES
-- ================================================================
CREATE TABLE IF NOT EXISTS community_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- QUESTIONS
-- ================================================================
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

-- ================================================================
-- COMMENTS
-- ================================================================
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

-- ================================================================
-- VOTES
-- ================================================================
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

-- ================================================================
-- USER STATS
-- ================================================================
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
CREATE INDEX IF NOT EXISTS idx_questions_views ON community_questions(views DESC);

CREATE INDEX IF NOT EXISTS idx_comments_question ON community_comments(question_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON community_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON community_comments(parent_id);

CREATE INDEX IF NOT EXISTS idx_votes_user ON community_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_question ON community_votes(question_id);
CREATE INDEX IF NOT EXISTS idx_votes_comment ON community_votes(comment_id);

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================
ALTER TABLE community_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_questions ENABLE ROW LEVEL SECURITY; 
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_user_stats ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- RLS POLICIES - SELECT (Read)
-- ================================================================
CREATE POLICY "Categories are viewable by everyone" ON community_categories FOR SELECT USING (true);
CREATE POLICY "Questions are viewable by everyone" ON community_questions FOR SELECT USING (true);
CREATE POLICY "Comments are viewable by everyone" ON community_comments FOR SELECT USING (true);
CREATE POLICY "Votes are viewable by everyone" ON community_votes FOR SELECT USING (true);
CREATE POLICY "User stats are viewable by everyone" ON community_user_stats FOR SELECT USING (true);

-- ================================================================
-- RLS POLICIES - INSERT (Create)
-- ================================================================
CREATE POLICY "Anyone can create questions" ON community_questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create comments" ON community_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create votes" ON community_votes FOR INSERT WITH CHECK (true);

-- ================================================================
-- RLS POLICIES - UPDATE (Edit)
-- ================================================================
CREATE POLICY "Users can update their own questions" ON community_questions 
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can update their own comments" ON community_comments 
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can update their own votes" ON community_votes 
  FOR UPDATE USING (auth.uid() = user_id);

-- ================================================================
-- RLS POLICIES - DELETE
-- ================================================================
CREATE POLICY "Users can delete their own questions" ON community_questions 
  FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments" ON community_comments 
  FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own votes" ON community_votes 
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================================
-- SEED DATA - Default Categories
-- ================================================================
INSERT INTO community_categories (name, description, icon, color) VALUES
  ('Pest Control', 'Questions about managing pests and diseases', '🐛', 'orange'),
  ('Soil Health', 'Soil testing, nutrients, and improvement', '🌱', 'amber'),
  ('Irrigation', 'Water management and irrigation techniques', '💧', 'blue'),
  ('Crop Disease', 'Plant diseases and treatment', '🦠', 'pink'),
  ('Success Story', 'Share your farming success stories', '🎉', 'green'),
  ('Urgent Help', 'Urgent farming problems needing quick help', '⚠️', 'red'),
  ('General', 'General farming questions and discussions', '💬', 'gray')
ON CONFLICT (name) DO NOTHING;

-- ================================================================
-- SUMMARY
-- ================================================================
-- Tables Created:
-- - community_categories (discussion categories)
-- - community_questions (farmer questions/posts)
-- - community_comments (answers and replies)
-- - community_votes (upvote/downvote system)
-- - community_user_stats (reputation and badges)
--
-- All tables have RLS enabled with appropriate policies
-- Default categories have been seeded
-- ================================================================
