-- Create education_profiles table
CREATE TABLE IF NOT EXISTS education_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    learning_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    total_study_hours DECIMAL(10,2) DEFAULT 0.0,
    courses_completed INTEGER DEFAULT 0,
    certificates_earned INTEGER DEFAULT 0,
    community_posts INTEGER DEFAULT 0,
    community_reputation INTEGER DEFAULT 0,
    preferred_language VARCHAR(10) DEFAULT 'en',
    learning_goals TEXT[],
    notification_settings JSONB DEFAULT '{"email": true, "push": true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create daily_learning_activities table
CREATE TABLE IF NOT EXISTS daily_learning_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    lessons_completed INTEGER DEFAULT 0,
    study_minutes INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    courses_accessed UUID[] DEFAULT '{}',
    is_streak_day BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, activity_date)
);

-- Test if we can insert an education profile for your user
INSERT INTO education_profiles (user_id, total_xp, current_level, learning_streak, total_study_hours)
VALUES ('485625cc-7f8d-48f3-b293-9b47cb9f6a62', 50, 1, 0, 2.5)
ON CONFLICT (user_id) DO UPDATE SET 
    total_xp = EXCLUDED.total_xp,
    total_study_hours = EXCLUDED.total_study_hours,
    updated_at = NOW();

-- Insert some sample learning activity
INSERT INTO daily_learning_activities (user_id, activity_date, lessons_completed, study_minutes, xp_earned)
VALUES ('485625cc-7f8d-48f3-b293-9b47cb9f6a62', CURRENT_DATE, 2, 45, 25)
ON CONFLICT (user_id, activity_date) DO UPDATE SET
    lessons_completed = EXCLUDED.lessons_completed,
    study_minutes = EXCLUDED.study_minutes,
    xp_earned = EXCLUDED.xp_earned,
    updated_at = NOW();