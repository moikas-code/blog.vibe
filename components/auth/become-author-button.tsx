'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Edit, Loader2 } from 'lucide-react'
import { use_user_role } from '@/lib/hooks/use-user-role'
import { toast } from 'sonner'

export function BecomeAuthorButton() {
  const { is_reader, promote_to_author } = use_user_role()
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
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      set_is_promoting(false)
    }
  }

  return (
    <Button
      onClick={handle_promotion}
      disabled={is_promoting}
      className="gap-2"
    >
      {is_promoting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Edit className="h-4 w-4" />
      )}
      {is_promoting ? 'Becoming Author...' : 'Become an Author'}
    </Button>
  )
}