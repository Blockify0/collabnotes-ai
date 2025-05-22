import { NextResponse } from 'next/server'
import pdf from 'pdf-parse'

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

    // Convert file to buffer
    const buffer = await file.arrayBuffer()
    const pdfBuffer = Buffer.from(buffer)

    console.log('Extracting text from PDF')
    const data = await pdf(pdfBuffer)

    if (!data.text) {
      console.error('No text extracted from PDF')
      throw new Error('No text extracted from PDF')
    }

    console.log('Successfully extracted text from PDF')
    return NextResponse.json({ text: data.text })
  } catch (error: any) {
    console.error('PDF extraction error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to extract text from PDF',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
} 