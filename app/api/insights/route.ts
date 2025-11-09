import { NextRequest, NextResponse } from 'next/server'
import { PredictiveInsightsEngine } from '@/core/agents/predictiveInsights'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Ensure user is authenticated
    await requireAuth()

    const engine = new PredictiveInsightsEngine()
    const insights = await engine.generateInsights()

    return NextResponse.json({
      success: true,
      insights,
      generated_at: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Insights generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate insights' },
      { status: error.message === 'Unauthorized - please sign in' ? 401 : 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    
    const body = await request.json()
    const { action } = body

    const engine = new PredictiveInsightsEngine()

    switch (action) {
      case 'detect_anomalies': {
        const { currentData, historicalData } = body
        const anomalies = await engine.detectAnomalies(currentData, historicalData)
        return NextResponse.json({ success: true, anomalies })
      }

      case 'smart_suggestions': {
        const { context } = body
        const suggestions = await engine.generateSmartSuggestions(context)
        return NextResponse.json({ success: true, suggestions })
      }

      case 'optimal_times': {
        const { historicalData } = body
        const optimalTimes = await engine.predictOptimalTimes(historicalData)
        return NextResponse.json({ success: true, optimalTimes })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Insights action error:', error)
    return NextResponse.json(
      { error: error.message || 'Action failed' },
      { status: 500 }
    )
  }
}
