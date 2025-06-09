import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  try {
    // Check if user is authenticated for security
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Test service role by trying to read from authors table
    const { data, error } = await supabaseAdmin
      .from('authors')
      .select('id, name, clerk_id')
      .limit(5)

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: 'Service role cannot access authors table'
      })
    }

    // Test if we can write to authors table
    const testData = {
      clerk_id: `test_${Date.now()}`,
      name: 'Test User',
      avatar_url: null
    }

    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('authors')
      .insert(testData)
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({
        success: false,
        readAccess: true,
        writeAccess: false,
        writeError: insertError.message,
        authorsCount: data?.length || 0
      })
    }

    // Clean up test data
    await supabaseAdmin
      .from('authors')
      .delete()
      .eq('id', insertData.id)

    return NextResponse.json({
      success: true,
      readAccess: true,
      writeAccess: true,
      authorsCount: data?.length || 0,
      message: 'Service role is working correctly'
    })

  } catch (error) {
    console.error('Service role test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}