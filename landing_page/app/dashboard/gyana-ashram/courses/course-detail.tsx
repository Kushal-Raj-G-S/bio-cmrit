'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button, Progress, Tabs, TabsContent, TabsList, TabsTrigger } from '../shared/ui-components'
import { VideoPlayer } from './video-player'
import { placeholderImages } from '../shared/placeholder-images'
import { 
  Play, 
  Clock, 
  Star, 
  Users, 
  BookOpen, 
  Award,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Download,
  MessageCircle,
  Share,
  Heart,
  FileText,
  Camera,
  Mic,
  Globe
} from 'lucide-react'

interface Lesson {
  id: string
  title: string
  duration: number
  videoUrl: string
  isCompleted: boolean
  type: 'video' | 'reading' | 'quiz' | 'assignment'
  description?: string
}

interface CourseDetailProps {
  courseId: string
  onBack?: () => void
}

// Mock data - replace with real data fetching
const mockCourse = {
  id: '1',
  title: 'Advanced Grain Quality Control & Verification',
  description: 'Master the art of grain quality assessment using modern techniques and traditional knowledge. Learn to identify, prevent, and solve quality issues that affect your harvest value.',
  instructor: 'Dr. Priya Sharma',
  instructorAvatar: placeholderImages.userAvatar('PS'),
  rating: 4.8,
  students: 1247,
  duration: '8 hours',
  level: 'Intermediate',
  language: 'English, Hindi, Kannada',
  category: 'Quality Control',
  price: 'Free',
  thumbnail: placeholderImages.courseImage('Course Thumbnail'),
  progress: 35,
  lessons: [
    {
      id: '1',
      title: 'Introduction to Grain Quality Standards',
      duration: 15,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      isCompleted: true,
      type: 'video' as const,
      description: 'Overview of international and local grain quality standards'
    },
    {
      id: '2', 
      title: 'Visual Inspection Techniques',
      duration: 22,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      isCompleted: true,
      type: 'video' as const,
      description: 'Learn to identify quality issues through visual examination'
    },
    {
      id: '3',
      title: 'Moisture Content Testing',
      duration: 18,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      isCompleted: false,
      type: 'video' as const,
      description: 'Hands-on moisture testing methods and equipment usage'
    },
    {
      id: '4',
      title: 'Field Practice: Quality Assessment',
      duration: 30,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      isCompleted: false,
      type: 'assignment' as const,
      description: 'Practical assignment to assess grain samples from your farm'
    }
  ],
  tags: ['Quality Control', 'Testing', 'Standards', 'Practical Skills'],
  requirements: [
    'Basic understanding of farming practices',
    'Access to grain samples for practice',
    'Mobile device with camera for assignments'
  ],
  outcomes: [
    'Identify grain quality issues accurately',
    'Use standard testing equipment',
    'Implement quality control measures',
    'Document and report quality assessments'
  ]
}

export const CourseDetail: React.FC<CourseDetailProps> = ({ courseId, onBack }) => {
  const [course] = useState(mockCourse)
  const [currentLesson, setCurrentLesson] = useState<Lesson>(course.lessons[0])
  const [isEnrolled, setIsEnrolled] = useState(true)
  const [activeTab, setActiveTab] = useState('lessons')
  const [isLiked, setIsLiked] = useState(false)

  const completedLessons = course.lessons.filter(lesson => lesson.isCompleted).length
  const totalLessons = course.lessons.length

  const nextLesson = () => {
    const currentIndex = course.lessons.findIndex(lesson => lesson.id === currentLesson.id)
    if (currentIndex < course.lessons.length - 1) {
      setCurrentLesson(course.lessons[currentIndex + 1])
    }
  }

  const previousLesson = () => {
    const currentIndex = course.lessons.findIndex(lesson => lesson.id === currentLesson.id)
    if (currentIndex > 0) {
      setCurrentLesson(course.lessons[currentIndex - 1])
    }
  }

  const handleLessonComplete = () => {
    // Mark current lesson as completed
    const updatedLesson = { ...currentLesson, isCompleted: true }
    setCurrentLesson(updatedLesson)
    // Auto-advance to next lesson
    setTimeout(nextLesson, 1500)
  }

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="w-4 h-4" />
      case 'reading': return <FileText className="w-4 h-4" />
      case 'assignment': return <Camera className="w-4 h-4" />
      default: return <BookOpen className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-blue-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="hover:bg-green-100"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-green-800">{course.title}</h1>
            <p className="text-green-600">by {course.instructor}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsLiked(!isLiked)}
              className={isLiked ? "text-red-500 hover:text-red-600" : "hover:text-red-500"}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-blue-100">
              <Share className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <VideoPlayer
                videoUrl={currentLesson.videoUrl}
                title={currentLesson.title}
                onProgress={(progress) => {
                  // Update lesson progress in state or database
                  // This could trigger automatic lesson completion
                }}
                onComplete={handleLessonComplete}
              />
            </motion.div>

            {/* Lesson Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-green-800">{currentLesson.title}</h3>
                      <p className="text-sm text-green-600">{currentLesson.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={previousLesson}
                        disabled={course.lessons[0].id === currentLesson.id}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={nextLesson}
                        disabled={course.lessons[course.lessons.length - 1].id === currentLesson.id}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Course Content Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 bg-white border border-green-200">
                  <TabsTrigger value="lessons" className="data-[state=active]:bg-green-100">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Lessons
                  </TabsTrigger>
                  <TabsTrigger value="description" className="data-[state=active]:bg-green-100">
                    <FileText className="w-4 h-4 mr-2" />
                    About
                  </TabsTrigger>
                  <TabsTrigger value="resources" className="data-[state=active]:bg-green-100">
                    <Download className="w-4 h-4 mr-2" />
                    Resources
                  </TabsTrigger>
                  <TabsTrigger value="discussions" className="data-[state=active]:bg-green-100">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Discussion
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="lessons" className="mt-4">
                  <Card className="border-green-200">
                    <CardHeader>
                      <CardTitle className="text-green-800">Course Lessons</CardTitle>
                      <CardDescription>
                        {completedLessons} of {totalLessons} lessons completed
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {course.lessons.map((lesson, index) => (
                          <motion.div
                            key={lesson.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                              lesson.id === currentLesson.id 
                                ? 'border-green-300 bg-green-50' 
                                : 'border-gray-200 hover:border-green-200 hover:bg-green-25'
                            }`}
                            onClick={() => setCurrentLesson(lesson)}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              lesson.isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {lesson.isCompleted ? <CheckCircle className="w-4 h-4" /> : getLessonIcon(lesson.type)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-green-800">{lesson.title}</h4>
                              <p className="text-sm text-green-600">{lesson.description}</p>
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {lesson.duration}m
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="description" className="mt-4">
                  <Card className="border-green-200">
                    <CardHeader>
                      <CardTitle className="text-green-800">Course Description</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-700">{course.description}</p>
                      
                      <div>
                        <h4 className="font-semibold text-green-800 mb-2">What you'll learn:</h4>
                        <ul className="space-y-1">
                          {course.outcomes.map((outcome, index) => (
                            <li key={index} className="flex items-start gap-2 text-gray-700">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {outcome}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-green-800 mb-2">Requirements:</h4>
                        <ul className="space-y-1">
                          {course.requirements.map((requirement, index) => (
                            <li key={index} className="flex items-start gap-2 text-gray-700">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                              {requirement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="resources" className="mt-4">
                  <Card className="border-green-200">
                    <CardHeader>
                      <CardTitle className="text-green-800">Course Resources</CardTitle>
                      <CardDescription>Downloadable materials and references</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { name: 'Grain Quality Standards Handbook', type: 'PDF', size: '2.5 MB' },
                          { name: 'Quality Testing Checklist', type: 'PDF', size: '850 KB' },
                          { name: 'Sample Assessment Forms', type: 'DOCX', size: '1.2 MB' },
                          { name: 'Regional Quality Guidelines', type: 'PDF', size: '3.1 MB' }
                        ].map((resource, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-green-200 transition-colors">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-green-600" />
                              <div>
                                <h4 className="font-medium text-green-800">{resource.name}</h4>
                                <p className="text-sm text-gray-600">{resource.type} • {resource.size}</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="discussions" className="mt-4">
                  <Card className="border-green-200">
                    <CardHeader>
                      <CardTitle className="text-green-800">Course Discussion</CardTitle>
                      <CardDescription>Ask questions and connect with fellow farmers</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>Discussion feature coming soon!</p>
                        <p className="text-sm">Connect with other farmers and share experiences</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800">Course Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold text-green-700">{Math.round((completedLessons / totalLessons) * 100)}%</span>
                  </div>
                  <Progress value={(completedLessons / totalLessons) * 100} className="h-2" />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Duration</div>
                      <div className="font-semibold">{course.duration}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Level</div>
                      <div className="font-semibold">{course.level}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Students</div>
                      <div className="font-semibold">{course.students.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Rating</div>
                      <div className="font-semibold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {course.rating}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="text-gray-600 text-sm mb-2">Languages</div>
                    <div className="flex items-center gap-1 text-sm">
                      <Globe className="w-4 h-4 text-green-600" />
                      {course.language}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-2">
                    {course.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Instructor Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800">Instructor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <img 
                      src={course.instructorAvatar} 
                      alt={course.instructor}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h4 className="font-semibold text-green-800">{course.instructor}</h4>
                      <p className="text-sm text-gray-600">Agricultural Expert</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-3">
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
