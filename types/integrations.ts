// Integration Types for Personal Data Sources

export type IntegrationType = 
  | 'twitter' 
  | 'instagram' 
  | 'linkedin' 
  | 'facebook'
  | 'tiktok'
  | 'youtube'
  | 'plaid' // Banking aggregator
  | 'stripe'
  | 'paypal'
  | 'google-calendar'
  | 'notion'
  | 'spotify'
  | 'github'
  | 'gmail'
  | 'custom'

export interface IntegrationConfig {
  type: IntegrationType
  accessToken?: string
  refreshToken?: string
  apiKey?: string
  clientId?: string
  clientSecret?: string
  webhookUrl?: string
  customEndpoint?: string
  enabled: boolean
}

// Social Media Types
export interface SocialProfile {
  id: string
  platform: IntegrationType
  username: string
  displayName: string
  followers: number
  following: number
  bio?: string
  profileImage?: string
  verified: boolean
}

export interface SocialPost {
  id: string
  platform: IntegrationType
  content: string
  timestamp: Date
  likes: number
  comments: number
  shares: number
  engagement: number
  media?: string[]
}

export interface SocialAnalytics {
  platform: IntegrationType
  totalPosts: number
  totalEngagement: number
  averageLikes: number
  topPosts: SocialPost[]
  bestPostingTimes: string[]
  audienceGrowth: number
}

// Financial Types
export interface BankAccount {
  id: string
  institution: string
  accountType: 'checking' | 'savings' | 'credit' | 'investment'
  balance: number
  currency: string
  lastSync: Date
}

export interface Transaction {
  id: string
  accountId: string
  date: Date
  amount: number
  description: string
  category: string
  merchant?: string
  pending: boolean
}

export interface FinancialSummary {
  totalBalance: number
  totalIncome: number
  totalExpenses: number
  monthlyBurn: number
  savingsRate: number
  topCategories: { category: string; amount: number }[]
  recurringCharges: Transaction[]
}

// Calendar & Productivity
export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: Date
  end: Date
  location?: string
  attendees?: string[]
  status: 'confirmed' | 'tentative' | 'cancelled'
}

export interface ProductivityStats {
  totalMeetings: number
  meetingHours: number
  focusTime: number
  tasksCompleted: number
  productivityScore: number
}

// Personal Data Insights
export interface PersonalInsights {
  // Social Media
  socialPresence?: {
    platforms: SocialProfile[]
    totalFollowers: number
    engagementRate: number
    contentThemes: string[]
  }
  
  // Financial
  financialHealth?: {
    netWorth: number
    cashFlow: number
    debtToIncome: number
    savingsGoals: { name: string; progress: number }[]
  }
  
  // Productivity
  productivity?: {
    peakHours: string[]
    averageTasksPerDay: number
    meetingLoad: string
    workLifeBalance: number
  }
  
  // Behavioral Patterns
  patterns?: {
    activeHours: string[]
    communication: string
    spendingHabits: string[]
    interests: string[]
  }
}

// Integration Adapter Interface
export interface IIntegrationAdapter {
  connect(config: IntegrationConfig): Promise<boolean>
  disconnect(): Promise<void>
  isConnected(): boolean
  sync(): Promise<void>
  getInsights(): Promise<any>
}

// Social Media Adapter
export interface ISocialMediaAdapter extends IIntegrationAdapter {
  getProfile(): Promise<SocialProfile>
  getPosts(limit?: number): Promise<SocialPost[]>
  getAnalytics(days?: number): Promise<SocialAnalytics>
  createPost(content: string, media?: string[]): Promise<SocialPost>
}

// Financial Adapter
export interface IFinancialAdapter extends IIntegrationAdapter {
  getAccounts(): Promise<BankAccount[]>
  getTransactions(accountId?: string, days?: number): Promise<Transaction[]>
  getSummary(days?: number): Promise<FinancialSummary>
  categorizeTransaction(transaction: Transaction): Promise<string>
}

// Calendar Adapter
export interface ICalendarAdapter extends IIntegrationAdapter {
  getEvents(days?: number): Promise<CalendarEvent[]>
  createEvent(event: Partial<CalendarEvent>): Promise<CalendarEvent>
  getProductivityStats(days?: number): Promise<ProductivityStats>
}
