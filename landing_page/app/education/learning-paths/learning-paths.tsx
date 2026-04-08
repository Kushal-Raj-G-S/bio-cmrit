'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button, Progress } from '../shared/ui-components'
import { 
  BookOpen, 
  Clock, 
  Star, 
  Users, 
  CheckCircle,
  ArrowRight,
  Wheat,
  Tractor,
  Leaf,
  Shield,
  TrendingUp,
  Award,
  MapPin,
  Calendar,
  Target
} from 'lucide-react'

interface LearningPath {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  estimatedDuration: string
  courses: {
    id: string
    title: string
    duration: string
    completed: boolean
    locked: boolean
  }[]
  benefits: string[]
  completion: number
  enrolled: boolean
  seasonal?: string
  category: string
}

const learningPaths: LearningPath[] = [
  {
    id: 'grain-master',
    title: 'Complete Grain Farming Mastery',
    description: 'From seed to market - master every aspect of grain farming including quality control, storage, and blockchain verification',
    icon: <Wheat className="w-6 h-6" />,
    difficulty: 'Beginner',
    estimatedDuration: '6 weeks',
    completion: 35,
    enrolled: true,
    category: 'Comprehensive',
    courses: [
      { id: '1', title: 'Basics of Grain Farming', duration: '2 hours', completed: true, locked: false },
      { id: '2', title: 'Soil Preparation & Seeding', duration: '3 hours', completed: true, locked: false },
      { id: '3', title: 'Crop Management & Care', duration: '4 hours', completed: false, locked: false },
      { id: '4', title: 'Harvesting Techniques', duration: '2.5 hours', completed: false, locked: true },
      { id: '5', title: 'Quality Control & Testing', duration: '3 hours', completed: false, locked: true },
      { id: '6', title: 'Storage & Preservation', duration: '2 hours', completed: false, locked: true },
      { id: '7', title: 'Blockchain Verification', duration: '1.5 hours', completed: false, locked: true },
      { id: '8', title: 'Market Readiness', duration: '2 hours', completed: false, locked: true }
    ],
    benefits: [
      'Complete grain farming expertise',
      'Quality certification preparation',
      'Blockchain technology integration',
      'Market premium access'
    ]
  },
  {
    id: 'tech-farmer',
    title: 'Digital Agriculture Specialist',
    description: 'Master modern farming technology including IoT sensors, mobile apps, and digital supply chain management',
    icon: <Tractor className="w-6 h-6" />,
    difficulty: 'Intermediate',
    estimatedDuration: '4 weeks',
    completion: 0,
    enrolled: false,
    category: 'Technology',
    courses: [
      { id: '9', title: 'Introduction to Smart Farming', duration: '2 hours', completed: false, locked: false },
      { id: '10', title: 'IoT Sensors & Monitoring', duration: '3 hours', completed: false, locked: true },
      { id: '11', title: 'Mobile Apps for Farmers', duration: '2 hours', completed: false, locked: true },
      { id: '12', title: 'Data Analysis & Insights', duration: '3 hours', completed: false, locked: true },
      { id: '13', title: 'Digital Supply Chain', duration: '2.5 hours', completed: false, locked: true },
      { id: '14', title: 'E-commerce for Farmers', duration: '2 hours', completed: false, locked: true }
    ],
    benefits: [
      'Technology integration skills',
      'Data-driven decision making',
      'Digital market access',
      'Efficiency optimization'
    ]
  },
  {
    id: 'sustainability',
    title: 'Sustainable Farming Practices',
    description: 'Learn eco-friendly farming methods that increase yield while protecting the environment',
    icon: <Leaf className="w-6 h-6" />,
    difficulty: 'Beginner',
    estimatedDuration: '5 weeks',
    completion: 15,
    enrolled: true,
    seasonal: 'All Season',
    category: 'Environment',
    courses: [
      { id: '15', title: 'Organic Farming Fundamentals', duration: '3 hours', completed: true, locked: false },
      { id: '16', title: 'Water Conservation Techniques', duration: '2.5 hours', completed: false, locked: false },
      { id: '17', title: 'Natural Pest Management', duration: '3 hours', completed: false, locked: true },
      { id: '18', title: 'Soil Health & Composting', duration: '2 hours', completed: false, locked: true },
      { id: '19', title: 'Renewable Energy in Farming', duration: '2.5 hours', completed: false, locked: true },
      { id: '20', title: 'Carbon Credits & Certification', duration: '2 hours', completed: false, locked: true }
    ],
    benefits: [
      'Reduced environmental impact',
      'Cost savings on inputs',
      'Premium market access',
      'Government incentive eligibility'
    ]
  },
  {
    id: 'quality-expert',
    title: 'Grain Quality & Safety Expert',
    description: 'Become a certified quality inspector and learn advanced testing methods for grain safety and quality',
    icon: <Shield className="w-6 h-6" />,
    difficulty: 'Advanced',
    estimatedDuration: '8 weeks',
    completion: 0,
    enrolled: false,
    category: 'Quality Assurance',
    courses: [
      { id: '21', title: 'Food Safety Standards', duration: '3 hours', completed: false, locked: false },
      { id: '22', title: 'Advanced Testing Methods', duration: '4 hours', completed: false, locked: true },
      { id: '23', title: 'Contamination Prevention', duration: '3 hours', completed: false, locked: true },
      { id: '24', title: 'Certification Processes', duration: '2.5 hours', completed: false, locked: true },
      { id: '25', title: 'Audit & Compliance', duration: '3 hours', completed: false, locked: true },
      { id: '26', title: 'Quality Documentation', duration: '2 hours', completed: false, locked: true },
      { id: '27', title: 'International Standards', duration: '3 hours', completed: false, locked: true }
    ],
    benefits: [
      'Quality inspector certification',
      'Premium pricing access',
      'Consulting opportunities',
      'Export market qualification'
    ]
  }
]

export const LearningPaths: React.FC = () => {
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null)
  const [filter, setFilter] = useState<'all' | 'enrolled' | 'available'>('all')

  const filteredPaths = learningPaths.filter(path => {
    if (filter === 'enrolled') return path.enrolled
    if (filter === 'available') return !path.enrolled
    return true
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleEnroll = (pathId: string) => {
    // Handle enrollment logic - update path enrollment status
    const pathIndex = learningPaths.findIndex(path => path.id === pathId)
    if (pathIndex !== -1) {
      // You can add state management here to update enrollment
      // For now, just show a success message or navigate
    }
  }

  const handleContinue = (pathId: string) => {
    // Handle continue learning logic - navigate to next course
    const path = learningPaths.find(p => p.id === pathId)
    if (path) {
      // Find next incomplete course and navigate there
      const nextCourse = path.courses.find(course => !course.completed && !course.locked)
      if (nextCourse) {
        // Navigate to course detail or learning interface
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-green-800 mb-4">Learning Paths</h2>
        <p className="text-lg text-green-600 max-w-2xl mx-auto">
          Follow structured learning journeys designed for different farming goals and expertise levels
        </p>
      </div>

      {/* Filters */}
      <div className="flex justify-center gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          All Paths
        </Button>
        <Button
          variant={filter === 'enrolled' ? 'default' : 'outline'}
          onClick={() => setFilter('enrolled')}
          className={filter === 'enrolled' ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          My Paths
        </Button>
        <Button
          variant={filter === 'available' ? 'default' : 'outline'}
          onClick={() => setFilter('available')}
          className={filter === 'available' ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          Available
        </Button>
      </div>

      {/* Learning Paths Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {filteredPaths.map((path, index) => (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-green-200 group cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg text-green-600 group-hover:bg-green-200 transition-colors">
                        {path.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-green-800 group-hover:text-green-900">
                          {path.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getDifficultyColor(path.difficulty)}>
                            {path.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {path.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {path.enrolled && (
                      <Badge className="bg-blue-100 text-blue-800">
                        Enrolled
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-gray-600 mt-2">
                    {path.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress (for enrolled paths) */}
                  {path.enrolled && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-green-700">{path.completion}%</span>
                      </div>
                      <Progress value={path.completion} className="h-2" />
                    </div>
                  )}

                  {/* Path Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      {path.estimatedDuration}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <BookOpen className="w-4 h-4" />
                      {path.courses.length} courses
                    </div>
                    {path.seasonal && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {path.seasonal}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Target className="w-4 h-4" />
                      Goal-oriented
                    </div>
                  </div>

                  {/* Benefits Preview */}
                  <div>
                    <h4 className="font-semibold text-green-800 mb-2 text-sm">Key Benefits:</h4>
                    <ul className="space-y-1">
                      {path.benefits.slice(0, 2).map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                      {path.benefits.length > 2 && (
                        <li className="text-sm text-gray-500">
                          +{path.benefits.length - 2} more benefits
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    {path.enrolled ? (
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleContinue(path.id)}
                      >
                        Continue Learning
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="flex-1 border-green-200 hover:bg-green-50"
                        onClick={() => handleEnroll(path.id)}
                      >
                        Enroll Now
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedPath(path)}
                      className="hover:bg-green-50"
                    >
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Detailed Path Modal/Drawer */}
      <AnimatePresence>
        {selectedPath && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPath(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-lg text-green-600">
                      {selectedPath.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-green-800">{selectedPath.title}</h3>
                      <p className="text-gray-600">{selectedPath.description}</p>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedPath(null)}>
                    ×
                  </Button>
                </div>

                {/* Complete Benefits List */}
                <div className="mb-6">
                  <h4 className="font-semibold text-green-800 mb-3">What you'll achieve:</h4>
                  <ul className="space-y-2">
                    {selectedPath.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Course List */}
                <div className="mb-6">
                  <h4 className="font-semibold text-green-800 mb-3">Course Curriculum:</h4>
                  <div className="space-y-2">
                    {selectedPath.courses.map((course, idx) => (
                      <div 
                        key={course.id} 
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          course.locked ? 'border-gray-200 bg-gray-50' : 'border-green-200 bg-white'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          course.completed ? 'bg-green-500 text-white' : 
                          course.locked ? 'bg-gray-300 text-gray-600' : 'bg-green-100 text-green-700'
                        }`}>
                          {course.completed ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                        </div>
                        <div className="flex-1">
                          <h5 className={`font-medium ${course.locked ? 'text-gray-500' : 'text-green-800'}`}>
                            {course.title}
                          </h5>
                          <p className="text-sm text-gray-600">{course.duration}</p>
                        </div>
                        {course.locked && (
                          <Badge variant="outline" className="text-xs">Locked</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex gap-2">
                  {selectedPath.enrolled ? (
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleContinue(selectedPath.id)}
                    >
                      Continue Learning
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleEnroll(selectedPath.id)}
                    >
                      Enroll in This Path
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setSelectedPath(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Footer */}
      <Card className="bg-gradient-to-r from-green-600 to-green-700 border-0 text-white">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{learningPaths.length}</div>
              <div className="text-green-100">Learning Paths</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{learningPaths.filter(p => p.enrolled).length}</div>
              <div className="text-green-100">Enrolled Paths</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {learningPaths.reduce((acc, path) => acc + path.courses.length, 0)}
              </div>
              <div className="text-green-100">Total Courses</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {Math.round(learningPaths.filter(p => p.enrolled).reduce((acc, path) => acc + path.completion, 0) / Math.max(learningPaths.filter(p => p.enrolled).length, 1))}%
              </div>
              <div className="text-green-100">Avg Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
