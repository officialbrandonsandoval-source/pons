'use client'

import { useState, useRef } from 'react'
import { MicrophoneIcon, StopIcon, PhotoIcon } from '@heroicons/react/24/solid'

export default function MultiModalInterface() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [imageAnalysis, setImageAnalysis] = useState('')
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await transcribeAudio(audioBlob)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsProcessing(true)
    setTranscript('')
    setResponse('')

    try {
      // Transcribe audio
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const transcribeResponse = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      })

      const transcribeData = await transcribeResponse.json()

      if (transcribeData.success) {
        setTranscript(transcribeData.text)

        // Send to PONS agent
        const agentResponse = await fetch('/api/copilot/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: transcribeData.text }),
        })

        const agentData = await agentResponse.json()

        if (agentData.response) {
          setResponse(agentData.response)

          // Synthesize response to speech
          const synthesizeResponse = await fetch('/api/voice/synthesize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: agentData.response }),
          })

          if (synthesizeResponse.ok) {
            const audioBlob = await synthesizeResponse.blob()
            const audioUrl = URL.createObjectURL(audioBlob)
            const audio = new Audio(audioUrl)
            audio.play()
          }
        }
      }
    } catch (error) {
      console.error('Error processing audio:', error)
      alert('Failed to process audio')
    } finally {
      setIsProcessing(false)
    }
  }

  const analyzeImage = async (file: File) => {
    setIsProcessing(true)
    setImageAnalysis('')

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('prompt', 'Analyze this image and describe what you see in detail.')

      const response = await fetch('/api/vision/analyze', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setImageAnalysis(data.analysis)

        // Optionally speak the analysis
        const synthesizeResponse = await fetch('/api/voice/synthesize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: data.analysis }),
        })

        if (synthesizeResponse.ok) {
          const audioBlob = await synthesizeResponse.blob()
          const audioUrl = URL.createObjectURL(audioBlob)
          const audio = new Audio(audioUrl)
          audio.play()
        }
      }
    } catch (error) {
      console.error('Error analyzing image:', error)
      alert('Failed to analyze image')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      analyzeImage(file)
    }
  }

  return (
    <div className="space-y-6">
      {/* Voice Interface */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span>🎤</span> Voice Interface
        </h3>

        <div className="flex items-center justify-center gap-4 mb-6">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isProcessing}
              className="p-6 bg-sky-500 hover:bg-sky-600 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MicrophoneIcon className="w-8 h-8 text-white" />
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="p-6 bg-red-500 hover:bg-red-600 rounded-full animate-pulse"
            >
              <StopIcon className="w-8 h-8 text-white" />
            </button>
          )}
        </div>

        <div className="text-center mb-4">
          {isRecording && (
            <p className="text-sky-400 animate-pulse">Listening...</p>
          )}
          {isProcessing && (
            <p className="text-yellow-400">Processing...</p>
          )}
          {!isRecording && !isProcessing && (
            <p className="text-gray-400">Click the microphone to start speaking</p>
          )}
        </div>

        {transcript && (
          <div className="bg-gray-900 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-gray-400 mb-2">You said:</p>
            <p className="text-white">{transcript}</p>
          </div>
        )}

        {response && (
          <div className="bg-sky-500/10 border border-sky-500 rounded-lg p-4">
            <p className="text-sm font-semibold text-sky-400 mb-2">PONS:</p>
            <p className="text-white whitespace-pre-wrap">{response}</p>
          </div>
        )}
      </div>

      {/* Vision Interface */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span>👁️</span> Vision Analysis
        </h3>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="w-full p-4 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <PhotoIcon className="w-6 h-6" />
          <span>Upload Image to Analyze</span>
        </button>

        {imageAnalysis && (
          <div className="mt-4 bg-purple-500/10 border border-purple-500 rounded-lg p-4">
            <p className="text-sm font-semibold text-purple-400 mb-2">Analysis:</p>
            <p className="text-white whitespace-pre-wrap">{imageAnalysis}</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
        <h4 className="font-semibold text-white mb-2">💡 Tips:</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Voice commands are automatically transcribed and processed by PONS</li>
          <li>• Responses are spoken aloud using natural text-to-speech</li>
          <li>• Upload images for visual analysis and description</li>
          <li>• Try commands like "Give me insights", "What should I do today?", or "Predict my week"</li>
        </ul>
      </div>
    </div>
  )
}
