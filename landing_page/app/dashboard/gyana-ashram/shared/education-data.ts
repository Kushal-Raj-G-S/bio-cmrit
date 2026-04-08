export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  students: number;
  progress: number;
  category: string;
  isFeatured?: boolean;
  instructor?: string;
  price?: number;
  tags?: string[];
  language?: string;
}

export interface UserStats {
  completedCourses: number;
  totalStudyTime: number;
  currentStreak: number;
  level: number;
  experiencePoints: number;
  badgesEarned: string[];
  weeklyGoal: number;
  weeklyProgress: number;
}

export const userStats: UserStats = {
  completedCourses: 12,
  totalStudyTime: 1450,
  currentStreak: 7,
  level: 5,
  experiencePoints: 2850,
  badgesEarned: ['First Course', 'Week Warrior', 'Knowledge Seeker', 'Crop Expert'],
  weeklyGoal: 300,
  weeklyProgress: 245
};

export const courses: Course[] = [
  {
    id: '1',
    title: 'Sustainable Crop Rotation Techniques',
    description: 'Learn advanced crop rotation methods to improve soil health and maximize yield while maintaining environmental sustainability.',
    thumbnail: 'https://via.placeholder.com/400x300/22c55e/ffffff?text=Crop+Rotation',
    duration: 45,
    difficulty: 'Intermediate',
    rating: 4.8,
    students: 1250,
    progress: 65,
    category: 'Crop Management',
    isFeatured: true,
    instructor: 'Dr. Sarah Green',
    price: 49,
    tags: ['sustainability', 'soil health', 'rotation']
  },
  {
    id: '2',
    title: 'Organic Pest Control Methods',
    description: 'Discover natural and organic approaches to pest management that protect crops without harmful chemicals.',
    thumbnail: 'https://via.placeholder.com/400x300/059669/ffffff?text=Pest+Control',
    duration: 35,
    difficulty: 'Beginner',
    rating: 4.6,
    students: 980,
    progress: 0,
    category: 'Pest Management',
    instructor: 'Prof. John Miller',
    price: 39,
    tags: ['organic', 'pest control', 'natural methods']
  },
  {
    id: '3',
    title: 'Water Conservation and Irrigation',
    description: 'Master efficient irrigation techniques and water conservation strategies for drought-resistant farming.',
    thumbnail: 'https://via.placeholder.com/400x300/0d9488/ffffff?text=Water+Conservation',
    duration: 55,
    difficulty: 'Advanced',
    rating: 4.9,
    students: 750,
    progress: 100,
    category: 'Water Management',
    isFeatured: true,
    instructor: 'Dr. Maria Rodriguez',
    price: 65,
    tags: ['irrigation', 'water conservation', 'efficiency']
  },
  {
    id: '4',
    title: 'Soil Health and Fertility Management',
    description: 'Comprehensive guide to understanding soil composition, testing, and improvement techniques.',
    thumbnail: 'https://via.placeholder.com/400x300/065f46/ffffff?text=Soil+Health',
    duration: 40,
    difficulty: 'Intermediate',
    rating: 4.7,
    students: 1100,
    progress: 30,
    category: 'Soil Management',
    instructor: 'Dr. Robert Chen',
    price: 45,
    tags: ['soil testing', 'fertility', 'nutrients']
  },
  {
    id: '5',
    title: 'Climate-Smart Agriculture Basics',
    description: 'Introduction to climate-resilient farming practices and adaptation strategies.',
    thumbnail: 'https://via.placeholder.com/400x300/16a34a/ffffff?text=Climate+Smart',
    duration: 50,
    difficulty: 'Beginner',
    rating: 4.5,
    students: 1350,
    progress: 0,
    category: 'Climate Adaptation',
    instructor: 'Dr. Lisa Thompson',
    price: 55,
    tags: ['climate change', 'adaptation', 'resilience']
  },
  {
    id: '6',
    title: 'Precision Agriculture Technologies',
    description: 'Explore modern farming technologies including GPS, sensors, and data analytics for precision farming.',
    thumbnail: 'https://via.placeholder.com/400x300/15803d/ffffff?text=Precision+Ag',
    duration: 60,
    difficulty: 'Advanced',
    rating: 4.8,
    students: 650,
    progress: 0,
    category: 'Technology',
    isFeatured: true,
    instructor: 'Dr. Michael Zhang',
    price: 75,
    tags: ['technology', 'GPS', 'sensors', 'data analytics']
  },
  {
    id: '7',
    title: 'Composting and Organic Matter Management',
    description: 'Learn to create and manage compost systems to enrich soil naturally.',
    thumbnail: 'https://via.placeholder.com/400x300/166534/ffffff?text=Composting',
    duration: 30,
    difficulty: 'Beginner',
    rating: 4.4,
    students: 890,
    progress: 80,
    category: 'Soil Management',
    instructor: 'Sarah Wilson',
    price: 35,
    tags: ['composting', 'organic matter', 'soil enrichment']
  },
  {
    id: '8',
    title: 'Integrated Pest Management (IPM)',
    description: 'Comprehensive approach to pest control combining biological, cultural, and chemical methods.',
    thumbnail: 'https://via.placeholder.com/400x300/14532d/ffffff?text=IPM+Methods',
    duration: 45,
    difficulty: 'Intermediate',
    rating: 4.6,
    students: 720,
    progress: 15,
    category: 'Pest Management',
    instructor: 'Dr. Amanda Foster',
    price: 50,
    tags: ['IPM', 'biological control', 'pest management']
  },
  {
    id: '9',
    title: 'Greenhouse Management Fundamentals',
    description: 'Complete guide to greenhouse operations, climate control, and crop production.',
    thumbnail: 'https://via.placeholder.com/400x300/22c55e/ffffff?text=Greenhouse',
    duration: 55,
    difficulty: 'Intermediate',
    rating: 4.7,
    students: 580,
    progress: 0,
    category: 'Controlled Environment',
    instructor: 'Prof. David Kumar',
    price: 60,
    tags: ['greenhouse', 'climate control', 'protected cultivation']
  },
  {
    id: '10',
    title: 'Market Gardening for Small Farms',
    description: 'Business strategies and techniques for profitable small-scale vegetable production.',
    thumbnail: 'https://via.placeholder.com/400x300/059669/ffffff?text=Market+Garden',
    duration: 40,
    difficulty: 'Beginner',
    rating: 4.5,
    students: 940,
    progress: 0,
    category: 'Business',
    instructor: 'Jennifer Adams',
    price: 45,
    tags: ['market gardening', 'small farms', 'business']
  },
  {
    id: '11',
    title: 'Seed Starting and Plant Propagation',
    description: 'Master the art of growing plants from seeds and other propagation techniques.',
    thumbnail: 'https://via.placeholder.com/400x300/0d9488/ffffff?text=Seed+Starting',
    duration: 35,
    difficulty: 'Beginner',
    rating: 4.3,
    students: 1200,
    progress: 100,
    category: 'Plant Biology',
    instructor: 'Maria Santos',
    price: 40,
    tags: ['seeds', 'propagation', 'plant biology']
  },
  {
    id: '12',
    title: 'Agroforestry Systems Design',
    description: 'Design and implement agroforestry systems that combine trees with crops for sustainability.',
    thumbnail: 'https://via.placeholder.com/400x300/065f46/ffffff?text=Agroforestry',
    duration: 65,
    difficulty: 'Advanced',
    rating: 4.9,
    students: 480,
    progress: 0,
    category: 'Sustainable Systems',
    isFeatured: true,
    instructor: 'Dr. Carlos Martinez',
    price: 80,
    tags: ['agroforestry', 'trees', 'sustainability', 'systems design']
  }
];
