// Community Hub Real Implementation - Adaptive Frontend
// Location: src/components/education/community/frontend/components/RealCommunityDiscussion.tsx

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../../../shared/ui-components'
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Server,
  ServerOff,
  RefreshCw,
  Award,
  Clock,
  Vote,
  CheckCircle
} from 'lucide-react'

import { useCommunity, useConnection } from '../hooks/useRealCommunity'
import { QuestionList } from './QuestionList'
import { AskQuestionModal } from './AskQuestionModal'

export const RealCommunityDiscussion: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [showAskModal, setShowAskModal] = useState(false)

  const { isConnected, loading: connectionLoading, testConnection } = useConnection()
  
  // Memoize the filters object to prevent infinite re-renders
  const filters = useMemo(() => ({
    category: activeCategory === 'all' ? undefined : activeCategory,
    search: searchQuery || undefined,
    filter: filterType === 'all' ? undefined : filterType,
    sort: sortBy
  }), [activeCategory, searchQuery, filterType, sortBy])
  
  const {
    user,
    isAuthenticated,
    categories = [],
    questions = [],
    createQuestion,
    loading,
    error,
    refetch
  } = useCommunity(filters)

  // Connection Status Component
  const ConnectionStatus = () => (
    <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {connectionLoading ? (
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
            ) : isConnected ? (
              <Server className="w-5 h-5 text-green-600" />
            ) : (
              <ServerOff className="w-5 h-5 text-red-600" />
            )}
            <div>
              <h3 className="font-semibold text-gray-800">
                {connectionLoading 
                  ? 'Connecting...' 
                  : isConnected 
                    ? 'Community Hub Connected' 
                    : 'Community Hub Offline'
                }
              </h3>
              <p className="text-sm text-gray-600">
                {connectionLoading 
                  ? 'Testing connection to Community Hub server...'
                  : isConnected 
                    ? 'Real-time community features are available'
                    : 'Start the Community Hub server to enable real features'
                }
              </p>
            </div>
          </div>
          {!isConnected && !connectionLoading && (
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

  // Setup Instructions Component
  const SetupInstructions = () => (
    <Card className="border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 to-white">
      <CardContent className="p-6">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          Start Community Hub Server
        </h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Quick Start:</strong></p>
          <div className="bg-gray-100 p-3 rounded-lg font-mono text-xs">
            <div>cd src/components/education/community</div>
            <div>./setup.ps1</div>
          </div>
          <p className="text-xs text-gray-500">
            This will start the backend server with real database, authentication, and all community features.
          </p>
        </div>
      </CardContent>
    </Card>
  )

  // Welcome Section
  const WelcomeSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-8 space-y-4"
    >
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
          <Users className="w-8 h-8 text-white" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">
          {isConnected ? 'Welcome to the Community Hub' : 'Community Hub Available'}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {isAuthenticated && user
            ? `Welcome back, ${user.firstName || user.username || 'Farmer'}! Connect with fellow farmers, share knowledge, and get expert advice.`
            : isConnected
              ? 'Connect with fellow farmers, ask questions, and share your farming knowledge with the community.'
              : 'A real-time community platform for farmers to connect, learn, and share knowledge together.'
          }
        </p>
      </div>

      {isConnected && (
        <div className="flex justify-center gap-4 mt-6">
          {!isAuthenticated ? (
            <div className="flex gap-3">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Users className="w-4 h-4 mr-2" />
                Join Community
              </Button>
              <Button variant="outline">
                Login
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => setShowAskModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ask Question
            </Button>
          )}
        </div>
      )}
    </motion.div>
  )

  // Community Stats
  const CommunityStats = () => {
    if (!isConnected) return null

    const stats = [
      { label: 'Total Questions', value: (questions || []).length, icon: MessageSquare, color: 'text-blue-600' },
      { label: 'Active Users', value: '24', icon: Users, color: 'text-green-600' },
      { label: 'Expert Answers', value: '156', icon: Award, color: 'text-purple-600' },
      { label: 'Solved Today', value: '8', icon: CheckCircle, color: 'text-emerald-600' }
    ]

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    )
  }

  // Main Content
  const MainContent = () => {
    if (!isConnected) {
      return (
        <div className="space-y-6">
          <WelcomeSection />
          <SetupInstructions />
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <WelcomeSection />
        
        {isAuthenticated && <CommunityStats />}

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={activeCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory('all')}
          >
            All Categories
          </Button>
          {(categories || []).map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(category.id)}
              className="flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }}></span>
              {category.name}
              {questions && questions.filter(q => q.category?.id === category.id).length > 0 && (
                <Badge variant="outline" className="ml-1 px-1 py-0 text-xs">
                  {questions.filter(q => q.category?.id === category.id).length}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Questions</option>
              <option value="urgent">Urgent Help</option>
              <option value="unsolved">Unsolved</option>
              <option value="solved">Solved</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="votes">Most Votes</option>
              <option value="comments">Most Comments</option>
              <option value="trending">Trending</option>
            </select>
          </div>
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading community questions...</p>
          </div>
        ) : error ? (
          <Card className="border-l-4 border-l-red-500 bg-red-50">
            <CardContent className="p-6">
              <p className="text-red-700">Error: {error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refetch}
                className="mt-2"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <QuestionList 
            questions={questions || []}
            onQuestionClick={(question) => console.log('Question clicked:', question)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Community Hub</h1>
          <p className="text-gray-600">Ask questions, share knowledge, connect with farmers</p>
        </div>
        <Button 
          onClick={() => setShowAskModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ask Question
        </Button>
      </div>

      {/* Categories Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveCategory('all')}
        >
          All Categories
        </Button>
        {(categories || []).map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Search and Sort */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="votes">Most Votes</option>
          <option value="comments">Most Comments</option>
        </select>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading questions...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No questions yet</h3>
          <p className="text-gray-500 mb-6">Be the first to ask a question!</p>
          <Button 
            onClick={() => setShowAskModal(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ask First Question
          </Button>
        </div>
      ) : (
        <QuestionList 
          questions={questions}
          onQuestionClick={(question) => {
            console.log('Question clicked:', question.title)
          }}
          onVote={(questionId, voteType) => {
            console.log('Vote:', questionId, voteType)
          }}
        />
      )}

      {/* Ask Question Modal */}
      {showAskModal && (
        <AskQuestionModal
          isOpen={showAskModal}
          onClose={() => setShowAskModal(false)}
          onSubmit={async (data: any) => {
            try {
              await createQuestion(data)
              setShowAskModal(false)
              refetch() // Refresh questions list
            } catch (error) {
              console.error('Failed to create question:', error)
            }
          }}
          categories={categories || []}
        />
      )}
    </div>
  )
}
