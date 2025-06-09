import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        hint: 'Make sure you are logged in'
      }, { status: 401 })
    }

    // Check if webhook secret is configured
    const webhookSecretExists = !!process.env.CLERK_WEBHOOK_SECRET
    
    // Check if author record exists
    const { data: author, error } = await supabase
      .from('authors')
      .select('*')
      .eq('clerk_id', userId)
      .single()

    // Check environment variables
    const envCheck = {
      CLERK_WEBHOOK_SECRET: webhookSecretExists,
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      CLERK_SECRET_KEY: !!process.env.CLERK_SECRET_KEY,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    }

    return NextResponse.json({
      userId,
      authorExists: !!author,
      authorData: author,
      authorError: error?.message,
      environmentVariables: envCheck,
      debug: {
        hint: !author ? 'Author record missing - webhook may not be configured' : 'Author record exists',
        webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.vercel.app'}/api/webhooks/clerk`
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Debug check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}