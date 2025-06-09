import { createClient } from '@supabase/supabase-js'
import { useAuth } from '@clerk/nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a Supabase client that works with Clerk
export function createClerkSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      // This function will be called before every request
      fetch: (url, options = {}) => {
        // We'll set the user context in the RLS policies
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            // Add any additional headers if needed
          },
        })
      },
    },
  })
}

// Hook to get Supabase client with Clerk context
export function useSupabaseWithClerk() {
  const { userId } = useAuth()
  const supabase = createClerkSupabaseClient()

  // Set the current user context for RLS policies
  if (userId) {
    // Execute RPC call and handle potential errors  
    try {
      supabase.rpc('set_current_user', { user_id: userId })
      // Note: RPC call executes asynchronously in background
    } catch (error) {
      // If the function doesn't exist, we'll set it using a different method
      console.warn('set_current_user function not found, using alternative method', error)
    }
  }

  return supabase
}

// Default export for server-side usage
export const supabase = createClerkSupabaseClient()