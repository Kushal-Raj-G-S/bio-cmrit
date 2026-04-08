'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, Button, Progress } from '../shared/ui-components'
import { placeholderImages } from '../shared/placeholder-images'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  SkipBack, 
  SkipForward,
  Settings,
  Subtitles,
  RotateCcw
} from 'lucide-react'

interface VideoPlayerProps {
  videoUrl: string
  title: string
  onProgress?: (progress: number) => void
  onComplete?: () => void
  className?: string
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  title,
  onProgress,
  onComplete,
  className = ""
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)
    const handleEnded = () => {
      setIsPlaying(false)
      onComplete?.()
    }

    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', updateDuration)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', updateDuration)
      video.removeEventListener('ended', handleEnded)
    }
  }, [onComplete])

  useEffect(() => {
    if (duration > 0) {
      const progress = (currentTime / duration) * 100
      onProgress?.(progress)
    }
  }, [currentTime, duration, onProgress])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const newTime = (parseFloat(e.target.value) / 100) * duration
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const skipTime = (seconds: number) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds))
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const changePlaybackRate = () => {
    const video = videoRef.current
    if (!video) return

    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2]
    const currentIndex = rates.indexOf(playbackRate)
    const nextRate = rates[(currentIndex + 1) % rates.length]
    
    video.playbackRate = nextRate
    setPlaybackRate(nextRate)
  }

  return (
    <Card className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      <CardContent className="p-0">
        <div 
          className="relative group"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full aspect-video bg-black"
            onClick={togglePlay}
            poster={placeholderImages.videoThumbnail()}
            onError={(e) => {
              // Silently handle video load errors
              if (videoRef.current && videoUrl.includes('/videos/')) {
                videoRef.current.src = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
              }
            }}
          />
          
          {/* Controls Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showControls || !isPlaying ? 1 : 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 flex flex-col justify-between p-4"
          >
            {/* Top Controls */}
            <div className="flex justify-between items-center">
              <h3 className="text-white font-semibold text-lg">{title}</h3>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-white hover:bg-white/20"
                  onClick={changePlaybackRate}
                >
                  {playbackRate}x
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                  <Subtitles className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Center Play Button */}
            <div className="flex justify-center items-center">
              <Button
                onClick={togglePlay}
                size="lg"
                className="rounded-full bg-white/20 hover:bg-white/30 text-white border-0 w-16 h-16"
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </Button>
            </div>

            {/* Bottom Controls */}
            <div className="space-y-2">
              {/* Progress Bar */}
              <div className="flex items-center gap-2 text-white text-sm">
                <span className="min-w-[40px]">{formatTime(currentTime)}</span>
                <div className="flex-1 relative">
                  <Progress 
                    value={duration ? (currentTime / duration) * 100 : 0} 
                    className="h-2 bg-white/30"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={duration ? (currentTime / duration) * 100 : 0}
                    onChange={handleSeek}
                    className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
                  />
                </div>
                <span className="min-w-[40px]">{formatTime(duration)}</span>
              </div>

              {/* Control Buttons */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-white hover:bg-white/20"
                    onClick={() => skipTime(-10)}
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={togglePlay}
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-white hover:bg-white/20"
                    onClick={() => skipTime(10)}
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={toggleMute}
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  <div className="w-20">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        const newVolume = parseFloat(e.target.value)
                        setVolume(newVolume)
                        if (videoRef.current) {
                          videoRef.current.volume = newVolume
                        }
                      }}
                      className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => skipTime(-30)}
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    <RotateCcw className="w-4 h-4" />
                    30s
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}
