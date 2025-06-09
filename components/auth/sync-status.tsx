'use client'

import { useAuthSync } from './auth-sync-provider'
import { Loader2 } from 'lucide-react'

export function SyncStatus() {
  const { isSyncing } = useAuthSync()

  if (!isSyncing) return null

  return (
    <div className="fixed top-4 right-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2 shadow-sm z-50 flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
      <span className="text-sm text-blue-700 dark:text-blue-300">
        Syncing user data...
      </span>
    </div>
  )
}