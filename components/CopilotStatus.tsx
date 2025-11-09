import React from 'react'

export default function CopilotStatus() {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-charcoal to-dark-lighter text-white border border-shiftly-blue shadow-glow animate-pulse-slow">
      <div className="flex items-center justify-between mb-3">
        <div className="text-lg font-semibold">🤖 AI Copilot</div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-400">Online</span>
        </div>
      </div>
      <div className="text-shiftly-blue font-medium">
        Standing by... waiting for your command.
      </div>
      <div className="mt-3 text-xs text-steel-grey">
        GPT-4 • Memory Enabled • Voice Ready
      </div>
    </div>
  )
}
