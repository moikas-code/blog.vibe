import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react'

interface PostPageProps {
  params: Promise<{
    slug: string
  }>
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
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/posts">
        <Button variant="ghost" className="mb-6 font-mono rounded-lg">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Posts
        </Button>
      </Link>

      <article>
        {post.featured_image && (
          <div className="aspect-video relative overflow-hidden rounded-lg mb-8 glass">
            <img
              src={post.featured_image}
              alt={post.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4 font-mono">{post.title}</h1>
          
          {post.excerpt && (
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 font-mono">{post.excerpt}</p>
          )}

          <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400 font-mono text-sm">
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
                className={`px-3 py-1 rounded-lg text-white ${
                  post.category.slug === 'gaming' ? 'gradient-gaming' :
                  post.category.slug === 'anime' ? 'gradient-anime' :
                  post.category.slug === 'ai' ? 'gradient-ai' :
                  post.category.slug === 'sports' ? 'gradient-sports' :
                  post.category.slug === 'music' ? 'gradient-music' :
                  post.category.slug === 'news' ? 'gradient-news' :
                  'bg-gray-500'
                }`}
              >
                {post.category.name}
              </Link>
            )}
          </div>
        </header>

        <Card className="glass mb-12">
          <CardContent className="p-8">
            <div 
              className="ProseMirror text-gray-800 dark:text-gray-200"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </CardContent>
        </Card>

        {post.tags && post.tags.length > 0 && (
          <Card className="glass mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                {post.tags.map((tagItem: { tag: { slug: string; name: string } }) => (
                  <Link
                    key={tagItem.tag.slug}
                    href={`/posts?tag=${tagItem.tag.slug}`}
                    className="px-3 py-1 glass rounded-lg text-sm font-mono hover-lift transition-all"
                  >
                    {tagItem.tag.name}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {post.author && (
          <Card className="glass">
            <CardContent className="flex items-start gap-4 p-6">
              {post.author.avatar_url && (
                <img
                  src={post.author.avatar_url}
                  alt={post.author.name}
                  className="w-16 h-16 rounded-full glass"
                />
              )}
              <div>
                <h3 className="font-semibold text-lg mb-1 font-mono">About {post.author.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 font-mono">
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