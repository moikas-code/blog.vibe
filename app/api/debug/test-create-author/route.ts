import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function POST() {
  // Test data from your webhook
  const testAuthorData = {
    clerk_id: 'user_2yFd566gvYDQrTKfgSUxRYVnDrC',
    name: 'Warren Gates',
    avatar_url: 'https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18yeUZTODcwZEo2Qmo3YXhkUHdyNGJVeGg2ZlMiLCJyaWQiOiJ1c2VyXzJ5RmQ1NjZndllEUXJUS2ZnU1V4UllWbkRyQyIsImluaXRpYWxzIjoiV0cifQ'
  }

  try {
    console.log('Testing author creation with:', testAuthorData)
    
    const { data, error } = await supabaseAdmin
      .from('authors')
      .upsert(testAuthorData, { 
        onConflict: 'clerk_id',
        ignoreDuplicates: false 
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        testData: testAuthorData
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      author: data,
      message: 'Author created/updated successfully'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      testData: testAuthorData
    }, { status: 500 })
  }
}