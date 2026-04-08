"use client"

import React, { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Loader2 } from 'lucide-react'

interface VoiceConversationalProps {
  onFieldUpdate: (fieldName: string, value: any) => void
  language: 'en-IN' | 'hi-IN'
  onLanguageChange: (lang: 'en-IN' | 'hi-IN') => void
}

const questions = [
  { field: 'name', en: "What is your field name?", hi: "आपके खेत का नाम क्या है?", audio: ['q1_en.mp3', 'q1_hi.mp3'] },
  { field: 'size', en: "What is the size in hectares?", hi: "हेक्टेयर में आकार क्या है?", audio: ['q2_en.mp3', 'q2_hi.mp3'] },
  { field: 'current_crop', en: "What crop is currently growing?", hi: "अभी कौन सी फसल उगाई जा रही है?", audio: ['q3_en.mp3', 'q3_hi.mp3'] },
  { field: 'soil_type', en: "What is your soil type?", hi: "आपकी मिट्टी का प्रकार क्या है?", audio: ['q4_en.mp3', 'q4_hi.mp3'] },
  { field: 'season', en: "Which season?", hi: "कौन सा मौसम है?", audio: ['q5_en.mp3', 'q5_hi.mp3'] },
  { field: 'climate_zone', en: "What is your climate zone?", hi: "आपका जलवायु क्षेत्र क्या है?", audio: ['q6_en.mp3', 'q6_hi.mp3'] }
]

export function VoiceConversational({ onFieldUpdate, language, onLanguageChange }: VoiceConversationalProps) {
  const [isActive, setIsActive] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState('')
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_MAIN_BACKEND_URL || 'http://localhost:8000'

  // Play question audio
  const playQuestion = (questionIndex: number) => {
    const q = questions[questionIndex]
    const audioFile = language === 'hi-IN' ? `/voice/${q.audio[1]}` : `/voice/${q.audio[0]}`

    if (audioRef.current) {
      audioRef.current.src = audioFile
      audioRef.current.load()
      audioRef.current.play()
        .then(() => {
          console.log('[SUCCESS] Audio playing:', audioFile)
        })
        .catch((error) => {
          console.error('[ERROR] Audio playback failed:', error)
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(language === 'hi-IN' ? q.hi : q.en)
            utterance.lang = language
            window.speechSynthesis.speak(utterance)
          }
        })
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      let mimeType = 'audio/wav'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm;codecs=opus'
      }
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      
      audioChunksRef.current = []
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data) }
      mediaRecorder.onstop = async () => {
        await processAnswer(new Blob(audioChunksRef.current, { type: mimeType }))
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
      
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop()
          setIsRecording(false)
        }
      }, 5000)
    } catch (err) {
      alert('Please allow microphone access')
    }
  }

  const processAnswer = async (audioBlob: Blob) => {
    setIsProcessing(true)
    setStatus('Processing...')
    
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'answer.wav')

      const response = await fetch(`${API_URL}/api/voice/transcribe`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success && data.transcript) {
        const text = data.transcript.trim()
        
        if (text) {
          onFieldUpdate(questions[currentQuestion].field, text)
          setStatus(`✓ Got it: ${text}`)
          
          setTimeout(() => {
            const next = currentQuestion + 1
            if (next < questions.length) {
              setCurrentQuestion(next)
              setStatus('')
              playQuestion(next)
              setTimeout(() => startRecording(), 2000)
            } else {
              setIsActive(false)
              setStatus('✅ All done!')
            }
          }, 1500)
        } else {
          setStatus('⚠️ Didn\'t catch that. Asking again...')
          setTimeout(() => {
            setStatus('')
            playQuestion(currentQuestion)
            setTimeout(() => startRecording(), 2000)
          }, 2000)
        }
      } else {
        setStatus('⚠️ Asking again...')
        setTimeout(() => {
          setStatus('')
          playQuestion(currentQuestion)
          setTimeout(() => startRecording(), 2000)
        }, 2000)
      }
    } catch (err) {
      console.error('[ERROR] Request failed:', err)
      setStatus('❌ Backend error. Make sure backend is running.')
      setIsActive(false)
    } finally {
      setIsProcessing(false)
    }
  }

  const startVoiceFlow = () => {
    setIsActive(true)
    setCurrentQuestion(0)
    setStatus('Starting...')
    setTimeout(() => {
      playQuestion(0)
      setTimeout(() => startRecording(), 2000)
    }, 500)
  }

  const stopVoiceFlow = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    setIsActive(false)
    setIsRecording(false)
    setIsProcessing(false)
    setStatus('')
    setCurrentQuestion(0)
  }

  if (!isActive) {
    return (
      <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
        <audio ref={audioRef} preload="auto" />
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-green-800 mb-1">🎤 Voice Input Available</h3>
            <p className="text-xs text-gray-600">Click to fill form by speaking</p>
          </div>
          <Button
            onClick={startVoiceFlow}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
          >
            <Mic className="mr-2 h-4 w-4" />
            Start Voice Input
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border-2 border-green-400">
      <audio ref={audioRef} />
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <div className="text-sm font-semibold text-green-800">
            Question {currentQuestion + 1}/{questions.length}
          </div>
          <div className="text-xs text-gray-700 mt-1">
            {language === 'hi-IN' ? questions[currentQuestion].hi : questions[currentQuestion].en}
          </div>
        </div>
        <Button onClick={stopVoiceFlow} variant="ghost" size="sm">✕</Button>
      </div>

      <div className="w-full bg-gray-300 rounded-full h-1.5 mb-4">
        <div 
          className="bg-green-600 h-1.5 rounded-full transition-all"
          style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="flex flex-col items-center gap-3 py-3">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
          isRecording ? 'bg-red-500 animate-pulse' : isProcessing ? 'bg-blue-500' : 'bg-green-500'
        }`}>
          {isProcessing ? (
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          ) : isRecording ? (
            <MicOff className="h-8 w-8 text-white" />
          ) : (
            <Mic className="h-8 w-8 text-white" />
          )}
        </div>
        
        <p className="text-sm font-medium text-center">
          {isProcessing ? '🤖 Processing...' : isRecording ? '🔴 Listening... (speak now)' : '🎧 Playing question...'}
        </p>

        {status && (
          <div className="mt-2 px-3 py-1 bg-white rounded-lg text-xs font-medium">
            {status}
          </div>
        )}
      </div>
    </div>
  )
}
