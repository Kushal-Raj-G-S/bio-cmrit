"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the current user
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('Error getting user:', error)
          router.push('/auth')
          return
        }

        if (!user) {
          router.push('/auth')
          return
        }

        // Fetch profile from database
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('onboarding_complete')
          .eq('id', user.id)
          .maybeSingle()

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError)
        }

        // If profile doesn't exist or onboarding not complete, go to onboarding
        if (!profile || !profile.onboarding_complete) {
          router.push('/onboarding')
          return
        }

        // Onboarding complete, go to dashboard
        router.push('/dashboard')
      } catch (error) {
        console.error('Callback error:', error)
        router.push('/auth')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}
