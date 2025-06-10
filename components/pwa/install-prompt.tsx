'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [show_prompt, set_show_prompt] = useState(false)
  const [defer_prompt, set_defer_prompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return
    }

    // Check if user already dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      return
    }

    const handle_before_install = (e: Event) => {
      e.preventDefault()
      set_defer_prompt(e as BeforeInstallPromptEvent)
      set_show_prompt(true)
    }

    window.addEventListener('beforeinstallprompt', handle_before_install)

    return () => {
      window.removeEventListener('beforeinstallprompt', handle_before_install)
    }
  }, [])

  const handle_install = async () => {
    if (!defer_prompt) return

    defer_prompt.prompt()
    const { outcome } = await defer_prompt.userChoice

    if (outcome === 'accepted') {
      console.log('PWA installed')
    }

    set_defer_prompt(null)
    set_show_prompt(false)
  }

  const handle_dismiss = () => {
    localStorage.setItem('pwa-install-dismissed', 'true')
    set_show_prompt(false)
  }

  if (!show_prompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
      <Card className="glass p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-mono font-bold mb-1">Install Moikas: Signal</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
              Install our app for offline reading and a better experience
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg shrink-0"
            onClick={handle_dismiss}
            aria-label="Dismiss install prompt"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button 
            onClick={handle_install}
            className="font-mono gap-2 flex-1"
          >
            <Download className="h-4 w-4" />
            Install App
          </Button>
          <Button 
            variant="outline" 
            onClick={handle_dismiss}
            className="font-mono"
          >
            Not Now
          </Button>
        </div>
      </Card>
    </div>
  )
}