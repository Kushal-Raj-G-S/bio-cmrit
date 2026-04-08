import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Singleton Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
    global: { headers: { 'x-cache-control': 'max-age=60' } }
  }
)

// Simple in-memory cache
const cache = new Map<string, { data: any; expires: number }>()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check cache
    const cacheKey = `profile_${userId}`
    const cached = cache.get(cacheKey)
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data, { headers: { 'X-Cache': 'HIT' } })
    }

    // Skip dev user and fetch real data
    if (userId.startsWith('dev-')) {
      const result = {
        profile: {
          id: userId,
          userId: userId,
          level: 5,
          xp: 2450,
          xpToNext: 1700,
          streak: 7,
          totalStudyHours: 45.5,
          certificates: 2,
          coursesCompleted: 3,
          activeCourses: 2,
          achievements: 8,
          thisMonthStudyTime: 12.5
        }
      }
      cache.set(cacheKey, { data: result, expires: Date.now() + 30000 })
      return NextResponse.json(result, { headers: { 'X-Cache': 'MISS' } })
    }

    // Get or create education profile for real user
    let { data: educationProfile, error: profileError } = await supabase
      .from('education_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError
    }

    // Create education profile if it doesn't exist
    if (!educationProfile) {
      const { data: newProfile, error: createError } = await supabase
        .from('education_profiles')
        .insert({
          user_id: userId,
          total_xp: 0,
          current_level: 1,
          learning_streak: 0,
          total_study_hours: 0.0,
          courses_completed: 0,
          certificates_earned: 0,
          community_posts: 0,
          community_reputation: 0
        })
        .select()
        .single()

      if (createError) throw createError
      educationProfile = newProfile
    }

    // Get additional stats
    const [enrollmentsResult, achievementsResult, monthlyActivityResult] = await Promise.all([
      // Active course enrollments
      supabase
        .from('course_enrollments')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active'),

      // User achievements
      supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('is_completed', true),

      // This month's study time
      supabase
        .from('daily_learning_activities')
        .select('study_minutes')
        .eq('user_id', userId)
        .gte('activity_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
    ])

    const activeCourses = enrollmentsResult.data?.length || 0
    const achievements = achievementsResult.data?.length || 0
    const thisMonthStudyTime = (monthlyActivityResult.data?.reduce((sum: number, activity: any) => sum + (activity.study_minutes || 0), 0) || 0) / 60.0

    // Calculate XP to next level (100 XP per level)
    const currentXP = educationProfile.total_xp
    const currentLevel = educationProfile.current_level
    const xpForCurrentLevel = (currentLevel - 1) * 100
    const xpForNextLevel = currentLevel * 100
    const xpProgress = currentXP - xpForCurrentLevel
    const xpToNext = xpForNextLevel - currentXP

    const responseData = {
      profile: {
        id: educationProfile.id,
        userId: educationProfile.user_id,
        level: educationProfile.current_level,
        xp: Math.max(xpProgress, 0),
        xpToNext: Math.max(xpToNext, 0),
        streak: educationProfile.learning_streak,
        totalStudyHours: educationProfile.total_study_hours,
        certificates: educationProfile.certificates_earned,
        coursesCompleted: educationProfile.courses_completed,
        activeCourses: activeCourses,
        achievements: achievements,
        thisMonthStudyTime: thisMonthStudyTime
      }
    }

    cache.set(cacheKey, { data: responseData, expires: Date.now() + 30000 })
    return NextResponse.json(responseData, { headers: { 'X-Cache': 'MISS' } })
  } catch (error) {
    console.error('Error in education profile API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
