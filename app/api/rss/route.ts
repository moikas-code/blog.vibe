import { NextResponse } from 'next/server'
import RSS from 'rss'
import { supabase } from '@/lib/supabase/client'

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    const feed = new RSS({
      title: 'Feed',
      description: 'A multi-author blog with RSS feed',
      feed_url: `${baseUrl}/api/rss`,
      site_url: baseUrl,
      image_url: `${baseUrl}/logo.png`,
      managingEditor: 'editor@blogfeed.com',
      webMaster: 'webmaster@blogfeed.com',
      copyright: `${new Date().getFullYear()} Feed`,
      language: 'en',
      categories: ['Blog', 'Technology', 'Writing'],
      pubDate: new Date().toUTCString(),
      ttl: 60,
    })

    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:authors(name),
        category:categories(name)
      `)
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(50)

    if (error) {
      throw error
    }

    posts?.forEach((post) => {
      feed.item({
        title: post.title,
        description: post.excerpt || post.content.substring(0, 200) + '...',
        url: `${baseUrl}/posts/${post.slug}`,
        guid: post.id,
        categories: post.category ? [post.category.name] : [],
        author: post.author?.name || 'Anonymous',
        date: new Date(post.published_at || post.created_at),
        enclosure: post.featured_image
          ? {
              url: post.featured_image,
              type: 'image/jpeg',
            }
          : undefined,
      })
    })

    const xml = feed.xml({ indent: true })

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('RSS feed error:', error)
    return NextResponse.json(
      { error: 'Failed to generate RSS feed' },
      { status: 500 }
    )
  }
}