import { NextRequest, NextResponse } from 'next/server'
import { searchDocuments } from '@/core/agents/ragAgent'

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()
    
    const results = await searchDocuments(query)
    
    return NextResponse.json({ results })
  } catch (error: any) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
