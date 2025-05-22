import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
})

export async function summarizeText(text: string) {
  try {
    const response = await fetch('/api/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      throw new Error('Failed to summarize text')
    }

    const data = await response.json()
    return data.summary
  } catch (error) {
    console.error('Error summarizing text:', error)
    throw error
  }
}

export async function transcribeAudio(audioFile: File) {
  try {
    const formData = new FormData()
    formData.append('file', audioFile)

    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to transcribe audio')
    }

    const data = await response.json()
    return data.text
  } catch (error) {
    console.error('Error transcribing audio:', error)
    throw error
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