/**
 * PONS Insights API Endpoint
 * 
 * POST /api/insights
 * 
 * Generates AI-powered insights from user data using the InsightsEngine.
 * Requires authentication and accepts data payload with optional context.
 * 
 * Request Body:
 * {
 *   "dataPayload": { ...user data from integrations... },
 *   "context": "Optional context string",
 *   "focusAreas": ["social", "financial"]
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "insights": [...],
 *   "summary": "...",
 *   "generatedAt": "2024-01-01T00:00:00.000Z",
 *   "dataSourcesUsed": ["CRM", "Social Media"]
 * }
 */

import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { insightsEngine } from '@/lib/ai/insightsEngine'
import { isOpenAIConfigured } from '@/lib/ai/openaiClient'

/**
 * POST handler - Generate insights from data
 */
export async function POST(request: Request) {
  try {
    // Authenticate user
    const user = await requireAuth()
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if OpenAI is configured
    if (!isOpenAIConfigured()) {
      return NextResponse.json(
        { 
          error: 'OpenAI API is not configured',
          message: 'Please set OPENAI_API_KEY in environment variables'
        },
        { status: 503 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { dataPayload, context, focusAreas } = body

    // Validate required fields
    if (!dataPayload || typeof dataPayload !== 'object') {
      return NextResponse.json(
        { error: 'dataPayload is required and must be an object' },
        { status: 400 }
      )
    }

    // Run insights analysis
    const analysis = await insightsEngine.analyze({
      userId: user.id,
      dataPayload,
      context,
      focusAreas,
    })

    // Return insights
    return NextResponse.json({
      success: true,
      ...analysis,
    })

  } catch (error: any) {
    console.error('Insights API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate insights',
        message: error.message || 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
}

/**
 * GET handler - Get sample insights structure (for testing)
 */
export async function GET(request: Request) {
  try {
    const user = await requireAuth()
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Return sample structure
    return NextResponse.json({
      success: true,
      message: 'Send POST request with dataPayload to generate insights',
      example: {
        dataPayload: {
          crm: {
            totalLeads: 47,
            activeDeals: 12,
            closedDealsThisMonth: 5,
            avgDealValue: 4900,
          },
          social: {
            followers: 1250,
            engagement_rate: 3.2,
            postsThisWeek: 5,
          },
          financial: {
            revenue: 24500,
            expenses: 18200,
            profit: 6300,
          },
        },
        context: 'Focus on sales and marketing optimization',
        focusAreas: ['sales', 'marketing'],
      },
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 401 }
    )
  }
}
