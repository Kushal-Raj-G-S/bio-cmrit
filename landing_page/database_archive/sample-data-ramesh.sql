-- ================================================================
-- Sample Data Setup for User: Ramesh (485625cc-7f8d-48f3-b293-9b47cb9f6a62)
-- ================================================================

-- 1. Create education profile for Ramesh
INSERT INTO education_profiles (user_id, total_xp, current_level, learning_streak, total_study_hours, courses_completed, certificates_earned)
VALUES ('485625cc-7f8d-48f3-b293-9b47cb9f6a62', 250, 3, 5, 8.5, 1, 0)
ON CONFLICT (user_id) DO UPDATE SET 
    total_xp = EXCLUDED.total_xp,
    current_level = EXCLUDED.current_level,
    learning_streak = EXCLUDED.learning_streak,
    total_study_hours = EXCLUDED.total_study_hours,
    courses_completed = EXCLUDED.courses_completed,
    updated_at = NOW();

-- 2. Add some learning activities for past few days
INSERT INTO daily_learning_activities (user_id, activity_date, lessons_completed, study_minutes, xp_earned, is_streak_day) VALUES
('485625cc-7f8d-48f3-b293-9b47cb9f6a62', CURRENT_DATE, 2, 45, 50, true),
('485625cc-7f8d-48f3-b293-9b47cb9f6a62', CURRENT_DATE - INTERVAL '1 day', 3, 60, 75, true),
('485625cc-7f8d-48f3-b293-9b47cb9f6a62', CURRENT_DATE - INTERVAL '2 days', 1, 30, 25, true),
('485625cc-7f8d-48f3-b293-9b47cb9f6a62', CURRENT_DATE - INTERVAL '3 days', 2, 50, 50, true),
('485625cc-7f8d-48f3-b293-9b47cb9f6a62', CURRENT_DATE - INTERVAL '4 days', 1, 40, 30, true)
ON CONFLICT (user_id, activity_date) DO UPDATE SET
    lessons_completed = EXCLUDED.lessons_completed,
    study_minutes = EXCLUDED.study_minutes,
    xp_earned = EXCLUDED.xp_earned,
    updated_at = NOW();

-- 3. Create some sample courses (if they don't exist)
INSERT INTO courses (id, title, description, difficulty_level, estimated_hours, total_lessons, xp_reward, is_published) VALUES
(gen_random_uuid(), 'Organic Farming Fundamentals', 'Learn the basics of organic farming practices', 'beginner', 10.0, 12, 200, true),
(gen_random_uuid(), 'Soil Health & Management', 'Master soil testing and improvement techniques', 'intermediate', 8.0, 10, 150, true),
(gen_random_uuid(), 'Smart Water Management', 'Efficient irrigation and water conservation methods', 'beginner', 6.0, 8, 120, true)
ON CONFLICT (id) DO NOTHING;

-- 4. Enroll Ramesh in some courses (first create courses and get their IDs)
WITH course_ids AS (
    SELECT 
        id,
        title,
        ROW_NUMBER() OVER (ORDER BY title) as rn
    FROM courses 
    WHERE title IN ('Organic Farming Fundamentals', 'Soil Health & Management', 'Smart Water Management')
)
INSERT INTO course_enrollments (user_id, course_id, progress_percentage, lessons_completed, status, enrolled_at, last_accessed_at) 
SELECT 
    '485625cc-7f8d-48f3-b293-9b47cb9f6a62',
    id,
    CASE 
        WHEN rn = 1 THEN 75.0
        WHEN rn = 2 THEN 40.0
        WHEN rn = 3 THEN 100.0
    END,
    CASE 
        WHEN rn = 1 THEN 9
        WHEN rn = 2 THEN 4
        WHEN rn = 3 THEN 8
    END,
    CASE 
        WHEN rn = 1 THEN 'active'
        WHEN rn = 2 THEN 'active'
        WHEN rn = 3 THEN 'completed'
    END,
    CASE 
        WHEN rn = 1 THEN NOW() - INTERVAL '15 days'
        WHEN rn = 2 THEN NOW() - INTERVAL '10 days'
        WHEN rn = 3 THEN NOW() - INTERVAL '20 days'
    END,
    CASE 
        WHEN rn = 1 THEN NOW() - INTERVAL '1 day'
        WHEN rn = 2 THEN NOW() - INTERVAL '2 days'
        WHEN rn = 3 THEN NOW() - INTERVAL '5 days'
    END
FROM course_ids
ON CONFLICT (user_id, course_id) DO UPDATE SET
    progress_percentage = EXCLUDED.progress_percentage,
    lessons_completed = EXCLUDED.lessons_completed,
    status = EXCLUDED.status,
    last_accessed_at = EXCLUDED.last_accessed_at;

-- 5. Add some achievements for Ramesh
INSERT INTO user_achievements (user_id, achievement_id, progress_percentage, is_completed, completed_at) 
SELECT 
    '485625cc-7f8d-48f3-b293-9b47cb9f6a62',
    id,
    100.0,
    true,
    NOW() - INTERVAL '5 days'
FROM achievements 
WHERE name = 'First Course Completed'
ON CONFLICT (user_id, achievement_id) DO NOTHING;

-- 6. Add a community post
INSERT INTO community_posts (user_id, title, content, post_type, likes_count, replies_count, created_at) VALUES
('485625cc-7f8d-48f3-b293-9b47cb9f6a62', 
 'My Experience with Organic Farming', 
 'I recently completed the organic farming course and wanted to share my experience. The techniques I learned have already improved my crop yield by 20%!', 
 'discussion', 
 8, 
 3, 
 NOW() - INTERVAL '3 days')
ON CONFLICT DO NOTHING;