"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { Plus, BookOpen, Users, Clock, Award } from 'lucide-react'

export default function CoursesAdminPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [isAddingCourse, setIsAddingCourse] = useState(false)
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    difficulty_level: 'beginner',
    estimated_hours: 0,
    total_lessons: 0,
    xp_reward: 0
  })

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setCourses(data)
    }
  }

  const addCourse = async () => {
    const { error } = await supabase
      .from('courses')
      .insert([{
        ...newCourse,
        is_published: true,
        slug: newCourse.title.toLowerCase().replace(/\s+/g, '-')
      }])

    if (!error) {
      setIsAddingCourse(false)
      setNewCourse({
        title: '',
        description: '',
        difficulty_level: 'beginner',
        estimated_hours: 0,
        total_lessons: 0,
        xp_reward: 0
      })
      fetchCourses()
    }
  }

  const enrollUserInCourse = async (courseId: string) => {
    // Get current user from auth context (you'd need to implement this)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { error } = await supabase
        .from('course_enrollments')
        .insert([{
          user_id: user.id,
          course_id: courseId,
          status: 'active'
        }])

      if (!error) {
        alert('Enrolled successfully!')
      }
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Course Management</h1>
        <Button 
          onClick={() => setIsAddingCourse(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Course
        </Button>
      </div>

      {isAddingCourse && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Course</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Course Title"
              value={newCourse.title}
              onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
            />
            <Textarea
              placeholder="Course Description"
              value={newCourse.description}
              onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <select 
                value={newCourse.difficulty_level}
                onChange={(e) => setNewCourse({...newCourse, difficulty_level: e.target.value})}
                className="border rounded p-2"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <Input
                type="number"
                placeholder="Estimated Hours"
                value={newCourse.estimated_hours}
                onChange={(e) => setNewCourse({...newCourse, estimated_hours: parseFloat(e.target.value) || 0})}
              />
              <Input
                type="number"
                placeholder="Total Lessons"
                value={newCourse.total_lessons}
                onChange={(e) => setNewCourse({...newCourse, total_lessons: parseInt(e.target.value) || 0})}
              />
              <Input
                type="number"
                placeholder="XP Reward"
                value={newCourse.xp_reward}
                onChange={(e) => setNewCourse({...newCourse, xp_reward: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addCourse}>Add Course</Button>
              <Button variant="outline" onClick={() => setIsAddingCourse(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <Badge variant={course.difficulty_level === 'beginner' ? 'default' : 
                              course.difficulty_level === 'intermediate' ? 'secondary' : 'destructive'}>
                  {course.difficulty_level}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{course.estimated_hours} hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{course.total_lessons} lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>{course.xp_reward} XP</span>
                </div>
              </div>

              <Button 
                className="w-full mt-4" 
                variant="outline"
                onClick={() => enrollUserInCourse(course.id)}
              >
                <Users className="w-4 h-4 mr-2" />
                Enroll
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}