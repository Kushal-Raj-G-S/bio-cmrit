// Community Question Card Component
// Location: src/components/education/community/frontend/components/QuestionCard.tsx

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, Badge, Button } from '../../../shared/ui-components'
import { Question, VoteType } from '../../shared/types'
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Eye, 
  Clock, 
  MapPin,
  CheckCircle,
  AlertTriangle,
  User,
  Trophy,
  Hash
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface QuestionCardProps {
  question: Question
  onQuestionClick: (question: Question) => void
  onVote: (questionId: string, voteType: VoteType) => void
  className?: string
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onQuestionClick,
  onVote,
  className = ''
}) => {
  const handleVote = (voteType: VoteType, e: React.MouseEvent) => {
    e.stopPropagation()
    onVote(question.id, voteType)
  }

  const getReputationColor = (reputation: number) => {
    if (reputation >= 1000) return 'text-purple-600'
    if (reputation >= 500) return 'text-blue-600'
    if (reputation >= 100) return 'text-green-600'
    return 'text-gray-600'
  }

  const getCategoryColor = (categoryName: string) => {
    const colors: Record<string, string> = {
      'Urgent Help': 'bg-red-100 text-red-700',
      'Success Story': 'bg-green-100 text-green-700',
      'Pest Control': 'bg-orange-100 text-orange-700',
      'Soil Health': 'bg-amber-100 text-amber-700',
      'Irrigation': 'bg-blue-100 text-blue-700',
      'Crop Disease': 'bg-pink-100 text-pink-700',
      'General': 'bg-gray-100 text-gray-700',
    }
    return colors[categoryName] || 'bg-gray-100 text-gray-700'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card 
        className={`cursor-pointer border-0 shadow-md hover:shadow-lg transition-all duration-300 ${
          question.isPinned ? 'ring-2 ring-green-200 bg-green-50/50' : ''
        } ${
          question.isUrgent ? 'border-l-4 border-red-500' : ''
        }`}
        onClick={() => onQuestionClick(question)}
      >
        <CardContent className="p-6">
          {/* Header with status badges */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex flex-wrap gap-2">
              <Badge className={getCategoryColor(question.category.name)}>
                {question.category.name}
              </Badge>
              
              {question.isPinned && (
                <Badge className="bg-yellow-100 text-yellow-700">
                  📌 Pinned
                </Badge>
              )}
              
              {question.isUrgent && (
                <Badge className="bg-red-100 text-red-700">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Urgent
                </Badge>
              )}
              
              {question.isSolved && (
                <Badge className="bg-green-100 text-green-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Solved
                </Badge>
              )}
            </div>
          </div>

          {/* Question Title */}
          <h3 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-2 hover:text-green-600 transition-colors">
            {question.title}
          </h3>

          {/* Question Content Preview */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {question.content}
          </p>

          {/* Tags */}
          {question.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {question.tags.slice(0, 3).map((tag) => (
                <span 
                  key={tag}
                  className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md"
                >
                  <Hash className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
              {question.tags.length > 3 && (
                <span className="text-xs text-gray-500">+{question.tags.length - 3} more</span>
              )}
            </div>
          )}

          {/* Images indicator */}
          {question.images.length > 0 && (
            <div className="flex items-center gap-1 mb-4 text-sm text-gray-500">
              <span>📷 {question.images.length} image{question.images.length > 1 ? 's' : ''}</span>
            </div>
          )}

          {/* Author Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                {question.author.avatar ? (
                  <img 
                    src={question.author.avatar} 
                    alt={`${question.author.firstName} ${question.author.lastName}` || question.author.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800">
                    {question.isAnonymous ? 'Anonymous' : (`${question.author.firstName} ${question.author.lastName}`.trim() || question.author.username)}
                  </span>
                  {question.author.isVerified && (
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                  )}
                  {question.author.isModerator && (
                    <Trophy className="w-4 h-4 text-purple-500" />
                  )}
                </div>
                
                {!question.isAnonymous && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className={getReputationColor(question.author.reputation)}>
                      {question.author.reputation} rep
                    </span>
                    {question.author.location && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {question.author.location}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
            </div>
          </div>

          {/* Stats and Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4">
              {/* Voting */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`p-1 h-auto ${
                    question.userVote === VoteType.UPVOTE ? 'text-green-600 bg-green-50' : 'text-gray-500 hover:text-green-600'
                  }`}
                  onClick={(e: React.MouseEvent) => handleVote(VoteType.UPVOTE, e)}
                >
                  <ThumbsUp className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium text-gray-700 min-w-[20px] text-center">
                  {(question as any).voteScore || question.upvotes - question.downvotes || 0}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`p-1 h-auto ${
                    question.userVote === VoteType.DOWNVOTE ? 'text-red-600 bg-red-50' : 'text-gray-500 hover:text-red-600'
                  }`}
                  onClick={(e: React.MouseEvent) => handleVote(VoteType.DOWNVOTE, e)}
                >
                  <ThumbsDown className="w-4 h-4" />
                </Button>
              </div>

              {/* Comments */}
              <div className="flex items-center gap-1 text-gray-500">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">{(question as any)._count?.comments || question.commentCount || 0}</span>
              </div>

              {/* Views */}
              <div className="flex items-center gap-1 text-gray-500">
                <Eye className="w-4 h-4" />
                <span className="text-sm">{question.viewCount || 0}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-green-600 hover:bg-green-50"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  onQuestionClick(question)
                }}
              >
                Answer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default QuestionCard
