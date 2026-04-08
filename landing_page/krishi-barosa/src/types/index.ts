// User Types
export interface User {
  id: string
  email: string
  name: string
  role: 'farmer' | 'manufacturer' | 'consumer' | 'admin'
  avatar?: string
  isVerified: boolean
  onboardingComplete: boolean
  createdAt: string
  lastLogin?: string
  profile?: UserProfile
}

export interface UserProfile {
  phone?: string
  location?: string
  organization?: string
  farmSize?: string
  cropTypes?: string[]
  licenseNumber?: string
  certifications?: string[]
  bio?: string
  website?: string
  socialLinks?: {
    linkedin?: string
    twitter?: string
    facebook?: string
  }
}

// Authentication Types
export interface SignUpData {
  email: string
  password: string
  name: string
  role: 'farmer' | 'manufacturer' | 'consumer' | 'admin'
  phone?: string
  organization?: string
}

export interface SignInData {
  email: string
  password: string
}

// Batch Types
export interface Batch {
  id: string
  batchNumber: string
  productName: string
  productType: 'crop' | 'seed' | 'pesticide' | 'fertilizer'
  quantity: number
  unit: string
  createdBy: string
  createdAt: string
  expiryDate?: string
  status: 'active' | 'expired' | 'recalled' | 'verified'
  qrCode: string
  location?: string
  farmDetails?: FarmDetails
  manufacturerDetails?: ManufacturerDetails
  labResults?: LabResult[]
  timeline: TimelineEvent[]
}

export interface FarmDetails {
  farmName: string
  farmSize: string
  soilType: string
  irrigationType: string
  sowingDate: string
  harvestDate?: string
  pesticidesUsed?: string[]
  fertilizersUsed?: string[]
  organicCertified: boolean
  coordinates?: {
    latitude: number
    longitude: number
  }
}

export interface ManufacturerDetails {
  companyName: string
  licenseNumber: string
  manufacturingDate: string
  batchSize: number
  ingredients: string[]
  qualityGrade: string
  storageConditions: string
  certifications: string[]
}

export interface LabResult {
  id: string
  testType: string
  testDate: string
  result: 'pass' | 'fail' | 'pending'
  parameters: {
    [key: string]: {
      value: number | string
      unit: string
      status: 'pass' | 'fail' | 'warning'
    }
  }
  labName: string
  certificateUrl?: string
}

export interface TimelineEvent {
  id: string
  title: string
  description: string
  date: string
  type: 'created' | 'processed' | 'tested' | 'shipped' | 'delivered' | 'scanned'
  location?: string
  userId?: string
  userName?: string
}

// QR Code Types
export interface QRCodeData {
  batchId: string
  productName: string
  productType: string
  createdBy: string
  createdAt: string
  verificationUrl: string
}

export interface QRScanResult {
  isValid: boolean
  batch?: Batch
  message: string
  scannedAt: string
  scannedBy?: string
  location?: string
}

// Verification Types
export interface VerificationResult {
  isAuthentic: boolean
  batch: Batch
  confidence: number
  warnings: string[]
  recommendations: string[]
  lastVerified: string
  verificationCount: number
}

// Fraud Types
export interface FraudReport {
  id: string
  reportedBy: string
  reporterName: string
  reporterEmail: string
  batchId: string
  productName: string
  reportType: 'counterfeit' | 'expired' | 'contaminated' | 'mislabeled' | 'other'
  description: string
  evidence?: string[]
  location?: string
  reportedAt: string
  status: 'pending' | 'investigating' | 'verified' | 'dismissed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignedTo?: string
  resolution?: string
  resolvedAt?: string
}

export interface FraudAlert {
  id: string
  batchId: string
  productName: string
  alertType: 'recalled' | 'counterfeit' | 'expired' | 'contaminated'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  createdAt: string
  affectedRegions: string[]
  actionRequired: string
  contactInfo: string
}

// Analytics Types
export interface AnalyticsData {
  totalScans: number
  totalBatches: number
  totalFraudReports: number
  totalUsers: number
  scanTrends: {
    date: string
    count: number
  }[]
  fraudTrends: {
    date: string
    count: number
  }[]
  userGrowth: {
    date: string
    count: number
  }[]
  topProducts: {
    name: string
    scanCount: number
  }[]
  regionData: {
    region: string
    scanCount: number
    fraudCount: number
  }[]
}

// Language Types
export interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
}

// Notification Types
export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
  actionUrl?: string
  actionText?: string
}

// Form Types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'file' | 'checkbox' | 'radio'
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

// API Response Types
export interface APIResponse<T = Record<string, unknown>> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: { [key: string]: string }
}

// Dashboard Types
export interface DashboardStats {
  totalBatches: number
  activeBatches: number
  expiredBatches: number
  scannedBatches: number
  fraudReports: number
  verificationRate: number
  recentActivity: TimelineEvent[]
}

// Education Types
export interface EducationContent {
  id: string
  title: string
  description: string
  type: 'article' | 'video' | 'infographic' | 'quiz'
  category: 'safety' | 'identification' | 'reporting' | 'technology'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number // in minutes
  content: string
  mediaUrl?: string
  quiz?: QuizQuestion[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

// Export all types
export type UserRole = User['role']
export type BatchStatus = Batch['status']
export type ProductType = Batch['productType']
export type ReportType = FraudReport['reportType']
export type Priority = FraudReport['priority']
export type AlertType = FraudAlert['alertType']
export type Severity = FraudAlert['severity']
export type NotificationType = Notification['type']