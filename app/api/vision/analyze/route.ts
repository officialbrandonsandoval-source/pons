import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    const prompt = formData.get('prompt') as string || 'What do you see in this image?'

    if (!imageFile) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
    }

    // Convert image to base64
    const buffer = Buffer.from(await imageFile.arrayBuffer())
    const base64Image = buffer.toString('base64')
    const mimeType = imageFile.type

    // Analyze image using GPT-4 Vision
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    })

    const analysis = response.choices[0].message.content

    return NextResponse.json({
      success: true,
      analysis,
      prompt,
    })
  } catch (error: any) {
    console.error('Image analysis error:', error)
    return NextResponse.json(
      { error: error.message || 'Image analysis failed' },
      { status: 500 }
    )
  }
}
