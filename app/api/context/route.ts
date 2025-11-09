import { NextRequest, NextResponse } from 'next/server'
import { ContextMemorySystem } from '@/core/agents/contextMemory'
import { requireAuth } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const user = await requireAuth()
    if (!user?.id) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 401 }
      )
    }

    const contextMemory = new ContextMemorySystem()
    const context = await contextMemory.getContext(user.id)

    return NextResponse.json({
      success: true,
      context,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get context' },
      { status: 401 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    if (!user?.id) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, interaction, query } = body
    const contextMemory = new ContextMemorySystem()

    switch (action) {
      case 'learn':
        if (!interaction) {
          return NextResponse.json(
            { error: 'Interaction data required' },
            { status: 400 }
          )
        }
        await contextMemory.learnFromInteraction(user.id, interaction)
        return NextResponse.json({
          success: true,
          message: 'Context learned',
        })

      case 'suggestions':
        if (!query) {
          return NextResponse.json(
            { error: 'Query required for suggestions' },
            { status: 400 }
          )
        }
        const suggestions = await contextMemory.getResponseSuggestions(
          user.id,
          query
        )
        return NextResponse.json({
          success: true,
          suggestions,
        })

      case 'clear':
        // Clear context cache by getting fresh context
        await contextMemory.getContext(user.id)
        return NextResponse.json({
          success: true,
          message: 'Context refreshed',
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to process context' },
      { status: 500 }
    )
  }
}
