import { NextRequest, NextResponse } from 'next/server'
import { quickAdd } from '@/core/agents/ragAgent'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { content, title } = await request.json()

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    await quickAdd(content, title)

    return NextResponse.json({
      success: true,
      message: 'Information saved to knowledge base',
    })
  } catch (error) {
    console.error('Quick add error:', error)
    return NextResponse.json(
      { error: 'Failed to save information' },
      { status: 500 }
    )
  }
}
