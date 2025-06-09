'use client'

import { useEffect, useState, createContext, useContext } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter, usePathname } from 'next/navigation'

interface AuthSyncContextType {
  isSyncing: boolean
  syncError: string | null
  retrySync: () => void
}

const AuthSyncContext = createContext<AuthSyncContextType>({
  isSyncing: false,
  syncError: null,
  retrySync: () => {},
})

export function useAuthSync() {
  return useContext(AuthSyncContext)
}

export function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, userId } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [lastSyncAttempt, setLastSyncAttempt] = useState<string | null>(null)

  const syncAuth = async () => {
    if (!isSignedIn || !userId || !user) return
    
    // Don't sync if we've already synced this user in this session
    const syncKey = `${userId}-${user.updatedAt}`
    if (lastSyncAttempt === syncKey && !syncError) return

    setIsSyncing(true)
    setSyncError(null)

    try {
      const response = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync user data')
      }

      // Mark this sync as successful
      setLastSyncAttempt(syncKey)
      
      // Only refresh if we're on a page that needs author data
      if (pathname.startsWith('/dashboard') || pathname.startsWith('/api')) {
        router.refresh()
      }
    } catch (error) {
      console.error('Auth sync error:', error)
      setSyncError(error instanceof Error ? error.message : 'Failed to sync user data')
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    syncAuth()
  }, [isSignedIn, userId, user?.updatedAt])

  const retrySync = () => {
    setLastSyncAttempt(null)
    syncAuth()
  }

  return (
    <AuthSyncContext.Provider value={{ isSyncing, syncError, retrySync }}>
      {children}
      {syncError && (
        <div className="fixed bottom-4 right-4 max-w-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 shadow-lg z-50">
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Sync Error
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {syncError}
              </p>
            </div>
            <button
              onClick={retrySync}
              className="ml-4 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </AuthSyncContext.Provider>
  )
}