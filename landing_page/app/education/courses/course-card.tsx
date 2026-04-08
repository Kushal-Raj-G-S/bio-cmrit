import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Progress } from '../shared/ui-components';
import { Course } from '../shared/education-data';
import { placeholderImages } from '../shared/placeholder-images';
import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  BookOpen, 
  Award,
  ChevronRight,
  Download,
  Bookmark,
  Share,
  MoreHorizontal,
  TrendingUp,
  CheckCircle,
  Target,
  Calendar,
  Globe,
  Headphones,
  Video,
  FileText,
  Eye,
  Heart,
  MessageSquare
} from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onClick?: () => void;
  viewMode?: 'grid' | 'list';
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const CourseCard: React.FC<CourseCardProps> = ({ 
  course, 
  onClick, 
  viewMode = 'grid',
  showProgress = true,
  size = 'md'
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress === 0) return 'bg-gray-200'
    if (progress < 50) return 'bg-blue-500'
    if (progress < 100) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const renderGridView = () => (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <Card className="overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-300 bg-white">
        {/* Course Image */}
        <div className="relative">
          <div className="aspect-video bg-gradient-to-br from-green-400 to-blue-500 relative overflow-hidden">
            <img 
              src={course.thumbnail || placeholderImages.courseImage(course.title)} 
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = placeholderImages.courseImage(course.title)
              }}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
            
            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <Play className="w-6 h-6 text-green-600 ml-1" />
              </div>
            </div>

            {/* Progress Badge */}
            {course.progress > 0 && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-white/90 text-gray-800 backdrop-blur-sm border-0">
                  {course.progress === 100 ? (
                    <><CheckCircle className="w-3 h-3 mr-1 text-green-600" /> Completed</>
                  ) : (
                    <>{course.progress}% Complete</>
                  )}
                </Badge>
              </div>
            )}

            {/* Bookmark */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute top-3 right-3 w-8 h-8 p-0 bg-white/90 hover:bg-white text-gray-600 hover:text-red-500 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <Heart className="w-4 h-4" />
            </Button>

            {/* Course Type Badge */}
            {course.isFeatured && (
              <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg">
                  ⭐ Featured
                </Badge>
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-6 space-y-4">
          {/* Course Meta */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {course.duration}h
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {course.students}
              </div>
            </div>
            <Badge variant="outline" className={getDifficultyColor(course.difficulty)}>
              {course.difficulty}
            </Badge>
          </div>

          {/* Course Title */}
          <div>
            <h3 className="font-bold text-lg text-gray-800 line-clamp-2 group-hover:text-green-700 transition-colors">
              {course.title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2 mt-2">
              {course.description}
            </p>
          </div>

          {/* Instructor & Rating */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              by {course.instructor || 'Expert Instructor'}
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">{course.rating}</span>
              <span className="text-xs text-gray-500">({course.students})</span>
            </div>
          </div>

          {/* Progress Bar */}
          {showProgress && course.progress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-gray-800">{course.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${course.progress}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-full rounded-full ${getProgressColor(course.progress)} relative`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30"></div>
                </motion.div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                onClick?.()
              }}
            >
              {course.progress === 0 ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Course
                </>
              ) : course.progress === 100 ? (
                <>
                  <Award className="w-4 h-4 mr-2" />
                  View Certificate
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Continue
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="px-3 hover:bg-gray-50"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderListView = () => (
    <motion.div
      whileHover={{ x: 4 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <Card className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Course Thumbnail */}
            <div className="flex-shrink-0">
              <div className="w-32 h-20 rounded-lg bg-gradient-to-br from-green-400 to-blue-500 relative overflow-hidden">
                <img 
                  src={course.thumbnail || placeholderImages.courseImage(course.title)} 
                  alt={course.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = placeholderImages.courseImage(course.title)
                  }}
                />
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="w-6 h-6 text-white opacity-80" />
                </div>
              </div>
            </div>

            {/* Course Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800 line-clamp-1 group-hover:text-green-700 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mt-1">
                    {course.description}
                  </p>
                </div>
                <Badge variant="outline" className={getDifficultyColor(course.difficulty)}>
                  {course.difficulty}
                </Badge>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {course.duration}h
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {course.students}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  {course.rating}
                </div>
              </div>

              {/* Progress */}
              {showProgress && course.progress > 0 && (
                <div className="mb-3">
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-800">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  by {course.instructor || 'Expert Instructor'}
                </div>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                  {course.progress === 0 ? 'Start' : course.progress === 100 ? 'Review' : 'Continue'}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return viewMode === 'grid' ? renderGridView() : renderListView()
}
