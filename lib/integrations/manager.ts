import { IntegrationConfig, IIntegrationAdapter, ISocialMediaAdapter, IFinancialAdapter, PersonalInsights } from '@/types/integrations'
import { TwitterAdapter, InstagramAdapter, LinkedInAdapter, FacebookAdapter, TikTokAdapter, YouTubeAdapter } from './social'
import { PlaidAdapter, StripeAdapter, PayPalAdapter } from './financial'
import { GoogleCalendarAdapter, NotionAdapter, GmailAdapter, SpotifyAdapter } from './productivity'

export class IntegrationManager {
  private static instance: IntegrationManager
  private integrations: Map<string, IIntegrationAdapter> = new Map()
  private config: Map<string, IntegrationConfig> = new Map()

  private constructor() {
    this.loadFromStorage()
  }

  static getInstance(): IntegrationManager {
    if (!IntegrationManager.instance) {
      IntegrationManager.instance = new IntegrationManager()
    }
    return IntegrationManager.instance
  }

  async connect(config: IntegrationConfig): Promise<boolean> {
    try {
      const adapter = this.createAdapter(config.type)
      const connected = await adapter.connect(config)
      
      if (connected) {
        this.integrations.set(config.type, adapter)
        this.config.set(config.type, config)
        this.saveToStorage()
      }
      
      return connected
    } catch (error) {
      console.error(`Failed to connect to ${config.type}:`, error)
      return false
    }
  }

  async disconnect(type: string): Promise<void> {
    const adapter = this.integrations.get(type)
    if (adapter) {
      await adapter.disconnect()
      this.integrations.delete(type)
      this.config.delete(type)
      this.saveToStorage()
    }
  }

  getAdapter(type: string): IIntegrationAdapter | undefined {
    return this.integrations.get(type)
  }

  getSocialAdapter(type: 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'tiktok' | 'youtube'): ISocialMediaAdapter | undefined {
    return this.integrations.get(type) as ISocialMediaAdapter
  }

  getFinancialAdapter(type: 'plaid' | 'stripe' | 'paypal'): IFinancialAdapter | undefined {
    return this.integrations.get(type) as IFinancialAdapter
  }

  getProductivityAdapter(type: 'google-calendar' | 'notion' | 'gmail' | 'spotify'): any | undefined {
    return this.integrations.get(type)
  }

  isConnected(type: string): boolean {
    const adapter = this.integrations.get(type)
    return adapter ? adapter.isConnected() : false
  }

  getConnectedIntegrations(): IntegrationConfig[] {
    return Array.from(this.config.values())
  }

  async syncAll(): Promise<void> {
    const syncPromises = Array.from(this.integrations.values()).map(adapter =>
      adapter.sync().catch(err => console.error('Sync failed:', err))
    )
    await Promise.all(syncPromises)
  }

  async getPersonalInsights(): Promise<PersonalInsights> {
    const insights: PersonalInsights = {}

    // Collect social media data
    const socialTypes = ['twitter', 'instagram', 'linkedin', 'facebook']
    const socialProfiles: any[] = []
    let totalFollowers = 0
    let totalEngagement = 0
    
    for (const type of socialTypes) {
      const adapter = this.getSocialAdapter(type as any)
      if (adapter && adapter.isConnected()) {
        try {
          const profile = await adapter.getProfile()
          socialProfiles.push(profile)
          totalFollowers += profile.followers
          
          const analytics = await adapter.getAnalytics(30)
          totalEngagement += analytics.totalEngagement
        } catch (error) {
          console.error(`Failed to fetch ${type} data:`, error)
        }
      }
    }

    if (socialProfiles.length > 0) {
      insights.socialPresence = {
        platforms: socialProfiles,
        totalFollowers,
        engagementRate: totalFollowers > 0 ? (totalEngagement / totalFollowers) * 100 : 0,
        contentThemes: ['Business', 'Technology', 'Lifestyle'], // TODO: AI-powered theme detection
      }
    }

    // Collect financial data
    const plaid = this.getFinancialAdapter('plaid')
    if (plaid && plaid.isConnected()) {
      try {
        const summary = await plaid.getSummary(30)
        insights.financialHealth = {
          netWorth: summary.totalBalance,
          cashFlow: summary.totalIncome - summary.totalExpenses,
          debtToIncome: 0, // TODO: Calculate from transaction patterns
          savingsGoals: [], // TODO: Define and track savings goals
        }
      } catch (error) {
        console.error('Failed to fetch financial data:', error)
      }
    }

    return insights
  }

  private createAdapter(type: string): IIntegrationAdapter {
    switch (type) {
      case 'twitter':
        return new TwitterAdapter()
      case 'instagram':
        return new InstagramAdapter()
      case 'linkedin':
        return new LinkedInAdapter()
      case 'facebook':
        return new FacebookAdapter()
      case 'tiktok':
        return new TikTokAdapter()
      case 'youtube':
        return new YouTubeAdapter()
      case 'plaid':
        return new PlaidAdapter()
      case 'stripe':
        return new StripeAdapter()
      case 'paypal':
        return new PayPalAdapter()
      case 'google-calendar':
        return new GoogleCalendarAdapter()
      case 'notion':
        return new NotionAdapter()
      case 'gmail':
        return new GmailAdapter()
      case 'spotify':
        return new SpotifyAdapter()
      default:
        throw new Error(`Unknown integration type: ${type}`)
    }
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return

    const stored = localStorage.getItem('pons_integrations')
    if (stored) {
      try {
        const configs: IntegrationConfig[] = JSON.parse(stored)
        configs.forEach(config => {
          this.connect(config)
        })
      } catch (error) {
        console.error('Failed to load integrations:', error)
      }
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return

    const configs = Array.from(this.config.values())
    localStorage.setItem('pons_integrations', JSON.stringify(configs))
  }
}
