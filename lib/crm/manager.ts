import { ICRMAdapter, CRMConfig } from '@/types/crm'
import { HubSpotAdapter } from './hubspot'
import { SalesforceAdapter } from './salesforce'

class CRMManager {
  private adapter: ICRMAdapter | null = null
  private config: CRMConfig | null = null

  async connect(config: CRMConfig): Promise<boolean> {
    try {
      // Create appropriate adapter based on CRM type
      switch (config.type) {
        case 'hubspot':
          this.adapter = new HubSpotAdapter()
          break
        case 'salesforce':
          this.adapter = new SalesforceAdapter()
          break
        case 'pipedrive':
          // this.adapter = new PipedriveAdapter()
          throw new Error('Pipedrive adapter coming soon')
        case 'custom':
          throw new Error('Custom adapter not implemented')
        default:
          throw new Error(`Unknown CRM type: ${config.type}`)
      }

      const connected = await this.adapter.connect(config)
      if (connected) {
        this.config = config
        // Save to localStorage for persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('crm_config', JSON.stringify(config))
        }
      }
      return connected
    } catch (error) {
      console.error('CRM connection failed:', error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    if (this.adapter) {
      await this.adapter.disconnect()
      this.adapter = null
      this.config = null
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('crm_config')
      }
    }
  }

  getAdapter(): ICRMAdapter | null {
    return this.adapter
  }

  isConnected(): boolean {
    return this.adapter?.isConnected() || false
  }

  getConfig(): CRMConfig | null {
    return this.config
  }

  // Load saved configuration from localStorage
  async loadSavedConnection(): Promise<boolean> {
    if (typeof window === 'undefined') return false

    const savedConfig = localStorage.getItem('crm_config')
    if (!savedConfig) return false

    try {
      const config = JSON.parse(savedConfig) as CRMConfig
      return await this.connect(config)
    } catch (error) {
      console.error('Failed to load saved CRM connection:', error)
      return false
    }
  }
}

// Export singleton instance
export const crmManager = new CRMManager()
