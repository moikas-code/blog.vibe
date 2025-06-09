import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET() {
  // Only allow authenticated users to access this endpoint
  const { userId } = await auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // In production, you might want to restrict this to specific user IDs
  // if (process.env.NODE_ENV === 'production' && userId !== 'your_admin_user_id') {
  //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  // }

  try {
    // Check if authors table exists and has the right columns
    const { data: authorsData, error: authorsError } = await supabaseAdmin
      .from('authors')
      .select('*')
      .limit(1)

    // Try to count authors
    const { count, error: countError } = await supabaseAdmin
      .from('authors')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      success: true,
      authorsTableExists: !authorsError,
      authorsError: authorsError?.message,
      authorsCount: count,
      countError: countError?.message,
      sampleData: authorsData,
      serviceKeyExists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrlExists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      serviceKeyExists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrlExists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    })
  }
}