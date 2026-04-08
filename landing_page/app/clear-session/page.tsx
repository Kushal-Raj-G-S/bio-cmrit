"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertTriangle, RefreshCw } from "lucide-react"

export default function ClearSessionPage() {
  const router = useRouter()
  const [cleared, setCleared] = useState(false)
  const [devSessionFound, setDevSessionFound] = useState(false)

  useEffect(() => {
    // Check if there's a dev session
    const devSession = localStorage.getItem('dev_session')
    if (devSession) {
      setDevSessionFound(true)
    }
  }, [])

  const handleClearSession = () => {
    // Clear all relevant localStorage items
    localStorage.removeItem('dev_session')
    localStorage.removeItem('community_token')
    localStorage.removeItem('community_user')
    localStorage.removeItem('graintrust-user')
    
    setCleared(true)
    
    // Auto redirect to auth page after 2 seconds
    setTimeout(() => {
      router.push('/auth')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            {cleared ? "✅ Session Cleared!" : "🧹 Clear Dev Session"}
          </CardTitle>
          <CardDescription>
            {cleared 
              ? "All dev sessions have been cleared. Redirecting to login..."
              : "Clear any leftover development sessions to fix authentication issues"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!cleared ? (
            <>
              {devSessionFound && (
                <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-800">Dev session found</p>
                    <p className="text-sm text-orange-700">This may cause authentication issues</p>
                  </div>
                </div>
              )}
              
              <Button 
                onClick={handleClearSession}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear All Sessions
              </Button>
              
              <p className="text-sm text-gray-600 text-center">
                This will clear all development sessions and redirect you to the login page.
              </p>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <p className="font-medium text-green-800">Sessions cleared successfully!</p>
                <p className="text-sm text-gray-600">Redirecting to login page...</p>
              </div>
              <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}