import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase/client'
import { supabaseAdmin } from '@/lib/supabase/server'
import { create_post_schema } from '@/lib/schemas/post'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const published = searchParams.get('published') === 'true'
    const category_id = searchParams.get('category_id')
    const author_id = searchParams.get('author_id')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('posts')
      .select(`
        *,
        author:authors(*),
        category:categories(*),
        tags:post_tags(tag:tags(*))
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)

    if (published) {
      query = query.eq('published', true)
    }

    if (category_id) {
      query = query.eq('category_id', category_id)
    }

    if (author_id) {
      query = query.eq('author_id', author_id)
    }

    const { data, error } = await query

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

    const body = await request.json()
    const validatedData = create_post_schema.parse(body)

    const { data: author } = await supabase
      .from('authors')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (!author) {
      return NextResponse.json(
        { error: 'Author profile not found' },
        { status: 404 }
      )
    }

    const { tags, ...postData } = validatedData

    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .insert({
        ...postData,
        author_id: author.id,
        published_at: postData.published ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (postError) {
      return NextResponse.json({ error: postError.message }, { status: 500 })
    }

    if (tags && tags.length > 0) {
      const tagPromises = tags.map(async (tagName) => {
        const slug = tagName.toLowerCase().replace(/\s+/g, '-')
        
        const { data: existingTag } = await supabaseAdmin
          .from('tags')
          .select('id')
          .eq('slug', slug)
          .single()

        let tagId = existingTag?.id

        if (!existingTag) {
          const { data: newTag } = await supabaseAdmin
            .from('tags')
            .insert({ name: tagName, slug })
            .select('id')
            .single()
          
          tagId = newTag?.id
        }

        if (tagId) {
          await supabaseAdmin
            .from('post_tags')
            .insert({ post_id: post.id, tag_id: tagId })
        }
      })

      await Promise.all(tagPromises)
    }

    return NextResponse.json(post, { status: 201 })
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