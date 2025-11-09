/**
 * useInsights Hook
 * 
 * React hook for fetching and managing AI-generated insights from the PONS Insights Engine.
 * Provides loading states, error handling, and automatic data fetching.
 * 
 * Usage:
 * ```tsx
 * const { insights, loading, error, generateInsights, refresh } = useInsights()
 * 
 * // Generate insights with data
 * await generateInsights({
 *   crm: { leads: 47, deals: 12 },
 *   social: { followers: 1250 }
 * })
 * ```
 */

'use client'

import { useState, useCallback } from 'react'
import type { InsightsAnalysis, Insight } from '@/lib/ai/insightsEngine'

interface UseInsightsOptions {
  autoLoad?: boolean
  defaultData?: Record<string, any>
}

interface UseInsightsReturn {
  insights: Insight[]
  summary: string | null
  loading: boolean
  error: string | null
  dataSourcesUsed: string[]
  generatedAt: string | null
  generateInsights: (
    dataPayload: Record<string, any>,
    context?: string,
    focusAreas?: string[]
  ) => Promise<void>
  refresh: () => Promise<void>
  clearError: () => void
}

/**
 * Hook for managing insights generation and state
 */
export function useInsights(options: UseInsightsOptions = {}): UseInsightsReturn {
  const { autoLoad = false, defaultData } = options

  // State management
  const [insights, setInsights] = useState<Insight[]>([])
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dataSourcesUsed, setDataSourcesUsed] = useState<string[]>([])
  const [generatedAt, setGeneratedAt] = useState<string | null>(null)
  const [lastPayload, setLastPayload] = useState<Record<string, any> | null>(defaultData || null)

  /**
   * Generate insights from data payload
   */
  const generateInsights = useCallback(async (
    dataPayload: Record<string, any>,
    context?: string,
    focusAreas?: string[]
  ) => {
    setLoading(true)
    setError(null)
    setLastPayload(dataPayload)

    try {
      const response = await fetch('/api/insights-engine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataPayload,
          context,
          focusAreas,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || 'Failed to generate insights')
      }

      const data: InsightsAnalysis & { success: boolean } = await response.json()

      if (!data.success) {
        throw new Error('Insights generation failed')
      }

      // Update state with results
      setInsights(data.insights)
      setSummary(data.summary)
      setDataSourcesUsed(data.dataSourcesUsed)
      setGeneratedAt(data.generatedAt)

    } catch (err: any) {
      console.error('useInsights error:', err)
      setError(err.message || 'Failed to generate insights')
      
      // Set empty state on error
      setInsights([])
      setSummary(null)
      setDataSourcesUsed([])
      setGeneratedAt(null)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Refresh insights with last used payload
   */
  const refresh = useCallback(async () => {
    if (!lastPayload) {
      setError('No previous data to refresh from')
      return
    }
    await generateInsights(lastPayload)
  }, [lastPayload, generateInsights])

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Auto-load on mount if enabled and default data provided
  // useEffect(() => {
  //   if (autoLoad && defaultData) {
  //     generateInsights(defaultData)
  //   }
  // }, [autoLoad, defaultData, generateInsights])

  return {
    insights,
    summary,
    loading,
    error,
    dataSourcesUsed,
    generatedAt,
    generateInsights,
    refresh,
    clearError,
  }
}

/**
 * Utility hook for quick demo insights
 */
export function useDemoInsights() {
  const hook = useInsights()

  const loadDemoData = useCallback(async () => {
    await hook.generateInsights({
      crm: {
        totalLeads: 47,
        activeDeals: 12,
        closedDealsThisMonth: 5,
        avgDealValue: 4900,
        conversionRate: 12.5,
      },
      social: {
        followers: 1250,
        engagement_rate: 3.2,
        postsThisWeek: 5,
        topPerformingContent: 'Product demos',
      },
      financial: {
        revenue: 24500,
        expenses: 18200,
        profit: 6300,
        profitMargin: 25.7,
      },
      productivity: {
        tasksCompleted: 45,
        averageTaskTime: 2.5,
        meetingsThisWeek: 8,
        focusTimeHours: 22,
      },
    }, 'Optimize for growth and efficiency')
  }, [hook])

  return {
    ...hook,
    loadDemoData,
  }
}
