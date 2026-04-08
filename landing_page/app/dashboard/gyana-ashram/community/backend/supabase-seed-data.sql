-- Quick seed data for Community Hub
-- Run this after the main schema setup

-- Insert categories
INSERT INTO categories (name, description, icon, color, "order")
VALUES 
  ('General', 'General farming questions and discussions', 'leaf', '#2ecc71', 1),
  ('Pests & Diseases', 'Pest control and disease management', 'bug', '#e74c3c', 2),
  ('Soil & Fertilizers', 'Soil health and fertilization tips', 'sprout', '#f39c12', 3),
  ('Weather & Climate', 'Weather patterns and climate adaptation', 'cloud-sun', '#3498db', 4),
  ('Equipment', 'Farm equipment and machinery', 'tractor', '#95a5a6', 5),
  ('Crops & Seeds', 'Crop selection and seed varieties', 'seedling', '#27ae60', 6)
ON CONFLICT (name) DO NOTHING;

-- Create a demo user (uses your real GrainTrust user info if available)
INSERT INTO community_users (email, username, first_name, last_name, password_hash, is_expert, reputation, level)
VALUES 
  ('demo@graintrust.com', 'demo_farmer', 'Demo', 'Farmer', 'auto-generated', false, 150, 2),
  ('expert@graintrust.com', 'expert_farmer', 'Expert', 'Farmer', 'auto-generated', true, 500, 5)
ON CONFLICT (email) DO NOTHING;

-- Add a welcome question
INSERT INTO questions (title, content, category_id, author_id, tags, is_pinned)
SELECT 
  'Welcome to GrainTrust Community Hub! 🌾',
  'This is your space to ask questions, share knowledge, and connect with fellow farmers. Feel free to ask your first question!',
  c.id,
  u.id,
  ARRAY['welcome', 'introduction']::text[],
  true
FROM categories c, community_users u 
WHERE c.name = 'General' AND u.username = 'expert_farmer'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Add a sample comment
INSERT INTO comments (content, question_id, author_id, is_by_expert)
SELECT 
  'Welcome to the community! We''re here to help each other grow better crops and build sustainable farms together.',
  q.id,
  u.id,
  true
FROM questions q, community_users u
WHERE q.is_pinned = true AND u.username = 'expert_farmer'
LIMIT 1
ON CONFLICT DO NOTHING;
