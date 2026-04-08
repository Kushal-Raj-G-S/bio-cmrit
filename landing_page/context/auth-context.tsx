"use client"

// Auth context for education platform  
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: any
  isAuthenticated: boolean
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const buildFallbackUser = (id: string) => ({
      id,
      name: 'User',
      email: '',
      phone: '',
      profile: null,
    })

    const checkAuth = async () => {
      try {
        setIsLoading(true)

        // Check password-auth FIRST (instant, no network call needed to decide)
        const passwordUserId = typeof window !== 'undefined' ? localStorage.getItem('biobloom_password_user_id') : null
        const isPasswordAuth = typeof window !== 'undefined' ? localStorage.getItem('biobloom_password_auth') === 'true' : false

        if (passwordUserId && isPasswordAuth) {
          // Password-login user — load profile via server API (bypasses RLS)
          try {
            const res = await fetch(`/api/user-data?userId=${passwordUserId}&table=profiles`)
            if (res.ok) {
              const { data: profile } = await res.json()
              if (profile) {
                setUser({ id: passwordUserId, name: profile.full_name || 'User', email: profile.email || '', phone: profile.phone, profile })
                setIsAuthenticated(true)
              } else {
                // Keep user logged in for this session even if profile row is temporarily unavailable.
                setUser(buildFallbackUser(passwordUserId))
                setIsAuthenticated(true)
              }
            } else {
              // Fail-open for transient API issues to avoid random /auth redirects.
              setUser(buildFallbackUser(passwordUserId))
              setIsAuthenticated(true)
            }
          } catch {
            // Network hiccup: keep local password-auth session active.
            setUser(buildFallbackUser(passwordUserId))
            setIsAuthenticated(true)
          }
          return // Done — no need to check Supabase session
        }

        // OTP/Supabase session user — check with timeout to avoid hanging
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          new Promise<{ data: { session: null } }>((resolve) => setTimeout(() => resolve({ data: { session: null } }), 4000))
        ])
        const { data: { session } } = sessionResult

        if (session?.user) {
          // Use cached profile if fresh (< 5 min)
          const cachedRaw = typeof window !== 'undefined' ? localStorage.getItem('biobloom_user_cache') : null
          let profile = null
          if (cachedRaw) {
            const cached = JSON.parse(cachedRaw)
            if (cached.id === session.user.id && cached.cachedAt > Date.now() - 300000) {
              profile = cached.profile
            }
          }
          if (!profile) {
            try {
              const { data: freshProfile } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle()
              profile = freshProfile
              if (profile && typeof window !== 'undefined') {
                localStorage.setItem('biobloom_user_cache', JSON.stringify({ id: session.user.id, profile, cachedAt: Date.now() }))
              }
            } catch {
              // If profile lookup fails, continue with auth session data.
            }
          }
          if (profile) {
            setUser({ id: session.user.id, name: profile.full_name || 'User', email: profile.email || session.user.email, phone: profile.phone, profile })
            setIsAuthenticated(true)
          } else {
            // Keep valid session authenticated even if profile row doesn't exist yet.
            setUser({ id: session.user.id, name: 'User', email: session.user.email || '', phone: session.user.phone || '', profile: null })
            setIsAuthenticated(true)
          }
        } else {
          setUser(null)
          setIsAuthenticated(false)
          if (typeof window !== 'undefined') {
            localStorage.removeItem('biobloom_user_cache')
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        let profile: any = null
        try {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle()
          profile = data
        } catch {
          // Keep auth active even if profile lookup fails.
        }

        const userData = {
          id: session.user.id,
          name: profile?.full_name || 'User',
          email: profile?.email || session.user.email,
          phone: profile?.phone || session.user.phone || '',
          profile: profile || null
        }
        setUser(userData)
        setIsAuthenticated(true)
        
        // Store user for community features
        if (typeof window !== 'undefined') {
          localStorage.setItem('community_user', JSON.stringify({
            id: session.user.id,
            email: userData.email,
            username: userData.email?.split('@')[0] || 'user',
            firstName: profile?.full_name?.split(' ')[0] || 'User',
            lastName: profile?.full_name?.split(' ').slice(1).join(' ') || '',
            avatar: profile?.avatar_url || null,
            reputation: 0,
            level: 1,
            badges: [],
            isVerified: false,
            isModerator: false,
            isExpert: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastActive: new Date()
          }))
        }
      } else {
        // Only reset auth if NOT using password-auth mode
        const isPasswordAuth = typeof window !== 'undefined' && localStorage.getItem('biobloom_password_auth') === 'true'
        if (!isPasswordAuth) {
          setUser(null)
          setIsAuthenticated(false)
          if (typeof window !== 'undefined') {
            localStorage.removeItem('community_user')
          }
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}