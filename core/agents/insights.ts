import { IntegrationManager } from '@/lib/integrations/manager'
import { PersonalInsights } from '@/types/integrations'

export class InsightsEngine {
  private static instance: InsightsEngine
  private integrationManager = IntegrationManager.getInstance()
  private cachedInsights: PersonalInsights | null = null
  private lastUpdate: Date | null = null

  private constructor() {}

  static getInstance(): InsightsEngine {
    if (!InsightsEngine.instance) {
      InsightsEngine.instance = new InsightsEngine()
    }
    return InsightsEngine.instance
  }

  async getInsights(forceRefresh = false): Promise<PersonalInsights> {
    // Return cached if recent (< 1 hour old)
    if (
      !forceRefresh &&
      this.cachedInsights &&
      this.lastUpdate &&
      Date.now() - this.lastUpdate.getTime() < 60 * 60 * 1000
    ) {
      return this.cachedInsights
    }

    const insights = await this.integrationManager.getPersonalInsights()
    this.cachedInsights = insights
    this.lastUpdate = new Date()

    return insights
  }

  async getAIContext(): Promise<string> {
    const insights = await this.getInsights()
    const contextParts: string[] = []

    // Social presence context
    if (insights.socialPresence) {
      const { platforms, totalFollowers, engagementRate, contentThemes } = insights.socialPresence
      contextParts.push(
        `Social Media Presence: Active on ${platforms.length} platform(s) with ${totalFollowers} total followers and ${engagementRate.toFixed(2)}% engagement rate. Primary content themes: ${contentThemes.join(', ')}.`
      )
      
      platforms.forEach(profile => {
        contextParts.push(
          `${profile.platform}: ${profile.followersCount} followers, ${profile.postsCount} posts`
        )
      })
    }

    // Financial context
    if (insights.financialHealth) {
      const { netWorth, cashFlow, debtToIncome, savingsGoals } = insights.financialHealth
      contextParts.push(
        `Financial Health: Net worth of $${netWorth.toLocaleString()}, monthly cash flow of $${cashFlow.toLocaleString()}, debt-to-income ratio of ${debtToIncome}%.`
      )
      
      if (savingsGoals.length > 0) {
        contextParts.push(
          `Savings Goals: ${savingsGoals.map(g => `${g.name} (${g.progress}%)`).join(', ')}`
        )
      }
    }

    // Productivity context
    if (insights.productivity) {
      const { peakHours, averageTasksPerDay, meetingLoad, workLifeBalance } = insights.productivity
      contextParts.push(
        `Productivity: Peak hours at ${peakHours.join(', ')}, completes ~${averageTasksPerDay} tasks/day, ${meetingLoad} meeting load, work-life balance score ${workLifeBalance}/10.`
      )
    }

    // Behavioral patterns
    if (insights.patterns) {
      const { activeHours, communicationStyle, spendingHabits, interests } = insights.patterns
      contextParts.push(
        `Behavioral Patterns: Most active during ${activeHours.join(', ')}, ${communicationStyle} communication style, interests include ${interests.join(', ')}.`
      )
      
      if (spendingHabits.length > 0) {
        contextParts.push(`Spending Habits: ${spendingHabits.join(', ')}`)
      }
    }

    // Goals context
    if (insights.goals) {
      const { shortTerm, longTerm, priorities } = insights.goals
      contextParts.push(
        `Goals: Short-term focus on ${shortTerm.join(', ')}. Long-term aspirations: ${longTerm.join(', ')}. Top priorities: ${priorities.join(', ')}.`
      )
    }

    return contextParts.length > 0
      ? '\n\n=== PERSONAL CONTEXT ===\n' + contextParts.join('\n') + '\n=== END CONTEXT ==='
      : ''
  }

  async analyzeSpendingPatterns(): Promise<string[]> {
    const plaid = this.integrationManager.getFinancialAdapter('plaid')
    if (!plaid || !plaid.isConnected()) {
      return []
    }

    try {
      const summary = await plaid.getSummary(30)
      const patterns: string[] = []

      // Analyze spending categories
      if (summary.topCategories.length > 0) {
        const topCategory = summary.topCategories[0]
        patterns.push(`Highest spending in ${topCategory.category}: $${topCategory.amount.toFixed(2)}`)
      }

      // Analyze recurring charges
      if (summary.recurringCharges.length > 0) {
        const totalRecurring = summary.recurringCharges.reduce((sum, charge) => sum + charge.amount, 0)
        patterns.push(`${summary.recurringCharges.length} recurring charges totaling $${totalRecurring.toFixed(2)}/month`)
      }

      // Savings rate analysis
      if (summary.savingsRate > 0) {
        patterns.push(`Savings rate: ${summary.savingsRate.toFixed(1)}%`)
      } else {
        patterns.push('Spending exceeds income - consider budget adjustments')
      }

      return patterns
    } catch (error) {
      console.error('Failed to analyze spending patterns:', error)
      return []
    }
  }

  async analyzeSocialEngagement(): Promise<string[]> {
    const insights = await this.getInsights()
    const engagement: string[] = []

    if (!insights.socialPresence) {
      return []
    }

    const { platforms, totalFollowers, engagementRate } = insights.socialPresence

    // Overall social performance
    engagement.push(
      `Total reach: ${totalFollowers} followers across ${platforms.length} platform(s)`
    )
    engagement.push(`Average engagement rate: ${engagementRate.toFixed(2)}%`)

    // Compare platforms
    const sortedPlatforms = platforms.sort((a, b) => b.followersCount - a.followersCount)
    if (sortedPlatforms.length > 0) {
      engagement.push(
        `Strongest platform: ${sortedPlatforms[0].platform} with ${sortedPlatforms[0].followersCount} followers`
      )
    }

    return engagement
  }

  async generateRecommendations(): Promise<string[]> {
    const insights = await this.getInsights()
    const recommendations: string[] = []

    // Financial recommendations
    if (insights.financialHealth) {
      const { cashFlow, savingsRate } = insights.financialHealth
      
      if (cashFlow < 0) {
        recommendations.push('🚨 Negative cash flow detected - review expenses and increase income')
      }
      
      if (savingsRate < 10) {
        recommendations.push('💰 Increase savings rate to at least 10% of income')
      } else if (savingsRate > 30) {
        recommendations.push('✅ Excellent savings rate - consider investing surplus')
      }
    }

    // Social recommendations
    if (insights.socialPresence) {
      const { engagementRate } = insights.socialPresence
      
      if (engagementRate < 1) {
        recommendations.push('📱 Post more engaging content - engagement rate is below 1%')
      } else if (engagementRate > 5) {
        recommendations.push('🔥 Great engagement rate - keep up the quality content')
      }
    }

    // Productivity recommendations
    if (insights.productivity) {
      const { workLifeBalance, meetingLoad } = insights.productivity
      
      if (workLifeBalance < 5) {
        recommendations.push('⚖️ Work-life balance is low - schedule more personal time')
      }
      
      if (meetingLoad === 'high') {
        recommendations.push('📅 Meeting load is high - consider declining low-value meetings')
      }
    }

    return recommendations
  }
}
