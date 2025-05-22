import OpenAI from 'openai'

export async function summarizeText(text: string): Promise<string> {
  try {
    console.log('Sending summarize request for text length:', text.length)
    
    const response = await fetch('/api/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Summarize API error:', data)
      throw new Error(data.details || data.error || 'Failed to summarize text')
    }

    if (!data.summary) {
      throw new Error('No summary received from API')
    }

    console.log('Successfully received summary')
    return data.summary
  } catch (error: any) {
    console.error('Error in summarizeText:', error)
    throw new Error(error.message || 'Failed to summarize text')
  }
}

export async function transcribeAudio(file: File): Promise<string> {
  try {
    console.log('Sending audio transcription request for file:', file.name)
    
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Transcribe API error:', data)
      throw new Error(data.details || data.error || 'Failed to transcribe audio')
    }

    if (!data.transcription) {
      throw new Error('No transcription received from API')
    }

    console.log('Successfully received transcription')
    return data.transcription
  } catch (error: any) {
    console.error('Error in transcribeAudio:', error)
    throw new Error(error.message || 'Failed to transcribe audio')
  }
}

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    console.log('Sending PDF extraction request for file:', file.name)
    
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/extract-pdf', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('PDF extraction API error:', data)
      throw new Error(data.details || data.error || 'Failed to extract text from PDF')
    }

    if (!data.text) {
      throw new Error('No text extracted from PDF')
    }

    console.log('Successfully extracted text from PDF')
    return data.text
  } catch (error: any) {
    console.error('Error in extractTextFromPDF:', error)
    throw new Error(error.message || 'Failed to extract text from PDF')
  }
}

export async function summarizeYouTubeVideo(videoUrl: string) {
  // Note: This is a placeholder. You'll need to implement YouTube video
  // transcription using a service like YouTube Data API
  throw new Error('YouTube video summarization not implemented')
} 