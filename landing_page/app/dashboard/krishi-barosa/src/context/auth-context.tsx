'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { toast } from 'sonner'

// Types
export interface User {
  id: string
  email: string
  name: string
  role: 'FARMER' | 'MANUFACTURER' | 'CONSUMER' | 'ADMIN'
  avatar?: string
  profilePicture?: string
  phone?: string
  bio?: string
  organization?: string
  location?: string
  state?: string
  country?: string
  specialization?: string
  experience?: string
  farmSize?: string
  organizationType?: string
  isVerified: boolean
  onboardingComplete: boolean
  lastLogin?: string | Date
  createdAt: string | Date
  updatedAt?: string | Date
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (userData: SignUpData) => Promise<{ success: boolean; error?: string }>
  signOut: () => void
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>
  completeOnboarding: (profileData: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
}

export interface SignUpData {
  email: string
  password: string
  name: string
  role: 'FARMER' | 'MANUFACTURER' | 'CONSUMER' | 'ADMIN'
  phone?: string
  organization?: string
}

// Demo users for testing
const DEMO_USERS: User[] = [
  {
    id: '1',
    email: 'farmer@demo.com',
    name: 'Rajesh Kumar',
    role: 'FARMER',
    avatar: '/api/placeholder/40/40',
    phone: '+91-9876543210',
    bio: 'Organic farmer with 15 years of experience in sustainable agriculture.',
    organization: 'Kumar Family Farm',
    location: 'Ludhiana',
    state: 'Punjab',
    country: 'India',
    farmSize: 'medium',
    specialization: 'Organic farming, Rice, Wheat',
    experience: '11-20',
    isVerified: true,
    onboardingComplete: true,
    createdAt: '2024-01-15T10:00:00Z',
    lastLogin: new Date().toISOString()
  },
  {
    id: '2',
    email: 'manufacturer@demo.com',
    name: 'Priya Sharma',
    role: 'MANUFACTURER',
    avatar: '/api/placeholder/40/40',
    phone: '+91-9876543211',
    bio: 'Leading manufacturer of premium seeds and organic pesticides.',
    organization: 'AgroTech Solutions Pvt Ltd',
    location: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    organizationType: 'corporation',
    specialization: 'Seeds, Pesticides, Fertilizers',
    experience: '20+',
    isVerified: true,
    onboardingComplete: true,
    createdAt: '2024-01-10T10:00:00Z',
    lastLogin: new Date().toISOString()
  },
  {
    id: '3',
    email: 'consumer@demo.com',
    name: 'Amit Patel',
    role: 'CONSUMER',
    avatar: '/api/placeholder/40/40',
    phone: '+91-9876543212',
    bio: 'Health-conscious consumer passionate about organic and authentic food products.',
    organization: 'Health-Conscious Consumer',
    location: 'Delhi',
    state: 'Delhi',
    country: 'India',
    specialization: 'Organic food verification',
    experience: '3-5',
    isVerified: true,
    onboardingComplete: true,
    createdAt: '2024-01-20T10:00:00Z',
    lastLogin: new Date().toISOString()
  },
  {
    id: '4',
    email: 'admin@krishibarosa.com',
    name: 'Kushal Raj G S',
    role: 'ADMIN',
    avatar: '/api/placeholder/40/40',
    phone: '+91-9876543213',
    bio: 'Platform administrator with expertise in agricultural technology and supply chain management.',
    organization: 'KrishiBarosa Platform',
    location: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    organizationType: 'government',
    specialization: 'Platform management, Analytics',
    experience: '20+',
    isVerified: true,
    onboardingComplete: true,
    createdAt: '2024-01-05T10:00:00Z',
    lastLogin: new Date().toISOString()
  }
]

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Auth Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const savedUser = localStorage.getItem('krishibarosa-user')
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser)
          // Normalize role to uppercase
          if (parsedUser.role) {
            parsedUser.role = parsedUser.role.toUpperCase()
          }
          setUser(parsedUser)
        } else {
          // Integration copy fallback: auto-login farmer demo user for immediate dashboard access.
          const demoFarmer = DEMO_USERS.find((u) => u.role === 'FARMER') || DEMO_USERS[0]
          setUser(demoFarmer)
          localStorage.setItem('krishibarosa-user', JSON.stringify(demoFarmer))
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        localStorage.removeItem('krishibarosa-user')
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Save user to localStorage whenever user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('krishibarosa-user', JSON.stringify(user))
    } else {
      localStorage.removeItem('graintrust-user')
    }
  }, [user])

  // Sign in function
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        const userWithProfile = {
          ...data.user,
          role: data.user.role.toUpperCase(),
          onboardingComplete: true,
          profile: {
            phone: data.user.phone,
            location: data.user.location,
            organization: data.user.organization,
            farmSize: data.user.specialization,
          }
        }
        setUser(userWithProfile)
        toast.success(`Welcome back, ${data.user.name}!`)
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Sign in failed' }
      }
    } catch (error) {
      console.error('Sign in error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    } finally {
      setIsLoading(false)
    }
  }

  // Sign up function
  const signUp = async (userData: SignUpData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          name: userData.name,
          password: userData.password,
          role: userData.role.toUpperCase(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        const userWithProfile = {
          ...data.user,
          role: data.user.role.toUpperCase(),
          onboardingComplete: false,
          profile: {
            phone: userData.phone,
            organization: userData.organization,
          }
        }
        setUser(userWithProfile)
        toast.success('Account created successfully!')
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Sign up failed' }
      }
    } catch (error) {
      console.error('Sign up error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    } finally {
      setIsLoading(false)
    }
  }

  // Sign out function
  const signOut = () => {
    setUser(null)
    localStorage.removeItem('krishibarosa-user')
    toast.success('Signed out successfully')
  }

  // Update profile function
  const updateProfile = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No user logged in' }
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          ...updates
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      setUser(data.user)
      localStorage.setItem('krishibarosa-user', JSON.stringify(data.user))
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile'
      return { success: false, error: errorMessage }
    }
  }

  // Complete onboarding function
  const completeOnboarding = async (profileData: Record<string, unknown>): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No user logged in' }
    
    try {
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          ...profileData
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete onboarding')
      }

      setUser(data.user)
      localStorage.setItem('krishibarosa-user', JSON.stringify(data.user))
      toast.success('Onboarding completed successfully!')
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete onboarding'
      return { success: false, error: errorMessage }
    }
  }

  // Reset password function
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check if email exists
      const userExists = DEMO_USERS.some(u => u.email === email) || email.includes('@')
      if (userExists) {
        toast.success('Password reset email sent!')
        return { success: true }
      }
      
      return { success: false, error: 'Email not found' }
    } catch {
      return { success: false, error: 'Failed to send reset email' }
    }
  }

  // Change password function
  const changePassword = async (oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No user logged in' }
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // For demo purposes, just check if passwords are valid
      if (oldPassword.length < 6 || newPassword.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' }
      }
      
      toast.success('Password changed successfully!')
      return { success: true }
    } catch {
      return { success: false, error: 'Failed to change password' }
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    updateProfile,
    completeOnboarding,
    resetPassword,
    changePassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}