-- ================================================================
-- BioBloom Education System Database Schema
-- Complete functional dashboard with real user tracking
-- ================================================================

-- ================================================================
-- 1. CORE USER EDUCATION PROFILE
-- ================================================================

-- Education Profile - Extended user data for learning system
CREATE TABLE IF NOT EXISTS education_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Learning Progress
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    learning_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    total_study_hours DECIMAL(10,2) DEFAULT 0.0,
    
    -- Achievements & Stats
    courses_completed INTEGER DEFAULT 0,
    certificates_earned INTEGER DEFAULT 0,
    community_posts INTEGER DEFAULT 0,
    community_reputation INTEGER DEFAULT 0,
    
    -- Preferences
    preferred_language VARCHAR(10) DEFAULT 'en',
    learning_goals TEXT[],
    notification_settings JSONB DEFAULT '{"email": true, "push": true}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- ================================================================
-- 2. COURSE MANAGEMENT SYSTEM
-- ================================================================

-- Course Categories
CREATE TABLE IF NOT EXISTS course_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50), -- Icon name for UI
    color VARCHAR(20), -- Color theme
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Main Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES course_categories(id),
    
    -- Course Details
    title VARCHAR(200) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    thumbnail_url TEXT,
    banner_url TEXT,
    
    -- Course Structure
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_hours DECIMAL(5,2),
    total_lessons INTEGER DEFAULT 0,
    
    -- Gamification
    xp_reward INTEGER DEFAULT 0,
    completion_certificate BOOLEAN DEFAULT false,
    
    -- Status & Metadata
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    instructor_id UUID REFERENCES profiles(id),
    
    -- SEO & Organization
    slug VARCHAR(200) UNIQUE,
    tags TEXT[],
    prerequisites TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course Lessons/Chapters
CREATE TABLE IF NOT EXISTS course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    
    -- Lesson Details
    title VARCHAR(200) NOT NULL,
    description TEXT,
    content TEXT, -- Main lesson content (markdown)
    video_url TEXT,
    duration_minutes INTEGER,
    
    -- Structure
    chapter_number INTEGER,
    lesson_number INTEGER,
    sort_order INTEGER DEFAULT 0,
    
    -- Gamification
    xp_reward INTEGER DEFAULT 10,
    
    -- Status
    is_published BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(course_id, chapter_number, lesson_number)
);

-- ================================================================
-- 3. USER LEARNING TRACKING
-- ================================================================

-- Course Enrollments
CREATE TABLE IF NOT EXISTS course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    
    -- Progress Tracking
    progress_percentage DECIMAL(5,2) DEFAULT 0.0,
    lessons_completed INTEGER DEFAULT 0,
    current_lesson_id UUID REFERENCES course_lessons(id),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'dropped')),
    completion_date TIMESTAMP WITH TIME ZONE,
    certificate_issued BOOLEAN DEFAULT false,
    certificate_id VARCHAR(50),
    
    -- Timestamps
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(user_id, course_id)
);

-- Lesson Progress Tracking
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    
    -- Progress Details
    status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
    completion_percentage DECIMAL(5,2) DEFAULT 0.0,
    time_spent_minutes INTEGER DEFAULT 0,
    
    -- XP & Rewards
    xp_earned INTEGER DEFAULT 0,
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, lesson_id)
);

-- Daily Learning Activity
CREATE TABLE IF NOT EXISTS daily_learning_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    
    -- Daily Stats
    lessons_completed INTEGER DEFAULT 0,
    study_minutes INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    courses_accessed UUID[] DEFAULT '{}',
    
    -- Streak Calculation
    is_streak_day BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, activity_date)
);

-- ================================================================
-- 4. ACHIEVEMENTS & GAMIFICATION
-- ================================================================

-- Achievement Definitions
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Achievement Details
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    badge_color VARCHAR(20),
    
    -- Achievement Criteria
    achievement_type VARCHAR(50) NOT NULL, -- 'course_completion', 'streak', 'xp_milestone', etc.
    criteria JSONB NOT NULL, -- Flexible criteria storage
    
    -- Rewards
    xp_reward INTEGER DEFAULT 0,
    badge_tier VARCHAR(20) DEFAULT 'bronze' CHECK (badge_tier IN ('bronze', 'silver', 'gold', 'platinum')),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    
    -- Achievement Details
    progress_percentage DECIMAL(5,2) DEFAULT 0.0,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}', -- Store specific achievement data
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, achievement_id)
);

-- ================================================================
-- 5. COMMUNITY SYSTEM
-- ================================================================

-- Discussion Categories
CREATE TABLE IF NOT EXISTS discussion_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Posts/Discussions
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES discussion_categories(id),
    
    -- Post Content
    title VARCHAR(200),
    content TEXT NOT NULL,
    post_type VARCHAR(20) DEFAULT 'discussion' CHECK (post_type IN ('discussion', 'question', 'showcase', 'announcement')),
    
    -- Engagement
    likes_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    
    -- Status
    is_pinned BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_closed BOOLEAN DEFAULT false,
    
    -- Tags
    tags TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Post Replies
CREATE TABLE IF NOT EXISTS community_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    parent_reply_id UUID REFERENCES community_replies(id), -- For nested replies
    
    -- Reply Content
    content TEXT NOT NULL,
    
    -- Engagement
    likes_count INTEGER DEFAULT 0,
    
    -- Status
    is_solution BOOLEAN DEFAULT false, -- Mark as solution for questions
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Interactions (Likes, etc.)
CREATE TABLE IF NOT EXISTS community_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Target (either post or reply)
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    reply_id UUID REFERENCES community_replies(id) ON DELETE CASCADE,
    
    -- Interaction Type
    interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('like', 'dislike', 'bookmark', 'report')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, post_id, reply_id, interaction_type),
    CHECK ((post_id IS NOT NULL AND reply_id IS NULL) OR (post_id IS NULL AND reply_id IS NOT NULL))
);

-- ================================================================
-- 6. CERTIFICATES & CREDENTIALS
-- ================================================================

-- Certificates
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id),
    
    -- Certificate Details
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Verification
    verification_url TEXT,
    is_verified BOOLEAN DEFAULT true,
    
    -- Design
    template_id VARCHAR(50),
    certificate_data JSONB, -- Store certificate-specific data
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- 7. LEARNING RECOMMENDATIONS
-- ================================================================

-- Learning Path Recommendations
CREATE TABLE IF NOT EXISTS learning_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Recommendation Details
    recommended_item_type VARCHAR(20) CHECK (recommended_item_type IN ('course', 'lesson', 'path', 'community_post')),
    recommended_item_id UUID NOT NULL,
    
    -- Recommendation Engine Data
    recommendation_type VARCHAR(30), -- 'personalized', 'trending', 'similar_users', 'next_in_path'
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    reasoning TEXT,
    
    -- User Interaction
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'clicked', 'dismissed', 'completed')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days'
);

-- ================================================================
-- 8. INDEXES FOR PERFORMANCE
-- ================================================================

-- Education Profiles
CREATE INDEX IF NOT EXISTS idx_education_profiles_user_id ON education_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_education_profiles_level ON education_profiles(current_level);

-- Courses
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(is_featured);

-- Course Enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON course_enrollments(status);

-- Lesson Progress
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_status ON lesson_progress(status);

-- Daily Activities
CREATE INDEX IF NOT EXISTS idx_daily_activities_user_date ON daily_learning_activities(user_id, activity_date);
CREATE INDEX IF NOT EXISTS idx_daily_activities_date ON daily_learning_activities(activity_date);

-- Community
CREATE INDEX IF NOT EXISTS idx_community_posts_user ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON community_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON community_posts(created_at);

-- ================================================================
-- 9. FUNCTIONS FOR AUTOMATIC UPDATES
-- ================================================================

-- Function to update education profile stats
CREATE OR REPLACE FUNCTION update_education_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total XP and level when XP changes
    IF TG_TABLE_NAME = 'daily_learning_activities' THEN
        UPDATE education_profiles 
        SET 
            total_xp = (
                SELECT COALESCE(SUM(xp_earned), 0) 
                FROM daily_learning_activities 
                WHERE user_id = NEW.user_id
            ),
            total_study_hours = (
                SELECT COALESCE(SUM(study_minutes), 0) / 60.0 
                FROM daily_learning_activities 
                WHERE user_id = NEW.user_id
            ),
            last_activity_date = NEW.activity_date,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
        
        -- Update current level based on XP (100 XP per level)
        UPDATE education_profiles 
        SET current_level = GREATEST(1, (total_xp / 100) + 1)
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update course completion stats
CREATE OR REPLACE FUNCTION update_course_completion_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Update courses completed count
        UPDATE education_profiles 
        SET 
            courses_completed = courses_completed + 1,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
        
        -- Update course enrollment completion date
        UPDATE course_enrollments
        SET completion_date = NOW()
        WHERE user_id = NEW.user_id AND course_id = NEW.course_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 10. TRIGGERS
-- ================================================================

-- Trigger for updating education profile stats
CREATE TRIGGER trigger_update_education_stats
    AFTER INSERT OR UPDATE ON daily_learning_activities
    FOR EACH ROW EXECUTE FUNCTION update_education_profile_stats();

-- Trigger for course completion
CREATE TRIGGER trigger_course_completion_stats
    AFTER UPDATE ON course_enrollments
    FOR EACH ROW EXECUTE FUNCTION update_course_completion_stats();

-- Auto-update timestamps
CREATE TRIGGER trigger_education_profiles_updated_at
    BEFORE UPDATE ON education_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_community_posts_updated_at
    BEFORE UPDATE ON community_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- 11. SAMPLE DATA INSERTION
-- ================================================================

-- Insert default course categories
INSERT INTO course_categories (name, description, icon, color, sort_order) VALUES
    ('Crop Monitoring', 'Learn AI-powered crop health monitoring techniques', 'Leaf', 'green', 1),
    ('Water Management', 'Sustainable irrigation and water conservation', 'Droplets', 'blue', 2),
    ('Soil Science', 'Understanding soil health and management', 'Mountain', 'brown', 3),
    ('Pest Management', 'Organic and integrated pest control methods', 'Bug', 'red', 4),
    ('Sustainable Farming', 'Eco-friendly farming practices and techniques', 'Recycle', 'emerald', 5),
    ('Smart Agriculture', 'IoT, sensors, and technology integration', 'Zap', 'purple', 6);

-- Insert discussion categories
INSERT INTO discussion_categories (name, description, icon, color, sort_order) VALUES
    ('General Discussion', 'General farming discussions and questions', 'MessageSquare', 'gray', 1),
    ('Crop Health', 'Share and discuss crop health issues', 'Leaf', 'green', 2),
    ('Technology', 'Agricultural technology discussions', 'Smartphone', 'blue', 3),
    ('Success Stories', 'Share your farming success stories', 'Trophy', 'yellow', 4),
    ('Market Prices', 'Discuss market trends and prices', 'TrendingUp', 'orange', 5),
    ('Weather & Climate', 'Weather impacts and climate discussions', 'Cloud', 'cyan', 6);

-- Insert default achievements
INSERT INTO achievements (name, description, icon, achievement_type, criteria, xp_reward, badge_tier) VALUES
    ('First Course Completed', 'Complete your first course', 'Award', 'course_completion', '{"courses_completed": 1}', 100, 'bronze'),
    ('Learning Streak', 'Study for 7 consecutive days', 'Flame', 'streak', '{"streak_days": 7}', 150, 'silver'),
    ('Knowledge Seeker', 'Complete 5 courses', 'BookOpen', 'course_completion', '{"courses_completed": 5}', 500, 'gold'),
    ('Community Helper', 'Answer 10 community questions', 'Users', 'community', '{"replies_count": 10}', 200, 'silver'),
    ('Expert Level', 'Reach level 10', 'Crown', 'level', '{"level": 10}', 1000, 'platinum');