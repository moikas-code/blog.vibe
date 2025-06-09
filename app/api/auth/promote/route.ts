import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { z } from 'zod'

const promote_schema = z.object({
  target_user_id: z.string(),
  role: z.enum(['reader', 'author', 'admin'])
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get current user's role
    const { data: currentUserData } = await supabaseAdmin
      .from('authors')
      .select('role')
      .eq('clerk_id', userId)
      .single()

    if (!currentUserData) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { target_user_id, role } = promote_schema.parse(body)

    // Check permissions
    if (role === 'author' && currentUserData.role !== 'admin') {
      // Allow self-promotion to author for readers
      if (target_user_id !== userId) {
        return NextResponse.json(
          { error: 'Only admins can promote other users to author' },
          { status: 403 }
        )
      }
    }

    if (role === 'admin' && currentUserData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can promote users to admin' },
        { status: 403 }
      )
    }

    // Perform the promotion
    let result
    if (role === 'author') {
      result = await supabaseAdmin.rpc('promote_to_author', {
        user_clerk_id: target_user_id
      })
    } else if (role === 'admin') {
      result = await supabaseAdmin.rpc('promote_to_admin', {
        user_clerk_id: target_user_id,
        admin_clerk_id: userId
      })
    } else {
      // Demote to reader
      result = await supabaseAdmin
        .from('authors')
        .update({ role: 'reader' })
        .eq('clerk_id', target_user_id)
    }

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      )
    }

    // Get updated user data
    const { data: updatedUser } = await supabaseAdmin
      .from('authors')
      .select('id, name, role')
      .eq('clerk_id', target_user_id)
      .single()

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `User successfully promoted to ${role}`
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Promotion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}