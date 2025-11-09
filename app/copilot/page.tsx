'use client'

import { useState, useRef, useEffect } from 'react'
import { runAgent } from '@/lib/api'
import { useSpeechRecognition, useSpeechSynthesis } from '@/lib/useSpeech'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI Copilot. How can I assist you today?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { isListening, transcript, startListening, stopListening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition()
  const { speak, stop: stopSpeaking } = useSpeechSynthesis()

  // Update input when transcript changes
  useEffect(() => {
    if (transcript) {
      setInput(transcript)
    }
  }, [transcript])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Stop listening if voice is active
    if (isListening) {
      stopListening()
    }
    stopSpeaking()

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    resetTranscript()
    setIsLoading(true)

    try {
      const response = await runAgent(input.trim())
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      
      // Speak the response if voice is enabled
      if (voiceEnabled) {
        speak(response)
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening()
    } else {
      resetTranscript()
      startListening()
    }
  }

  const toggleVoiceOutput = () => {
    setVoiceEnabled(!voiceEnabled)
    if (voiceEnabled) {
      stopSpeaking()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              🤖 AI Copilot
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your intelligent assistant with memory
            </p>
          </div>
          
          {/* Voice Controls */}
          {browserSupportsSpeechRecognition && (
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleVoiceOutput}
                className={`p-2 rounded-lg transition-all ${
                  voiceEnabled 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
                title={voiceEnabled ? 'Voice output enabled' : 'Voice output disabled'}
              >
                <span className="text-sm">{voiceEnabled ? '🔊' : '🔇'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl px-6 py-4 shadow-lg max-w-3xl">
              <div className="flex space-x-2">
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 md:px-8 py-4 md:py-6">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex space-x-2 md:space-x-4">
            {/* Voice Input Button */}
            {browserSupportsSpeechRecognition && (
              <button
                type="button"
                onClick={toggleVoiceInput}
                disabled={isLoading}
                className={`flex-shrink-0 p-2 md:p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                <span className="text-base md:text-lg">{isListening ? '🎤' : '🎙️'}</span>
              </button>
            )}
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? 'Listening...' : 'Ask me anything or use voice...'}
              disabled={isLoading}
              className="flex-1 px-4 md:px-6 py-3 md:py-4 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 disabled:opacity-50 text-sm md:text-base"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex-shrink-0 px-4 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm md:text-base"
            >
              Send
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
            {browserSupportsSpeechRecognition 
              ? '🎤 Voice commands enabled • Powered by GPT-4 with memory'
              : 'Powered by GPT-4 with memory and context awareness'
            }
          </p>
        </form>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-gray-700 dark:bg-gray-600' 
          : 'bg-gradient-to-r from-blue-500 to-purple-500'
      }`}>
        <span className="text-white text-sm font-bold">
          {isUser ? 'You' : 'AI'}
        </span>
      </div>
      <div className={`rounded-2xl px-6 py-4 shadow-lg max-w-3xl ${
        isUser 
          ? 'bg-gray-700 dark:bg-gray-600 text-white' 
          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
      }`}>
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p className={`text-xs mt-2 ${
          isUser ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'
        }`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}
