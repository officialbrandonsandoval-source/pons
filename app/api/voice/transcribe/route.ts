import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Convert File to Buffer for OpenAI
    const buffer = Buffer.from(await audioFile.arrayBuffer())
    
    // Create a new File object with the buffer
    const file = new File([buffer], audioFile.name, { type: audioFile.type })

    // Transcribe audio using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en',
    })

    return NextResponse.json({
      success: true,
      text: transcription.text,
    })
  } catch (error: any) {
    console.error('Speech-to-text error:', error)
    return NextResponse.json(
      { error: error.message || 'Transcription failed' },
      { status: 500 }
    )
  }
}
