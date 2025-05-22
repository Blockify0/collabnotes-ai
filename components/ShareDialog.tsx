'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface ShareDialogProps {
  onClose: () => void
  roomId: string
}

export default function ShareDialog({ onClose, roomId }: ShareDialogProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const shareUrl = `${window.location.origin}/workspace?room=${roomId}`

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Create a share link
      const shareLink = `${window.location.origin}/workspace/${roomId}`
      
      // Send invitation email
      const { error } = await supabase.functions.invoke('send-invitation', {
        body: { email, shareLink }
      })

      if (error) throw error
      
      setSuccess('Invitation sent successfully!')
      setEmail('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Share Workspace</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mt-4">
          <label htmlFor="share-url" className="block text-sm font-medium text-gray-700">
            Share URL
            </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              id="share-url"
              readOnly
              value={shareUrl}
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-50 text-gray-500 sm:text-sm"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 