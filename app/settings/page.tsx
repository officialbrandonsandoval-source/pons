'use client'

import { useState, useEffect } from 'react'
import { crmManager } from '@/lib/crm/manager'
import { CRMConfig } from '@/types/crm'
import { IntegrationManager } from '@/lib/integrations/manager'
import { IntegrationConfig, IntegrationType } from '@/types/integrations'

export default function SettingsPage() {
  const [crmType, setCrmType] = useState<'hubspot' | 'salesforce' | 'pipedrive' | 'custom'>('hubspot')
  const [apiKey, setApiKey] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [domain, setDomain] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionMessage, setConnectionMessage] = useState('')
  
  // Integration states
  const [selectedIntegrationType, setSelectedIntegrationType] = useState<IntegrationType>('twitter')
  const [integrationToken, setIntegrationToken] = useState('')
  const [integrationUserId, setIntegrationUserId] = useState('')
  const [connectedIntegrations, setConnectedIntegrations] = useState<IntegrationConfig[]>([])
  const integrationManager = IntegrationManager.getInstance()

  useEffect(() => {
    // Check if already connected
    setIsConnected(crmManager.isConnected())
    const config = crmManager.getConfig()
    if (config) {
      setCrmType(config.type)
    }
    
    // Load connected integrations
    setConnectedIntegrations(integrationManager.getConnectedIntegrations())
  }, [])

  const handleConnect = async () => {
    setIsConnecting(true)
    setConnectionMessage('')

    const config: CRMConfig = {
      type: crmType,
      apiKey: crmType === 'hubspot' ? apiKey : undefined,
      accessToken: crmType === 'salesforce' ? accessToken : undefined,
      domain: crmType === 'salesforce' ? domain : undefined,
    }

    const success = await crmManager.connect(config)
    
    if (success) {
      setIsConnected(true)
      setConnectionMessage('✅ Successfully connected to ' + crmType.toUpperCase())
      // Clear sensitive data from state
      setApiKey('')
      setAccessToken('')
    } else {
      setConnectionMessage('❌ Failed to connect. Please check your credentials.')
    }

    setIsConnecting(false)
  }

  const handleDisconnect = async () => {
    await crmManager.disconnect()
    setIsConnected(false)
    setConnectionMessage('Disconnected from CRM')
  }

  const handleConnectIntegration = async () => {
    const config: IntegrationConfig = {
      type: selectedIntegrationType,
      accessToken: integrationToken,
      enabled: true,
    }

    const success = await integrationManager.connect(config)
    
    if (success) {
      setConnectedIntegrations(integrationManager.getConnectedIntegrations())
      setIntegrationToken('')
      setIntegrationUserId('')
      setConnectionMessage(`✅ Successfully connected to ${selectedIntegrationType}`)
    } else {
      setConnectionMessage(`❌ Failed to connect to ${selectedIntegrationType}`)
    }
  }

  const handleDisconnectIntegration = async (type: string) => {
    await integrationManager.disconnect(type)
    setConnectedIntegrations(integrationManager.getConnectedIntegrations())
    setConnectionMessage(`Disconnected from ${type}`)
  }
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Settings
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Configure your PONS experience
      </p>
      
      <div className="space-y-6">
        {/* CRM Integration Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            🔗 CRM Integration
          </h3>
          
          {isConnected ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                <p className="text-green-800 dark:text-green-200 font-medium">
                  ✅ Connected to {crmType.toUpperCase()}
                </p>
              </div>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select CRM Platform
                </label>
                <select
                  value={crmType}
                  onChange={(e) => setCrmType(e.target.value as any)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="hubspot">HubSpot</option>
                  <option value="salesforce">Salesforce</option>
                  <option value="pipedrive">Pipedrive (Coming Soon)</option>
                </select>
              </div>

              {crmType === 'hubspot' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    HubSpot API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your HubSpot API key"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Get your API key from HubSpot Settings → Integrations → API Key
                  </p>
                </div>
              )}

              {crmType === 'salesforce' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Salesforce Instance URL
                    </label>
                    <input
                      type="text"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="https://your-instance.salesforce.com"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Access Token
                    </label>
                    <input
                      type="password"
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      placeholder="Enter your Salesforce access token"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                    />
                  </div>
                </>
              )}

              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 transition"
              >
                {isConnecting ? 'Connecting...' : 'Connect CRM'}
              </button>

              {connectionMessage && (
                <p className={`text-sm ${connectionMessage.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                  {connectionMessage}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Social Media & Financial Integrations */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            🌐 Personal Data Integrations
          </h3>
          
          {/* Connected Integrations */}
          {connectedIntegrations.length > 0 && (
            <div className="mb-6 space-y-2">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Connected Services
              </h4>
              {connectedIntegrations.map((integration) => (
                <div
                  key={integration.type}
                  className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {integration.type}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDisconnectIntegration(integration.type)}
                    className="text-xs px-3 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                  >
                    Disconnect
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Integration */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Platform
              </label>
              <select
                value={selectedIntegrationType}
                onChange={(e) => setSelectedIntegrationType(e.target.value as IntegrationType)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              >
                <optgroup label="Social Media">
                  <option value="twitter">Twitter (𝕏)</option>
                  <option value="instagram">Instagram</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="facebook">Facebook</option>
                  <option value="tiktok">TikTok (Coming Soon)</option>
                  <option value="youtube">YouTube (Coming Soon)</option>
                </optgroup>
                <optgroup label="Financial">
                  <option value="plaid">Plaid (Banking)</option>
                  <option value="stripe">Stripe (Coming Soon)</option>
                  <option value="paypal">PayPal (Coming Soon)</option>
                </optgroup>
                <optgroup label="Productivity">
                  <option value="google-calendar">Google Calendar (Coming Soon)</option>
                  <option value="notion">Notion (Coming Soon)</option>
                  <option value="github">GitHub (Coming Soon)</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Access Token / API Key
              </label>
              <input
                type="password"
                value={integrationToken}
                onChange={(e) => setIntegrationToken(e.target.value)}
                placeholder="Enter your API key or access token"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                {selectedIntegrationType === 'twitter' && 'Get your Bearer Token from Twitter Developer Portal'}
                {selectedIntegrationType === 'instagram' && 'Get your token from Facebook Developer Portal'}
                {selectedIntegrationType === 'linkedin' && 'Get your token from LinkedIn Developer Portal'}
                {selectedIntegrationType === 'facebook' && 'Get your token from Facebook Developer Portal'}
                {selectedIntegrationType === 'plaid' && 'Get your access token from Plaid Dashboard'}
              </p>
            </div>

            <button
              onClick={handleConnectIntegration}
              disabled={!integrationToken}
              className="w-full px-4 py-2 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-medium rounded-lg hover:from-sky-600 hover:to-cyan-600 disabled:opacity-50 transition"
            >
              Connect {selectedIntegrationType}
            </button>
          </div>
        </div>

        <SettingsSection title="Profile">
          <SettingItem label="Name" value="Elite Operator" />
          <SettingItem label="Email" value="elite@example.com" />
          <SettingItem label="Role" value="Founder & CEO" />
        </SettingsSection>
        
        <SettingsSection title="AI Configuration">
          <SettingItem label="Model" value="GPT-4 Turbo" />
          <SettingItem label="Temperature" value="0.7" />
          <SettingItem label="Memory Enabled" value="Yes" />
        </SettingsSection>
        
        <SettingsSection title="Integrations">
          <SettingItem 
            label="OpenAI" 
            value={typeof window !== 'undefined' && process.env.NEXT_PUBLIC_OPENAI_API_KEY ? 'Connected' : 'Not Connected'} 
          />
          <SettingItem 
            label="CRM" 
            value={isConnected ? 'Connected' : 'Not Connected'} 
          />
          <SettingItem label="Calendar" value="Not Connected" />
        </SettingsSection>
        
        <SettingsSection title="Preferences">
          <SettingItem label="Theme" value="Dark Mode" />
          <SettingItem label="Notifications" value="Enabled" />
          <SettingItem label="Language" value="English" />
        </SettingsSection>
      </div>
    </div>
  )
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{title}</h3>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  )
}

function SettingItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <span className="text-gray-700 dark:text-gray-300">{label}</span>
      <span className="font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  )
}
