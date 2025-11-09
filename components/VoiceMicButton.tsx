'use client'
// 🧠 COMPONENT: <VoiceMicButton />
// PURPOSE: Floating circular button to activate voice command input
// - Bottom right of screen
// - Click → starts voice capture
// - Use Heroicons mic icon or similar

// 🎨 STYLE:
// - Circle button with glowing border (blue)
// - Animated pulse when active
// - Tooltip: “Talk to PONS”

import { useState } from 'react'
import Link from 'next/link'

export default function VoiceMicButton() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link
      href="/copilot"
      className="fixed bottom-8 right-8 z-50 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button className="w-16 h-16 rounded-full bg-gradient-to-r from-shiftly-blue to-primary-light text-white shadow-glow hover:shadow-glow-lg hover:scale-110 transition-all duration-300 flex items-center justify-center">
        <span className="text-2xl">🎤</span>
      </button>
      
      {isHovered && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-charcoal text-snow-white text-sm rounded-lg whitespace-nowrap shadow-lg">
          Voice Command
        </div>
      )}
    </Link>
  )
}
