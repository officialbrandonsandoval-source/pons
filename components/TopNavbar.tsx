'use client'

import { useState, useEffect } from 'react'

export default function TopNavbar() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="w-full px-6 py-4 bg-white dark:bg-charcoal shadow-lg flex justify-between items-center border-b border-steel-grey/20">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-shiftly-blue to-primary-light bg-clip-text text-transparent">
          PONS
        </h1>
        <div className="hidden md:block text-sm text-steel-grey">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      <div className="text-sm text-steel-grey">
        {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
      </div>
      
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-xl bg-shiftly-blue/10 hover:bg-shiftly-blue/20 text-shiftly-blue hover:shadow-glow-sm transition-all">
          <span className="text-lg">🎤</span>
        </button>
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-shiftly-blue to-primary-light flex items-center justify-center font-bold text-white shadow-glow cursor-pointer hover:shadow-glow-lg transition-all">
            EO
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-charcoal"></div>
        </div>
      </div>
    </div>
  )
}
