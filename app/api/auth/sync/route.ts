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

    // Check if author already exists
    const { data: existingAuthor } = await supabaseAdmin
      .from('authors')
      .select('id, clerk_id, name, avatar_url, bio, role')
      .eq('clerk_id', user.id)
      .single()

    // Check if this is the first user (for admin bootstrap)
    let defaultRole = 'reader'
    if (!existingAuthor) {
      const { count } = await supabaseAdmin
        .from('authors')
        .select('*', { count: 'exact', head: true })
      
      // If no users exist, make this user an admin
      if (count === 0) {
        defaultRole = 'admin'
        console.log('🎉 First user detected - granting admin privileges!')
      }
    }

    // Create or update author record
    const authorData = {
      clerk_id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Anonymous',
      avatar_url: user.imageUrl || null,
      bio: existingAuthor?.bio || null, // Preserve existing bio
      role: existingAuthor?.role || defaultRole, // First user gets admin, others get reader
    }

    let data, error

    if (existingAuthor) {
      // Update existing author
      const result = await supabaseAdmin
        .from('authors')
        .update(authorData)
        .eq('id', existingAuthor.id)
        .select()
        .single()
      data = result.data
      error = result.error
    } else {
      // Insert new author - try using RPC to bypass potential RLS issues
      try {
        const result = await supabaseAdmin
          .from('authors')
          .insert(authorData)
          .select()
          .single()
        data = result.data
        error = result.error
      } catch (insertError) {
        // If direct insert fails, try using SQL
        console.log('Direct insert failed, trying SQL approach:', insertError)
        const sqlResult = await supabaseAdmin.rpc('create_author', {
          p_clerk_id: authorData.clerk_id,
          p_name: authorData.name,
          p_avatar_url: authorData.avatar_url,
          p_bio: authorData.bio,
          p_role: authorData.role
        })
        
        if (sqlResult.error) {
          error = sqlResult.error
        } else {
          // Get the created author
          const authorResult = await supabaseAdmin
            .from('authors')
            .select()
            .eq('clerk_id', authorData.clerk_id)
            .single()
          data = authorResult.data
          error = authorResult.error
        }
      }
    }

    if (error) {
      console.error('Error syncing author:', error)
      return NextResponse.json({ 
        error: 'Failed to sync author',
        details: error.message 
      }, { status: 500 })
    }

    const message = data?.role === 'admin' && defaultRole === 'admin' 
      ? 'Welcome, admin! You are the first user and have full system access.'
      : 'Author profile synced successfully'

    return NextResponse.json({ 
      success: true,
      author: data,
      message
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}