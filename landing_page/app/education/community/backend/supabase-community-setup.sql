-- Supabase DDL for Community Hub
-- Creates tables and enums compatible with the Prisma schema used in the local Community backend.
-- Run this in your Supabase project's SQL editor. Requires pgcrypto for gen_random_uuid().

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enums
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vote_type') THEN
    CREATE TYPE vote_type AS ENUM ('UP', 'DOWN');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE notification_type AS ENUM (
      'NEW_COMMENT', 'QUESTION_SOLVED', 'NEW_FOLLOWER', 'EXPERT_REPLY', 'UPVOTE_MILESTONE', 'BADGE_EARNED', 'SYSTEM_ALERT'
    );
  END IF;
END$$;

-- Community users
CREATE TABLE IF NOT EXISTS community_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  avatar text,
  bio text,

  farm_name text,
  farm_size text,
  farm_type text,
  location text,
  experience text DEFAULT 'Beginner',
  specialties text[] DEFAULT '{}',

  password_hash text NOT NULL,
  email_verified boolean DEFAULT false,
  verification_token text,
  reset_token text,
  reset_token_expiry timestamptz,

  reputation int DEFAULT 0,
  level int DEFAULT 1,
  badges text[] DEFAULT '{}',
  is_verified boolean DEFAULT false,
  is_moderator boolean DEFAULT false,
  is_expert boolean DEFAULT false,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  icon text,
  color text,
  "order" int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Questions
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  tags text[] DEFAULT '{}',
  images text[] DEFAULT '{}',
  is_urgent boolean DEFAULT false,
  is_anonymous boolean DEFAULT false,
  is_pinned boolean DEFAULT false,
  is_solved boolean DEFAULT false,
  location text,
  view_count int DEFAULT 0,
  vote_score int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  author_id uuid NOT NULL REFERENCES community_users(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_questions_author ON questions(author_id);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at);
CREATE INDEX IF NOT EXISTS idx_questions_vote_score ON questions(vote_score);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  images text[] DEFAULT '{}',
  is_accepted boolean DEFAULT false,
  is_by_expert boolean DEFAULT false,
  vote_score int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  author_id uuid NOT NULL REFERENCES community_users(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES comments(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_question ON comments(question_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

-- Votes
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type vote_type NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES community_users(id) ON DELETE CASCADE,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE
);

-- Enforce unique vote per user per question/comment using partial unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS ux_votes_user_question ON votes(user_id, question_id) WHERE question_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_votes_user_comment ON votes(user_id, comment_id) WHERE comment_id IS NOT NULL;

-- Follows
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  follower_id uuid NOT NULL REFERENCES community_users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES community_users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_follows_follower_following ON follows(follower_id, following_id);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type notification_type NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES community_users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

-- Helpful stats view (optional)
CREATE OR REPLACE VIEW community_stats AS
SELECT
  (SELECT count(*) FROM questions) AS total_questions,
  (SELECT count(*) FROM community_users) AS total_users,
  (SELECT count(*) FROM comments) AS total_comments,
  (SELECT count(*) FROM votes) AS total_votes,
  now()::timestamptz AS timestamp;

-- Trigger to keep updated_at fields in sync
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to tables that have updated_at
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'questions_set_updated_at') THEN
    CREATE TRIGGER questions_set_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'comments_set_updated_at') THEN
    CREATE TRIGGER comments_set_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'categories_set_updated_at') THEN
    CREATE TRIGGER categories_set_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'community_users_set_updated_at') THEN
    CREATE TRIGGER community_users_set_updated_at BEFORE UPDATE ON community_users FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END$$;

-- Short seeding helpers (uncomment & run if you want example data)
/*
INSERT INTO categories (name, description, icon, color)
VALUES ('General', 'General farming questions', 'leaf', '#2ecc71'),
       ('Pests', 'Pest control and management', 'bug', '#e74c3c');

INSERT INTO community_users (email, username, first_name, last_name, password_hash)
VALUES ('demo@farm.test', 'demo_farmer', 'Demo', 'Farmer', 'seeded'),
       ('expert@farm.test', 'expert_farmer', 'Expert', 'Farmer', 'seeded');

-- Example question
INSERT INTO questions (title, content, category_id, author_id, tags)
SELECT 'Welcome to Community', 'Ask your first question here!', c.id, u.id, ARRAY['welcome']::text[]
FROM categories c, community_users u LIMIT 1;
*/
