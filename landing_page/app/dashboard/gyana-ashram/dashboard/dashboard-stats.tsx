import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Progress } from '../shared/ui-components';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Award, 
  TrendingUp, 
  Clock, 
  Target,
  Zap
} from 'lucide-react';
import { UserStats } from '../shared/education-data';

interface DashboardStatsProps {
  stats: UserStats;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  // Add safety check for stats
  if (!stats) {
    return null;
  }

  const statsCards = [
    {
      title: 'Courses Completed',
      value: stats.completedCourses,
      total: 10,
      icon: BookOpen,
      color: 'green',
      gradient: 'from-green-500 to-green-600'
    },
    {
      title: 'Learning Hours',
      value: stats.totalStudyTime,
      icon: Clock,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Current Streak',
      value: stats.currentStreak,
      icon: Zap,
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Level',
      value: stats.level,
      icon: Award,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <div className="contents">
      {statsCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <div className="flex items-baseline space-x-1">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    {stat.total && (
                      <p className="text-sm text-gray-500">/ {stat.total}</p>
                    )}
                  </div>
                  {stat.total && (
                    <Progress 
                      value={(stat.value / stat.total) * 100} 
                      className="h-2 mt-2"
                    />
                  )}
                </div>
                <div className={`p-3 rounded-full bg-gradient-to-r ${stat.gradient}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
