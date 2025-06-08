import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'

interface PostsPageProps {
  searchParams: {
    category?: string
    page?: string
  }
}

async function getCategories() {
  const { data } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name')

  return data || []
}

async function getPosts(category?: string, page: number = 1, limit: number = 12) {
  const offset = (page - 1) * limit

  let query = supabase
    .from('posts')
    .select(`
      *,
      author:authors(name, avatar_url),
      category:categories(name, slug)
    `, { count: 'exact' })
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1)

  if (category) {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single()

    if (categoryData) {
      query = query.eq('category_id', categoryData.id)
    }
  }

  const { data, count } = await query

  return { posts: data || [], total: count || 0 }
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const page = parseInt(searchParams.page || '1')
  const limit = 12
  const { posts, total } = await getPosts(searchParams.category, page, limit)
  const categories = await getCategories()
  const totalPages = Math.ceil(total / limit)

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">All Posts</h1>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-2 flex-wrap">
            <Link href="/posts">
              <Button 
                variant={!searchParams.category ? "default" : "outline"}
                size="sm"
              >
                All Categories
              </Button>
            </Link>
            {categories.map((category) => (
              <Link key={category.id} href={`/posts?category=${category.slug}`}>
                <Button 
                  variant={searchParams.category === category.slug ? "default" : "outline"}
                  size="sm"
                >
                  {category.name}
                </Button>
              </Link>
            ))}
          </div>
          
          <p className="text-gray-600 ml-auto">
            Showing {posts.length} of {total} posts
          </p>
        </div>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">No posts found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              {post.featured_image && (
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
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
                <p className="text-gray-600 line-clamp-3 mb-4">
                  {post.excerpt || post.content}
                </p>
                <div className="flex items-center justify-between">
                  {post.category && (
                    <Link
                      href={`/posts?category=${post.category.slug}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {post.category.name}
                    </Link>
                  )}
                  <Link href={`/posts/${post.slug}`}>
                    <Button variant="ghost" size="sm">
                      Read More →
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          {page > 1 && (
            <Link href={`/posts?${searchParams.category ? `category=${searchParams.category}&` : ''}page=${page - 1}`}>
              <Button variant="outline">← Previous</Button>
            </Link>
          )}
          
          <span className="px-4 text-gray-600">
            Page {page} of {totalPages}
          </span>
          
          {page < totalPages && (
            <Link href={`/posts?${searchParams.category ? `category=${searchParams.category}&` : ''}page=${page + 1}`}>
              <Button variant="outline">Next →</Button>
            </Link>
          )}
        </div>
      )}
    </main>
  )
}