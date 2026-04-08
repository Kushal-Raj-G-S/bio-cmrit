// Community Question List Component
// Location: src/components/education/community/frontend/components/QuestionList.tsx

'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Badge } from '../../../shared/ui-components'
import { Question, VoteType } from '../../shared/types'
import { QuestionCard } from './QuestionCard'
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Clock, 
  ThumbsUp, 
  MessageCircle,
  TrendingUp,
  Hash,
  Plus,
  Loader2
} from 'lucide-react'

interface QuestionListProps {
  questions: Question[]
  loading?: boolean
  onQuestionClick: (question: Question) => void
  onVote?: (questionId: string, voteType: VoteType) => void
  onCreateQuestion?: () => void
  className?: string
}

export type SortBy = 'newest' | 'oldest' | 'most_votes' | 'most_comments' | 'trending'
export type FilterBy = 'all' | 'urgent' | 'solved' | 'unsolved' | 'pinned'

export const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  loading = false,
  onQuestionClick,
  onVote,
  onCreateQuestion,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('newest')
  const [filterBy, setFilterBy] = useState<FilterBy>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

  // Get unique categories and tags
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(
      questions
        .filter(q => q.category && (q.category.name || q.category))
        .map(q => typeof q.category === 'string' ? q.category : q.category.name)
    ))
    return uniqueCategories.sort()
  }, [questions])

  const tags = useMemo(() => {
    const allTags = questions.flatMap(q => q.tags || [])
    const uniqueTags = Array.from(new Set(allTags))
    return uniqueTags.sort()
  }, [questions])

  // Filter and sort questions
  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = questions

    // Text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(term) ||
        q.content.toLowerCase().includes(term) ||
        q.tags.some(tag => tag.toLowerCase().includes(term)) ||
        `${q.author.firstName} ${q.author.lastName}`.toLowerCase().includes(term) ||
        q.author.username.toLowerCase().includes(term)
      )
    }

    // Filter by status
    switch (filterBy) {
      case 'urgent':
        filtered = filtered.filter(q => q.isUrgent)
        break
      case 'solved':
        filtered = filtered.filter(q => q.isSolved)
        break
      case 'unsolved':
        filtered = filtered.filter(q => !q.isSolved)
        break
      case 'pinned':
        filtered = filtered.filter(q => q.isPinned)
        break
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(q => q.category.name === selectedCategory)
    }

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(q => q.tags.includes(selectedTag))
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'most_votes':
        filtered.sort((a, b) => {
          const aVotes = (a as any).voteScore || (a.upvotes - a.downvotes) || 0
          const bVotes = (b as any).voteScore || (b.upvotes - b.downvotes) || 0
          return bVotes - aVotes
        })
        break
      case 'most_comments':
        filtered.sort((a, b) => {
          const aComments = (a as any)._count?.comments || a.commentCount || 0
          const bComments = (b as any)._count?.comments || b.commentCount || 0
          return bComments - aComments
        })
        break
      case 'trending':
        // Simple trending algorithm: votes + comments in last 7 days
        const now = new Date().getTime()
        const weekMs = 7 * 24 * 60 * 60 * 1000
        filtered.sort((a, b) => {
          const aVotes = (a as any).voteScore || (a.upvotes - a.downvotes) || 0
          const aComments = (a as any)._count?.comments || a.commentCount || 0
          const bVotes = (b as any).voteScore || (b.upvotes - b.downvotes) || 0
          const bComments = (b as any)._count?.comments || b.commentCount || 0
          
          const aScore = (new Date(a.createdAt).getTime() > now - weekMs) ? 
            aVotes + aComments : 0
          const bScore = (new Date(b.createdAt).getTime() > now - weekMs) ? 
            bVotes + bComments : 0
          return bScore - aScore
        })
        break
    }

    // Always show pinned first
    return [
      ...filtered.filter(q => q.isPinned),
      ...filtered.filter(q => !q.isPinned)
    ]
  }, [questions, searchTerm, sortBy, filterBy, selectedCategory, selectedTag])

  const clearFilters = () => {
    setSearchTerm('')
    setSortBy('newest')
    setFilterBy('all')
    setSelectedCategory('')
    setSelectedTag('')
  }

  const hasActiveFilters = searchTerm || filterBy !== 'all' || selectedCategory || selectedTag

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Community Questions</h2>
          <p className="text-gray-600 mt-1">
            {filteredAndSortedQuestions.length} question{filteredAndSortedQuestions.length !== 1 ? 's' : ''} found
          </p>
        </div>
        
        {onCreateQuestion && (
          <Button 
            onClick={onCreateQuestion}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ask Question
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search questions, tags, or users..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="most_votes">Most Votes</option>
              <option value="most_comments">Most Comments</option>
              <option value="trending">Trending</option>
            </select>
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-green-50 border-green-200' : ''}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge className="ml-2 bg-green-600 text-white text-xs px-1">
                {[searchTerm, filterBy !== 'all', selectedCategory, selectedTag].filter(Boolean).length}
              </Badge>
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-50 p-4 rounded-lg space-y-4"
            >
              {/* Status Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status:</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'All Questions', icon: null },
                    { value: 'urgent', label: 'Urgent', icon: '🚨' },
                    { value: 'solved', label: 'Solved', icon: '✅' },
                    { value: 'unsolved', label: 'Unsolved', icon: '❓' },
                    { value: 'pinned', label: 'Pinned', icon: '📌' },
                  ].map((filter) => (
                    <Button
                      key={filter.value}
                      variant={filterBy === filter.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterBy(filter.value as FilterBy)}
                      className={filterBy === filter.value ? 'bg-green-600 text-white' : ''}
                    >
                      {filter.icon && <span className="mr-1">{filter.icon}</span>}
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category:</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={!selectedCategory ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('')}
                    className={!selectedCategory ? 'bg-green-600 text-white' : ''}
                  >
                    All Categories
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={selectedCategory === category ? 'bg-green-600 text-white' : ''}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tag Filter */}
              {tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags:</label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    <Button
                      variant={!selectedTag ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTag('')}
                      className={!selectedTag ? 'bg-green-600 text-white' : ''}
                    >
                      All Tags
                    </Button>
                    {tags.slice(0, 20).map((tag) => (
                      <Button
                        key={tag}
                        variant={selectedTag === tag ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTag(tag)}
                        className={selectedTag === tag ? 'bg-green-600 text-white' : ''}
                      >
                        <Hash className="w-3 h-3 mr-1" />
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Question List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-green-600" />
            <span className="ml-2 text-gray-600">Loading questions...</span>
          </div>
        ) : filteredAndSortedQuestions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              {hasActiveFilters ? 'No questions match your filters' : 'No questions yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {hasActiveFilters 
                ? 'Try adjusting your filters or search terms'
                : 'Be the first to ask a question in the community!'
              }
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            ) : onCreateQuestion && (
              <Button onClick={onCreateQuestion} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Ask First Question
              </Button>
            )}
          </div>
        ) : (
          <motion.div 
            className="grid gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AnimatePresence mode="popLayout">
              {filteredAndSortedQuestions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <QuestionCard
                    question={question}
                    onQuestionClick={onQuestionClick}
                    onVote={onVote || (() => {})}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default QuestionList
