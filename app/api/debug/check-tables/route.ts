import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET() {
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