import { NextRequest, NextResponse } from 'next/server'
import { ragQuery } from '@/core/agents/ragAgent'

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()
    
    const result = await ragQuery(query)
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Query error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
