-- ================================================================
-- BIOBLOOM COMMUNITY HUB DATABASE SCHEMA
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

-- Follows table (follow questions to get notifications)
CREATE TABLE IF NOT EXISTS community_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES community_questions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- Community notifications table
CREATE TABLE IF NOT EXISTS community_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('new_comment', 'new_answer', 'vote', 'mention', 'follow')),
  question_id UUID REFERENCES community_questions(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User stats extension for community
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
-- INDEXES for performance
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_questions_author ON community_questions(author_id);
CREATE INDEX IF NOT EXISTS idx_questions_category ON community_questions(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_created ON community_questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_votes ON community_questions(vote_count DESC);

CREATE INDEX IF NOT EXISTS idx_comments_question ON community_comments(question_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON community_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON community_comments(parent_id);

CREATE INDEX IF NOT EXISTS idx_votes_user ON community_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_question ON community_votes(question_id);
CREATE INDEX IF NOT EXISTS idx_votes_comment ON community_votes(comment_id);

CREATE INDEX IF NOT EXISTS idx_follows_user ON community_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_question ON community_follows(question_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON community_notifications(user_id, is_read);

-- ================================================================
-- FUNCTIONS & TRIGGERS
-- ================================================================

-- Function to update question comment count
CREATE OR REPLACE FUNCTION update_question_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_questions 
    SET comment_count = comment_count + 1,
        updated_at = NOW()
    WHERE id = NEW.question_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_questions 
    SET comment_count = GREATEST(comment_count - 1, 0),
        updated_at = NOW()
    WHERE id = OLD.question_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_question_comment_count
AFTER INSERT OR DELETE ON community_comments
FOR EACH ROW EXECUTE FUNCTION update_question_comment_count();

-- Function to update category question count
CREATE OR REPLACE FUNCTION update_category_question_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.category_id IS NOT NULL THEN
    UPDATE community_categories 
    SET question_count = question_count + 1
    WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' AND OLD.category_id IS NOT NULL THEN
    UPDATE community_categories 
    SET question_count = GREATEST(question_count - 1, 0)
    WHERE id = OLD.category_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.category_id IS NOT NULL AND OLD.category_id != NEW.category_id THEN
      UPDATE community_categories 
      SET question_count = GREATEST(question_count - 1, 0)
      WHERE id = OLD.category_id;
    END IF;
    IF NEW.category_id IS NOT NULL AND OLD.category_id != NEW.category_id THEN
      UPDATE community_categories 
      SET question_count = question_count + 1
      WHERE id = NEW.category_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_category_question_count
AFTER INSERT OR UPDATE OR DELETE ON community_questions
FOR EACH ROW EXECUTE FUNCTION update_category_question_count();

-- ================================================================
-- SEED DATA - Default Categories
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
  ('Weather & Climate', 'weather-climate', '⛅', '#06b6d4', 'Weather patterns, climate adaptation, and seasonal planning'),
  ('General Discussion', 'general', '💬', '#64748b', 'General farming topics and community discussions')
ON CONFLICT (slug) DO NOTHING;

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================

ALTER TABLE community_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_user_stats ENABLE ROW LEVEL SECURITY;

-- Categories: Everyone can read, only admins can write
CREATE POLICY "Categories are viewable by everyone" ON community_categories FOR SELECT USING (true);

-- Questions: Everyone can read, authenticated users can create
CREATE POLICY "Questions are viewable by everyone" ON community_questions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create questions" ON community_questions FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own questions" ON community_questions FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own questions" ON community_questions FOR DELETE USING (auth.uid() = author_id);

-- Comments: Everyone can read, authenticated users can create
CREATE POLICY "Comments are viewable by everyone" ON community_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON community_comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own comments" ON community_comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own comments" ON community_comments FOR DELETE USING (auth.uid() = author_id);

-- Votes: Users can manage their own votes
CREATE POLICY "Users can view all votes" ON community_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create votes" ON community_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own votes" ON community_votes FOR DELETE USING (auth.uid() = user_id);

-- Follows: Users can manage their own follows
CREATE POLICY "Users can view own follows" ON community_follows FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can create follows" ON community_follows FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own follows" ON community_follows FOR DELETE USING (auth.uid() = user_id);

-- Notifications: Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON community_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON community_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON community_notifications FOR UPDATE USING (auth.uid() = user_id);

-- User stats: Everyone can read, only the user can update
CREATE POLICY "User stats are viewable by everyone" ON community_user_stats FOR SELECT USING (true);
CREATE POLICY "Users can update own stats" ON community_user_stats FOR UPDATE USING (auth.uid() = user_id);

-- ================================================================
-- DONE! Community Hub Database Setup Complete
-- ================================================================
