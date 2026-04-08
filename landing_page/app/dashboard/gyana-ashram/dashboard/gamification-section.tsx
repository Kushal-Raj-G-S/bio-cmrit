import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Progress } from '../shared/ui-components';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  Zap, 
  Award,
  Star,
  Medal
} from 'lucide-react';
import { UserStats } from '../shared/education-data';

interface GamificationSectionProps {
  stats: UserStats;
}

export const GamificationSection: React.FC<GamificationSectionProps> = ({ stats }) => {
  // Add safety check for stats
  if (!stats) {
    return null;
  }

  const progressPercentage = (stats.experiencePoints / (stats.experiencePoints + 1000)) * 100;

  return (
    <Card className="border-green-200 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Your Progress & Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Level Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-green-800">Level {stats.level}</h3>
              <Badge className="bg-green-100 text-green-800">
                {stats.experiencePoints} XP
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress to Level {stats.level + 1}</span>
                <span>1000 XP to go</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
            
            {/* Streak */}
            <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg">
              <Zap className="w-8 h-8 text-orange-500" />
              <div>
                <p className="font-semibold text-orange-800">{stats.currentStreak} Day Streak</p>
                <p className="text-sm text-orange-600">Keep learning daily!</p>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-800">Recent Badges</h3>
            <div className="grid grid-cols-2 gap-3">
              {(stats.badgesEarned || []).slice(0, 4).map((badge, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="p-3 bg-white border border-gray-200 rounded-lg text-center hover:shadow-md transition-all"
                >
                  <div className="text-2xl mb-1">🏆</div>
                  <p className="text-xs font-medium text-gray-800">{badge}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
