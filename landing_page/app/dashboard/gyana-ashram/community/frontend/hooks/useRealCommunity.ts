// Community Hub Real React Hooks - Production Ready
// Location: src/components/education/community/frontend/hooks/useRealCommunity.ts

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Question, Category, CommunityUser, Comment, CreateQuestionData, CreateCommentData, VoteType } from '../../shared/types'

// Get current authenticated user from localStorage
const getAuthUser = () => {
  if (typeof window === 'undefined') return null
  
  const userStr = localStorage.getItem('community_user')
  if (userStr) {
    try {
      return JSON.parse(userStr)
    } catch (e) {
      return null
    }
  }
  return null
}

// Function to get user headers from auth context
const getUserHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') return {}
  
  const user = getAuthUser()
  if (!user) return {}
  
  const headers = {
    'X-User-ID': user.id,
    'X-User-Name': user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username,
    'X-User-Email': user.email
  }
  
  return headers
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
    const result = await this.request<Category[]>('/categories')
    // Handle both array and object responses
    const categories = Array.isArray(result) ? result : (result as any).categories || []
    console.log('📂 Categories received:', categories.length)
    return categories
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
    const result = await this.request<Question[]>(url)
    
    // Handle both array and object responses
    const questions = Array.isArray(result) ? result : (result as any).questions || []
    console.log('📦 Questions received:', questions.length)
    
    return { questions, pagination: null }
  }

  async createQuestion(data: CreateQuestionData, images?: File[]): Promise<Question> {
    console.log('🚀 Creating question with data:', data)
    
    const user = this.getStoredUser()
    if (!user) throw new Error('User not authenticated')
    
    const questionData = {
      title: data.title,
      content: data.content,
      categoryId: data.categoryId,
      tags: data.tags || [],
      authorId: user.id
    }
    
    console.log('📤 Sending to API:', questionData)
    
    // For now, skip image uploads (can be added later with Supabase Storage)
    const result = await this.request<Question>('/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    })
    
    console.log('✅ Question created:', result)
    return result
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

  async voteQuestion(questionId: string, type: VoteType): Promise<{ success: boolean; newVoteCount: number; userVote: string | null }> {
    const user = this.getStoredUser()
    if (!user) {
      console.error('❌ Vote failed: User not authenticated')
      throw new Error('User not authenticated')
    }
    
    console.log('🗳️ Voting:', { userId: user.id, questionId, voteType: type === VoteType.UPVOTE ? 'up' : 'down' })
    
    const result = await this.request<{ success: boolean; newVoteCount: number; userVote: string | null }>('/votes', {
      method: 'POST',
      body: JSON.stringify({ 
        userId: user.id,
        questionId,
        voteType: type === VoteType.UPVOTE ? 'up' : 'down'
      }),
    })
    
    console.log('✅ Vote result:', result)
    return result
  }

  async trackView(questionId: string): Promise<{ success: boolean; views: number }> {
    const user = this.getStoredUser()
    const result = await this.request<{ success: boolean; views: number }>('/views', {
      method: 'POST',
      body: JSON.stringify({ 
        questionId,
        userId: user?.id
      }),
    })
    return result
  }

  async healthCheck(): Promise<{ status: string }> {
    // Use stats endpoint as health check
    await this.request<any>('/stats')
    return { status: 'OK' }
  }

  isAuthenticated(): boolean {
    return getAuthUser() !== null
  }

  getStoredUser(): CommunityUser | null {
    const user = getAuthUser()
    return user
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
      
      // Update local state with new vote count
      setQuestions(prev => (prev || []).map(q => 
        q.id === questionId 
          ? { 
              ...q, 
              vote_count: result.newVoteCount,
              voteScore: result.newVoteCount,
              userVote: result.userVote === 'up' ? VoteType.UPVOTE : result.userVote === 'down' ? VoteType.DOWNVOTE : null
            }
          : q
      ))
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to vote'
      setError(errorMessage)
      throw error
    }
  }, [])

  const trackView = useCallback(async (questionId: string) => {
    try {
      const result = await realApi.trackView(questionId)
      
      // Update local state with new view count
      setQuestions(prev => (prev || []).map(q => 
        q.id === questionId 
          ? { ...q, views: result.views, viewCount: result.views }
          : q
      ))
      
      return result
    } catch (error) {
      console.error('View tracking error:', error)
      // Don't throw - view tracking is non-critical
    }
  }, [])

  return {
    questions,
    loading,
    error,
    trackView,
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
    trackView: questions.trackView,
    
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
