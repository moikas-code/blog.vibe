'use client'

import { useState, useEffect } from 'react'
import { WifiOff } from 'lucide-react'

export function OfflineIndicator() {
  const [is_offline, set_is_offline] = useState(false)

  useEffect(() => {
    const update_online_status = () => {
      set_is_offline(!navigator.onLine)
    }

    // Check initial status
    update_online_status()

    // Listen for online/offline events
    window.addEventListener('online', update_online_status)
    window.addEventListener('offline', update_online_status)

    return () => {
      window.removeEventListener('online', update_online_status)
      window.removeEventListener('offline', update_online_status)
    }
  }, [])

  if (!is_offline) return null

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-yellow-900 py-2 px-4 text-center z-50">
      <div className="flex items-center justify-center gap-2 text-sm font-mono">
        <WifiOff className="h-4 w-4" />
        <span>You&apos;re offline - Reading cached content</span>
      </div>
    </div>
  )
}