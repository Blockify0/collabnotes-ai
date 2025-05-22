'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { RoomProvider, useMyPresence, useUpdateMyPresence, useSelf, useOthers } from '../../lib/liveblocks'
import { LiveList } from '@liveblocks/client'
import { supabase } from '../../lib/supabase'
import { summarizeText, transcribeAudio } from '../../lib/openai'
import ShareDialog from '../../components/ShareDialog'

function WorkspaceContent() {
  const [content, setContent] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Liveblocks presence
  const updateMyPresence = useUpdateMyPresence()
  const others = useOthers()
  const self = useSelf()

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    updateMyPresence({ content: newContent })
    setError(null) // Clear any previous errors
  }

  const handleSummarize = async () => {
    if (!content.trim()) return
    setIsProcessing(true)
    setError(null)
    try {
      const result = await summarizeText(content)
      setSummary(result)
    } catch (error: any) {
      console.error('Error summarizing:', error)
      setError(error.message || 'Failed to summarize text. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    try {
      if (file.type.startsWith('audio/')) {
        const transcription = await transcribeAudio(file)
        setContent(prev => prev + '\n\nTranscription:\n' + transcription)
      } else {
        // Handle other file types (PDF, etc.)
        console.log('File type not supported yet:', file.type)
      }
    } catch (error) {
      console.error('Error processing file:', error)
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
            <button
              onClick={() => setShowShareDialog(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Share
            </button>
          </div>

          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <textarea
                value={content}
                onChange={handleContentChange}
                className="w-full h-64 p-4 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-medium text-base leading-relaxed"
                placeholder="Start typing..."
                style={{ 
                  color: '#111827', // text-gray-900
                  fontSize: '1rem',
                  lineHeight: '1.75',
                  fontWeight: '500'
                }}
              />
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          {summary && (
            <div className="mt-6 bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Summary</h3>
                <div className="mt-2 text-sm text-gray-700">{summary}</div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={handleSummarize}
              disabled={isProcessing || !content.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Summarize'
              )}
            </button>
          </div>
        </div>
      </div>

      {showShareDialog && (
        <ShareDialog
          onClose={() => setShowShareDialog(false)}
          roomId={self?.id || ''}
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