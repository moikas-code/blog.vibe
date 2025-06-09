'use client'

import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export function AuthSync() {
  const { isSignedIn, userId } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const syncAuth = async () => {
      if (isSignedIn && userId) {
        try {
          const response = await fetch('/api/auth/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (!response.ok) {
            console.error('Failed to sync auth:', await response.text())
          } else {
            // Refresh the page to ensure all data is loaded
            router.refresh()
          }
        } catch (error) {
          console.error('Auth sync error:', error)
        }
      }
    }

    syncAuth()
  }, [isSignedIn, userId, router])

  return null
}