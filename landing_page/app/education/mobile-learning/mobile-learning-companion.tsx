'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button, Progress } from '../shared/ui-components'
import { 
  Download, 
  Wifi, 
  WifiOff, 
  Volume2, 
  VolumeX, 
  Languages, 
  Calendar,
  MapPin,
  Sun,
  Cloud,
  CloudRain,
  Thermometer,
  Droplets,
  Wind,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Clock,
  Smartphone,
  Headphones,
  FileText
} from 'lucide-react'

interface OfflineContent {
  id: string
  title: string
  type: 'video' | 'audio' | 'text' | 'interactive'
  size: string
  duration: string
  downloaded: boolean
  downloading: boolean
  progress: number
  language: string
  category: string
  priority: 'high' | 'medium' | 'low'
}

interface WeatherInfo {
  temperature: number
  condition: 'sunny' | 'cloudy' | 'rainy'
  humidity: number
  windSpeed: number
  recommendation: string
}

const mockOfflineContent: OfflineContent[] = [
  {
    id: '1',
    title: 'Monsoon Preparation Guide',
    type: 'video',
    size: '250 MB',
    duration: '25 min',
    downloaded: true,
    downloading: false,
    progress: 100,
    language: 'Hindi',
    category: 'Seasonal',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Quick Quality Check Audio Guide',
    type: 'audio',
    size: '15 MB',
    duration: '12 min',
    downloaded: true,
    downloading: false,
    progress: 100,
    language: 'Kannada',
    category: 'Quality Control',
    priority: 'high'
  },
  {
    id: '3',
    title: 'Pest Identification Manual',
    type: 'text',
    size: '5 MB',
    duration: '30 min read',
    downloaded: false,
    downloading: false,
    progress: 0,
    language: 'English',
    category: 'Pest Management',
    priority: 'medium'
  },
  {
    id: '4',
    title: 'Interactive Soil Testing',
    type: 'interactive',
    size: '45 MB',
    duration: '15 min',
    downloaded: false,
    downloading: true,
    progress: 65,
    language: 'Hindi',
    category: 'Soil Management',
    priority: 'medium'
  }
]

const mockWeather: WeatherInfo = {
  temperature: 28,
  condition: 'cloudy',
  humidity: 65,
  windSpeed: 12,
  recommendation: 'Good time for harvesting. Consider quality testing after collection.'
}

export const MobileLearningCompanion: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [offlineContent, setOfflineContent] = useState(mockOfflineContent)
  const [currentAudio, setCurrentAudio] = useState<OfflineContent | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [weather] = useState(mockWeather)
  const [selectedLanguage, setSelectedLanguage] = useState('Hindi')
  const [storageUsed, setStorageUsed] = useState(0)

  useEffect(() => {
    const handleOnlineStatus = () => setIsOnline(navigator.onLine)
    window.addEventListener('online', handleOnlineStatus)
    window.addEventListener('offline', handleOnlineStatus)

    // Calculate storage used
    const totalUsed = offlineContent
      .filter(content => content.downloaded)
      .reduce((acc, content) => acc + parseInt(content.size), 0)
    setStorageUsed(totalUsed)

    return () => {
      window.removeEventListener('online', handleOnlineStatus)
      window.removeEventListener('offline', handleOnlineStatus)
    }
  }, [offlineContent])

  const handleDownload = (contentId: string) => {
    setOfflineContent(prev => prev.map(content => 
      content.id === contentId 
        ? { ...content, downloading: true, progress: 0 }
        : content
    ))

    // Simulate download progress
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15
      if (progress >= 100) {
        progress = 100
        setOfflineContent(prev => prev.map(content => 
          content.id === contentId 
            ? { ...content, downloading: false, downloaded: true, progress: 100 }
            : content
        ))
        clearInterval(interval)
      } else {
        setOfflineContent(prev => prev.map(content => 
          content.id === contentId 
            ? { ...content, progress }
            : content
        ))
      }
    }, 500)
  }

  const handleDelete = (contentId: string) => {
    setOfflineContent(prev => prev.map(content => 
      content.id === contentId 
        ? { ...content, downloaded: false, downloading: false, progress: 0 }
        : content
    ))
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="w-5 h-5" />
      case 'audio': return <Headphones className="w-5 h-5" />
      case 'text': return <FileText className="w-5 h-5" />
      case 'interactive': return <Smartphone className="w-5 h-5" />
      default: return <BookOpen className="w-5 h-5" />
    }
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-6 h-6 text-yellow-500" />
      case 'cloudy': return <Cloud className="w-6 h-6 text-gray-500" />
      case 'rainy': return <CloudRain className="w-6 h-6 text-blue-500" />
      default: return <Sun className="w-6 h-6" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredContent = offlineContent.filter(content => 
    selectedLanguage === 'All' || content.language === selectedLanguage
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-green-800 mb-4">Mobile Learning Companion</h2>
        <p className="text-lg text-green-600 max-w-2xl mx-auto">
          Learn on-the-go with offline content and smart recommendations
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={`border-2 ${isOnline ? 'border-green-300 bg-green-50' : 'border-orange-300 bg-orange-50'}`}>
          <CardContent className="p-4 text-center">
            {isOnline ? <Wifi className="w-6 h-6 text-green-600 mx-auto mb-2" /> : <WifiOff className="w-6 h-6 text-orange-600 mx-auto mb-2" />}
            <div className="font-semibold text-sm">
              {isOnline ? 'Online' : 'Offline'}
            </div>
            <div className="text-xs text-gray-600">
              {isOnline ? 'Sync available' : 'Offline mode'}
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardContent className="p-4 text-center">
            <Download className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="font-semibold text-sm">{offlineContent.filter(c => c.downloaded).length}</div>
            <div className="text-xs text-gray-600">Downloaded</div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <div className="font-semibold text-sm">
              {Math.round(offlineContent.filter(c => c.downloaded).reduce((acc, c) => acc + parseInt(c.duration), 0) / 60)}h
            </div>
            <div className="text-xs text-gray-600">Content Time</div>
          </CardContent>
        </Card>

        <Card className="border-indigo-200">
          <CardContent className="p-4 text-center">
            <Smartphone className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
            <div className="font-semibold text-sm">{storageUsed} MB</div>
            <div className="text-xs text-gray-600">Storage Used</div>
          </CardContent>
        </Card>
      </div>

      {/* Weather-based Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              {getWeatherIcon(weather.condition)}
              Today's Farming Insight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-orange-500" />
                <span className="text-sm">{weather.temperature}°C</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span className="text-sm">{weather.humidity}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{weather.windSpeed} km/h</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-500" />
                <span className="text-sm">Local Area</span>
              </div>
            </div>
            <div className="bg-white/70 p-3 rounded-lg">
              <p className="text-blue-800 font-medium">{weather.recommendation}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Language & Filters */}
      <Card className="border-green-200">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Language:</span>
            </div>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="All">All Languages</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Kannada">Kannada</option>
            </select>
            <div className="flex-1" />
            <Badge className="bg-green-100 text-green-800">
              {filteredContent.length} items available
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Offline Content List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-green-800">Offline Content</h3>
        
        <AnimatePresence>
          {filteredContent.map((content, index) => (
            <motion.div
              key={content.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Content Icon */}
                    <div className={`p-3 rounded-lg ${
                      content.downloaded ? 'bg-green-100 text-green-600' : 
                      content.downloading ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getContentIcon(content.type)}
                    </div>

                    {/* Content Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-green-800 line-clamp-1">{content.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="capitalize">{content.type}</span>
                            <span>•</span>
                            <span>{content.size}</span>
                            <span>•</span>
                            <span>{content.duration}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getPriorityColor(content.priority)}>
                            {content.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {content.language}
                          </Badge>
                        </div>
                      </div>

                      {/* Progress Bar (for downloading) */}
                      {content.downloading && (
                        <div className="mb-3">
                          <div className="flex justify-between text-sm text-blue-600 mb-1">
                            <span>Downloading...</span>
                            <span>{Math.round(content.progress)}%</span>
                          </div>
                          <Progress value={content.progress} className="h-2" />
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {content.category}
                        </Badge>
                        
                        <div className="flex gap-2">
                          {content.downloaded ? (
                            <>
                              {content.type === 'audio' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setCurrentAudio(content)
                                    setIsPlaying(!isPlaying)
                                  }}
                                  className="gap-1"
                                >
                                  {currentAudio?.id === content.id && isPlaying ? 
                                    <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />
                                  }
                                  {currentAudio?.id === content.id && isPlaying ? 'Pause' : 'Play'}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                              >
                                <BookOpen className="w-3 h-3" />
                                Open
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(content.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Delete
                              </Button>
                            </>
                          ) : content.downloading ? (
                            <Button size="sm" variant="outline" disabled>
                              <Clock className="w-3 h-3 mr-1" />
                              Downloading
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleDownload(content.id)}
                              className="bg-green-600 hover:bg-green-700 gap-1"
                              disabled={!isOnline}
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </Button>
                          )}
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

      {/* Audio Player (if audio is playing) */}
      <AnimatePresence>
        {currentAudio && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-6 right-6 md:left-auto md:w-96"
          >
            <Card className="border-green-300 bg-white shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Headphones className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-green-800 text-sm line-clamp-1">
                      {currentAudio.title}
                    </h4>
                    <p className="text-xs text-gray-600">{currentAudio.duration}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost">
                      <SkipBack className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="ghost">
                      <SkipForward className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setCurrentAudio(null)}
                    >
                      ×
                    </Button>
                  </div>
                </div>
                <Progress value={45} className="h-1 mt-3" />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Tips */}
      {!isOnline && (
        <Card className="border-orange-300 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-800 mb-1">You're offline</h4>
                <p className="text-sm text-orange-700 mb-2">
                  You can still access downloaded content and take notes. Your progress will sync when you're back online.
                </p>
                <div className="flex gap-2">
                  <Badge className="bg-orange-100 text-orange-800 text-xs">
                    {offlineContent.filter(c => c.downloaded).length} items available offline
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
