import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase/client'
import { supabaseAdmin } from '@/lib/supabase/server'
import { update_post_schema } from '@/lib/schemas/post'
import { z } from 'zod'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:authors(*),
        category:categories(*),
        tags:post_tags(tag:tags(*))
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = update_post_schema.parse(body)

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

    const { data: existingPost } = await supabase
      .from('posts')
      .select('author_id, published')
      .eq('id', params.id)
      .single()

    if (!existingPost || existingPost.author_id !== author.id) {
      return NextResponse.json(
        { error: 'Unauthorized to edit this post' },
        { status: 403 }
      )
    }

    const { tags, ...postData } = validatedData

    const updateData: any = { ...postData }
    if (postData.published && !existingPost.published) {
      updateData.published_at = new Date().toISOString()
    }

    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (postError) {
      return NextResponse.json({ error: postError.message }, { status: 500 })
    }

    if (tags !== undefined) {
      await supabaseAdmin
        .from('post_tags')
        .delete()
        .eq('post_id', params.id)

      if (tags.length > 0) {
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
    }

    return NextResponse.json(post)
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

export const PUT = PATCH

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    const { data: existingPost } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', params.id)
      .single()

    if (!existingPost || existingPost.author_id !== author.id) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this post' },
        { status: 403 }
      )
    }

    const { error } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}