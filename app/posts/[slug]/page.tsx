import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { formatDistanceToNow, format } from 'date-fns'
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react'

interface PostPageProps {
  params: {
    slug: string
  }
}

async function getPost(slug: string) {
  const { data } = await supabase
    .from('posts')
    .select(`
      *,
      author:authors(name, bio, avatar_url),
      category:categories(name, slug),
      tags:post_tags(tag:tags(name, slug))
    `)
    .eq('slug', slug)
    .eq('published', true)
    .single()

  return data
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/posts">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Posts
        </Button>
      </Link>

      <article>
        {post.featured_image && (
          <div className="aspect-video relative overflow-hidden rounded-lg mb-8">
            <img
              src={post.featured_image}
              alt={post.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          
          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>
          )}

          <div className="flex flex-wrap items-center gap-6 text-gray-600">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>by {post.author?.name || 'Anonymous'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.published_at || post.created_at}>
                {format(new Date(post.published_at || post.created_at), 'MMMM d, yyyy')}
              </time>
            </div>

            {post.category && (
              <Link
                href={`/posts?category=${post.category.slug}`}
                className="text-blue-600 hover:underline"
              >
                {post.category.name}
              </Link>
            )}
          </div>
        </header>

        <div 
          className="mb-12 text-gray-800 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags && post.tags.length > 0 && (
          <div className="border-t pt-6">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="h-4 w-4 text-gray-600" />
              {post.tags.map((tagItem: any) => (
                <Link
                  key={tagItem.tag.slug}
                  href={`/posts?tag=${tagItem.tag.slug}`}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  {tagItem.tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {post.author && (
          <Card className="mt-12">
            <CardContent className="flex items-start gap-4 p-6">
              {post.author.avatar_url && (
                <img
                  src={post.author.avatar_url}
                  alt={post.author.name}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <h3 className="font-semibold text-lg mb-1">About {post.author.name}</h3>
                <p className="text-gray-600">
                  {post.author.bio || 'No bio available'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </article>
    </main>
  )
}