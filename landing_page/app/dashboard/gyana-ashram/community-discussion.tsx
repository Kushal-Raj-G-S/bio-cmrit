'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button } from './shared/ui-components'
import { placeholderImages } from './shared/placeholder-images'
import { 
  MessageCircle, 
  Heart, 
  Reply, 
  Clock, 
  MapPin, 
  Wheat,
  ThumbsUp,
  Flag,
  Search,
  Filter,
  Plus,
  Users,
  TrendingUp,
  Award,
  Camera,
  Send,
  Bookmark,
  Eye,
  Zap,
  CheckCircle,
  HelpCircle,
  Star,
  FileText,
  Image,
  Video,
  Mic,
  Hash,
  Globe,
  Activity
} from 'lucide-react'

interface Discussion {
  id: string
  title: string
  content: string
  author: {
    name: string
    avatar: string
    location: string
    reputation: number
    badges: string[]
  }
  category: string
  tags: string[]
  likes: number
  replies: number
  views: number
  timeAgo: string
  isResolved: boolean
  hasImages: boolean
  isPinned: boolean
  isLiked: boolean
  isBookmarked: boolean
}

const mockDiscussions: Discussion[] = [
  {
    id: '1',
    title: '🌾 Best practices for wheat storage during monsoon? URGENT!',
    content: 'Fellow farmers, I need your expertise! With the monsoon approaching, I\'m worried about moisture control in my wheat storage facility. Last year I lost 15% of my harvest to fungal growth. What preventive measures have worked for you? I have about 50 tons to store.',
    author: {
      name: 'Ramesh Kumar',
      avatar: placeholderImages.userAvatar('RK'),
      location: 'Punjab, India',
      reputation: 450,
      badges: ['Quality Expert', 'Helper', 'Top Contributor']
    },
    category: 'Storage & Preservation',
    tags: ['wheat', 'storage', 'monsoon', 'moisture', 'urgent'],
    likes: 23,
    replies: 15,
    views: 342,
    timeAgo: '2 hours ago',
    isResolved: false,
    hasImages: true,
    isPinned: false,
    isLiked: false,
    isBookmarked: true
  },
  {
    id: '2',
    title: '✅ SUCCESS: Organic pest control for rice - 90% reduction achieved!',
    content: 'Amazing results using neem oil combined with beneficial insects! After 3 months of implementation, I\'ve reduced pest damage by 90% without any chemicals. Sharing my complete strategy below. Cost was only ₹2000 per acre vs ₹5000 for chemicals!',
    author: {
      name: 'Priya Devi',
      avatar: placeholderImages.userAvatar('PD'),
      location: 'West Bengal, India',
      reputation: 820,
      badges: ['Organic Pioneer', 'Innovator', 'Success Story']
    },
    category: 'Pest Management',
    tags: ['rice', 'organic', 'success-story', 'neem', 'cost-effective'],
    likes: 68,
    replies: 32,
    views: 1247,
    timeAgo: '1 day ago',
    isResolved: true,
    hasImages: true,
    isPinned: true,
    isLiked: true,
    isBookmarked: false
  },
  {
    id: '3',
    title: '🤝 Need blockchain implementation buddy - let\'s learn together!',
    content: 'Hi everyone! I completed the blockchain verification course but feeling overwhelmed about implementing it on my farm. Looking for 2-3 farmers who want to form a study group and help each other through the process. We can share costs and knowledge!',
    author: {
      name: 'Suresh Patel',
      avatar: placeholderImages.userAvatar('XX'),
      location: 'Gujarat, India',
      reputation: 180,
      badges: ['Learner', 'Community Builder']
    },
    category: 'Technology',
    tags: ['blockchain', 'verification', 'study-group', 'collaboration'],
    likes: 12,
    replies: 8,
    views: 234,
    timeAgo: '3 days ago',
    isResolved: false,
    hasImages: false,
    isPinned: false,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: '4',
    title: '🚀 GAME CHANGER: 40% yield increase with smart irrigation system!',
    content: 'Life-changing results to share! Installed IoT-based irrigation 8 months ago. Results: 40% higher yield, 60% water savings, 30% less labor. Investment paid back in one season! AMA about sensors, automation, costs, and ROI. Happy to help fellow farmers!',
    author: {
      name: 'Anjali Singh',
      avatar: placeholderImages.userAvatar('XX'),
      location: 'Haryana, India',
      reputation: 1250,
      badges: ['Tech Pioneer', 'Success Story', 'Mentor', 'Innovation Leader']
    },
    category: 'Success Stories',
    tags: ['irrigation', 'IoT', 'yield-increase', 'water-saving', 'automation'],
    likes: 145,
    replies: 67,
    views: 2340,
    timeAgo: '1 week ago',
    isResolved: false,
    hasImages: true,
    isPinned: true,
    isLiked: true,
    isBookmarked: true
  },
  {
    id: '5',
    title: '⚠️ Warning: Fake seeds being sold in local market - be careful!',
    content: 'ALERT: Found counterfeit seeds being sold at Krishi Mandi with fake certification. Lost 2 acres already. Sharing photos of authentic vs fake packaging. Please verify with official dealers only. Has anyone else faced this issue? We need to report this together.',
    author: {
      name: 'Vikash Sharma',
      avatar: placeholderImages.userAvatar('XX'),
      location: 'Bihar, India',
      reputation: 340,
      badges: ['Watchdog', 'Community Protector']
    },
    category: 'Quality Control',
    tags: ['seeds', 'fake', 'warning', 'quality-control', 'safety'],
    likes: 89,
    replies: 23,
    views: 567,
    timeAgo: '2 days ago',
    isResolved: false,
    hasImages: true,
    isPinned: false,
    isLiked: false,
    isBookmarked: true
  },
  {
    id: '6',
    title: '💰 Market prices dropping - what\'s your strategy?',
    content: 'Tomato prices crashed from ₹40/kg to ₹8/kg in just 2 weeks. This volatility is killing small farmers like us. What strategies are you using to handle price fluctuations? Should we form a cooperative for better negotiation power?',
    author: {
      name: 'Lakshmi Reddy',
      avatar: placeholderImages.userAvatar('XX'),
      location: 'Karnataka, India',
      reputation: 290,
      badges: ['Market Analyst', 'Small Farmer']
    },
    category: 'Market & Pricing',
    tags: ['tomato', 'pricing', 'market-volatility', 'cooperative', 'strategy'],
    likes: 34,
    replies: 18,
    views: 445,
    timeAgo: '5 hours ago',
    isResolved: false,
    hasImages: false,
    isPinned: false,
    isLiked: false,
    isBookmarked: false
  }
]

const categories = [
  'All Categories',
  'Storage & Preservation',
  'Pest Management',
  'Technology & Innovation',
  'Quality Control',
  'Success Stories',
  'Market & Pricing',
  'Equipment & Tools',
  'Crop Management',
  'Soil & Water',
  'Organic Farming',
  'Weather & Climate',
  'Government Schemes',
  'Business & Finance'
]

const quickTopics = [
  { name: 'Urgent Help', icon: '🚨', color: 'bg-red-50 text-red-700 border-red-200' },
  { name: 'Success Stories', icon: '🏆', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { name: 'Tech Questions', icon: '💻', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { name: 'Market Updates', icon: '📈', color: 'bg-green-50 text-green-700 border-green-200' },
  { name: 'Equipment Help', icon: '🔧', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { name: 'Weather Alerts', icon: '🌧️', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
]

export const CommunityDiscussion: React.FC = () => {
  const [discussions, setDiscussions] = useState(mockDiscussions)
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent')
  const [showNewPost, setShowNewPost] = useState(false)
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostTitle, setNewPostTitle] = useState('')
  const [selectedQuickTopic, setSelectedQuickTopic] = useState('')

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesCategory = selectedCategory === 'All Categories' || discussion.category === selectedCategory
    const matchesSearch = discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         discussion.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         discussion.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesQuickTopic = !selectedQuickTopic || 
      (selectedQuickTopic === 'Urgent Help' && (discussion.tags.includes('urgent') || discussion.title.includes('URGENT'))) ||
      (selectedQuickTopic === 'Success Stories' && discussion.category === 'Success Stories') ||
      (selectedQuickTopic === 'Tech Questions' && (discussion.category === 'Technology & Innovation' || discussion.category === 'Technology')) ||
      (selectedQuickTopic === 'Market Updates' && discussion.category === 'Market & Pricing')
    
    return matchesCategory && matchesSearch && matchesQuickTopic
  })

  const sortedDiscussions = [...filteredDiscussions].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    
    switch (sortBy) {
      case 'popular':
        return b.likes - a.likes
      case 'trending':
        return b.views - a.views
      default:
        return 0 // Recent is default order
    }
  })

  const handleLike = (discussionId: string) => {
    setDiscussions(prev => prev.map(discussion => 
      discussion.id === discussionId 
        ? { 
            ...discussion, 
            isLiked: !discussion.isLiked,
            likes: discussion.isLiked ? discussion.likes - 1 : discussion.likes + 1
          }
        : discussion
    ))
  }

  const handleBookmark = (discussionId: string) => {
    setDiscussions(prev => prev.map(discussion => 
      discussion.id === discussionId 
        ? { ...discussion, isBookmarked: !discussion.isBookmarked }
        : discussion
    ))
  }

  const getBadgeColor = (badge: string) => {
    const badgeColors: { [key: string]: string } = {
      'Quality Expert': 'bg-emerald-100 text-emerald-800',
      'Helper': 'bg-blue-100 text-blue-800',
      'Top Contributor': 'bg-purple-100 text-purple-800',
      'Organic Pioneer': 'bg-green-100 text-green-800',
      'Innovator': 'bg-indigo-100 text-indigo-800',
      'Success Story': 'bg-yellow-100 text-yellow-800',
      'Tech Pioneer': 'bg-cyan-100 text-cyan-800',
      'Mentor': 'bg-orange-100 text-orange-800',
      'Innovation Leader': 'bg-violet-100 text-violet-800',
      'Community Builder': 'bg-pink-100 text-pink-800',
      'Learner': 'bg-slate-100 text-slate-800',
      'Watchdog': 'bg-red-100 text-red-800',
      'Community Protector': 'bg-amber-100 text-amber-800',
      'Market Analyst': 'bg-teal-100 text-teal-800',
      'Small Farmer': 'bg-lime-100 text-lime-800'
    }
    return badgeColors[badge] || 'bg-gray-100 text-gray-800'
  }

  const getDiscussionTypeIcon = (discussion: Discussion) => {
    if (discussion.title.includes('SUCCESS') || discussion.title.includes('GAME CHANGER')) {
      return <TrendingUp className="w-4 h-4 text-green-600" />
    }
    if (discussion.title.includes('URGENT') || discussion.title.includes('Warning')) {
      return <Zap className="w-4 h-4 text-red-600" />
    }
    if (discussion.isResolved) {
      return <CheckCircle className="w-4 h-4 text-green-600" />
    }
    return <HelpCircle className="w-4 h-4 text-blue-600" />
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
            Farmer Community Hub
          </h2>
          <p className="text-lg text-green-600 max-w-3xl mx-auto">
            Connect, share knowledge, and grow together with fellow farmers from across India 🇮🇳
          </p>
        </motion.div>
        
        {/* Quick Topic Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mt-6"
        >
          {quickTopics.map((topic, index) => (
            <Button
              key={topic.name}
              variant={selectedQuickTopic === topic.name ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedQuickTopic(selectedQuickTopic === topic.name ? '' : topic.name)}
              className={`${topic.color} hover:scale-105 transition-all duration-200`}
            >
              <span className="mr-2">{topic.icon}</span>
              {topic.name}
            </Button>
          ))}
        </motion.div>
      </div>

      {/* Enhanced Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card className="border-green-200 hover:shadow-lg transition-all duration-300 group">
          <CardContent className="p-4 text-center">
            <div className="relative">
              <Users className="w-8 h-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-2xl font-bold text-green-800">2.4k</div>
            <div className="text-sm text-green-600">Active Farmers</div>
            <div className="text-xs text-green-500 mt-1">+124 this week</div>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200 hover:shadow-lg transition-all duration-300 group">
          <CardContent className="p-4 text-center">
            <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
            <div className="text-2xl font-bold text-blue-800">1.8k</div>
            <div className="text-sm text-blue-600">Discussions</div>
            <div className="text-xs text-blue-500 mt-1">+89 today</div>
          </CardContent>
        </Card>
        
        <Card className="border-purple-200 hover:shadow-lg transition-all duration-300 group">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
            <div className="text-2xl font-bold text-purple-800">96%</div>
            <div className="text-sm text-purple-600">Resolved</div>
            <div className="text-xs text-purple-500 mt-1">Within 24h avg</div>
          </CardContent>
        </Card>
        
        <Card className="border-orange-200 hover:shadow-lg transition-all duration-300 group">
          <CardContent className="p-4 text-center">
            <Award className="w-8 h-8 text-orange-600 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
            <div className="text-2xl font-bold text-orange-800">187</div>
            <div className="text-sm text-orange-600">Experts</div>
            <div className="text-xs text-orange-500 mt-1">Ready to help</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-green-200 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search Row */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search discussions, farmers, topics, or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-green-50/50"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </Button>
                  )}
                </div>

                <Button 
                  onClick={() => setShowNewPost(true)}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Ask Question
                </Button>
              </div>

              {/* Filters Row */}
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular' | 'trending')}
                  className="px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
                >
                  <option value="recent">🕒 Most Recent</option>
                  <option value="popular">❤️ Most Liked</option>
                  <option value="trending">🔥 Trending</option>
                </select>

                {(selectedCategory !== 'All Categories' || searchQuery || selectedQuickTopic) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory('All Categories')
                      setSearchQuery('')
                      setSelectedQuickTopic('')
                    }}
                    className="text-gray-500 border-gray-300"
                  >
                    Clear Filters
                  </Button>
                )}

                <div className="ml-auto text-sm text-gray-500">
                  {sortedDiscussions.length} discussion{sortedDiscussions.length !== 1 ? 's' : ''} found
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Discussions List */}
      <div className="space-y-4">
        <AnimatePresence>
          {sortedDiscussions.map((discussion, index) => (
            <motion.div
              key={discussion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2 }}
            >
              <Card className={`hover:shadow-xl transition-all duration-300 border-l-4 cursor-pointer group ${
                discussion.isPinned 
                  ? 'border-l-yellow-400 bg-gradient-to-r from-yellow-50 to-white' 
                  : discussion.title.includes('URGENT') || discussion.title.includes('Warning')
                  ? 'border-l-red-400 bg-gradient-to-r from-red-50 to-white'
                  : discussion.category === 'Success Stories'
                  ? 'border-l-green-400 bg-gradient-to-r from-green-50 to-white'
                  : 'border-l-blue-400 bg-gradient-to-r from-blue-50 to-white'
              }`}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Enhanced Author Avatar */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <img 
                          src={discussion.author.avatar} 
                          alt={discussion.author.name}
                          className="w-12 h-12 rounded-full ring-2 ring-white shadow-lg"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getDiscussionTypeIcon(discussion)}
                            <h3 className="font-bold text-gray-800 hover:text-green-700 cursor-pointer group-hover:text-green-700 transition-colors line-clamp-2">
                              {discussion.title}
                            </h3>
                          </div>
                          
                          <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1 font-medium">
                              <span>{discussion.author.name}</span>
                              {discussion.author.reputation > 500 && (
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {discussion.author.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {discussion.timeAgo}
                            </div>
                          </div>

                          {/* Author Stats & Badges */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-full">
                              <Award className="w-3 h-3 text-yellow-600" />
                              {discussion.author.reputation} pts
                            </div>
                            <div className="flex gap-1 flex-wrap">
                              {discussion.author.badges.slice(0, 2).map((badge, idx) => (
                                <Badge key={idx} className={`text-xs ${getBadgeColor(badge)}`}>
                                  {badge}
                                </Badge>
                              ))}
                              {discussion.author.badges.length > 2 && (
                                <Badge className="text-xs bg-gray-100 text-gray-600">
                                  +{discussion.author.badges.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation()
                              handleBookmark(discussion.id)
                            }}
                            className={`${discussion.isBookmarked ? 'text-yellow-600' : 'text-gray-400'} hover:scale-110 transition-transform`}
                          >
                            <Bookmark className={`w-4 h-4 ${discussion.isBookmarked ? 'fill-current' : ''}`} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gray-400 hover:text-red-500 hover:scale-110 transition-all"
                          >
                            <Flag className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center gap-2 mb-3">
                        {discussion.isPinned && (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs border border-yellow-200">
                            📌 Pinned
                          </Badge>
                        )}
                        {discussion.isResolved && (
                          <Badge className="bg-green-100 text-green-800 text-xs border border-green-200">
                            ✅ Resolved
                          </Badge>
                        )}
                        {discussion.title.includes('URGENT') && (
                          <Badge className="bg-red-100 text-red-800 text-xs border border-red-200 animate-pulse">
                            🚨 Urgent
                          </Badge>
                        )}
                        {discussion.hasImages && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs border border-blue-200">
                            📸 Images
                          </Badge>
                        )}
                      </div>

                      {/* Content Preview */}
                      <p className="text-gray-700 mb-4 line-clamp-2 leading-relaxed">
                        {discussion.content}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {discussion.tags.slice(0, 4).map((tag, idx) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className="text-xs border-green-200 text-green-700 hover:bg-green-50 cursor-pointer transition-colors"
                          >
                            #{tag}
                          </Badge>
                        ))}
                        {discussion.tags.length > 4 && (
                          <Badge variant="outline" className="text-xs border-gray-200 text-gray-500">
                            +{discussion.tags.length - 4}
                          </Badge>
                        )}
                      </div>

                      {/* Enhanced Actions & Stats */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation()
                              handleLike(discussion.id)
                            }}
                            className={`gap-2 hover:scale-105 transition-all ${
                              discussion.isLiked ? 'text-red-600' : 'text-gray-600'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${discussion.isLiked ? 'fill-current' : ''}`} />
                            <span className="font-medium">{discussion.likes}</span>
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-2 text-gray-600 hover:text-blue-600 hover:scale-105 transition-all"
                          >
                            <Reply className="w-4 h-4" />
                            <span className="font-medium">{discussion.replies}</span>
                          </Button>
                          
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Eye className="w-3 h-3" />
                            {discussion.views.toLocaleString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className="text-xs bg-white border-gray-200 text-gray-600"
                          >
                            {discussion.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Enhanced New Post Modal */}
      <AnimatePresence>
        {showNewPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewPost(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-green-800">Ask the Community</h3>
                    <p className="text-green-600 mt-1">Get help from 2.4k+ experienced farmers</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowNewPost(false)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-10 h-10 p-0"
                  >
                    ✕
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      What's your question? *
                    </label>
                    <input
                      type="text"
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      placeholder="e.g., How to prevent fungal infections in wheat during monsoon?"
                      className="w-full px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">Be specific and clear to get better answers</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Provide details *
                    </label>
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Describe your situation in detail. Include:
• Your location and crop type
• What you've already tried
• Specific challenges you're facing
• Any relevant timing or urgency"
                      rows={8}
                      className="w-full px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">More details = better answers from the community</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Category *
                      </label>
                      <select className="w-full px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                        {categories.slice(1).map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Urgency Level
                      </label>
                      <select className="w-full px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                        <option value="normal">🕒 Normal - within a week</option>
                        <option value="urgent">⚡ Urgent - within 24 hours</option>
                        <option value="critical">🚨 Critical - immediate help needed</option>
                      </select>
                    </div>
                  </div>

                  {/* Optional Features */}
                  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <h4 className="font-medium text-gray-700 mb-3">Optional: Make your question more helpful</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Button variant="outline" size="sm" className="justify-start">
                        <Image className="w-4 h-4 mr-2" />
                        Add Photos
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start">
                        <Video className="w-4 h-4 mr-2" />
                        Add Video
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start">
                        <MapPin className="w-4 h-4 mr-2" />
                        Add Location
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-xl font-semibold shadow-md"
                      disabled={!newPostTitle.trim() || !newPostContent.trim()}
                    >
                      <Send className="w-5 h-5 mr-2" />
                      Post Your Question
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowNewPost(false)}
                      className="px-6 py-3 rounded-xl"
                    >
                      Cancel
                    </Button>
                  </div>

                  <div className="text-center text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                    💡 <strong>Pro tip:</strong> Questions with specific details and context get 3x more helpful responses!
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Empty State */}
      {sortedDiscussions.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-green-200">
            <CardContent className="p-16 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-700 mb-3">
                  {searchQuery || selectedCategory !== 'All Categories' || selectedQuickTopic
                    ? 'No discussions match your filters'
                    : 'Start the conversation!'
                  }
                </h3>
                <p className="text-green-600 mb-6 leading-relaxed">
                  {searchQuery || selectedCategory !== 'All Categories' || selectedQuickTopic
                    ? 'Try adjusting your search terms or filters to find more discussions, or start a new one!'
                    : 'Be the first to ask a question and help build our farming community. Every expert was once a beginner!'
                  }
                </p>
                <div className="space-y-3">
                  <Button 
                    onClick={() => setShowNewPost(true)}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-6 py-3 rounded-xl font-semibold"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Ask Your First Question
                  </Button>
                  {(searchQuery || selectedCategory !== 'All Categories' || selectedQuickTopic) && (
                    <div>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setSelectedCategory('All Categories')
                          setSearchQuery('')
                          setSelectedQuickTopic('')
                        }}
                        className="mx-2"
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

export default CommunityDiscussion
