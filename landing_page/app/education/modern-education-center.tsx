'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button, Progress, Tabs, TabsContent, TabsList, TabsTrigger } from './shared/ui-components'
import { useAuth } from '@/context/auth-context'
import { useEducationDashboard } from '@/hooks/useEducationDashboard'
import { CourseCard, CourseDetail } from './courses'
import { DashboardStats, GamificationSection, AIRecommendations, CertificationBanner, ModernGamifiedDashboard } from './dashboard'
import { LearningPaths } from './learning-paths'
import { AdaptiveCommunityHub } from './community/AdaptiveCommunityHub'
import { MobileLearningCompanion } from './mobile-learning'
import { ErrorBoundary, courses, type Course } from './shared'
import { 
  BookOpen, 
  Award, 
  TrendingUp, 
  Users, 
  Star,
  ChevronRight,
  Play,
  Calendar,
  Clock,
  Target,
  Zap,
  Sparkles,
  ArrowRight,
  CheckCircle,
  BarChart3,
  Brain,
  Lightbulb,
  Rocket,
  Trophy,
  Globe,
  Heart,
  Shield,
  Leaf,
  Sun,
  Droplets,
  Wheat,
  Sprout,
  Tractor,
  PieChart,
  LineChart,
  Activity,
  Search,
  Bell,
  Settings,
  Menu,
  X,
  Filter,
  Grid,
  List,
  MessageSquare,
  Video,
  Headphones,
  Monitor,
  Smartphone,
  Wifi,
  Download
} from 'lucide-react'

interface ModernEducationCenterProps {
  user?: {
    name: string
    avatar: string
    level: number
    points: number
    streak: number
  }
}

export const ModernEducationCenter: React.FC<ModernEducationCenterProps> = ({ 
  user = { name: 'Farmer', avatar: '', level: 5, points: 1250, streak: 7 }
}) => {
  const { user: authUser, isAuthenticated } = useAuth()
  
  // Get live education data
  const { stats, loading: educationLoading } = useEducationDashboard(authUser?.id)
  
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false)

  // Modern Hero Section
  const HeroSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-green-700 to-teal-800 p-8 md:p-12 text-white shadow-2xl"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/20 blur-3xl transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/10 blur-2xl transform -translate-x-16 translate-y-16"></div>
      </div>

      <div className="relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Wheat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {user.name}!</h1>
                  <p className="text-green-100">Continue your farming mastery journey</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-3 gap-4"
            >
              <div className="text-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
                <div className="text-2xl font-bold">{user.level}</div>
                <div className="text-sm text-green-100">Level</div>
              </div>
              <div className="text-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
                <div className="text-2xl font-bold">{user.points.toLocaleString()}</div>
                <div className="text-sm text-green-100">Points</div>
              </div>
              <div className="text-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
                <div className="text-2xl font-bold">{user.streak}</div>
                <div className="text-sm text-green-100">Day Streak</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex gap-3"
            >
              <Button 
                className="bg-white text-green-700 hover:bg-green-50 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => setActiveTab('courses')}
              >
                <Play className="w-5 h-5 mr-2" />
                Continue Learning
              </Button>
              <Button 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 px-6 py-3 rounded-xl backdrop-blur-sm"
                onClick={() => setActiveTab('community')}
              >
                <Users className="w-5 h-5 mr-2" />
                Join Community
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="hidden md:block"
          >
            <div className="relative">
              <div className="w-64 h-64 rounded-3xl bg-white/10 backdrop-blur-sm p-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 mx-auto flex items-center justify-center">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg">AI-Powered Learning</h3>
                  <p className="text-sm text-green-100">Personalized recommendations just for you</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )

  // Modern Navigation
  const ModernNavigation = () => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm"
    >
      <div className="flex items-center justify-between p-4">
        {/* Navigation moved to full left */}
        <nav className="hidden md:flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'courses', label: 'Courses', icon: BookOpen },
            { id: 'paths', label: 'Learning Paths', icon: Target },
            { id: 'community', label: 'Community', icon: Users },
            { id: 'mobile', label: 'Mobile', icon: Smartphone }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-green-700 shadow-md font-medium'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search courses, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
          </Button>

          {/* Mobile Menu */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200/50 bg-white/90 backdrop-blur-xl"
          >
            <div className="p-4 space-y-2">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'courses', label: 'Courses', icon: BookOpen },
                { id: 'paths', label: 'Learning Paths', icon: Target },
                { id: 'community', label: 'Community', icon: Users },
                { id: 'mobile', label: 'Mobile', icon: Smartphone }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setShowMobileMenu(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-green-50 text-green-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )

  // Quick Stats Cards
  const QuickStats = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      {[
        { 
          label: 'Courses Completed', 
          value: stats?.coursesCompleted || 0, 
          icon: CheckCircle, 
          color: 'text-green-600',
          bg: 'bg-green-50',
          change: '+2 this week'
        },
        { 
          label: 'Study Hours', 
          value: `${stats?.profile?.totalStudyHours || 0}h`, 
          icon: Clock, 
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          change: '+5h this week'
        },
        { 
          label: 'Current Streak', 
          value: `${stats?.profile?.streak || 0} days`, 
          icon: Zap, 
          color: 'text-orange-600',
          bg: 'bg-orange-50',
          change: 'Keep it up!'
        },
        { 
          label: 'Certificates', 
          value: stats?.profile?.certificates || 0, 
          icon: Award, 
          color: 'text-purple-600',
          bg: 'bg-purple-50',
          change: '1 pending'
        }
      ].map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + index * 0.05 }}
          whileHover={{ y: -2 }}
        >
          <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
                <div className="text-xs text-green-600 font-medium">{stat.change}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/30">
        <ModernNavigation />
        
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && (
                <ModernGamifiedDashboard />
              )}

              {activeTab === 'courses' && (
                <div className="space-y-6">
                  {selectedCourse ? (
                    <div>
                      <Button 
                        variant="ghost" 
                        onClick={() => setSelectedCourse(null)}
                        className="mb-4"
                      >
                        <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                        Back to Courses
                      </Button>
                      <CourseDetail courseId={selectedCourse.id} />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-800">Your Courses</h2>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                          >
                            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Filter className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className={`grid gap-6 ${
                        viewMode === 'grid' 
                          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                          : 'grid-cols-1'
                      }`}>
                        {courses.map((course, index) => (
                          <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <CourseCard 
                              course={course} 
                              onClick={() => setSelectedCourse(course)}
                              viewMode={viewMode}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'paths' && <LearningPaths />}
              {activeTab === 'community' && <AdaptiveCommunityHub />}
              {activeTab === 'mobile' && <MobileLearningCompanion />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default ModernEducationCenter
