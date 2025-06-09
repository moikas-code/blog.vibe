'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Edit, Loader2 } from 'lucide-react'
import { useUserRole } from '@/lib/hooks/use-user-role'
import { toast } from 'sonner'

export function BecomeAuthorButton() {
  const { is_reader, promote_to_author } = useUserRole()
  const [is_promoting, set_is_promoting] = useState(false)

  if (!is_reader) {
    return null
  }

  const handle_promotion = async () => {
    set_is_promoting(true)
    
    try {
      const success = await promote_to_author()
      
      if (success) {
        toast.success('Welcome! You are now an author and can create posts and categories.')
      } else {
        toast.error('Failed to become an author. Please try again.')
      }
    } catch {
      toast.error('An error occurred. Please try again.')
    } finally {
      set_is_promoting(false)
    }
  }

  return (
    <Button
      onClick={handle_promotion}
      disabled={is_promoting}
      className="gap-2 font-mono rounded-lg glass gradient-ai"
    >
      {is_promoting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Edit className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">
        {is_promoting ? 'Becoming Author...' : 'Become an Author'}
      </span>
      <span className="sm:hidden">
        {is_promoting ? 'Processing...' : 'Become Author'}
      </span>
    </Button>
  )
}