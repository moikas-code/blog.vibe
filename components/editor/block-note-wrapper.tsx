'use client'

import dynamic from 'next/dynamic'

// Dynamically import BlockNoteEditor with SSR disabled
export const BlockNoteEditor = dynamic(
  () => import('./block-note-editor').then(mod => mod),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full min-h-[400px] flex items-center justify-center border rounded-lg bg-gray-50">
        <p className="text-gray-500">Loading editor...</p>
      </div>
    )
  }
)