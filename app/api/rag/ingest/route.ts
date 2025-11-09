import { NextRequest, NextResponse } from 'next/server'
import { ingestDocument } from '@/core/agents/ragAgent'

export async function POST(req: NextRequest) {
  try {
    const { content, metadata } = await req.json()
    
    await ingestDocument(content, metadata)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Ingest error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
