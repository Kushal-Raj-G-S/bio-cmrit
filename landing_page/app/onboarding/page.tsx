"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { 
  User, 
  MapPin, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Sprout,
  Building2,
  Upload,
  Leaf,
  Shield
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const steps: OnboardingStep[] = [
  {
    id: 'account',
    title: 'Complete Your Profile',
    description: 'Add your details to continue',
    icon: User
  },
  {
    id: 'profile',
    title: 'Your Farming Background',
    description: 'Tell us about your farming experience',
    icon: Leaf
  },
  {
    id: 'farm',
    title: 'Your Farm Details',
    description: 'Information about your land and crops',
    icon: Sprout
  },
  {
    id: 'location',
    title: 'Location',
    description: 'Where is your farm located?',
    icon: MapPin
  },
  {
    id: 'complete',
    title: 'All Set! 🎉',
    description: 'Welcome to BioBloom - your smart farming journey begins',
    icon: CheckCircle
  }
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [accountCreated, setAccountCreated] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    bio: '',
    farmName: '',
    farmSize: '',
    experience: '',
    crops: '',
    city: '',
    state: '',
    district: '',
    pincode: ''
  })

  // Load user data on mount - only from fresh phone auth
  useEffect(() => {
    const loadUserData = async () => {
      // Check for real Supabase session
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if they have completed onboarding before
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_complete, full_name, email')
          .eq('id', user.id)
          .maybeSingle()

        if (profile?.onboarding_complete) {
          // User already completed onboarding, redirect to dashboard
          router.push('/dashboard')
          return
        }

        // Load minimal data - only email if exists
        if (user.email && !formData.email) {
          setFormData(prev => ({
            ...prev,
            email: user.email || ''
          }))
        }
        return
      }

      // No session - redirect to auth
      router.push('/auth')
    }

    loadUserData()
  }, [])

  const handleNext = () => {
    // Validate account completion before moving from step 0
    if (currentStep === 0 && !accountCreated) {
      toast.error('Please complete your profile first')
      return
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCreateAccount = async () => {
    // DEVELOPMENT MODE: Check for dev session
    const devSession = localStorage.getItem('dev_session')
    if (devSession) {
      try {
        const devUser = JSON.parse(devSession)
        // Update dev session with new profile data
        devUser.profile = {
          ...devUser.profile,
          full_name: formData.fullName,
          email: formData.email
        }
        localStorage.setItem('dev_session', JSON.stringify(devUser))
        setAccountCreated(true)
        toast.success('Profile updated! (Dev Mode)')
        return
      } catch (e) {
        localStorage.removeItem('dev_session')
      }
    }

    // Get current user (from phone auth)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast.error('No active session. Please login first.')
      router.push('/auth')
      return
    }

    // Validate only the fields user can edit
    if (!formData.fullName) {
      toast.error('Please enter your full name')
      return
    }

    if (!formData.email) {
      toast.error('Please enter your email')
      return
    }

    if (!formData.password || formData.password.length < 6) {
      toast.error('Please enter a password (minimum 6 characters)')
      return
    }

    setLoading(true)
    try {
      // Get phone from authenticated user
      const phone = user.phone || user.user_metadata?.phone

      // Update user password in Supabase Auth
      const { error: passwordError } = await supabase.auth.updateUser({
        password: formData.password
      })

      if (passwordError) {
        console.error('Password update error:', passwordError)
        throw passwordError
      }

      // Only update profile in database - no auth updates needed
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          email: formData.email,
          phone: phone,
          phone_verified: !!phone,
          onboarding_step: 1
        })
        .eq('id', user.id)

      if (profileError) {
        console.error('Profile update error:', profileError)
        throw profileError
      }

      setAccountCreated(true)
      toast.success('Account details saved!')
      
      // Move to next step automatically
      setTimeout(() => setCurrentStep(1), 500)
    } catch (error: any) {
      console.error('Account update error:', error)
      toast.error(error.message || 'Failed to save account details')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      // DEVELOPMENT MODE: Check for dev session
      const devSession = localStorage.getItem('dev_session')
      if (devSession) {
        try {
          const devUser = JSON.parse(devSession)
          // Update dev session with complete profile
          devUser.profile = {
            ...devUser.profile,
            full_name: formData.fullName,
            email: formData.email,
            bio: formData.bio,
            experience_years: formData.experience,
            farm_name: formData.farmName,
            farm_size: formData.farmSize,
            primary_crops: formData.crops,
            city: formData.city,
            district: formData.district,
            state: formData.state,
            pincode: formData.pincode,
            onboarding_complete: true
          }
          localStorage.setItem('dev_session', JSON.stringify(devUser))
          toast.success('Welcome to BioBloom! (Dev Mode)')
          setTimeout(() => {
            router.push('/dashboard')
          }, 1500)
          setLoading(false)
          return
        } catch (e) {
          localStorage.removeItem('dev_session')
        }
      }

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('No user found')
      }

      // Get phone from user metadata (set during auth)
      const phone = user.phone || user.user_metadata?.phone

      // Use UPSERT to insert or update profile (prevents duplicate issues)
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.fullName || user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          email: user.email,
          phone: phone,
          bio: formData.bio,
          experience_years: formData.experience,
          farm_name: formData.farmName,
          farm_size: formData.farmSize,
          primary_crops: formData.crops,
          city: formData.city,
          district: formData.district,
          state: formData.state,
          pincode: formData.pincode,
          phone_verified: !!phone,
          onboarding_complete: true,
          onboarding_step: 5
        }, {
          onConflict: 'id'
        })

      if (error) {
        console.error('Onboarding save error:', error)
        throw error
      }

      toast.success('Welcome to BioBloom! Your profile is complete.')
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (error: any) {
      console.error('Failed to complete onboarding:', error)
      toast.error(error.message || 'Failed to complete onboarding')
    } finally {
      setLoading(false)
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  const renderStepContent = () => {
    if (currentStep === 0) {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border-2 border-green-200">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              <User className="w-5 h-5" />
              Complete Your Profile
            </h4>
            <p className="text-sm text-green-800">
              Set up your account with a password for future logins
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2 text-base">
                👤 Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Rajesh Kumar"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                disabled={accountCreated}
                className="text-base py-6"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-base">
                ✉️ Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="farmer@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={accountCreated}
                className="text-base py-6"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-base">
                🔒 Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password (min 6 characters)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={accountCreated}
                className="text-base py-6"
              />
              <p className="text-xs text-gray-500">You'll use this password for future logins instead of OTP</p>
            </div>

            {!accountCreated && (
              <Button
                onClick={handleCreateAccount}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-6 text-base mt-4"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </span>
                ) : (
                  'Save & Continue'
                )}
              </Button>
            )}

            {accountCreated && (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">Profile Updated!</p>
                  <p className="text-sm text-green-700">Click Next to continue</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )
    }

    if (currentStep === 1) {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="experience" className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-green-600" />
              Farming Experience
            </Label>
            <select
              id="experience"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              className="h-12 w-full px-3 border-2 rounded-md focus:border-green-500 focus:outline-none"
            >
              <option value="">Select your experience level</option>
              <option value="0-2">0-2 years (New Farmer)</option>
              <option value="3-5">3-5 years</option>
              <option value="6-10">6-10 years</option>
              <option value="11-20">11-20 years</option>
              <option value="20+">20+ years (Expert)</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Tell us about your farming journey</Label>
            <Textarea
              id="bio"
              placeholder="Share your story, what crops you grow, your farming philosophy..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="min-h-[140px] border-2 focus:border-green-500"
            />
          </div>
        </div>
      )
    }

    if (currentStep === 2) {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="farmName" className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-green-600" />
              Farm Name
            </Label>
            <Input
              id="farmName"
              placeholder="e.g., Green Valley Farms"
              value={formData.farmName}
              onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
              className="h-12 border-2 focus:border-green-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="farmSize">Farm Size (in acres)</Label>
              <select
                id="farmSize"
                value={formData.farmSize}
                onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                className="h-12 w-full px-3 border-2 rounded-md focus:border-green-500 focus:outline-none"
              >
                <option value="">Select size</option>
                <option value="small">Small (under 2 acres)</option>
                <option value="medium">Medium (2-10 acres)</option>
                <option value="large">Large (10-50 acres)</option>
                <option value="commercial">Commercial (50+ acres)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="crops" className="flex items-center gap-2">
                <Sprout className="w-4 h-4 text-green-600" />
                Primary Crops
              </Label>
              <Input
                id="crops"
                placeholder="Wheat, Rice, Cotton, etc."
                value={formData.crops}
                onChange={(e) => setFormData({ ...formData, crops: e.target.value })}
                className="h-12 border-2 focus:border-green-500"
              />
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Farm Photos (Optional)
            </h4>
            <p className="text-sm text-blue-800 mb-3">
              Add photos of your farm to help us provide better recommendations
            </p>
            <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
              <Upload className="w-4 h-4 mr-2" />
              Upload Photos
            </Button>
          </div>
        </div>
      )
    }

    if (currentStep === 3) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" />
                City/Village
              </Label>
              <Input
                id="city"
                placeholder="Your city or village"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="h-12 border-2 focus:border-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                placeholder="Your district"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="h-12 border-2 focus:border-green-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="Your state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="h-12 border-2 focus:border-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">PIN Code</Label>
              <Input
                id="pincode"
                type="text"
                placeholder="123456"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="h-12 border-2 focus:border-green-500"
                maxLength={6}
              />
            </div>
          </div>
        </div>
      )
    }

    if (currentStep === 4) {
      return (
        <div className="text-center space-y-6">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-2xl border-2 border-green-200">
            <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold text-green-900 mb-2">Welcome to BioBloom! 🌱</h3>
            <p className="text-green-800 mb-4 text-lg">
              Your profile is complete and ready. Let's start growing together!
            </p>
            <div className="bg-white p-4 rounded-lg border-2 border-green-200 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-700">Account Status:</span>
                <Badge className="bg-green-600 text-white px-4 py-1">
                  ✓ Active
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-left bg-white p-6 rounded-xl border-2 border-gray-200">
            <p className="font-semibold text-gray-900 mb-3">What's next?</p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Access your personalized dashboard
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Get AI-powered crop recommendations
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Monitor your farm's health in real-time
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Connect with farming experts
              </li>
            </ul>
          </div>
        </div>
      )
    }

    return <div>Unknown step</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <Card className="w-full max-w-3xl shadow-2xl border-2 border-green-200 bg-white/95 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-4 rounded-2xl shadow-lg">
              <Sprout className="w-10 h-10 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-gray-900">BioBloom Setup</CardTitle>
              <CardDescription className="text-base">Let's set up your farming profile</CardDescription>
            </div>
          </div>
          <div className="space-y-2">
            <Progress value={progress} className="h-3 bg-gray-200" />
            <p className="text-sm text-gray-600 font-medium">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-br from-green-100 to-blue-100 p-4 rounded-full shadow-md">
                {(() => {
                  const Icon = steps[currentStep].icon
                  return <Icon className="w-8 h-8 text-green-600" />
                })()}
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-gray-600 mb-6">
              {steps[currentStep].description}
            </p>
          </div>

          <div className="animate-in slide-in-from-right-5 duration-300">
            {renderStepContent()}
          </div>

          <div className="flex justify-between pt-6 border-t-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2 border-2 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white flex items-center gap-2 px-8 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white flex items-center gap-2 px-8 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {loading ? 'Completing...' : 'Complete Setup'}
                <CheckCircle className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
