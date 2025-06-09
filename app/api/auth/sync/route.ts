import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function POST() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user details from Clerk
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create or update author record
    const authorData = {
      clerk_id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Anonymous',
      avatar_url: user.imageUrl || null,
    }

    const { data, error } = await supabaseAdmin
      .from('authors')
      .upsert(authorData, { 
        onConflict: 'clerk_id',
        ignoreDuplicates: false 
      })
      .select()
      .single()

    if (error) {
      console.error('Error syncing author:', error)
      return NextResponse.json({ 
        error: 'Failed to sync author',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      author: data,
      message: 'Author profile synced successfully'
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}