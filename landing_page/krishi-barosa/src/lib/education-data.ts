export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number;
  progress: number;
  rating: number;
  students: number;
  instructor: string;
  thumbnail: string;
  tags: string[];
  language: string[];
  lessons: number;
  isCompleted: boolean;
  isFeatured: boolean;
}

export interface UserStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalHours: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  badgesEarned: Badge[];
  achievements: Achievement[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export const courses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Supply Chain Verification',
    description: 'Learn the basics of supply chain verification and traceability in agriculture.',
    category: 'Verification',
    difficulty: 'Beginner',
    duration: 120,
    progress: 0,
    rating: 4.8,
    students: 1250,
    instructor: 'Dr. Sarah Johnson',
    thumbnail: '/api/placeholder/300/200',
    tags: ['verification', 'supply chain', 'basics'],
    language: ['English', 'Hindi'],
    lessons: 8,
    isCompleted: false,
    isFeatured: true
  },
  {
    id: '2',
    title: 'Quality Control in Agricultural Products',
    description: 'Master quality control techniques for agricultural products.',
    category: 'Quality Control',
    difficulty: 'Intermediate',
    duration: 180,
    progress: 45,
    rating: 4.6,
    students: 890,
    instructor: 'Prof. Raj Kumar',
    thumbnail: '/api/placeholder/300/200',
    tags: ['quality', 'control', 'agriculture'],
    language: ['English', 'Hindi', 'Kannada'],
    lessons: 12,
    isCompleted: false,
    isFeatured: false
  },
  {
    id: '3',
    title: 'Fraud Detection in Food Supply Chains',
    description: 'Advanced techniques for detecting and preventing fraud in food supply chains.',
    category: 'Fraud Detection',
    difficulty: 'Advanced',
    duration: 240,
    progress: 100,
    rating: 4.9,
    students: 650,
    instructor: 'Dr. Michael Chen',
    thumbnail: '/api/placeholder/300/200',
    tags: ['fraud', 'detection', 'security'],
    language: ['English'],
    lessons: 15,
    isCompleted: true,
    isFeatured: true
  }
];

export const userStats: UserStats = {
  totalCourses: 15,
  completedCourses: 8,
  inProgressCourses: 3,
  totalHours: 240,
  currentStreak: 7,
  longestStreak: 14,
  level: 5,
  xp: 2450,
  xpToNextLevel: 550,
  badgesEarned: [
    {
      id: '1',
      name: 'First Course',
      description: 'Completed your first course',
      icon: '🎓',
      color: 'blue',
      earnedAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Week Warrior',
      description: '7-day learning streak',
      icon: '🔥',
      color: 'orange',
      earnedAt: '2024-02-01'
    }
  ],
  achievements: [
    {
      id: '1',
      name: 'Knowledge Seeker',
      description: 'Enrolled in 10+ courses',
      icon: '📚',
      unlockedAt: '2024-02-15'
    }
  ]
};
