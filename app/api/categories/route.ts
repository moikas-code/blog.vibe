import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase/client'
import { supabaseAdmin } from '@/lib/supabase/server'
import { create_category_schema } from '@/lib/schemas/category'
import { z } from 'zod'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user exists and has permission to create categories
    const { data: author } = await supabaseAdmin
      .from('authors')
      .select('id, role')
      .eq('clerk_id', userId)
      .single()

    if (!author) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Only admin and author roles can create categories
    if (!['admin', 'author'].includes(author.role)) {
      return NextResponse.json(
        { error: 'Only authors and admins can create categories' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = create_category_schema.parse(body)

    // Use supabaseAdmin to bypass RLS policies
    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert(validatedData)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Category with this name or slug already exists' },
          { status: 409 }
        )
      }
      console.error('Error creating category:', error)
      return NextResponse.json({ 
        error: 'Failed to create category',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}