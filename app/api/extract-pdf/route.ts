import { NextResponse } from 'next/server'
import pdfParse from 'pdf-parse'

export const dynamic = 'force-dynamic'
// Remove edge runtime to use serverless function
// export const runtime = 'edge'

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
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Parse PDF
    const data = await pdfParse(buffer, {
      pagerender: renderPage,
      max: 0 // No page limit
    })
    
    if (!data.text.trim()) {
      console.error('No text extracted from PDF')
      throw new Error('No text extracted from PDF')
    }

    console.log('Successfully extracted text from PDF')
    return NextResponse.json({ text: data.text.trim() })
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

// Custom page renderer to handle text extraction
async function renderPage(pageData: any) {
  try {
    const textContent = await pageData.getTextContent()
    return textContent.items.map((item: any) => item.str).join(' ')
  } catch (error) {
    console.error('Error rendering page:', error)
    return ''
  }
} 