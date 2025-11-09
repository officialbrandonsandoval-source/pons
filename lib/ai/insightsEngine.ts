/**
 * PONS Insights Engine
 * 
 * Analyzes user data from connected integrations (CRM, social media, financials, etc.)
 * and generates actionable insights using GPT-4 Turbo.
 * 
 * Core Features:
 * - Data-driven analysis with AI-powered pattern recognition
 * - Actionable recommendations for each insight
 * - Priority scoring and categorization
 * - JSON-structured output for easy consumption
 */

import { getOpenAIClient } from './openaiClient'

/**
 * Single insight with actionable recommendation
 */
export interface Insight {
  id: string
  category: 'social' | 'financial' | 'productivity' | 'sales' | 'marketing' | 'general'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  actionableRecommendation: string
  confidence: number // 0-100
  dataPoints?: string[] // Supporting data references
}

/**
 * Complete insights analysis result
 */
export interface InsightsAnalysis {
  insights: Insight[]
  summary: string
  generatedAt: string
  dataSourcesUsed: string[]
}

/**
 * Input data for insights generation
 */
export interface InsightsInput {
  userId: string
  dataPayload: Record<string, any>
  context?: string
  focusAreas?: string[]
}

/**
 * InsightsEngine - Core AI analysis system
 * 
 * Processes user data and generates actionable insights using GPT-4 Turbo
 */
export class InsightsEngine {
  private model = 'gpt-4-turbo-preview' // Latest GPT-4 Turbo model

  /**
   * System prompt for PONS Insights AI
   */
  private getSystemPrompt(): string {
    return `You are PONS Insights, an advanced AI analyst for the PONS AI Operating System.

Your role is to analyze user data from multiple sources (CRM, social media, financials, productivity tools) 
and generate 3-5 actionable insights with specific recommendations.

For each insight, provide:
1. A clear, specific title (max 60 chars)
2. A detailed description explaining what you observed
3. ONE concrete, actionable recommendation the user can implement today
4. A priority level (high/medium/low) based on potential impact
5. A confidence score (0-100) based on data quality and patterns
6. The category that best fits the insight

Guidelines:
- Be specific and data-driven, not generic
- Focus on opportunities and optimizations, not just problems
- Make recommendations actionable within 1-7 days
- Prioritize insights with high ROI potential
- Use clear, professional language

Return ONLY valid JSON matching this exact structure:
{
  "insights": [
    {
      "id": "unique-id",
      "category": "social|financial|productivity|sales|marketing|general",
      "priority": "high|medium|low",
      "title": "Brief insight title",
      "description": "Detailed explanation of the insight",
      "actionableRecommendation": "Specific action to take",
      "confidence": 85,
      "dataPoints": ["supporting fact 1", "supporting fact 2"]
    }
  ],
  "summary": "Overall analysis summary in 1-2 sentences"
}`
  }

  /**
   * Analyze user data and generate insights
   * 
   * @param input - User data and context for analysis
   * @returns Structured insights with recommendations
   */
  async analyze(input: InsightsInput): Promise<InsightsAnalysis> {
    const openai = getOpenAIClient()

    // Build user prompt with data and context
    const userPrompt = this.buildUserPrompt(input)

    try {
      // Call GPT-4 Turbo for analysis
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7, // Balanced creativity and consistency
        max_tokens: 2000,
        response_format: { type: 'json_object' }, // Ensure JSON response
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      // Parse and validate the JSON response
      const parsed = JSON.parse(content)
      
      // Add IDs if not present
      const insights = parsed.insights.map((insight: any, index: number) => ({
        ...insight,
        id: insight.id || `insight-${Date.now()}-${index}`,
      }))

      // Determine data sources used
      const dataSourcesUsed = this.extractDataSources(input.dataPayload)

      return {
        insights,
        summary: parsed.summary || 'Analysis complete',
        generatedAt: new Date().toISOString(),
        dataSourcesUsed,
      }
    } catch (error: any) {
      console.error('InsightsEngine analysis error:', error)
      
      // Return fallback insights on error
      return this.getFallbackInsights(input)
    }
  }

  /**
   * Build the user prompt with data and context
   */
  private buildUserPrompt(input: InsightsInput): string {
    const { dataPayload, context, focusAreas } = input

    let prompt = '# User Data Analysis Request\n\n'

    // Add context if provided
    if (context) {
      prompt += `## Context\n${context}\n\n`
    }

    // Add focus areas if specified
    if (focusAreas && focusAreas.length > 0) {
      prompt += `## Focus Areas\n${focusAreas.join(', ')}\n\n`
    }

    // Add the data payload
    prompt += '## Data to Analyze\n```json\n'
    prompt += JSON.stringify(dataPayload, null, 2)
    prompt += '\n```\n\n'

    prompt += 'Generate 3-5 actionable insights from this data with specific recommendations.'

    return prompt
  }

  /**
   * Extract data source names from payload
   */
  private extractDataSources(payload: Record<string, any>): string[] {
    const sources = new Set<string>()
    
    // Look for common integration data structures
    if (payload.crm) sources.add('CRM')
    if (payload.social) sources.add('Social Media')
    if (payload.financial) sources.add('Financial Data')
    if (payload.email) sources.add('Email')
    if (payload.calendar) sources.add('Calendar')
    if (payload.tasks) sources.add('Task Management')
    if (payload.analytics) sources.add('Analytics')

    return Array.from(sources)
  }

  /**
   * Generate fallback insights when AI fails
   */
  private getFallbackInsights(input: InsightsInput): InsightsAnalysis {
    return {
      insights: [
        {
          id: `fallback-${Date.now()}`,
          category: 'general',
          priority: 'medium',
          title: 'Data Analysis in Progress',
          description: 'We\'re processing your connected data sources to generate personalized insights.',
          actionableRecommendation: 'Connect more integrations to get richer insights and recommendations.',
          confidence: 50,
          dataPoints: ['System initialization'],
        },
      ],
      summary: 'Initial analysis complete. More insights will be available as you use the system.',
      generatedAt: new Date().toISOString(),
      dataSourcesUsed: this.extractDataSources(input.dataPayload),
    }
  }

  /**
   * Validate insights data structure
   */
  private validateInsights(insights: any[]): boolean {
    if (!Array.isArray(insights) || insights.length === 0) {
      return false
    }

    return insights.every(insight => 
      insight.category &&
      insight.priority &&
      insight.title &&
      insight.description &&
      insight.actionableRecommendation
    )
  }
}

/**
 * Create a singleton instance for the app
 */
export const insightsEngine = new InsightsEngine()
