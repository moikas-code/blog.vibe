'use client'

import { WifiOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="glass max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <WifiOff className="h-16 w-16 text-gray-400" />
        </div>
        
        <h1 className="text-2xl font-bold font-mono mb-4">You&apos;re Offline</h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6 font-mono">
          It looks like you&apos;ve lost your internet connection. 
          You can still read cached posts while offline.
        </p>
        
        <Button 
          onClick={() => window.location.reload()} 
          className="font-mono gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
        
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
            Tip: Posts you&apos;ve visited before are available offline. 
            They&apos;ll automatically sync when you&apos;re back online.
          </p>
        </div>
      </Card>
    </main>
  )
}