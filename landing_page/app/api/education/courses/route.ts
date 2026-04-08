import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Singleton Supabase client (reuse connection)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
    global: { headers: { 'x-cache-control': 'max-age=60' } }
  }
)

// Simple in-memory cache (expires after 30 seconds)
const cache = new Map<string, { data: any; expires: number }>()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    // Check cache first
    const cacheKey = `courses_${userId}_${status || 'all'}`
    const cached = cache.get(cacheKey)
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data, {
        headers: { 'X-Cache': 'HIT' }
      })
    }

    // Mock data for dev user
    if (userId.startsWith('dev-')) {
      const mockEnrollments = [
        {
          id: 'enroll-1',
          courseId: 'organic-farming-101',
          courseName: 'Organic Farming Fundamentals',
          progress: 75,
          status: 'active' as const,
          startedAt: '2025-11-01T00:00:00Z',
          lastAccessedAt: new Date().toISOString(),
        },
        {
          id: 'enroll-2',
          courseId: 'soil-health',
          courseName: 'Soil Health & Management',
          progress: 45,
          status: 'active' as const,
          startedAt: '2025-12-10T00:00:00Z',
          lastAccessedAt: new Date().toISOString(),
        }
      ]

      const result = {
        enrollments: status ? mockEnrollments.filter(e => e.status === status) : mockEnrollments
      }
      
      // Cache the result
      cache.set(cacheKey, { data: result, expires: Date.now() + 30000 })
      
      return NextResponse.json(result, {
        headers: { 'X-Cache': 'MISS' }
      })
    }

    // Fetch real course enrollments
    let query = supabase
      .from('course_enrollments')
      .select(`
        id,
        course_id,
        progress_percentage,
        status,
        enrolled_at,
        last_accessed_at,
        completion_date,
        courses (
          id,
          title,
          description,
          thumbnail_url,
          difficulty_level,
          estimated_hours
        )
      `)
      .eq('user_id', userId)
      .order('enrolled_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: enrollments, error } = await query

    if (error) throw error

    // Transform the data to match the expected format
    const transformedEnrollments = enrollments?.map((enrollment: any) => {
      const course = Array.isArray(enrollment.courses) ? enrollment.courses[0] : enrollment.courses
      
      return {
        id: enrollment.id,
        courseId: enrollment.course_id,
        courseName: course?.title || 'Unknown Course',
        progress: Math.round(enrollment.progress_percentage || 0),
        status: enrollment.status,
        startedAt: enrollment.enrolled_at,
        lastAccessedAt: enrollment.last_accessed_at,
        completionDate: enrollment.completion_date,
        courseDetails: {
          description: course?.description,
          thumbnail: course?.thumbnail_url,
          difficulty: course?.difficulty_level,
          estimatedHours: course?.estimated_hours
        }
      }
    }) || []

    const result = {
      enrollments: transformedEnrollments
    }
    
    // Cache the successful result
    cache.set(cacheKey, { data: result, expires: Date.now() + 30000 })

    return NextResponse.json(result, {
      headers: { 'X-Cache': 'MISS' }
    })

  } catch (error) {
    console.error('Error in courses API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
