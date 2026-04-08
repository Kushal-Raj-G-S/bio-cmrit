"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { 
  User,
  Sprout,
  MapPin,
  ArrowLeft,
  Upload,
  LogOut,
  ChevronDown
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserProfile {
  id?: string
  full_name?: string
  email?: string
  phone?: string
  phone_verified?: boolean
  bio?: string
  farm_name?: string
  farm_size?: string
  experience?: string
  primary_crops?: string
  city?: string
  district?: string
  state?: string
  pincode?: string
  onboarding_complete?: boolean
  onboarding_step?: number
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ profile: UserProfile | null } | null>(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      // Check password-auth first (no Supabase session for these users)
      if (typeof window !== 'undefined') {
        const passwordUserId = localStorage.getItem('biobloom_password_user_id')
        const passwordAuth = localStorage.getItem('biobloom_password_auth')
        if (passwordUserId && passwordAuth === 'true') {
          // Use server-side API — bypasses RLS, no hanging
          const res = await fetch(`/api/user-data?userId=${passwordUserId}&table=profiles`)
          const { data: profile } = await res.json()
          setUser({ profile: profile || null })
          setLoading(false)
          return
        }
      }

      // Check for real Supabase session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // Real user is authenticated - clear any dev session and use real profile
        localStorage.removeItem('dev_session')
        
        const res = await fetch(`/api/user-data?userId=${session.user.id}&table=profiles`)
        const { data: profile } = await res.json()

        if (profile) {
          if (!profile.onboarding_complete) {
            router.push('/onboarding')
            return
          }
          setUser({ profile })
        } else {
          setUser({ profile: null })
        }
        setLoading(false)
        return
      }

      // No real session - check for dev session only as fallback
      const devSession = localStorage.getItem('dev_session')
      if (devSession) {
        try {
          const devUser = JSON.parse(devSession)
          // Only use dev session if it's the actual dev number
          if (devUser.phone === '+919876543210') {
            setUser({ profile: devUser.profile })
            setLoading(false)
            return
          } else {
            // Remove invalid dev session
            localStorage.removeItem('dev_session')
          }
        } catch (e) {
          localStorage.removeItem('dev_session')
        }
      }

      // No valid session found
      console.log('No session found in settings')
      router.push('/auth')
    } catch (error) {
      console.error('Error in checkUser:', error)
      router.push('/auth')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    // Clear dev session if exists
    localStorage.removeItem('dev_session')
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header - Same as Dashboard */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 animate-in slide-in-from-top-2 duration-300">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-3 group transition-all duration-200 hover:scale-105">
            <div className="relative w-10 h-10 overflow-hidden rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-200">
              <Image
                src="/main.png"
                alt="BioBloom Logo"
                fill
                className="object-cover transition-transform duration-200 group-hover:scale-110"
              />
            </div>
            <span className="font-heading font-bold text-xl text-gray-900 group-hover:text-green-600 transition-colors duration-200">BioBloom</span>
            <Badge variant="secondary" className="ml-2 text-xs bg-green-100 text-green-800 group-hover:bg-green-200 transition-colors duration-200">
              For Indian Farmers
            </Badge>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <button onClick={() => router.push('/dashboard/krishichakra')} className="px-4 py-2 text-gray-800 hover:text-white hover:bg-gradient-to-r hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold rounded-lg">
              KrishiChakra
            </button>
            <button onClick={() => router.push('/dashboard')} className="px-4 py-2 text-gray-800 hover:text-white hover:bg-gradient-to-r hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold rounded-lg">
              KrishiUddhar
            </button>
            <button onClick={() => router.push('/dashboard')} className="px-4 py-2 text-gray-800 hover:text-white hover:bg-gradient-to-r hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold rounded-lg">
              KrishiAusadh
            </button>
            <button onClick={() => router.push('/dashboard')} className="px-4 py-2 text-gray-800 hover:text-white hover:bg-gradient-to-r hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold rounded-lg">
              PashudhanSakhi
            </button>
            <button onClick={() => router.push('/dashboard')} className="px-4 py-2 text-gray-800 hover:text-white hover:bg-gradient-to-r hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold rounded-lg">
              KrishiBaros
            </button>
            <button onClick={() => router.push('/dashboard')} className="px-4 py-2 text-gray-800 hover:text-white hover:bg-gradient-to-r hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold rounded-lg">
              GyanaAshram
            </button>
          </nav>

          <div className="flex items-center gap-4">
            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-green-50 transition-all duration-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-2">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium">{user?.profile?.full_name?.split(' ')[0] || 'User'}</span>
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 animate-in zoom-in-95 duration-150">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard/settings')} className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard')}
          className="mb-6 hover:bg-green-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Settings Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-8">
              <h1 className="text-3xl font-bold">Profile Settings</h1>
              <p className="text-green-50 mt-2">Manage your account information and preferences</p>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Profile Photo Section */}
              <div className="flex flex-col items-center gap-4 pb-8 border-b">
                <div className="relative w-32 h-32 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-xl">
                  <User className="w-16 h-16 text-white" />
                </div>
                <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Profile Photo
                </Button>
              </div>

              {/* User Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-green-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Full Name</p>
                    <p className="font-medium text-gray-900">{user?.profile?.full_name || 'Not set'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="font-medium text-gray-900">{user?.profile?.email || 'Not set'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <p className="font-medium text-gray-900">{user?.profile?.phone || 'Not set'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Phone Verified</p>
                    <p className="font-medium text-gray-900">{user?.profile?.phone_verified ? '✅ Verified' : '❌ Not Verified'}</p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {user?.profile?.bio && (
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">Bio</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900">{user.profile.bio}</p>
                  </div>
                </div>
              )}

              {/* Farm Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-green-600" />
                  Farm Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Farm Name</p>
                    <p className="font-medium text-gray-900">{user?.profile?.farm_name || 'Not set'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Farm Size</p>
                    <p className="font-medium text-gray-900">{user?.profile?.farm_size || 'Not set'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Experience</p>
                    <p className="font-medium text-gray-900">{user?.profile?.experience || 'Not set'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Primary Crops</p>
                    <p className="font-medium text-gray-900">{user?.profile?.primary_crops || 'Not set'}</p>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Location
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">City</p>
                    <p className="font-medium text-gray-900">{user?.profile?.city || 'Not set'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">District</p>
                    <p className="font-medium text-gray-900">{user?.profile?.district || 'Not set'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">State</p>
                    <p className="font-medium text-gray-900">{user?.profile?.state || 'Not set'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Pincode</p>
                    <p className="font-medium text-gray-900">{user?.profile?.pincode || 'Not set'}</p>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-3">Account Status</h3>
                <div className="space-y-2">
                  <p className="text-sm text-green-800">
                    <span className="font-semibold">Onboarding Status:</span> {user?.profile?.onboarding_complete ? '✅ Completed' : '⏳ In Progress'}
                  </p>
                  <p className="text-sm text-green-800">
                    <span className="font-semibold">Current Step:</span> {user?.profile?.onboarding_step || 0} / 5
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
