'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()
  }, [])

  const handleGetStarted = () => {
    if (user) {
      router.push('/workspace')
    } else {
      router.push('/auth')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            CollabNotes AI
          </h1>
          <p className="text-lg leading-8 text-gray-600">
            Real-time collaborative notebook powered by AI. Work together seamlessly with smart features.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button
              onClick={handleGetStarted}
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {user ? 'Go to Workspace' : 'Get Started'}
            </button>
            <Link href="/about" className="text-sm font-semibold leading-6 text-gray-900">
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.name} className="relative p-6 bg-white rounded-lg shadow-sm">
              <div className="text-lg font-semibold text-gray-900">{feature.name}</div>
              <p className="mt-2 text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const features = [
  {
    name: 'Real-time Collaboration',
    description: 'Work together with live cursors and presence indicators, just like in Figma.',
  },
  {
    name: 'AI-Powered Features',
    description: 'Get smart summaries, transcriptions, and content suggestions powered by GPT-4.',
  },
  {
    name: 'Rich Media Support',
    description: 'Upload and process YouTube videos, PDFs, and audio files with automatic transcription.',
  },
]
