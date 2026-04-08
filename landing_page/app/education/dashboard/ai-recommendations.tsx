import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../shared/ui-components';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  BookOpen,
  Star,
  ArrowRight
} from 'lucide-react';
import { Course } from '../shared/education-data';

interface AIRecommendationsProps {
  courses: Course[];
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({ courses }) => {
  return (
    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Sparkles className="w-5 h-5" />
          AI-Powered Recommendations
        </CardTitle>
        <p className="text-sm text-purple-600">
          Personalized course suggestions based on your learning journey
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.slice(0, 3).map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-4 rounded-lg border border-purple-200 hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-gray-800 text-sm line-clamp-2">
                    {course.title}
                  </h4>
                  <Badge className="bg-purple-100 text-purple-800 text-xs">
                    {course.difficulty}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {course.rating}
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {course.duration} hours
                  </div>
                </div>

                <Button 
                  size="sm" 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Start Learning
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
