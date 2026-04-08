import { User } from '@/types'

// Password validation utility
export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' }
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase and one lowercase letter' }
  }
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' }
  }
  return { isValid: true }
}

// Email validation utility
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Phone number validation (Indian format)
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

// Generate user avatar placeholder
export const generateAvatar = (name: string): string => {
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=22c55e&color=fff&size=128`
}

// Role-based permissions
export const getUserPermissions = (role: User['role']) => {
  const permissions = {
    farmer: {
      canCreateBatch: true,
      canViewBatch: true,
      canGenerateQR: true,
      canAccessFarmerDashboard: true,
      canAccessManufacturerDashboard: false,
      canAccessConsumerDashboard: false,
      canAccessAdminDashboard: false,
      canReportFraud: true,
      canScanQR: true,
      canManageUsers: false,
      canViewAnalytics: false,
    },
    manufacturer: {
      canCreateBatch: true,
      canViewBatch: true,
      canGenerateQR: true,
      canAccessFarmerDashboard: false,
      canAccessManufacturerDashboard: true,
      canAccessConsumerDashboard: false,
      canAccessAdminDashboard: false,
      canReportFraud: true,
      canScanQR: true,
      canManageUsers: false,
      canViewAnalytics: false,
    },
    consumer: {
      canCreateBatch: false,
      canViewBatch: false,
      canGenerateQR: false,
      canAccessFarmerDashboard: false,
      canAccessManufacturerDashboard: false,
      canAccessConsumerDashboard: true,
      canAccessAdminDashboard: false,
      canReportFraud: true,
      canScanQR: true,
      canManageUsers: false,
      canViewAnalytics: false,
    },
    admin: {
      canCreateBatch: true,
      canViewBatch: true,
      canGenerateQR: true,
      canAccessFarmerDashboard: true,
      canAccessManufacturerDashboard: true,
      canAccessConsumerDashboard: true,
      canAccessAdminDashboard: true,
      canReportFraud: true,
      canScanQR: true,
      canManageUsers: true,
      canViewAnalytics: true,
    },
  }
  
  return permissions[role]
}

// Check if user can access a specific route
export const canAccessRoute = (user: User | null, route: string): boolean => {
  if (!user) return false
  
  const permissions = getUserPermissions(user.role)
  
  switch (route) {
    case '/farmer':
      return permissions.canAccessFarmerDashboard
    case '/manufacturer':
      return permissions.canAccessManufacturerDashboard
    case '/consumer':
      return permissions.canAccessConsumerDashboard
    case '/admin':
      return permissions.canAccessAdminDashboard
    default:
      return true
  }
}

// Format user display name
export const formatUserName = (user: User): string => {
  if (user.name) return user.name
  return user.email.split('@')[0]
}

// Get role display name
export const getRoleDisplayName = (role: User['role']): string => {
  const roleNames = {
    farmer: 'Farmer',
    manufacturer: 'Manufacturer',
    consumer: 'Consumer',
    admin: 'Administrator'
  }
  return roleNames[role]
}

// Get role color for badges
export const getRoleColor = (role: User['role']): string => {
  const roleColors = {
    farmer: 'bg-green-100 text-green-800',
    manufacturer: 'bg-blue-100 text-blue-800',
    consumer: 'bg-purple-100 text-purple-800',
    admin: 'bg-red-100 text-red-800'
  }
  return roleColors[role]
}

// Generate secure random ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

// Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Check if onboarding is required
export const requiresOnboarding = (user: User): boolean => {
  return !user.onboardingComplete || !user.isVerified
}

// Session management
export const getSessionExpiry = (): number => {
  // 7 days in milliseconds
  return Date.now() + (7 * 24 * 60 * 60 * 1000)
}

export const isSessionExpired = (timestamp: number): boolean => {
  return Date.now() > timestamp
}

// Sanitize user input
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '')
}

// Generate verification code
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}