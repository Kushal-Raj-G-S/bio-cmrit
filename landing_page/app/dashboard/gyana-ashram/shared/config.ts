// Education Platform Configuration
import { placeholderImages } from './placeholder-images';

export const educationConfig = {
  // Image placeholders
  placeholders: placeholderImages,

  // Development settings
  development: {
    suppressConsoleWarnings: process.env.NODE_ENV === 'development',
    enableDebugLogs: false,
    mockData: true,
  },

  // Feature flags
  features: {
    offlineSupport: true,
    multiLanguage: true,
    videoPlayer: true,
    community: true,
    learningPaths: true,
    mobileCompanion: true,
  },

  // Default content
  defaultContent: {
    languages: ['English', 'Hindi', 'Kannada'],
    categories: ['Quality Control', 'Storage', 'Pest Management', 'Technology', 'Sustainability'],
    videoFormats: ['mp4', 'webm'],
    supportedRegions: ['India', 'Karnataka', 'Punjab', 'Gujarat', 'West Bengal', 'Haryana'],
  }
}

// Utility functions
export const getPlaceholderImage = (type: 'avatar' | 'course' | 'video', data?: string) => {
  switch (type) {
    case 'avatar':
      return educationConfig.placeholders.userAvatar(data || 'U')
    case 'course':
      return educationConfig.placeholders.courseImage(data || 'Course')
    case 'video':
      return educationConfig.placeholders.videoThumbnail()
    default:
      return educationConfig.placeholders.courseImage('Content')
  }
}

// Error handling utilities
export const handleApiError = (error: any, context: string) => {
  if (educationConfig.development.enableDebugLogs) {
    console.warn(`${context} error:`, error)
  }
  
  // Return user-friendly error message
  return {
    message: 'Something went wrong. Please try again.',
    canRetry: true,
    shouldReload: false,
  }
}

// Mock data checker
export const isMockDataEnabled = () => {
  return educationConfig.development.mockData
}
