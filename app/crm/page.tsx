'use client'

import { useState, useEffect } from 'react'
import { crmManager } from '@/lib/crm/manager'
import { CRMContact } from '@/types/crm'
import Link from 'next/link'

export default function CRMPage() {
  const [contacts, setContacts] = useState<CRMContact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    setIsLoading(true)
    const connected = crmManager.isConnected()
    setIsConnected(connected)

    if (connected) {
      try {
        const adapter = crmManager.getAdapter()
        if (adapter) {
          const data = await adapter.getContacts(50)
          setContacts(data)
        }
      } catch (error) {
        console.error('Failed to load contacts:', error)
      }
    }
    setIsLoading(false)
  }

  if (!isConnected) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          👥 CRM
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Connect your CRM to manage contacts, leads, and deals directly from PONS
          </p>
          <Link
            href="/settings"
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-600 transition"
          >
            Connect CRM in Settings
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          👥 CRM
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading contacts...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            CRM
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connected to {crmManager.getConfig()?.type.toUpperCase()}
          </p>
        </div>
        <button
          onClick={loadContacts}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Total Contacts</h3>
          <p className="text-3xl font-bold text-blue-500">{contacts.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Hot Leads</h3>
          <p className="text-3xl font-bold text-red-500">
            {contacts.filter(c => c.status === 'lead').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Customers</h3>
          <p className="text-3xl font-bold text-green-500">
            {contacts.filter(c => c.status === 'customer').length}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Recent Contacts
        </h3>
        {contacts.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No contacts found.</p>
        ) : (
          <div className="space-y-3">
            {contacts.slice(0, 20).map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {contact.firstName} {contact.lastName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {contact.email}
                    {contact.company && ` • ${contact.company}`}
                    {contact.title && ` • ${contact.title}`}
                  </p>
                </div>
                {contact.status && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    contact.status === 'lead' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                    contact.status === 'customer' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {contact.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
