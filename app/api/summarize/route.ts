import { NextResponse } from 'next/server'
import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not configured')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes text concisely."
        },
        {
          role: "user",
          content: `Please summarize the following text:\n\n${text}`
        }
      ],
      max_tokens: 150,
    })

    return NextResponse.json({ summary: response.choices[0].message.content })
  } catch (error) {
    console.error('Error summarizing text:', error)
    return NextResponse.json(
      { error: 'Failed to summarize text' },
      { status: 500 }
    )
  }
} 