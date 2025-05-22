import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    // Log the request for debugging
    console.log('Received summarize request')

    const { text } = await request.json()

    if (!text) {
      console.error('No text provided in request')
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured')
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      )
    }

    console.log('Making OpenAI API request')
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes text. Provide concise and clear summaries."
        },
        {
          role: "user",
          content: `Please summarize the following text:\n\n${text}`
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
    })

    const summary = completion.choices[0]?.message?.content

    if (!summary) {
      console.error('No summary generated from OpenAI')
      throw new Error('No summary generated')
    }

    console.log('Successfully generated summary')
    return NextResponse.json({ summary })
  } catch (error: any) {
    console.error('Summarize API error:', error)
    
    // Log detailed error information
    if (error.response) {
      console.error('OpenAI API response:', error.response)
    }
    
    // Handle specific OpenAI errors
    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key' },
        { status: 401 }
      )
    }
    
    if (error.response?.status === 429) {
      return NextResponse.json(
        { error: 'OpenAI API rate limit exceeded' },
        { status: 429 }
      )
    }

    // Return a more detailed error message
    return NextResponse.json(
      { 
        error: 'Failed to summarize text',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
} 