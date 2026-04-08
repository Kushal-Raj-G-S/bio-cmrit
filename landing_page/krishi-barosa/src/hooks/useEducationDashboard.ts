import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';

export interface EducationProfile {
  id: string;
  userId: string;
  level: number;
  xp: number;
  streak: number;
  lastVisitDate: string | null;
  totalStudyHours: number;
  certificates: number;
  createdAt: string;
  updatedAt: string;
}

export interface EducationStats {
  profile: EducationProfile | null;
  coursesCompleted: number;
  activeCourses: number;
  achievements: number;
  thisMonthStudyTime: number;
}

export interface CalendarVisit {
  visitDate: string;
  lessonsCompleted: number;
  studyMinutes: number;
}

export interface CourseEnrollment {
  id: string;
  courseId: string;
  courseName: string;
  progress: number;
  status: 'active' | 'completed' | 'paused';
  startedAt: string;
  lastAccessedAt: string | null;
}

export function useEducationDashboard(userId?: string) {
  const { user } = useAuth();
  const effectiveUserId = userId || user?.id;
  
  const [stats, setStats] = useState<EducationStats | null>(null);
  const [calendarVisits, setCalendarVisits] = useState<CalendarVisit[]>([]);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch education profile and stats
  const fetchEducationStats = async () => {
    if (!effectiveUserId) return;
    
    try {
      const response = await fetch(`/api/education/profile?userId=${effectiveUserId}`);
      if (!response.ok) throw new Error('Failed to fetch education stats');
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching education stats:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Fetch calendar visits
  const fetchCalendarVisits = async (month?: string, year?: string) => {
    if (!effectiveUserId) return;
    
    try {
      let url = `/api/education/calendar?userId=${effectiveUserId}`;
      if (month && year) {
        url += `&month=${month}&year=${year}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch calendar visits');
      
      const data = await response.json();
      setCalendarVisits(data.visits);
    } catch (err) {
      console.error('Error fetching calendar visits:', err);
    }
  };

  // Fetch course enrollments
  const fetchEnrollments = async (status?: 'active' | 'completed' | 'paused') => {
    if (!effectiveUserId) return;
    
    try {
      let url = `/api/education/courses?userId=${effectiveUserId}`;
      if (status) {
        url += `&status=${status}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch enrollments');
      
      const data = await response.json();
      setEnrollments(data.enrollments);
    } catch (err) {
      console.error('Error fetching enrollments:', err);
    }
  };

  // Record a visit today
  const recordVisit = async (lessonsCompleted = 0, studyMinutes = 0) => {
    if (!effectiveUserId) return;
    
    try {
      const response = await fetch('/api/education/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: effectiveUserId,
          visitDate: new Date().toISOString().split('T')[0],
          lessonsCompleted,
          studyMinutes
        })
      });
      
      if (!response.ok) throw new Error('Failed to record visit');
      
      const data = await response.json();
      
      // Update stats with new streak
      if (data.streak && stats?.profile) {
        setStats({
          ...stats,
          profile: {
            ...stats.profile,
            streak: data.streak
          }
        });
      }
      
      // Refresh calendar visits
      await fetchCalendarVisits();
    } catch (err) {
      console.error('Error recording visit:', err);
    }
  };

  // Update course progress
  const updateCourseProgress = async (
    courseId: string,
    courseName: string,
    progress: number,
    status: 'active' | 'completed' | 'paused' = 'active'
  ) => {
    if (!effectiveUserId) return;
    
    try {
      const response = await fetch('/api/education/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: effectiveUserId,
          courseId,
          courseName,
          progress,
          status
        })
      });
      
      if (!response.ok) throw new Error('Failed to update course');
      
      // Refresh data
      await Promise.all([
        fetchEducationStats(),
        fetchEnrollments()
      ]);
    } catch (err) {
      console.error('Error updating course:', err);
    }
  };

  // Initial fetch
  useEffect(() => {
    const loadData = async () => {
      if (!effectiveUserId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Fetch all data in parallel for faster loading
        const [profileData, calendarData, enrollmentsData] = await Promise.all([
          fetch(`/api/education/profile?userId=${effectiveUserId}`).then(r => r.json()),
          fetch(`/api/education/calendar?userId=${effectiveUserId}`).then(r => r.json()),
          fetch(`/api/education/courses?userId=${effectiveUserId}&status=active`).then(r => r.json())
        ]);
        
        setStats(profileData);
        setCalendarVisits(calendarData.visits || []);
        setEnrollments(enrollmentsData.enrollments || []);
        
        // Record today's visit only once on initial load
        const today = new Date().toISOString().split('T')[0];
        const hasVisitToday = calendarData.visits?.some((v: CalendarVisit) => v.visitDate === today);
        
        if (!hasVisitToday) {
          await fetch('/api/education/calendar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: effectiveUserId,
              visitDate: today,
              lessonsCompleted: 0,
              studyMinutes: 0
            })
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [effectiveUserId]);

  return {
    stats,
    calendarVisits,
    enrollments,
    loading,
    error,
    recordVisit,
    updateCourseProgress,
    fetchCalendarVisits,
    fetchEnrollments,
    refreshStats: fetchEducationStats
  };
}
