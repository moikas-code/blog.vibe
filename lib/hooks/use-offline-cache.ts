'use client'

import { useEffect } from 'react'

export function useOfflineCache(url?: string) {
  useEffect(() => {
    if (!url || typeof window === 'undefined') return

    // Cache the current page if service worker is available
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_POST',
        url: url
      })
    }
  }, [url])

  const clear_cache = async () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_CACHE'
      })
    }
  }

  const request_background_sync = async () => {
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready
        await (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register('sync-posts')
        console.log('Background sync registered')
      } catch (error) {
        console.error('Background sync failed:', error)
      }
    }
  }

  return {
    clear_cache,
    request_background_sync
  }
}