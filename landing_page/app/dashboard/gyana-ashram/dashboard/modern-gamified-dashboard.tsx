
'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { useAuth } from '@/context/auth-context'
import { useTranslation } from '@/hooks/use-translation'
import { useEducationDashboard } from '@/hooks/useEducationDashboard'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Badge, 
  Button, 
  Progress 
} from '../shared/ui-components'
import { 
  Brain,
  Flame,
  Trophy,
  Clock,
  Star,
  CheckCircle,
  Users,
  MessageSquare,
  Download,
  ChevronRight,
  Zap,
  Target,
  Award,
  BookOpen,
  TrendingUp,
  Calendar,
  Sparkles,
  Medal,
  Crown,
  Rocket,
  Heart,
  ShieldCheck,
  Leaf,
  Lightbulb,
  Play,
  ArrowRight,
  Home,
  Settings,
  User,
  HelpCircle,
  Tractor,
  Droplets,
  Wheat,
  Sprout,
  CalendarDays,
  ChevronLeft
} from 'lucide-react'

interface DashboardProps {
  userId?: string // Add userId prop to fetch real data
}

export const ModernGamifiedDashboard = ({ 
  userId
}: DashboardProps) => {
  // Get authenticated user
  const { user: authUser } = useAuth()
  const { t } = useTranslation()
  
  // Get live education data
  const { 
    stats, 
    calendarVisits, 
    enrollments, 
    loading, 
    error 
  } = useEducationDashboard(userId || authUser?.id)
  
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // Show loading state while fetching user data
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("gyanaAshram.overview.loadingDashboard")}</p>
        </div>
      </div>
    )
  }
  
  // Show error state if there's an error fetching data
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading dashboard: {error}</p>
          <Button onClick={() => window.location.reload()}>
            {t("gyanaAshram.overview.tryAgain")}
          </Button>
        </div>
      </div>
    )
  }
  
  // Use real user data from auth context
  const userName = authUser?.name || 'User'
  const userLevel = stats?.profile?.level || 1
  const userXP = stats?.profile?.xp || 0
  const userStreak = stats?.profile?.streak || 0
  const coursesCompleted = stats?.coursesCompleted || 0
  const activeCourses = stats?.activeCourses || 0
  const certificates = stats?.profile?.certificates || 0
  const studyHours = stats?.profile?.totalStudyHours || 0
  const studyHoursThisMonth = stats?.thisMonthStudyTime || 0
  
  // Calculate XP progress to next level
  const xpToNextLevel = (userLevel * 300) + 200
  const xpProgress = Math.round((userXP / xpToNextLevel) * 100)
  
  // Convert calendarVisits to Set for calendar display
  const visitDates = new Set(calendarVisits.map(v => v.visitDate))
  
  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const currentDay = new Date(startDate)
    
    for (let i = 0; i < 42; i++) {
      const dateStr = currentDay.toISOString().split('T')[0]
      const isCurrentMonth = currentDay.getMonth() === month
      const isToday = dateStr === new Date().toISOString().split('T')[0]
      const hasVisit = visitDates.has(dateStr)
      
      days.push({
        date: new Date(currentDay),
        dateStr,
        day: currentDay.getDate(),
        isCurrentMonth,
        isToday,
        hasVisit
      })
      
      currentDay.setDate(currentDay.getDate() + 1)
    }
    
    return days
  }
  
  const calendarDays = generateCalendarDays()
  const monthKeys = ['january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december']
  const monthNames = monthKeys.map(k => t(`gyanaAshram.calendar.${k}`))
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }
  
  // Build dashboard data from real stats
  const dashboardData = {
    user: {
      name: userName,
      level: userLevel,
      xp: userXP,
      xpToNext: xpToNextLevel,
      avatar: authUser?.avatar || authUser?.profilePicture || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    stats: {
      coursesCompleted: coursesCompleted,
      totalCourses: coursesCompleted + activeCourses,
      studyHours: studyHours,
      studyHoursThisMonth: Math.floor(studyHoursThisMonth / 60), // Convert minutes to hours
      certificates: certificates
    },
    recommendations: [
      {
        id: '1',
        title: 'AI-Powered Crop Monitoring',
        description: 'Learn smart sensors for better yields',
        thumbnail: '🌾',
        difficulty: 'Intermediate',
        duration: '2h 30m',
        rating: 4.8
      },
      {
        id: '2',
        title: 'Sustainable Water Management',
        description: 'Efficient irrigation techniques',
        thumbnail: '💧',
        difficulty: 'Beginner',
        duration: '1h 45m',
        rating: 4.9
      }
    ],
    communityCategories: ['equipment', 'soil', 'water', 'pests', 'seeds']
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 🔰 Mandatory Header Section - DO NOT MODIFY */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 p-8 mb-8 text-white"
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 opacity-30"></div>
            <div className="absolute bottom-0 left-0 transform rotate-12">
              <Tractor className="w-32 h-32 text-white/10" />
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-3xl md:text-4xl font-bold">
                  {t("gyanaAshram.hero.welcomeBack")}, {dashboardData.user.name}! 
                </h1>
                <p className="text-green-100 text-lg">{t("gyanaAshram.hero.subtitle")}</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-4"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <span className="text-sm font-medium">{t("gyanaAshram.hero.level")} {dashboardData.user.level}</span>
                </div>
                <div className="flex-1 max-w-xs">
                  <div className="flex justify-between text-sm mb-1">
                    <span><CountUp end={dashboardData.user.xp} duration={2} /> XP</span>
                    <span>{dashboardData.user.xpToNext} XP</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(dashboardData.user.xp / dashboardData.user.xpToNext) * 100}%` }}
                      transition={{ delay: 0.6, duration: 1.5 }}
                      className="h-2 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              {/* Profile image removed */}
            </motion.div>
          </div>
        </motion.div>

        {/* Modern Grid-Based Dashboard Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          
          {/* 🟦 Left Sidebar - Learning Overview & Progress */}
          <div className="xl:col-span-3 flex flex-col gap-4">
            
            {/* XP & Level Progress Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-none shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-5">
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                      <span className="font-bold text-lg text-gray-900">{t("gyanaAshram.hero.level")} {dashboardData.user.level}</span>
                    </div>
                    
                    <div className="relative w-20 h-20 mx-auto">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="2"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2"
                          strokeDasharray={`${(dashboardData.user.xp / dashboardData.user.xpToNext) * 100}, 100`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-700">
                          <CountUp end={Math.round((dashboardData.user.xp / dashboardData.user.xpToNext) * 100)} duration={2} />%
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <CountUp end={dashboardData.user.xp} duration={2} /> / {dashboardData.user.xpToNext} XP
                      </p>
                      <p className="text-xs text-gray-500">
                        {dashboardData.user.xpToNext - dashboardData.user.xp} {t("gyanaAshram.overview.xpToNextLevel")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Course Progress */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-green-600" />
                    {t("gyanaAshram.overview.activeCourses")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {dashboardData.recommendations.map((course, index) => (
                    <div key={course.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-sm">
                          {course.thumbnail}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{course.title}</h4>
                          <p className="text-xs text-gray-500">{course.duration}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>{t("gyanaAshram.overview.progress")}</span>
                          <span>{65 + index * 10}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="h-1.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000"
                            style={{ width: `${65 + index * 10}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Extended Quick Stats & Achievements */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex-1"
            >
              <Card className="border-none shadow-sm h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-gray-900">{t("gyanaAshram.overview.statsAndAchievements")}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: t('gyanaAshram.stats.certificates'), value: dashboardData.stats.certificates, icon: Award, color: 'text-purple-600' },
                      { label: t('gyanaAshram.stats.studyHours'), value: `${dashboardData.stats.studyHours}h`, icon: Clock, color: 'text-blue-600' },
                      { label: t('gyanaAshram.overview.completed'), value: `${dashboardData.stats.coursesCompleted}/${dashboardData.stats.totalCourses}`, icon: CheckCircle, color: 'text-green-600' },
                      { label: t('gyanaAshram.overview.thisMonth'), value: `${dashboardData.stats.studyHoursThisMonth}h`, icon: TrendingUp, color: 'text-orange-600' }
                    ].map((stat, index) => (
                      <div key={stat.label} className="text-center p-4 bg-gray-50 rounded-lg">
                        <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                        <p className="font-bold text-gray-900 text-lg">{stat.value}</p>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Learning Streak */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                        <Flame className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-base">{t("gyanaAshram.overview.learningStreak")}</h4>
                        <p className="text-sm text-gray-600">{t("gyanaAshram.overview.keepMomentum")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-orange-600">
                        <CountUp end={userStreak} duration={2} />
                      </span>
                      <span className="text-base text-gray-600">{t("gyanaAshram.overview.daysInARow")}</span>
                    </div>
                  </div>

                  {/* Recent Achievements */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 text-base">{t("gyanaAshram.overview.recentAchievements")}</h4>
                    {[
                      { title: t('gyanaAshram.overview.firstCourseCompleted'), icon: Medal, color: 'text-yellow-600' },
                      { title: t('gyanaAshram.overview.weekStreak'), icon: Flame, color: 'text-orange-600' },
                      { title: t('gyanaAshram.overview.communityMember'), icon: Users, color: 'text-blue-600' }
                    ].map((achievement, index) => (
                      <div key={achievement.title} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                          <achievement.icon className={`w-4 h-4 ${achievement.color}`} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{achievement.title}</span>
                      </div>
                    ))}
                  </div>

                  {/* Daily Goal Progress */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-900 text-base">{t("gyanaAshram.overview.todaysGoal")}</h4>
                      <span className="text-sm text-gray-500">2/3 {t("gyanaAshram.overview.todaysGoalStatus")}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="h-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000 w-2/3" />
                    </div>
                    <p className="text-sm text-gray-600">{t("gyanaAshram.overview.dailyGoalMessage")}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* 🟨 Center Content - Calendar & Extended Activity */}
          <div className="xl:col-span-6 flex flex-col gap-4">
            
            {/* Visit Tracker Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <CalendarDays className="w-6 h-6 text-green-600" />
                      {t("gyanaAshram.overview.learningCalendar")}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigateMonth('prev')}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-base font-medium min-w-24 text-center">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigateMonth('next')}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Calendar Header */}
                    <div className="grid grid-cols-7 gap-1">
                      {[t('gyanaAshram.calendar.sun'), t('gyanaAshram.calendar.mon'), t('gyanaAshram.calendar.tue'), t('gyanaAshram.calendar.wed'), t('gyanaAshram.calendar.thu'), t('gyanaAshram.calendar.fri'), t('gyanaAshram.calendar.sat')].map(day => (
                        <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((day, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.005 }}
                          className={`
                            relative h-10 flex items-center justify-center text-base rounded-lg cursor-pointer transition-all hover:scale-105
                            ${!day.isCurrentMonth 
                              ? 'text-gray-300' 
                              : day.isToday 
                                ? 'bg-blue-500 text-white font-bold shadow-sm' 
                                : day.hasVisit 
                                  ? 'bg-green-100 text-green-800 font-medium border border-green-300 shadow-sm' 
                                  : 'text-gray-700 hover:bg-gray-100'
                            }
                          `}
                        >
                          {day.day}
                          {day.hasVisit && day.isCurrentMonth && !day.isToday && (
                            <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full shadow-sm"></div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Calendar Stats */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                          <span className="text-sm text-gray-600">{t("gyanaAshram.overview.visited")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-500 rounded"></div>
                          <span className="text-sm text-gray-600">{t("gyanaAshram.overview.today")}</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 font-medium">
                        {visitDates.size} {t("gyanaAshram.overview.visitsTotal")}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Extended Activity & Progress Hub */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex-1"
            >
              <Card className="border-none shadow-sm h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-bold text-gray-900">{t("gyanaAshram.overview.activityAndProgress")}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-5">
                  {/* Recent Activity */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 text-base">{t("gyanaAshram.overview.recentActivity")}</h4>
                    {[
                      { action: t('gyanaAshram.overview.completedLesson'), subject: 'AI-Powered Crop Monitoring', time: `2 ${t('gyanaAshram.overview.hoursAgo')}`, icon: CheckCircle, color: 'text-green-600' },
                      { action: t('gyanaAshram.overview.startedCourse'), subject: 'Sustainable Water Management', time: `1 ${t('gyanaAshram.overview.dayAgo')}`, icon: Play, color: 'text-blue-600' },
                      { action: t('gyanaAshram.overview.earnedCertificate'), subject: 'Organic Farming Basics', time: `3 ${t('gyanaAshram.overview.daysAgo')}`, icon: Award, color: 'text-purple-600' },
                      { action: t('gyanaAshram.overview.joinedCommunity'), subject: 'Microbiology Group', time: `5 ${t('gyanaAshram.overview.daysAgo')}`, icon: Users, color: 'text-orange-600' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm`}>
                          <activity.icon className={`w-5 h-5 ${activity.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-base font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-600">{activity.subject}</p>
                        </div>
                        <span className="text-sm text-gray-500">{activity.time}</span>
                      </div>
                    ))}
                  </div>

                  {/* Weekly Learning Overview */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 text-base">{t("gyanaAshram.overview.thisWeeksProgress")}</h4>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5">
                      <div className="grid grid-cols-7 gap-3 mb-4">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                          <div key={day} className="text-center">
                            <div className="text-sm text-gray-500 mb-2">{day}</div>
                            <div className={`h-10 rounded ${index < 5 ? 'bg-green-200' : index === 5 ? 'bg-green-400' : 'bg-gray-200'} flex items-center justify-center`}>
                              {index < 6 && <CheckCircle className="w-4 h-4 text-green-700" />}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-base">
                        <span className="text-gray-600">6/7 {t("gyanaAshram.overview.daysCompleted")}</span>
                        <span className="text-green-600 font-medium">86% {t("gyanaAshram.overview.weeklyGoal")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Study Time Analysis */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 text-base">{t("gyanaAshram.overview.studyTimeBreakdown")}</h4>
                    <div className="space-y-3">
                      {[
                        { subject: t('gyanaAshram.overview.cropMonitoring'), hours: 12, color: 'bg-green-400', percentage: 60 },
                        { subject: t('gyanaAshram.overview.waterManagement'), hours: 5, color: 'bg-blue-400', percentage: 25 },
                        { subject: t('gyanaAshram.overview.soilScience'), hours: 3, color: 'bg-yellow-400', percentage: 15 }
                      ].map((item, index) => (
                        <div key={item.subject} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 font-medium">{item.subject}</span>
                            <span className="text-gray-500">{item.hours}h</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 ${item.color} rounded-full transition-all duration-1000`}
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* 🟪 Right Sidebar - Actions, Community & Recommendations */}
          <div className="xl:col-span-3 flex flex-col gap-4">
            
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-gray-900">{t("gyanaAshram.overview.quickActions")}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {[
                    { icon: BookOpen, label: t('gyanaAshram.overview.continueLearning'), color: 'text-green-600', bg: 'bg-green-50' },
                    { icon: Download, label: t('gyanaAshram.overview.downloadCertificate'), color: 'text-blue-600', bg: 'bg-blue-50' },
                    { icon: Users, label: t('gyanaAshram.overview.joinStudyGroup'), color: 'text-purple-600', bg: 'bg-purple-50' },
                    { icon: MessageSquare, label: t('gyanaAshram.overview.askCommunity'), color: 'text-orange-600', bg: 'bg-orange-50' }
                  ].map((action, index) => (
                    <button
                      key={action.label}
                      className={`w-full flex items-center gap-4 p-4 rounded-lg ${action.bg} hover:scale-105 transition-all duration-200 text-left`}
                    >
                      <action.icon className={`w-5 h-5 ${action.color}`} />
                      <span className="font-medium text-gray-900 text-base">{action.label}</span>
                      <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
                    </button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Community Highlights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    {t("gyanaAshram.overview.communities")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {[
                    { name: 'Organic Farming Society', members: 248, icon: Leaf, color: 'text-green-600' },
                    { name: 'Microbiology Group', members: 156, icon: Sprout, color: 'text-emerald-600' }
                  ].map((community, index) => (
                    <div key={community.name} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <community.icon className={`w-5 h-5 ${community.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-base">{community.name}</h4>
                        <p className="text-sm text-gray-500">{community.members} {t("gyanaAshram.overview.farmers")}</p>
                      </div>
                    </div>
                  ))}
                  
                  <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white text-base py-3">
                    <Users className="w-5 h-5 mr-2" />
                    {t("gyanaAshram.overview.exploreCommunities")}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Extended Recommendations & Learning Path */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex-1"
            >
              <Card className="border-none shadow-sm h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-gray-900">{t("gyanaAshram.overview.learningPath")}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-5">
                  {/* Recommended Courses */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 text-base">{t("gyanaAshram.overview.recommendedCourses")}</h4>
                    {dashboardData.recommendations.slice(0, 2).map((course, index) => (
                      <div key={course.id} className="space-y-3 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-lg flex-shrink-0">
                            {course.thumbnail}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 text-base line-clamp-2 mb-2">
                              {course.title}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <Badge variant="outline" className="text-sm px-2 py-1">
                                {course.difficulty}
                              </Badge>
                              <span>{course.duration}</span>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span>{course.rating}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2">
                          <Play className="w-4 h-4 mr-2" />
                          {t("gyanaAshram.overview.startCourse")}
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Learning Insights */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 text-base">{t("gyanaAshram.overview.learningInsights")}</h4>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Brain className="w-5 h-5 text-purple-600" />
                        <span className="font-medium text-purple-900 text-base">{t("gyanaAshram.overview.smartRecommendation")}</span>
                      </div>
                      <p className="text-sm text-purple-700">
                        {t("gyanaAshram.overview.insightMessage")}
                      </p>
                    </div>
                  </div>

                  {/* Next Milestones */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 text-base">{t("gyanaAshram.overview.nextMilestones")}</h4>
                    <div className="space-y-3">
                      {[
                        { milestone: t('gyanaAshram.overview.completeCourses'), progress: 50, current: 5, total: 10 },
                        { milestone: t('gyanaAshram.overview.earnCertificates'), progress: 60, current: 3, total: 5 },
                        { milestone: t('gyanaAshram.overview.studyHoursGoal'), progress: 74, current: 37, total: 50 }
                      ].map((item, index) => (
                        <div key={item.milestone} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 font-medium">{item.milestone}</span>
                            <span className="text-gray-500">{item.current}/{item.total}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
