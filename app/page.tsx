'use client'

import { useSession } from 'next-auth/react'
import ModernDashboard from '@/components/ModernDashboard'
import Sidebar from '@/components/Sidebar'
import TopNavbar from '@/components/TopNavbar'

export default function HomePage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading PONS AI OS...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center max-w-md px-6">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">PONS AI OS</h1>
          <p className="text-xl text-slate-600 mb-8">Your Intelligent Operating System</p>
          <a
            href="/auth/signin"
            className="inline-block px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Sign In to Continue
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto">
          <ModernDashboard />
        </main>
      </div>
    </div>
  )
}
