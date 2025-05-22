import { NextResponse } from 'next/server'
import * as pdfjs from 'pdfjs-dist'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

// Initialize PDF.js worker
const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry')
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker

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

    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer()
    
    // Load the PDF document
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
    
    // Extract text from all pages
    let text = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      text += content.items.map((item: any) => item.str).join(' ') + '\n'
    }

    if (!text.trim()) {
      console.error('No text extracted from PDF')
      throw new Error('No text extracted from PDF')
    }

    console.log('Successfully extracted text from PDF')
    return NextResponse.json({ text: text.trim() })
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