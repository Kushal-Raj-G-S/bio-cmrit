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
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    // Check cache
    const cacheKey = `calendar_${userId}_${month}_${year}`
    const cached = cache.get(cacheKey)
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data, { headers: { 'X-Cache': 'HIT' } })
    }

    // Mock data for dev user
    if (userId.startsWith('dev-')) {
      const visits = []
      const today = new Date()
      for (let i = 0; i < 30; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        if (Math.random() > 0.3 || i < 7) {
          visits.push({
            visitDate: date.toISOString().split('T')[0],
            lessonsCompleted: Math.floor(Math.random() * 4) + 1,
            studyMinutes: Math.floor(Math.random() * 60) + 15,
          })
        }
      }
      const result = { visits }
      cache.set(cacheKey, { data: result, expires: Date.now() + 30000 })
      return NextResponse.json(result, { headers: { 'X-Cache': 'MISS' } })
    }

    // Build date range for query
    let startDate: string
    let endDate: string

    if (month && year) {
      const monthInt = parseInt(month, 10)
      const yearInt = parseInt(year, 10)
      startDate = new Date(yearInt, monthInt - 1, 1).toISOString().split('T')[0]
      endDate = new Date(yearInt, monthInt, 0).toISOString().split('T')[0]
    } else {
      // Default to last 30 days
      endDate = new Date().toISOString().split('T')[0]
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      startDate = thirtyDaysAgo.toISOString().split('T')[0]
    }

    // Fetch real learning activities
    const { data: activities, error } = await supabase
      .from('daily_learning_activities')
      .select('activity_date, lessons_completed, study_minutes, xp_earned')
      .eq('user_id', userId)
      .gte('activity_date', startDate)
      .lte('activity_date', endDate)
      .order('activity_date', { ascending: false })

    if (error) throw error

    // Transform data to match expected format
    const visits = activities?.map(activity => ({
      visitDate: activity.activity_date,
      lessonsCompleted: activity.lessons_completed || 0,
      studyMinutes: activity.study_minutes || 0,
      xpEarned: activity.xp_earned || 0
    })) || []

    const result = { visits }
    cache.set(cacheKey, { data: result, expires: Date.now() + 30000 })
    return NextResponse.json(result, { headers: { 'X-Cache': 'MISS' } })

  } catch (error) {
    console.error('Error in calendar API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, visitDate, lessonsCompleted, studyMinutes, xpEarned } = body

    if (!userId || !visitDate) {
      return NextResponse.json({ error: 'userId and visitDate required' }, { status: 400 })
    }

    // Skip saving for dev user
    if (userId.startsWith('dev-')) {
      return NextResponse.json({
        success: true,
        streak: 7,
        visitDate: visitDate,
      })
    }

    // Insert or update daily activity
    const { data: activity, error } = await supabase
      .from('daily_learning_activities')
      .upsert({
        user_id: userId,
        activity_date: visitDate,
        lessons_completed: lessonsCompleted || 0,
        study_minutes: studyMinutes || 0,
        xp_earned: xpEarned || 0,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,activity_date'
      })
      .select()
      .single()

    if (error) throw error

    // Update learning streak
    const { data: profile, error: profileError } = await supabase
      .from('education_profiles')
      .select('learning_streak')
      .eq('user_id', userId)
      .single()

    if (profileError) throw profileError

    return NextResponse.json({
      success: true,
      streak: profile.learning_streak,
      visitDate: visitDate,
      activity: activity
    })

  } catch (error) {
    console.error('Error in calendar POST API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
