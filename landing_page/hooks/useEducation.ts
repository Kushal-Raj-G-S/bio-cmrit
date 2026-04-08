// Real hooks for education platform with Supabase integration
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/auth-context'

export { useAuth }

export const useEducationDashboard = (userId?: string) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [calendarVisits, setCalendarVisits] = useState<any[]>([])
  const [enrollments, setEnrollments] = useState<any[]>([])

  useEffect(() => {
    const fetchEducationData = async () => {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Fetch education profile
        const { data: eduProfile, error: eduError } = await supabase
          .from('education_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()

        if (eduError && eduError.code !== 'PGRST116') throw eduError

        // Fetch course enrollments
        const { data: courseEnrollments, error: enrollError } = await supabase
          .from('course_enrollments')
          .select(`
            *,
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

        if (enrollError) throw enrollError

        // Calculate stats
        const completedCourses = courseEnrollments?.filter(e => e.status === 'completed').length || 0
        const activeCourses = courseEnrollments?.filter(e => e.status === 'active').length || 0
        const totalStudyHours = eduProfile?.total_study_hours || 0

        setStats({
          coursesCompleted: completedCourses,
          activeCourses: activeCourses,
          totalStudyHours: totalStudyHours,
          thisMonthStudyTime: Math.round(totalStudyHours * 60 * 0.3), // Estimate 30% this month
          calendarVisits: [],
          enrollments: courseEnrollments || [],
          profile: {
            level: eduProfile?.current_level || 1,
            xp: eduProfile?.total_xp || 0,
            streak: eduProfile?.learning_streak || 0,
            certificates: eduProfile?.certificates_earned || 0,
            studyHours: totalStudyHours
          }
        })

        setEnrollments(courseEnrollments || [])
        
        // Mock calendar visits (could be enhanced with actual visit tracking)
        const today = new Date()
        const visits = []
        for (let i = 0; i < eduProfile?.learning_streak || 0; i++) {
          const visitDate = new Date(today)
          visitDate.setDate(visitDate.getDate() - i)
          visits.push({ visitDate: visitDate.toISOString().split('T')[0] })
        }
        setCalendarVisits(visits)

      } catch (err: any) {
        console.error('Error fetching education data:', err)
        setError(err.message || 'Failed to load education data')
      } finally {
        setLoading(false)
      }
    }

    fetchEducationData()
  }, [userId])

  return {
    stats: stats || {
      coursesCompleted: 0,
      activeCourses: 0,
      totalStudyHours: 0,
      thisMonthStudyTime: 0,
      calendarVisits: [],
      enrollments: [],
      profile: {
        level: 1,
        xp: 0,
        streak: 0,
        certificates: 0,
        studyHours: 0
      }
    },
    calendarVisits,
    enrollments,
    loading,
    error
  }
}