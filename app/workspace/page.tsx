'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { RoomProvider, useMyPresence, useUpdateMyPresence, useSelf, useOthers } from '../../lib/liveblocks'
import { supabase } from '../../lib/supabase'
import { summarizeText, transcribeAudio } from '../../lib/openai'
import ShareDialog from '../../components/ShareDialog'

function WorkspaceContent() {
  const [content, setContent] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Liveblocks presence
  const updateMyPresence = useUpdateMyPresence()
  const others = useOthers()
  const self = useSelf()

  useEffect(() => {
    // Check authentication
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }
    checkUser()
  }, [])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    updateMyPresence({ content: newContent })
  }

  const handleSummarize = async () => {
    if (!content.trim()) return
    setIsProcessing(true)
    try {
      const result = await summarizeText(content)
      setSummary(result)
    } catch (error) {
      console.error('Error summarizing:', error)
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

  const handleShare = () => {
    setShowShareDialog(true)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!user) {
    router.push('/')
    return null
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Collaborators</h2>
          <div className="space-y-2">
            {/* Current user */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-600 font-medium">
                  {user.email?.[0].toUpperCase() || 'U'}
                </span>
              </div>
              <span className="text-sm text-gray-900">You</span>
            </div>
            
            {/* Other collaborators */}
            {others.map(({ presence }) => (
              <div key={presence.id} className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-medium">
                    {presence.name?.[0].toUpperCase() || 'C'}
                  </span>
                </div>
                <span className="text-sm text-gray-900">{presence.name || 'Collaborator'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-14 border-b border-gray-200 flex items-center px-4 space-x-4 bg-white">
          <button
            onClick={() => router.push('/')}
            className="text-gray-900 hover:text-gray-700"
          >
            ← Back
          </button>
          <div className="flex-1" />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="audio/*,application/pdf"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
          >
            Upload File
          </button>
          <button
            onClick={handleSummarize}
            disabled={isProcessing || !content.trim()}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-500 disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Summarize'}
          </button>
          <button
            onClick={handleShare}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-500"
          >
            Share
          </button>
        </div>

        {/* Editor */}
        <div className="flex-1 p-8 bg-white">
          <div className="max-w-4xl mx-auto">
            {summary && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Summary</h3>
                <p className="text-gray-600">{summary}</p>
              </div>
            )}
            <textarea
              value={content}
              onChange={handleContentChange}
              placeholder="Start typing your notes here..."
              className="w-full h-full min-h-[500px] p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 text-base"
            />
          </div>
        </div>
      </div>

      {showShareDialog && (
        <ShareDialog
          workspaceId="current-workspace"
          onClose={() => setShowShareDialog(false)}
        />
      )}
    </div>
  )
}

export default function Workspace() {
  return (
    <RoomProvider
      id="collabnotes-workspace"
      initialPresence={{
        id: 'anonymous',
        cursor: null,
        name: 'Anonymous',
        color: '#000000',
        content: '',
      }}
      initialStorage={{
        content: ''
      }}
    >
      <WorkspaceContent />
    </RoomProvider>
  )
} 