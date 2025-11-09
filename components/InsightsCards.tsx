/**
 * InsightsCards Component
 * 
 * Displays AI-generated insights as beautiful, interactive cards with:
 * - Priority indicators
 * - Category badges
 * - Confidence scores
 * - Actionable recommendations
 * - Loading and error states
 */

'use client'

import { useState } from 'react'
import { useDemoInsights } from '@/hooks/useInsights'
import {
  SparklesIcon,
  LightBulbIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

export default function InsightsCards() {
  const { insights, loading, error, summary, loadDemoData, dataSourcesUsed } = useDemoInsights()
  const [expanded, setExpanded] = useState<string | null>(null)

  // Category icons and colors
  const categoryConfig = {
    social: { icon: UsersIcon, color: 'blue', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    financial: { icon: CurrencyDollarIcon, color: 'green', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
    productivity: { icon: CheckCircleIcon, color: 'purple', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
    sales: { icon: ChartBarIcon, color: 'orange', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
    marketing: { icon: SparklesIcon, color: 'pink', bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700' },
    general: { icon: LightBulbIcon, color: 'slate', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700' },
  }

  // Priority styles
  const priorityConfig = {
    high: { badge: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
    medium: { badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
    low: { badge: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
  }

  if (insights.length === 0 && !loading && !error) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-dashed border-indigo-200 p-8">
        <div className="text-center max-w-md mx-auto">
          <SparklesIcon className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">AI Insights Engine</h3>
          <p className="text-slate-600 mb-6">
            Generate intelligent insights from your connected data sources using GPT-4 Turbo
          </p>
          <button
            onClick={loadDemoData}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            Generate Insights
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">AI Insights</h2>
            {summary && (
              <p className="text-sm text-slate-600">{summary}</p>
            )}
          </div>
        </div>
        <button
          onClick={loadDemoData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">Refresh</span>
        </button>
      </div>

      {/* Data Sources */}
      {dataSourcesUsed.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>Analyzing:</span>
          {dataSourcesUsed.map((source, i) => (
            <span key={i} className="px-2 py-1 bg-slate-100 rounded-md font-medium">
              {source}
            </span>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-4" />
              <div className="h-3 bg-slate-200 rounded w-full mb-2" />
              <div className="h-3 bg-slate-200 rounded w-5/6" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Failed to Generate Insights</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Insights Grid */}
      {!loading && insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight) => {
            const config = categoryConfig[insight.category as keyof typeof categoryConfig]
            const Icon = config.icon
            const priorityStyle = priorityConfig[insight.priority as keyof typeof priorityConfig]
            const isExpanded = expanded === insight.id

            return (
              <div
                key={insight.id}
                className={`bg-white rounded-xl border-2 ${config.border} p-6 hover:shadow-lg transition-all cursor-pointer ${
                  isExpanded ? 'ring-2 ring-offset-2 ring-indigo-500' : ''
                }`}
                onClick={() => setExpanded(isExpanded ? null : insight.id)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2 ${config.bg} rounded-lg`}>
                    <Icon className={`w-5 h-5 ${config.text}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Priority Indicator */}
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold border ${priorityStyle.badge}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
                      {insight.priority}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-900 text-lg leading-tight">
                    {insight.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {insight.description}
                  </p>

                  {/* Actionable Recommendation */}
                  <div className={`${config.bg} rounded-lg p-3 border ${config.border}`}>
                    <div className="flex items-start gap-2">
                      <LightBulbIcon className={`w-4 h-4 ${config.text} flex-shrink-0 mt-0.5`} />
                      <div>
                        <p className="text-xs font-semibold text-slate-700 mb-1">Action Item</p>
                        <p className={`text-sm font-medium ${config.text}`}>
                          {insight.actionableRecommendation}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Confidence & Data Points */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">Confidence</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                              style={{ width: `${insight.confidence}%` }}
                            />
                          </div>
                          <span className="font-semibold text-slate-900">{insight.confidence}%</span>
                        </div>
                      </div>

                      {insight.dataPoints && insight.dataPoints.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-700">Supporting Data</p>
                          {insight.dataPoints.map((point, i) => (
                            <p key={i} className="text-xs text-slate-600 pl-3 border-l-2 border-slate-200">
                              {point}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Expand indicator */}
                <div className="mt-4 text-center">
                  <button className="text-xs text-slate-500 hover:text-slate-700 font-medium">
                    {isExpanded ? '▲ Less' : '▼ More'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
