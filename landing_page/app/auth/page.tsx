"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FadeIn, SlideUp, ScaleIn } from "@/components/ui/animation-wrapper"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { supabase } from "@/lib/supabase"
import {
  CheckCircle, Leaf, Brain, Shield, Sparkles, ArrowRight, AlertCircle, Lock, MessageSquare
} from "lucide-react"
import { useRouter } from "next/navigation"

type Step = 'phone' | 'choose' | 'password' | 'otp'

export default function AuthPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, authLoading, router])

  const [phone, setPhone] = useState("")
  const [step, setStep] = useState<Step>('phone')
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [canResend, setCanResend] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  const phoneWithCode = `+91${phone}`

  // Step 1: check if phone exists → choose method, else new user → OTP
  const handleCheckPhone = async () => {
    if (phone.length !== 10) {
      setMessage({ type: 'error', text: 'Enter a valid 10-digit phone number' })
      return
    }
    setLoading(true)
    setMessage({ type: 'success', text: '🔍 Checking your number...' })
    try {
      // Use server-side API — bypasses RLS, no hanging
      const res = await fetch(`/api/user-data?phone=${phone}`)
      const { data: profile } = await res.json()

      if (profile) {
        setStep('choose')
      } else {
        await sendOTP()
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Something went wrong' })
    } finally {
      setLoading(false)
    }
  }

  const sendOTP = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: phoneWithCode })
      if (error) throw error
      setStep('otp')
      setOtp('')
      setCanResend(false)
      setResendTimer(60)
      const interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) { clearInterval(interval); setCanResend(true); return 0 }
          return prev - 1
        })
      }, 1000)
      setMessage({ type: 'success', text: `📱 OTP sent to ${phoneWithCode}` })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to send OTP' })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordLogin = async () => {
    if (!password) { setMessage({ type: 'error', text: 'Enter your password' }); return }
    setLoading(true)
    setMessage(null)
    try {
      // Use server-side API — bypasses RLS
      const res = await fetch(`/api/user-data?phone=${phone}`)
      const { data: profile } = await res.json()

      if (!profile) { setMessage({ type: 'error', text: 'Phone number not found' }); return }
      if (profile.app_password !== password) { setMessage({ type: 'error', text: 'Incorrect password' }); return }

      // Store user id so dashboard can load via profiles table
      if (typeof window !== 'undefined') {
        localStorage.setItem('biobloom_password_user_id', profile.id)
        localStorage.setItem('biobloom_password_auth', 'true')
      }
      setMessage({ type: 'success', text: '✅ Welcome back! Redirecting...' })
      setTimeout(() => router.push('/dashboard'), 800)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Login failed' })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) { setMessage({ type: 'error', text: 'Enter the 6-digit OTP' }); return }
    setLoading(true)
    setMessage(null)
    try {
      const result = await Promise.race([
        supabase.auth.verifyOtp({ phone: phoneWithCode, token: otp, type: 'sms' }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 10000))
      ])
      const { data, error } = result as Awaited<ReturnType<typeof supabase.auth.verifyOtp>>

      if (error) {
        if (error.message?.includes('expired') || error.message?.includes('invalid')) {
          setMessage({ type: 'error', text: '⏱️ OTP expired. Click Resend OTP.' })
          setCanResend(true)
        } else {
          setMessage({ type: 'error', text: error.message })
        }
        return
      }
      if (!data.user) { setMessage({ type: 'error', text: 'Verification failed. Try again.' }); return }

      const { data: profile } = await supabase
        .from('profiles').select('onboarding_complete').eq('id', data.user.id).maybeSingle()

      if (profile?.onboarding_complete) {
        setMessage({ type: 'success', text: 'Welcome back! Redirecting...' })
        setTimeout(() => router.push('/dashboard'), 800)
      } else {
        if (!profile) {
          await supabase.from('profiles').insert({
            id: data.user.id, phone: phoneWithCode, onboarding_complete: false,
            created_at: new Date().toISOString(), updated_at: new Date().toISOString()
          })
        }
        setMessage({ type: 'success', text: 'Verified! Setting up your account...' })
        setTimeout(() => router.push('/onboarding'), 800)
      }
    } catch (err: any) {
      if (err.message === 'TIMEOUT') {
        setMessage({ type: 'error', text: '⏱️ Connection slow. Check internet and try again.' })
        setCanResend(true)
      } else {
        setMessage({ type: 'error', text: err.message || 'Something went wrong' })
      }
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setStep('phone'); setPassword(''); setOtp(''); setMessage(null); setCanResend(false); setResendTimer(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <Header />

      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left — Auth Form */}
          <SlideUp delay={50}>
            <Card className="border-2 border-green-200 shadow-2xl backdrop-blur-sm bg-white/95">
              <CardHeader className="text-center pb-4">
                <FadeIn delay={80}>
                  <Badge className="mb-3 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white px-4 py-2 mx-auto shadow-lg animate-pulse">
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    Join BioBloom
                  </Badge>
                </FadeIn>
                <CardTitle className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 font-heading">
                  Login or Signup 📱
                </CardTitle>
                <CardDescription className="text-lg">
                  {step === 'phone' && 'Enter your phone number to continue'}
                  {step === 'choose' && 'Choose how you want to login'}
                  {step === 'password' && 'Enter your password'}
                  {step === 'otp' && `OTP sent to +91${phone}`}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                {message && (
                  <div className={`p-4 rounded-lg flex items-start gap-3 animate-in slide-in-from-top-2 duration-300 ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-800 border-2 border-green-200'
                      : 'bg-red-50 text-red-800 border-2 border-red-200'
                  }`}>
                    {message.type === 'success'
                      ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                    <span className="text-sm font-medium">{message.text}</span>
                  </div>
                )}

                {/* Phone field — shown on phone/password/otp steps */}
                {step !== 'choose' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-600" /> Phone Number
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center px-3 py-3 bg-gray-100 rounded-lg border-2 text-gray-600 font-semibold text-sm">+91</div>
                      <Input
                        type="tel"
                        placeholder="9686293233"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        maxLength={10}
                        disabled={step !== 'phone'}
                        className="border-2 border-gray-200 focus:border-green-500 py-6 text-lg"
                        onKeyDown={(e) => e.key === 'Enter' && step === 'phone' && handleCheckPhone()}
                      />
                    </div>
                  </div>
                )}

                {/* STEP: phone */}
                {step === 'phone' && (
                  <Button onClick={handleCheckPhone} disabled={loading || phone.length !== 10}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-6 text-lg font-semibold">
                    {loading
                      ? <span className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Checking...</span>
                      : <span className="flex items-center justify-center gap-2">Continue <ArrowRight className="w-5 h-5" /></span>}
                  </Button>
                )}

                {/* STEP: choose */}
                {step === 'choose' && (
                  <div className="space-y-3">
                    <p className="text-center text-sm text-gray-500 font-medium">+91 {phone}</p>
                    <button onClick={() => { setStep('password'); setMessage(null) }}
                      className="w-full flex items-center gap-4 p-5 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all duration-200 text-left group">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <Lock className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Login with Password</p>
                        <p className="text-sm text-gray-500">Fast &amp; no SMS cost</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-green-600" />
                    </button>

                    <button onClick={() => sendOTP()}
                      className="w-full flex items-center gap-4 p-5 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-left group">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <MessageSquare className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Login with OTP</p>
                        <p className="text-sm text-gray-500">One-time SMS verification</p>
                      </div>
                      {loading
                        ? <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin ml-auto" />
                        : <ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-blue-600" />}
                    </button>

                    <Button variant="outline" onClick={reset} className="w-full">← Change Phone Number</Button>
                  </div>
                )}

                {/* STEP: password */}
                {step === 'password' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-green-600" /> Password
                      </label>
                      <Input type="password" placeholder="Enter your password" value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-2 border-gray-200 focus:border-green-500 py-6 text-lg"
                        autoFocus onKeyDown={(e) => e.key === 'Enter' && handlePasswordLogin()} />
                    </div>
                    <Button onClick={handlePasswordLogin} disabled={loading || !password}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-6 text-lg font-semibold">
                      {loading
                        ? <span className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Logging in...</span>
                        : <span className="flex items-center justify-center gap-2">Login <ArrowRight className="w-5 h-5" /></span>}
                    </Button>
                    <Button variant="outline" onClick={() => { setStep('choose'); setMessage(null); setPassword('') }} className="w-full">← Back</Button>
                  </div>
                )}

                {/* STEP: otp */}
                {step === 'otp' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Enter 6-Digit OTP</label>
                      <Input type="text" placeholder="000000" value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        className="text-center text-2xl font-bold tracking-widest border-2 border-gray-200 focus:border-green-500 py-6"
                        autoFocus onKeyDown={(e) => e.key === 'Enter' && handleVerifyOTP()} />
                    </div>
                    <Button onClick={handleVerifyOTP} disabled={loading || otp.length !== 6}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-6 text-lg font-semibold">
                      {loading
                        ? <span className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Verifying...</span>
                        : <span className="flex items-center justify-center gap-2">Verify &amp; Continue <ArrowRight className="w-5 h-5" /></span>}
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={reset} className="flex-1">← Change Number</Button>
                      <Button variant="outline" onClick={() => { setOtp(''); setMessage(null); sendOTP() }}
                        disabled={!canResend || loading} className="flex-1">
                        {canResend ? 'Resend OTP' : `Resend (${resendTimer}s)`}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </SlideUp>

          {/* Right — Benefits */}
          <ScaleIn delay={100}>
            <div className="space-y-8">
              <FadeIn delay={130}>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-heading">Why Join BioBloom?</h2>
                <p className="text-xl text-gray-600 mb-8">Get access to cutting-edge AI tools designed specifically for Indian farmers</p>
              </FadeIn>
              <div className="space-y-6">
                <SlideUp delay={160}>
                  <div className="flex gap-4 p-6 bg-white rounded-xl shadow-lg border-2 border-green-100 hover:border-green-300 transition-all duration-300 hover:scale-105">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"><Brain className="w-7 h-7 text-white" /></div>
                    <div><h3 className="font-semibold text-xl text-gray-900 mb-2">AI-Powered Insights</h3><p className="text-gray-600">Get personalized recommendations based on your land, climate, and crops</p></div>
                  </div>
                </SlideUp>
                <SlideUp delay={190}>
                  <div className="flex gap-4 p-6 bg-white rounded-xl shadow-lg border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 hover:scale-105">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"><Leaf className="w-7 h-7 text-white" /></div>
                    <div><h3 className="font-semibold text-xl text-gray-900 mb-2">Sustainable Farming</h3><p className="text-gray-600">Reduce costs and increase yields with organic-first solutions</p></div>
                  </div>
                </SlideUp>
                <SlideUp delay={220}>
                  <div className="flex gap-4 p-6 bg-white rounded-xl shadow-lg border-2 border-purple-100 hover:border-purple-300 transition-all duration-300 hover:scale-105">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"><Shield className="w-7 h-7 text-white" /></div>
                    <div><h3 className="font-semibold text-xl text-gray-900 mb-2">100% Free Forever</h3><p className="text-gray-600">No hidden costs, no subscriptions. All features completely free</p></div>
                  </div>
                </SlideUp>
              </div>
              <FadeIn delay={250}>
                <div className="p-6 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl text-white text-center shadow-xl">
                  <p className="text-lg mb-2">Join <span className="font-bold text-2xl">10,000+</span> farmers</p>
                  <p className="opacity-90">Already transforming their farms with BioBloom</p>
                </div>
              </FadeIn>
            </div>
          </ScaleIn>
        </div>
      </main>

      <Footer />
    </div>
  )
}
