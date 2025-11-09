import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

interface UserPreference {
  key: string
  value: any
  category: 'communication' | 'scheduling' | 'content' | 'general'
  learnedAt: Date
  confidence: number
}

interface ConversationContext {
  userId: string
  recentTopics: string[]
  currentIntent: string
  emotionalTone: 'positive' | 'neutral' | 'negative' | 'urgent'
  preferences: UserPreference[]
  behavioralPatterns: BehavioralPattern[]
}

interface BehavioralPattern {
  pattern: string
  frequency: number
  lastObserved: Date
  examples: string[]
}

export class ContextMemorySystem {
  private memoryCache: Map<string, ConversationContext> = new Map()
  private readonly CACHE_TTL = 30 * 60 * 1000 // 30 minutes

  /**
   * Initialize or retrieve user context
   */
  async getContext(userId: string): Promise<ConversationContext> {
    // Check cache first
    if (this.memoryCache.has(userId)) {
      return this.memoryCache.get(userId)!
    }

    // Load from database
    const { data: profile } = await supabase
      .from('profiles')
      .select('settings')
      .eq('id', userId)
      .single()

    const { data: conversations } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(10)

    const context: ConversationContext = {
      userId,
      recentTopics: this.extractTopics(conversations),
      currentIntent: 'general',
      emotionalTone: 'neutral',
      preferences: this.loadPreferences(profile?.settings || {}),
      behavioralPatterns: this.extractPatterns(conversations),
    }

    this.memoryCache.set(userId, context)
    
    // Auto-cleanup cache
    setTimeout(() => this.memoryCache.delete(userId), this.CACHE_TTL)

    return context
  }

  /**
   * Learn from user interaction
   */
  async learnFromInteraction(
    userId: string,
    interaction: {
      userMessage: string
      assistantResponse: string
      feedback?: 'positive' | 'negative'
      actionTaken?: string
    }
  ): Promise<void> {
    const context = await this.getContext(userId)

    // Extract preferences from interaction
    const newPreferences = await this.extractPreferences(interaction)
    
    for (const pref of newPreferences) {
      const existing = context.preferences.find(p => p.key === pref.key)
      if (existing) {
        // Update existing preference
        existing.value = pref.value
        existing.confidence = Math.min(1, existing.confidence + 0.1)
        existing.learnedAt = new Date()
      } else {
        // Add new preference
        context.preferences.push(pref)
      }
    }

    // Update behavioral patterns
    const patterns = await this.detectPatterns(interaction, context)
    for (const pattern of patterns) {
      const existing = context.behavioralPatterns.find(p => p.pattern === pattern.pattern)
      if (existing) {
        existing.frequency++
        existing.lastObserved = new Date()
        existing.examples.push(interaction.userMessage.substring(0, 100))
      } else {
        context.behavioralPatterns.push(pattern)
      }
    }

    // Save to database
    await this.saveContext(userId, context)
    
    // Update cache
    this.memoryCache.set(userId, context)
  }

  /**
   * Extract user preferences from conversation
   */
  private async extractPreferences(interaction: {
    userMessage: string
    assistantResponse: string
  }): Promise<UserPreference[]> {
    const preferences: UserPreference[] = []
    const message = interaction.userMessage.toLowerCase()

    // Communication style preferences
    if (message.includes('prefer') || message.includes('like to')) {
      if (message.includes('brief') || message.includes('concise') || message.includes('short')) {
        preferences.push({
          key: 'communication_style',
          value: 'concise',
          category: 'communication',
          learnedAt: new Date(),
          confidence: 0.7,
        })
      } else if (message.includes('detail') || message.includes('thorough')) {
        preferences.push({
          key: 'communication_style',
          value: 'detailed',
          category: 'communication',
          learnedAt: new Date(),
          confidence: 0.7,
        })
      }
    }

    // Scheduling preferences
    if (message.includes('morning') && message.includes('better')) {
      preferences.push({
        key: 'preferred_time',
        value: 'morning',
        category: 'scheduling',
        learnedAt: new Date(),
        confidence: 0.6,
      })
    }

    if (message.includes('evening') || message.includes('night')) {
      preferences.push({
        key: 'preferred_time',
        value: 'evening',
        category: 'scheduling',
        learnedAt: new Date(),
        confidence: 0.6,
      })
    }

    // Content preferences
    if (message.includes('focus on') || message.includes('interested in')) {
      const topicMatch = message.match(/(?:focus on|interested in)\s+([a-z\s]+)/i)
      if (topicMatch) {
        preferences.push({
          key: 'content_interest',
          value: topicMatch[1].trim(),
          category: 'content',
          learnedAt: new Date(),
          confidence: 0.8,
        })
      }
    }

    return preferences
  }

  /**
   * Detect behavioral patterns
   */
  private async detectPatterns(
    interaction: {
      userMessage: string
      assistantResponse: string
    },
    context: ConversationContext
  ): Promise<BehavioralPattern[]> {
    const patterns: BehavioralPattern[] = []
    const message = interaction.userMessage.toLowerCase()

    // Question pattern
    if (message.includes('?')) {
      patterns.push({
        pattern: 'asks_questions_frequently',
        frequency: 1,
        lastObserved: new Date(),
        examples: [message.substring(0, 100)],
      })
    }

    // Command pattern
    if (
      message.startsWith('create') ||
      message.startsWith('make') ||
      message.startsWith('generate') ||
      message.startsWith('show me')
    ) {
      patterns.push({
        pattern: 'prefers_direct_commands',
        frequency: 1,
        lastObserved: new Date(),
        examples: [message.substring(0, 100)],
      })
    }

    // Time-based pattern
    const hour = new Date().getHours()
    if (hour < 6 || hour > 22) {
      patterns.push({
        pattern: 'active_during_late_hours',
        frequency: 1,
        lastObserved: new Date(),
        examples: [`Active at ${hour}:00`],
      })
    }

    // Follow-up pattern
    if (
      message.startsWith('also') ||
      message.startsWith('and') ||
      message.includes('another')
    ) {
      patterns.push({
        pattern: 'asks_follow_up_questions',
        frequency: 1,
        lastObserved: new Date(),
        examples: [message.substring(0, 100)],
      })
    }

    return patterns
  }

  /**
   * Get personalized greeting based on context
   */
  async getPersonalizedGreeting(userId: string): Promise<string> {
    const context = await this.getContext(userId)
    const hour = new Date().getHours()
    
    let timeGreeting = 'Hello'
    if (hour < 12) timeGreeting = 'Good morning'
    else if (hour < 18) timeGreeting = 'Good afternoon'
    else timeGreeting = 'Good evening'

    // Check for patterns
    const hasActivePattern = context.behavioralPatterns.find(
      p => p.pattern === 'active_during_late_hours'
    )
    if (hasActivePattern && hour > 22) {
      timeGreeting = "Burning the midnight oil again? I'm here to help"
    }

    // Check for recent topics
    if (context.recentTopics.length > 0) {
      return `${timeGreeting}! Ready to continue working on ${context.recentTopics[0]}?`
    }

    return `${timeGreeting}! What can I help you with today?`
  }

  /**
   * Generate context-aware response suggestions
   */
  async getResponseSuggestions(
    userId: string,
    userMessage: string
  ): Promise<string[]> {
    const context = await this.getContext(userId)
    const suggestions: string[] = []

    // Based on communication style
    const stylePreference = context.preferences.find(p => p.key === 'communication_style')
    
    if (stylePreference?.value === 'concise') {
      suggestions.push('Keep response brief and to the point')
    } else if (stylePreference?.value === 'detailed') {
      suggestions.push('Provide comprehensive explanation with examples')
    }

    // Based on recent topics
    if (context.recentTopics.length > 0) {
      suggestions.push(`Reference previous discussion about ${context.recentTopics[0]}`)
    }

    // Based on behavioral patterns
    const commandPattern = context.behavioralPatterns.find(
      p => p.pattern === 'prefers_direct_commands'
    )
    if (commandPattern && commandPattern.frequency > 5) {
      suggestions.push('Provide actionable next steps')
    }

    return suggestions
  }

  /**
   * Save context to database
   */
  private async saveContext(userId: string, context: ConversationContext): Promise<void> {
    const settings = {
      preferences: context.preferences,
      behavioralPatterns: context.behavioralPatterns,
      recentTopics: context.recentTopics,
    }

    await supabase
      .from('profiles')
      .update({ settings })
      .eq('id', userId)
  }

  /**
   * Extract topics from conversation history
   */
  private extractTopics(conversations: any[]): string[] {
    if (!conversations || conversations.length === 0) return []

    const topics: string[] = []
    const keywords = ['social', 'financial', 'productivity', 'schedule', 'task', 'insights']

    for (const conv of conversations) {
      const messages = conv.messages || []
      for (const msg of messages) {
        const content = msg.content?.toLowerCase() || ''
        for (const keyword of keywords) {
          if (content.includes(keyword) && !topics.includes(keyword)) {
            topics.push(keyword)
          }
        }
      }
    }

    return topics.slice(0, 5)
  }

  /**
   * Load preferences from settings
   */
  private loadPreferences(settings: any): UserPreference[] {
    return settings.preferences || []
  }

  /**
   * Extract patterns from conversation history
   */
  private extractPatterns(conversations: any[]): BehavioralPattern[] {
    return conversations?.[0]?.context?.behavioralPatterns || []
  }

  /**
   * Clear user context (for privacy/reset)
   */
  async clearContext(userId: string): Promise<void> {
    this.memoryCache.delete(userId)
    
    await supabase
      .from('profiles')
      .update({ 
        settings: { 
          preferences: [], 
          behavioralPatterns: [], 
          recentTopics: [] 
        } 
      })
      .eq('id', userId)
  }

  /**
   * Get context summary for debugging
   */
  async getContextSummary(userId: string): Promise<string> {
    const context = await this.getContext(userId)
    
    let summary = `User Context Summary:\n\n`
    summary += `Recent Topics: ${context.recentTopics.join(', ') || 'None'}\n`
    summary += `Preferences: ${context.preferences.length} learned\n`
    summary += `Behavioral Patterns: ${context.behavioralPatterns.length} detected\n\n`
    
    if (context.preferences.length > 0) {
      summary += `Top Preferences:\n`
      context.preferences.slice(0, 3).forEach(pref => {
        summary += `- ${pref.key}: ${pref.value} (${(pref.confidence * 100).toFixed(0)}% confidence)\n`
      })
    }
    
    if (context.behavioralPatterns.length > 0) {
      summary += `\nTop Patterns:\n`
      context.behavioralPatterns
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 3)
        .forEach(pattern => {
          summary += `- ${pattern.pattern}: observed ${pattern.frequency} times\n`
        })
    }
    
    return summary
  }
}
