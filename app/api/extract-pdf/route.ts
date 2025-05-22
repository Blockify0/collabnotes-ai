import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    console.log('Received PDF extraction request')

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.error('No file provided in request')
      return NextResponse.json(
        { error: 'PDF file is required' },
        { status: 400 }
      )
    }

    // For now, return a placeholder response
    // We'll implement actual PDF extraction in a separate PR
    return NextResponse.json({ 
      text: "PDF extraction is temporarily disabled while we update the implementation for Edge Runtime compatibility.",
      status: "pending"
    })

  } catch (error: any) {
    console.error('PDF extraction error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
} 