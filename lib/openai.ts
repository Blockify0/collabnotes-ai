import OpenAI from 'openai'

export async function summarizeText(text: string): Promise<string> {
  try {
    const response = await fetch('/api/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to summarize text')
    }

    const data = await response.json()
    return data.summary
  } catch (error: any) {
    console.error('Error in summarizeText:', error)
    throw new Error(error.message || 'Failed to summarize text')
  }
}

export async function transcribeAudio(file: File): Promise<string> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to transcribe audio')
    }

    const data = await response.json()
    return data.transcription
  } catch (error: any) {
    console.error('Error in transcribeAudio:', error)
    throw new Error(error.message || 'Failed to transcribe audio')
  }
}

export async function extractTextFromPDF(pdfFile: File) {
  // Note: This is a placeholder. You'll need to implement PDF text extraction
  // using a library like pdf.js or a service like AWS Textract
  throw new Error('PDF text extraction not implemented')
}

export async function summarizeYouTubeVideo(videoUrl: string) {
  // Note: This is a placeholder. You'll need to implement YouTube video
  // transcription using a service like YouTube Data API
  throw new Error('YouTube video summarization not implemented')
} 