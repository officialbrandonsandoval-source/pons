'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  ChatBubbleLeftRightIcon, 
  UserGroupIcon, 
  FolderIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  LockClosedIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/20/solid'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Copilot', href: '/copilot', icon: ChatBubbleLeftRightIcon },
  { name: 'CRM', href: '/crm', icon: UserGroupIcon },
  { name: 'Projects', href: '/projects', icon: FolderIcon },
  { name: 'Tasks', href: '/tasks', icon: CheckCircleIcon },
  { name: 'Content', href: '/content', icon: DocumentTextIcon },
  { name: 'Vault', href: '/vault', icon: LockClosedIcon },
  { name: 'Financials', href: '/financials', icon: CurrencyDollarIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-gray-900 text-white rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className={`fixed lg:relative inset-y-0 left-0 z-40 flex h-screen w-64 flex-col bg-gray-900 text-white transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex h-16 items-center justify-center border-b border-gray-800">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            PONS
          </h1>
        </div>

        <nav className="flex-1 space-y-1 px-2 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
              >
                <item.icon className={`mr-3 h-2.5 w-2.5 flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-300'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-gray-800 p-4">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium">Elite Operator</p>
              <p className="text-xs text-gray-400">AI-Powered</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
