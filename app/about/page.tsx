'use client'

import Link from 'next/link'

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">About CollabNotes AI</h1>
          <p className="text-lg text-gray-600 mb-12">
            A powerful collaborative notebook that combines real-time editing with AI-powered features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Real-time Collaboration</h2>
            <ul className="space-y-3 text-gray-600">
              <li>• Live cursor presence</li>
              <li>• Instant updates across devices</li>
              <li>• Team presence indicators</li>
              <li>• Collaborative editing</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Features</h2>
            <ul className="space-y-3 text-gray-600">
              <li>• Smart content summarization</li>
              <li>• YouTube video transcription</li>
              <li>• PDF text extraction</li>
              <li>• Audio file transcription</li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
} 