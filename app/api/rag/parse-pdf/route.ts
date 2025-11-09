import { NextRequest, NextResponse } from 'next/server'

// Using dynamic import for pdf-parse since it's a CJS module
const pdf = require('pdf-parse')

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Parse PDF
    const data = await pdf(buffer)
    
    return NextResponse.json({ 
      text: data.text,
      pages: data.numpages,
      info: data.info,
    })
  } catch (error) {
    console.error('PDF parsing error:', error)
    return NextResponse.json(
      { error: 'Failed to parse PDF' },
      { status: 500 }
    )
  }
}
