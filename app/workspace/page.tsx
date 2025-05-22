'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { RoomProvider, useMyPresence, useUpdateMyPresence, useSelf, useOthers, useStorage } from '../../lib/liveblocks'
import { LiveList } from '@liveblocks/client'
import { supabase } from '../../lib/supabase'
import { summarizeText, transcribeAudio, extractTextFromPDF } from '../../lib/openai'
import ShareDialog from '../../components/ShareDialog'

function WorkspaceContent() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Liveblocks hooks
  const updateMyPresence = useUpdateMyPresence()
  const others = useOthers()
  const self = useSelf()
  const content = useStorage((root: { readonly content: readonly string[] }) => root.content)

  // Initialize content if empty
  useEffect(() => {
    if (content?.length === 0) {
      updateMyPresence({ content: '' })
    }
  }, [content, updateMyPresence])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    updateMyPresence({ content: newContent })
    setError(null)
  }

  const handleSummarize = async () => {
    if (!content) return
    setIsProcessing(true)
    setError(null)
    try {
      const result = await summarizeText(content.join('\n'))
      setSummary(result)
    } catch (error: any) {
      console.error('Error summarizing:', error)
      setError(error.message || 'Failed to summarize text')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      let extractedText = ''
      if (file.type === 'application/pdf') {
        const response = await fetch('/api/extract-pdf', {
          method: 'POST',
          body: formData,
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Failed to extract PDF')
        extractedText = data.text
      } else if (file.type.startsWith('audio/')) {
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Failed to transcribe audio')
        extractedText = data.text
      }

      if (extractedText) {
        updateMyPresence({ content: extractedText })
      }
    } catch (error: any) {
      console.error('Error processing file:', error)
      setError(error.message || 'Failed to process file')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Workspace</h1>
            <div className="flex space-x-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="audio/*,application/pdf"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Upload File
              </button>
              <button
                onClick={() => setShowShareDialog(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Share
              </button>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {others.map(({ presence }) => (
                  <div
                    key={presence.id}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: presence.color }}
                    title={presence.name}
                  />
                ))}
              </div>

              <textarea
                value={content?.join('\n') || ''}
                onChange={handleContentChange}
                className="w-full h-64 p-4 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Start typing..."
              />

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleSummarize}
                  disabled={isProcessing || !content}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Summarize'}
                </button>
              </div>

              {summary && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Summary</h3>
                  <p className="text-gray-600">{summary}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showShareDialog && (
        <ShareDialog
          onClose={() => setShowShareDialog(false)}
          roomId="workspace"
        />
      )}
    </div>
  )
}

export default function Workspace() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (error) {
          console.error('Auth error:', error)
          router.push('/auth')
          return
        }

        if (!session) {
          console.log('No session found')
          router.push('/auth')
          return
        }

        setUser(session.user)
        setIsLoading(false)
      } catch (error) {
        console.error('Error checking auth:', error)
        if (mounted) {
          router.push('/auth')
        }
      }
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return

      if (event === 'SIGNED_OUT') {
        router.push('/auth')
      } else if (session) {
        setUser(session.user)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <RoomProvider
      id="workspace"
      initialPresence={{
        id: user.id,
        cursor: null,
        name: user.email || 'Anonymous',
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
        content: '',
      }}
      initialStorage={{
        content: new LiveList<string>([]),
      }}
    >
      <WorkspaceContent />
    </RoomProvider>
  )
} 