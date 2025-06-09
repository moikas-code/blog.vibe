'use client'

import { useOfflineCache } from '@/lib/hooks/use-offline-cache'
import { useEffect } from 'react'

interface OfflinePostWrapperProps {
  children: React.ReactNode
  postUrl: string
}

export function OfflinePostWrapper({ children, postUrl }: OfflinePostWrapperProps) {
  const { request_background_sync } = useOfflineCache(postUrl)

  useEffect(() => {
    // Request background sync when component mounts
    request_background_sync()
  }, [request_background_sync])

  return <>{children}</>
}