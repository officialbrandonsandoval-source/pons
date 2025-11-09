'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Insight {
  category: string
  priority: string
  insight: string
  actionable: boolean
  actions?: string[]
  confidence: number
}

export default function InsightsDashboard() {
  const { data: session } = useSession()
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session) {
      fetchInsights()
    }
  }, [session])

  const fetchInsights = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/insights')
      const data = await response.json()

      if (data.success) {
        setInsights(data.insights)
      } else {
        setError(data.error || 'Failed to load insights')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-400">Please sign in to view insights</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchInsights}
            className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 rounded text-white text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-400">No insights available yet. Connect your integrations to get started.</p>
      </div>
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 border-red-500 text-red-400'
      case 'medium':
        return 'bg-yellow-500/10 border-yellow-500 text-yellow-400'
      case 'low':
        return 'bg-blue-500/10 border-blue-500 text-blue-400'
      default:
        return 'bg-gray-500/10 border-gray-500 text-gray-400'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'social':
        return '📱'
      case 'financial':
        return '💰'
      case 'productivity':
        return '⚡'
      case 'health':
        return '❤️'
      default:
        return '📊'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Predictive Insights</h2>
        <button
          onClick={fetchInsights}
          className="px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded text-white text-sm"
        >
          Refresh
        </button>
      </div>

      {/* High Priority Insights */}
      {insights.insights.filter((i: Insight) => i.priority === 'high').length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-red-400">🔴</span> High Priority
          </h3>
          {insights.insights
            .filter((i: Insight) => i.priority === 'high')
            .map((insight: Insight, index: number) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getPriorityColor(insight.priority)}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getCategoryIcon(insight.category)}</span>
                  <div className="flex-1">
                    <p className="font-medium mb-2">{insight.insight}</p>
                    {insight.actions && insight.actions.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-sm font-semibold">Recommended Actions:</p>
                        <ul className="text-sm space-y-1 ml-4">
                          {insight.actions.map((action, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-sky-400">→</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="mt-2 text-xs opacity-70">
                      Confidence: {(insight.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Predictions */}
      {insights.predictions.nextWeek.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>🔮</span> Next Week Predictions
          </h3>
          <div className="bg-purple-500/10 border border-purple-500 rounded-lg p-4">
            <ul className="space-y-2">
              {insights.predictions.nextWeek.map((pred: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-purple-200">
                  <span className="text-purple-400">•</span>
                  <span>{pred}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Opportunities */}
      {insights.predictions.opportunities.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>✨</span> Opportunities
          </h3>
          <div className="bg-green-500/10 border border-green-500 rounded-lg p-4">
            <ul className="space-y-2">
              {insights.predictions.opportunities.map((opp: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-green-200">
                  <span className="text-green-400">→</span>
                  <span>{opp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Risks */}
      {insights.predictions.risks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>⚠️</span> Potential Risks
          </h3>
          <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-4">
            <ul className="space-y-2">
              {insights.predictions.risks.map((risk: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-orange-200">
                  <span className="text-orange-400">!</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Immediate */}
        {insights.recommendations.immediate.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <span>⚡</span> Do Now
            </h4>
            <ul className="space-y-2 text-sm">
              {insights.recommendations.immediate.map((rec: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-gray-300">
                  <span className="text-sky-400">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Short Term */}
        {insights.recommendations.shortTerm.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <span>📅</span> Next 1-3 Months
            </h4>
            <ul className="space-y-2 text-sm">
              {insights.recommendations.shortTerm.map((rec: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-gray-300">
                  <span className="text-sky-400">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Long Term */}
        {insights.recommendations.longTerm.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <span>🎯</span> Long Term (3+ Months)
            </h4>
            <ul className="space-y-2 text-sm">
              {insights.recommendations.longTerm.map((rec: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-gray-300">
                  <span className="text-sky-400">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Patterns */}
      {(insights.patterns.behavioral.length > 0 || insights.patterns.temporal.length > 0) && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">📈 Detected Patterns</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.patterns.behavioral.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="font-medium text-white mb-2">Behavioral</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  {insights.patterns.behavioral.map((pattern: string, index: number) => (
                    <li key={index}>• {pattern}</li>
                  ))}
                </ul>
              </div>
            )}
            {insights.patterns.temporal.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="font-medium text-white mb-2">Temporal</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  {insights.patterns.temporal.map((pattern: string, index: number) => (
                    <li key={index}>• {pattern}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
