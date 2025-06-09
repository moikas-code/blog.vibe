'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase/client'

export type UserRole = 'reader' | 'author' | 'admin'

interface UserProfile {
  id: string
  clerk_id: string
  name: string
  role: UserRole
  bio?: string
  avatar_url?: string
}

export function use_user_role() {
  const { user, isLoaded } = useUser()
  const [user_profile, set_user_profile] = useState<UserProfile | null>(null)
  const [is_loading, set_is_loading] = useState(true)
  const [error, set_error] = useState<string | null>(null)

  const fetch_user_profile = async () => {
    if (!isLoaded || !user) {
      set_is_loading(false)
      return
    }

    try {
      // Set the current user context for RLS policies
      await supabase.rpc('set_current_user', { user_id: user.id })

      const { data, error } = await supabase
        .from('authors')
        .select('id, clerk_id, name, role, bio, avatar_url')
        .eq('clerk_id', user.id)
        .single()

      if (error) {
        throw error
      }

      set_user_profile(data)
      set_error(null)
    } catch (err) {
      console.error('Error fetching user profile:', err)
      set_error('Failed to fetch user profile')
      set_user_profile(null)
    } finally {
      set_is_loading(false)
    }
  }

  useEffect(() => {
    fetch_user_profile()
  }, [user, isLoaded])

  const is_reader = user_profile?.role === 'reader'
  const is_author = user_profile?.role === 'author'
  const is_admin = user_profile?.role === 'admin'
  const can_create_posts = is_author || is_admin
  const can_manage_categories = is_admin
  const can_manage_users = is_admin

  const promote_to_author = async (): Promise<boolean> => {
    if (!user || !is_reader) return false

    try {
      const response = await fetch('/api/auth/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_user_id: user.id,
          role: 'author'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to promote to author')
      }

      // Refresh user profile
      await fetch_user_profile()
      return true
    } catch (err) {
      console.error('Error promoting to author:', err)
      return false
    }
  }

  const promote_user = async (target_user_id: string, role: UserRole): Promise<boolean> => {
    if (!user || !can_manage_users) return false

    try {
      const response = await fetch('/api/auth/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_user_id,
          role
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to promote user to ${role}`)
      }

      return true
    } catch (err) {
      console.error('Error promoting user:', err)
      return false
    }
  }

  return {
    user_profile,
    is_loading,
    error,
    is_reader,
    is_author,
    is_admin,
    can_create_posts,
    can_manage_categories,
    can_manage_users,
    promote_to_author,
    promote_user,
    refresh: fetch_user_profile
  }
}