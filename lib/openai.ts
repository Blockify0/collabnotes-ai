import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function summarizeText(text: string) {
  try {
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

    return response.choices[0].message.content
  } catch (error) {
    console.error('Error summarizing text:', error)
    throw error
  }
}

export async function transcribeAudio(audioFile: File) {
  try {
    const formData = new FormData()
    formData.append('file', audioFile)
    formData.append('model', 'whisper-1')

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    })

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