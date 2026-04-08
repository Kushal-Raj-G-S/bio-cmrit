// Adaptive Community Hub - Switches between Mock and Real Implementation
// Location: src/components/education/community/AdaptiveCommunityHub.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, Button } from '../shared/ui-components'
import { 
  Server, 
  ServerOff, 
  RefreshCw
} from 'lucide-react'

import { RealCommunityDiscussion } from './frontend/components/RealCommunityDiscussion'
import { useConnection } from './frontend/hooks/useRealCommunity'

interface AdaptiveCommunityHubProps {
  className?: string
}

export const AdaptiveCommunityHub: React.FC<AdaptiveCommunityHubProps> = ({ 
  className = '' 
}) => {
  const { isConnected, loading, testConnection } = useConnection()

  // Auto-detect real backend availability - only once
  useEffect(() => {
    if (isConnected === null) {
      testConnection()
    }
  }, [isConnected, testConnection])

  const ConnectionStatus = () => (
    <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {loading ? (
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
            ) : isConnected ? (
              <Server className="w-5 h-5 text-green-600" />
            ) : (
              <ServerOff className="w-5 h-5 text-red-600" />
            )}
            <div>
              <h3 className="font-semibold text-gray-800">
                {loading 
                  ? 'Checking Backend...' 
                  : isConnected 
                    ? 'Community Hub Backend Active' 
                    : 'Community Hub Backend Offline'
                }
              </h3>
              <p className="text-sm text-gray-600">
                {loading 
                  ? 'Testing connection to Community Hub server...'
                  : isConnected 
                    ? 'Real-time community features are available'
                    : 'Backend server is required for Community Hub functionality'
                }
              </p>
            </div>
          </div>
          
          {!isConnected && !loading && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={testConnection}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const BackendRequiredMessage = () => (
    <Card className="border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-white">
      <CardContent className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <ServerOff className="w-12 h-12 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Community Hub Backend Required
        </h3>
        <p className="text-gray-600 mb-4">
          The Community Hub requires a real backend server with database to function. 
          Please start the backend server to access all community features.
        </p>
        
        <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm mb-4">
          <div className="text-gray-600 mb-2">Start the backend server:</div>
          <div className="text-gray-700">cd src/components/education/community/backend</div>
          <div className="text-green-600 font-semibold">node server-simple.js</div>
        </div>
        
        <div className="text-sm text-gray-500 space-y-1">
          <p><strong>Features available with backend:</strong></p>
          <p>• Real user posts and comments</p>
          <p>• Voting and reputation system</p>
          <p>• Image uploads</p>
          <p>• Expert verification</p>
          <p>• Search and filtering</p>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Community Content */}
      {isConnected ? (
        <RealCommunityDiscussion />
      ) : (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <ServerOff className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Community Hub Offline</h3>
            <p className="text-gray-600 mb-4">Start the backend server to access community features</p>
          </div>
          <Button onClick={testConnection} className="bg-green-600 hover:bg-green-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  )
}

export default AdaptiveCommunityHub
