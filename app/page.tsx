import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'

async function getRecentPosts() {
  const { data } = await supabase
    .from('posts')
    .select(`
      *,
      author:authors(name, avatar_url),
      category:categories(name, slug)
    `)
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(6)

  return data || []
}

export default async function Home() {
  const posts = await getRecentPosts()

  return (
    <main className="container mx-auto px-4 py-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Feed</h1>
        <p className="text-lg text-gray-600 mb-6">
          A multi-author blog platform with RSS feed support
        </p>
        <div className="space-x-4">
          <Link href="/posts">
            <Button size="lg">Browse Posts</Button>
          </Link>
          <Link href="/sign-up">
            <Button size="lg" variant="outline">
              Become an Author
            </Button>
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Recent Posts</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <CardTitle className="line-clamp-2">
                  <Link href={`/posts/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </CardTitle>
                <CardDescription>
                  by {post.author?.name || 'Anonymous'} •{' '}
                  {formatDistanceToNow(new Date(post.published_at || post.created_at), {
                    addSuffix: true,
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 line-clamp-3">
                  {post.excerpt || post.content}
                </p>
                {post.category && (
                  <Link
                    href={`/categories/${post.category.slug}`}
                    className="inline-block mt-4 text-sm text-blue-600 hover:underline"
                  >
                    {post.category.name}
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Subscribe to our RSS Feed</h2>
        <p className="text-gray-600 mb-4">
          Stay updated with our latest posts by subscribing to our RSS feed
        </p>
        <Link href="/api/rss" target="_blank" rel="noopener noreferrer">
          <Button variant="outline">
            Subscribe to RSS
          </Button>
        </Link>
      </section>
    </main>
  )
}