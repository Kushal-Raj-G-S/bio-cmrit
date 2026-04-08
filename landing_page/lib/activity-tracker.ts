import { supabase } from '@/lib/supabase'

interface ActivityData {
  userId: string
  lessonsCompleted?: number
  studyMinutes?: number
  xpEarned?: number
  courseId?: string
}

export async function trackDailyActivity({
  userId,
  lessonsCompleted = 0,
  studyMinutes = 0,
  xpEarned = 0,
  courseId
}: ActivityData) {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    // Get existing activity for today
    const { data: existingActivity, error: fetchError } = await supabase
      .from('daily_learning_activities')
      .select('*')
      .eq('user_id', userId)
      .eq('activity_date', today)
      .maybeSingle()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    // Prepare update data
    const updateData = {
      user_id: userId,
      activity_date: today,
      lessons_completed: (existingActivity?.lessons_completed || 0) + lessonsCompleted,
      study_minutes: (existingActivity?.study_minutes || 0) + studyMinutes,
      xp_earned: (existingActivity?.xp_earned || 0) + xpEarned,
      courses_accessed: courseId ? 
        [...(existingActivity?.courses_accessed || []), courseId].filter((v, i, arr) => arr.indexOf(v) === i) :
        (existingActivity?.courses_accessed || []),
      is_streak_day: true,
      updated_at: new Date().toISOString()
    }

    // Upsert the activity
    const { error: upsertError } = await supabase
      .from('daily_learning_activities')
      .upsert(updateData, {
        onConflict: 'user_id,activity_date'
      })

    if (upsertError) throw upsertError

    // Update learning streak
    await updateLearningStreak(userId)

    return { success: true }
  } catch (error) {
    console.error('Error tracking daily activity:', error)
    return { success: false, error }
  }
}

async function updateLearningStreak(userId: string) {
  try {
    // Get last 30 days of activities
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data: activities, error } = await supabase
      .from('daily_learning_activities')
      .select('activity_date')
      .eq('user_id', userId)
      .gte('activity_date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('activity_date', { ascending: false })

    if (error) throw error

    // Calculate current streak
    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < activities.length; i++) {
      const activityDate = new Date(activities[i].activity_date)
      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() - i)
      
      if (activityDate.toDateString() === expectedDate.toDateString()) {
        streak++
      } else {
        break
      }
    }

    // Update education profile with new streak
    await supabase
      .from('education_profiles')
      .update({
        learning_streak: streak,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

  } catch (error) {
    console.error('Error updating learning streak:', error)
  }
}

export async function completeLesson(userId: string, lessonId: string, courseId: string, timeSpent: number = 30) {
  try {
    // Mark lesson as completed
    await supabase
      .from('lesson_progress')
      .upsert({
        user_id: userId,
        lesson_id: lessonId,
        course_id: courseId,
        status: 'completed',
        completion_percentage: 100,
        time_spent_minutes: timeSpent,
        xp_earned: 25, // 25 XP per lesson
        completed_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,lesson_id'
      })

    // Track daily activity
    await trackDailyActivity({
      userId,
      lessonsCompleted: 1,
      studyMinutes: timeSpent,
      xpEarned: 25,
      courseId
    })

    // Update course enrollment progress
    const { data: enrollment } = await supabase
      .from('course_enrollments')
      .select('lessons_completed, progress_percentage')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single()

    if (enrollment) {
      const { data: courseData } = await supabase
        .from('courses')
        .select('total_lessons')
        .eq('id', courseId)
        .single()

      const newLessonsCompleted = (enrollment.lessons_completed || 0) + 1
      const newProgressPercentage = courseData ? 
        (newLessonsCompleted / courseData.total_lessons) * 100 : 0

      await supabase
        .from('course_enrollments')
        .update({
          lessons_completed: newLessonsCompleted,
          progress_percentage: Math.min(newProgressPercentage, 100),
          last_accessed_at: new Date().toISOString(),
          status: newProgressPercentage >= 100 ? 'completed' : 'active'
        })
        .eq('user_id', userId)
        .eq('course_id', courseId)
    }

    return { success: true }
  } catch (error) {
    console.error('Error completing lesson:', error)
    return { success: false, error }
  }
}

export async function startLearningSession(userId: string, courseId: string) {
  try {
    // Update last accessed time
    await supabase
      .from('course_enrollments')
      .update({
        last_accessed_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('course_id', courseId)

    return { success: true }
  } catch (error) {
    console.error('Error starting learning session:', error)
    return { success: false, error }
  }
}