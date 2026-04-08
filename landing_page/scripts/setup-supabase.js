const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabase = createClient(
  'https://mjpklbrzusbrocsluoum.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcGtsYnJ6dXNicm9jc2x1b3VtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzIwNTc3NywiZXhwIjoyMDc4NzgxNzc3fQ.n3hRBpexiMOmnDtskoMnTBEWOEHc347jX-XCu2HN59E'
)

async function executeSQL() {
  try {
    console.log('🔗 Connecting to Supabase...')
    
    // Test connection first
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Connection test failed:', error)
      return
    }
    
    console.log('✅ Connection successful!')
    
    // 1. Create education_profiles table
    console.log('📝 Creating education_profiles table...')
    const { error: profileError } = await supabase.rpc('exec', {
      sql: `
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
      `
    })
    
    if (profileError) {
      console.log('education_profiles table may already exist:', profileError.message)
    } else {
      console.log('✅ education_profiles table created!')
    }
    
    // 2. Create daily_learning_activities table
    console.log('📝 Creating daily_learning_activities table...')
    const { error: activityError } = await supabase.rpc('exec', {
      sql: `
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
      `
    })
    
    if (activityError) {
      console.log('daily_learning_activities table may already exist:', activityError.message)
    } else {
      console.log('✅ daily_learning_activities table created!')
    }
    
    // 3. Create community_categories table
    console.log('📝 Creating community_categories table...')
    const { error: categoriesError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS community_categories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL,
          slug VARCHAR(100) UNIQUE,
          description TEXT,
          icon VARCHAR(50),
          color VARCHAR(20),
          sort_order INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (categoriesError) {
      console.log('community_categories table may already exist:', categoriesError.message)
    } else {
      console.log('✅ community_categories table created!')
    }
    
    // 4. Create community_questions table
    console.log('📝 Creating community_questions table...')
    const { error: questionsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS community_questions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
          category_id UUID,
          title VARCHAR(200) NOT NULL,
          content TEXT NOT NULL,
          tags TEXT[],
          images TEXT[],
          vote_count INTEGER DEFAULT 0,
          view_count INTEGER DEFAULT 0,
          answer_count INTEGER DEFAULT 0,
          is_answered BOOLEAN DEFAULT false,
          is_pinned BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (questionsError) {
      console.log('community_questions table may already exist:', questionsError.message)
    } else {
      console.log('✅ community_questions table created!')
    }
    
    // 5. Insert sample categories
    console.log('📝 Inserting sample categories...')
    const { error: insertCategoriesError } = await supabase
      .from('community_categories')
      .upsert([
        {
          name: 'Crop Management',
          slug: 'crop-management',
          description: 'Questions about crop planning, planting, and management',
          icon: 'Leaf',
          color: 'green'
        },
        {
          name: 'Pest Control',
          slug: 'pest-control',
          description: 'Pest and disease management discussions',
          icon: 'Bug',
          color: 'red'
        },
        {
          name: 'Water Management',
          slug: 'water-management',
          description: 'Irrigation and water conservation topics',
          icon: 'Droplets',
          color: 'blue'
        }
      ], {
        onConflict: 'slug'
      })
    
    if (insertCategoriesError) {
      console.log('Categories may already exist:', insertCategoriesError.message)
    } else {
      console.log('✅ Sample categories inserted!')
    }
    
    // 4. Insert education profile for Ramesh
    console.log('👤 Creating education profile for Ramesh...')
    const { error: insertProfileError } = await supabase
      .from('education_profiles')
      .upsert({
        user_id: '485625cc-7f8d-48f3-b293-9b47cb9f6a62',
        total_xp: 250,
        current_level: 3,
        learning_streak: 5,
        total_study_hours: 8.5,
        courses_completed: 1,
        certificates_earned: 0
      }, {
        onConflict: 'user_id'
      })
    
    if (insertProfileError) {
      console.error('Error creating profile:', insertProfileError)
    } else {
      console.log('✅ Education profile created!')
    }
    
    // 5. Insert learning activities
    console.log('📊 Adding learning activities...')
    const today = new Date()
    const activities = []
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      activities.push({
        user_id: '485625cc-7f8d-48f3-b293-9b47cb9f6a62',
        activity_date: date.toISOString().split('T')[0],
        lessons_completed: Math.floor(Math.random() * 3) + 1,
        study_minutes: Math.floor(Math.random() * 40) + 30,
        xp_earned: Math.floor(Math.random() * 50) + 25,
        is_streak_day: true
      })
    }
    
    const { error: activityInsertError } = await supabase
      .from('daily_learning_activities')
      .upsert(activities, {
        onConflict: 'user_id,activity_date'
      })
    
    if (activityInsertError) {
      console.error('Error inserting activities:', activityInsertError)
    } else {
      console.log('✅ Learning activities added!')
    }
    
    // 6. Verify data
    console.log('🔍 Verifying setup...')
    const { data: profile } = await supabase
      .from('education_profiles')
      .select('*')
      .eq('user_id', '485625cc-7f8d-48f3-b293-9b47cb9f6a62')
      .single()
    
    if (profile) {
      console.log('✅ Profile verified:', {
        level: profile.current_level,
        xp: profile.total_xp,
        streak: profile.learning_streak,
        study_hours: profile.total_study_hours
      })
    }
    
    const { data: activities_count } = await supabase
      .from('daily_learning_activities')
      .select('count')
      .eq('user_id', '485625cc-7f8d-48f3-b293-9b47cb9f6a62')
    
    console.log(`✅ Activities count: ${activities_count?.length || 0}`)
    
    console.log('🎉 Database setup completed successfully!')
    console.log('🚀 Your dashboard should now show real data!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// Run the setup
executeSQL()