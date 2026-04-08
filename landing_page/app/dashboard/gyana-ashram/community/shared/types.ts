// Community Hub Types
// Location: src/components/education/community/shared/types.ts

export interface CommunityUser {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  avatar?: string
  bio?: string
  location?: string
  reputation: number
  level: number
  badges: string[]
  isVerified: boolean
  isModerator: boolean
  isExpert: boolean
  createdAt: Date
  updatedAt: Date
  lastActive: Date
  
  // Farming specific
  farmName?: string
  farmSize?: 'Small' | 'Medium' | 'Large'
  farmType?: 'Organic' | 'Traditional' | 'Mixed'
  specialties?: string[]
  experience?: 'Beginner' | 'Intermediate' | 'Expert'
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color: string
  icon?: string
  order: number
  isActive: boolean
  questionCount?: number
}

export interface Question {
  id: string
  title: string
  content: string
  images: string[]
  tags: string[]
  isUrgent: boolean
  isPinned: boolean
  isSolved: boolean
  isAnonymous: boolean
  viewCount: number
  views?: number  // Database field name
  upvotes: number  // For backward compatibility
  downvotes: number  // For backward compatibility
  voteScore?: number  // For backward compatibility
  vote_count?: number  // Database field name
  createdAt: Date
  updatedAt: Date
  
  // Relations
  author: CommunityUser
  category: Category
  comments?: Comment[]
  commentCount?: number
  userVote?: VoteType | null
  
  // API response structure
  _count?: {
    votes: number
    comments: number
  }
}

export interface Comment {
  id: string
  content: string
  images: string[]
  upvotes: number
  downvotes: number
  isAnswer: boolean
  createdAt: Date
  updatedAt: Date
  
  // Relations
  author: CommunityUser
  question?: Question
  userVote?: VoteType | null
}

export interface Vote {
  id: string
  type: VoteType
  createdAt: Date
  userId: string
  questionId?: string
  commentId?: string
}

export interface Follow {
  id: string
  createdAt: Date
  followerId: string
  followingId: string
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  data?: any
  isRead: boolean
  createdAt: Date
  userId: string
}

export enum VoteType {
  UPVOTE = 'UPVOTE',
  DOWNVOTE = 'DOWNVOTE'
}

export enum NotificationType {
  NEW_COMMENT = 'NEW_COMMENT',
  QUESTION_SOLVED = 'QUESTION_SOLVED',
  VOTE_RECEIVED = 'VOTE_RECEIVED',
  FOLLOWER_NEW = 'FOLLOWER_NEW',
  MENTION = 'MENTION'
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
  pagination?: PaginationData
}

export interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// Form Types
export interface CreateQuestionData {
  title: string
  content: string
  categoryId: string
  tags: string[]
  images?: (File | string)[] // File objects or base64 strings
  isUrgent?: boolean
  isAnonymous?: boolean
  location?: string
}

export interface CreateCommentData {
  questionId: string
  content: string
  images?: File[]
}

export interface UpdateUserProfileData {
  name?: string
  bio?: string
  location?: string
  farmSize?: string
  farmType?: string
  cropSpecialty?: string[]
  experienceLevel?: string
}

// Filter Types
export interface QuestionFilters {
  category?: string
  tags?: string[]
  sortBy?: 'recent' | 'popular' | 'solved' | 'urgent'
  timeframe?: 'today' | 'week' | 'month' | 'all'
  search?: string
}

// Statistics Types
export interface CommunityStats {
  totalQuestions: number
  totalUsers: number
  questionsToday: number
  solvedQuestions: number
  activeUsers: number
  topCategories: Array<{
    category: Category
    count: number
  }>
}

export interface UserStats {
  questionsAsked: number
  questionsAnswered: number
  bestAnswers: number
  reputation: number
  level: number
  points: number
  followers: number
  following: number
}
