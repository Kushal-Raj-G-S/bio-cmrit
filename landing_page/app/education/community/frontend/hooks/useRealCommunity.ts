// Community Hub Real React Hooks - Production Ready
// Location: src/components/education/community/frontend/hooks/useRealCommunity.ts

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Question, Category, CommunityUser, Comment, CreateQuestionData, CreateCommentData, VoteType } from '../../shared/types'

// Function to get user headers from localStorage (simplified approach)
const getUserHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') return {}
  
  try {
    const savedUser = localStorage.getItem('graintrust-user')
    console.log('🔍 Getting user headers, saved user:', savedUser)
    
    if (savedUser) {
      const user = JSON.parse(savedUser)
      console.log('✅ Parsed user:', user)
      
      const headers = {
        'X-User-ID': user.id || 'guest',
        'X-User-Name': user.name || 'Anonymous User', 
        'X-User-Email': user.email || 'guest@graintrust.com'
      }
      
      console.log('📤 User headers:', headers)
      return headers
    }
  } catch (error) {
    console.error('❌ Error getting user headers:', error)
  }
  
  const defaultHeaders = {
    'X-User-ID': 'guest',
    'X-User-Name': 'Anonymous User',
    'X-User-Email': 'guest@graintrust.com'
  }
  
  console.log('📤 Default headers:', defaultHeaders)
  return defaultHeaders
}

// Real API client (simplified to avoid external dependencies for now)
class SimpleCommunityApi {
  private baseURL: string
  private token: string | null = null

  constructor() {
    // Use Next.js API routes instead of separate Express server
    this.baseURL = '/api/community'
    
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('community_token')
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...getUserHeaders(), // Add user headers from localStorage
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  setAuthToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('community_token', token)
    }
  }

  clearAuthToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('community_token')
      localStorage.removeItem('community_user')
    }
  }

  // Auth methods
  async login(email: string, password: string): Promise<{ user: CommunityUser; token: string }> {
    const result = await this.request<{ user: CommunityUser; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    
    this.setAuthToken(result.token)
    if (typeof window !== 'undefined') {
      localStorage.setItem('community_user', JSON.stringify(result.user))
    }
    
    return result
  }

  async register(userData: any): Promise<{ user: CommunityUser; token: string }> {
    const result = await this.request<{ user: CommunityUser; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
    
    this.setAuthToken(result.token)
    if (typeof window !== 'undefined') {
      localStorage.setItem('community_user', JSON.stringify(result.user))
    }
    
    return result
  }

  // API methods
  async getCategories(): Promise<Category[]> {
    const result = await this.request<{ categories: Category[] }>('/categories')
    return result.categories
  }

  async getQuestions(params: any = {}): Promise<{ questions: Question[]; pagination: any }> {
    // Filter out undefined values and create clean query params
    const cleanParams: Record<string, string> = {}
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanParams[key] = String(value)
      }
    })
    
    const queryParams = new URLSearchParams(cleanParams).toString()
    const url = queryParams ? `/questions?${queryParams}` : '/questions'
    const result = await this.request<{ questions: Question[] }>(url)
    return { questions: result.questions, pagination: null }
  }

  async createQuestion(data: CreateQuestionData, images?: File[]): Promise<Question> {
    // For now, skip image uploads (can be added later with Supabase Storage)
    // The API expects the question data directly and returns the question
    return this.request<Question>('/questions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getComments(questionId: string): Promise<Comment[]> {
    // Comments are included in the question detail fetch
    const result = await this.request<any>(`/questions/${questionId}`)
    return result.comments || []
  }

  async createComment(questionId: string, data: CreateCommentData): Promise<Comment> {
    return this.request<Comment>(`/questions/${questionId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async voteQuestion(questionId: string, type: VoteType): Promise<{ voteScore: number }> {
    const result = await this.request<{ message: string }>(`/questions/${questionId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    })
    // Return a placeholder since the API doesn't return vote score directly
    return { voteScore: 0 }
  }

  async healthCheck(): Promise<{ status: string }> {
    // Use stats endpoint as health check
    await this.request<any>('/stats')
    return { status: 'OK' }
  }

  isAuthenticated(): boolean {
    return !!this.token
  }

  getStoredUser(): CommunityUser | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('community_user')
      return userData ? JSON.parse(userData) : null
    }
    return null
  }
}

// Create singleton instance
const realApi = new SimpleCommunityApi()

// Community Auth Hook - rename to avoid conflicts  
export const useCommunityAuth = () => {
  const [user, setUser] = useState<CommunityUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is stored locally
    const storedUser = realApi.getStoredUser()
    if (storedUser && realApi.isAuthenticated()) {
      setUser(storedUser)
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { user } = await realApi.login(email, password)
      setUser(user)
      return user
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (userData: any) => {
    setLoading(true)
    setError(null)
    
    try {
      const { user } = await realApi.register(userData)
      setUser(user)
      return user
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    realApi.clearAuthToken()
    setUser(null)
  }, [])

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: realApi.isAuthenticated()
  }
}

// Connection Hook
export const useConnection = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(true) // Default to true since we're using Next.js API routes
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Skip health check - we're using Next.js API routes which are always available
    setIsConnected(true)
    setLoading(false)
  }, [])

  const testConnection = useCallback(async () => {
    setLoading(true)
    try {
      await realApi.healthCheck()
      setIsConnected(true)
      return true
    } catch (error) {
      setIsConnected(false)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    isConnected,
    loading,
    testConnection
  }
}

// Categories Hook
export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await realApi.getCategories()
      setCategories(Array.isArray(result) ? result : [])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch categories'
      setError(errorMessage)
      console.error('Categories fetch error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  }
}

// Questions Hook
export const useQuestions = (filters?: { category?: string; tag?: string; search?: string; filter?: string; sort?: string }) => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<any>(null)

  const fetchQuestions = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await realApi.getQuestions(filters)
      setQuestions(Array.isArray(result.questions) ? result.questions : [])
      setPagination(result.pagination)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch questions'
      setError(errorMessage)
      console.error('Questions fetch error:', error)
    } finally {
      setLoading(false)
    }
  }, [filters?.category, filters?.tag, filters?.search, filters?.filter, filters?.sort])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  const createQuestion = useCallback(async (data: CreateQuestionData, images?: File[]) => {
    try {
      const newQuestion = await realApi.createQuestion(data, images)
      setQuestions(prev => [newQuestion, ...(prev || [])])
      return newQuestion
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create question'
      setError(errorMessage)
      throw error
    }
  }, [])

  const voteQuestion = useCallback(async (questionId: string, type: VoteType) => {
    try {
      const result = await realApi.voteQuestion(questionId, type)
      
      // Update local state
      setQuestions(prev => (prev || []).map(q => 
        q.id === questionId 
          ? { ...q, voteScore: result.voteScore }
          : q
      ))
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to vote'
      setError(errorMessage)
      throw error
    }
  }, [])

  return {
    questions,
    loading,
    error,
    pagination,
    createQuestion,
    voteQuestion,
    refetch: fetchQuestions
  }
}

// Comments Hook
export const useComments = (questionId: string) => {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    if (!questionId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await realApi.getComments(questionId)
      setComments(Array.isArray(result) ? result : [])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch comments'
      setError(errorMessage)
      console.error('Comments fetch error:', error)
    } finally {
      setLoading(false)
    }
  }, [questionId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const createComment = useCallback(async (data: CreateCommentData) => {
    try {
      const newComment = await realApi.createComment(questionId, data)
      setComments(prev => [...(prev || []), newComment])
      return newComment
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create comment'
      setError(errorMessage)
      throw error
    }
  }, [questionId])

  return {
    comments,
    loading,
    error,
    createComment,
    refetch: fetchComments
  }
}

// Main Community Hook (combines everything)
export const useCommunity = (filters?: { category?: string; tag?: string; search?: string; filter?: string; sort?: string }) => {
  const auth = useCommunityAuth()
  const connection = useConnection()
  const categories = useCategories()
  const questions = useQuestions(filters)

  return {
    // Auth
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    login: auth.login,
    register: auth.register,
    logout: auth.logout,
    
    // Connection
    isConnected: connection.isConnected,
    testConnection: connection.testConnection,
    
    // Data
    categories: categories.categories || [],
    questions: questions.questions || [],
    
    // Actions
    createQuestion: questions.createQuestion,
    voteQuestion: questions.voteQuestion,
    
    // Loading states
    loading: auth.loading || connection.loading || categories.loading || questions.loading,
    error: auth.error || categories.error || questions.error,
    
    // Refetch methods
    refetch: () => {
      categories.refetch()
      questions.refetch()
    }
  }
}
