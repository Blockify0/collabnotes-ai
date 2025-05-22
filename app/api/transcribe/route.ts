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
    console.log('Received transcribe request')

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.error('No file provided in request')
      return NextResponse.json(
        { error: 'Audio file is required' },
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

    // Create a new File object with the correct properties
    const audioFile = new File(
      [await file.arrayBuffer()],
      file.name,
      { type: file.type }
    )

    console.log('Making OpenAI API request for transcription')
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    })

    if (!transcription.text) {
      console.error('No transcription generated from OpenAI')
      throw new Error('No transcription generated')
    }

    console.log('Successfully generated transcription')
    return NextResponse.json({ transcription: transcription.text })
  } catch (error: any) {
    console.error('Transcribe API error:', error)
    
    if (error.response) {
      console.error('OpenAI API response:', error.response)
    }
    
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

    return NextResponse.json(
      { 
        error: 'Failed to transcribe audio',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
} 