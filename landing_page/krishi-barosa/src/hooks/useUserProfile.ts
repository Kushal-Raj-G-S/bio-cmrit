import { useState, useEffect } from 'react'

interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  level: number
  points: number
  streak: number
  xpProgress: number
  profileCompletion: number
  trustScore: number
  role: string
  joinedDate: string
}

export const useUserProfile = (userId?: string) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserProfile = async (id?: string) => {
    try {
      setLoading(true)
      // If no ID provided, fetch current user (Rajesh)
      const url = id ? `/api/user/profile?userId=${id}` : '/api/user/profile'
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile')
      }
      
      const userData = await response.json()
      setUser(userData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const updateAvatar = async (id: string, avatarUrl: string) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: id,
          avatar: avatarUrl
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update avatar')
      }

      const updatedUser = await response.json()
      if (user) {
        setUser({
          ...user,
          avatar: updatedUser.avatar
        })
      }
      
      return updatedUser
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  useEffect(() => {
    // Always fetch profile - if userId is provided, use it, otherwise fetch current user
    fetchUserProfile(userId)
  }, [userId])

  return {
    user,
    loading,
    error,
    refetch: userId ? () => fetchUserProfile(userId) : () => {},
    updateAvatar: userId ? (avatarUrl: string) => updateAvatar(userId, avatarUrl) : () => Promise.reject('No user ID')
  }
}
