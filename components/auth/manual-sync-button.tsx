'use client'

import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { useAuthSync } from './auth-sync-provider'

export function ManualSyncButton() {
  const { retrySync, isSyncing } = useAuthSync()

  return (
    <Button
      onClick={retrySync}
      disabled={isSyncing}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
      {isSyncing ? 'Syncing...' : 'Sync Profile'}
    </Button>
  )
}