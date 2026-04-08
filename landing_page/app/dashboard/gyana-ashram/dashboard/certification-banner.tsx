import React from 'react';
import { Card, CardContent, Button, Badge } from '../shared/ui-components';
import { motion } from 'framer-motion';
import { 
  Award, 
  Download, 
  CheckCircle,
  Star,
  Trophy
} from 'lucide-react';
import { UserStats } from '../shared/education-data';

interface CertificationBannerProps {
  userStats: UserStats;
}

export const CertificationBanner: React.FC<CertificationBannerProps> = ({ userStats }) => {
  // Add safety check for userStats
  if (!userStats) {
    return null;
  }

  const completionRate = userStats.completedCourses > 0 ? (userStats.completedCourses / 10) * 100 : 0;
  const canEarnCertificate = userStats.completedCourses >= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden"
    >
      <Card className="border-0 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">
                  {canEarnCertificate ? 'Certificate Ready!' : 'Earn Your Certificate'}
                </h3>
                <p className="text-yellow-100">
                  {canEarnCertificate 
                    ? 'Congratulations! You can now download your certificate.'
                    : `Complete ${5 - userStats.completedCourses} more courses to earn your certificate.`
                  }
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-white/20 text-white border-white/30">
                    {userStats.completedCourses}/10 Courses
                  </Badge>
                  <Badge className="bg-white/20 text-white border-white/30">
                    {Math.round(completionRate)}% Complete
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              {canEarnCertificate ? (
                <Button className="bg-white text-yellow-600 hover:bg-yellow-50 font-semibold">
                  <Download className="w-4 h-4 mr-2" />
                  Download Certificate
                </Button>
              ) : (
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  <Trophy className="w-4 h-4 mr-2" />
                  View Progress
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
