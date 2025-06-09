import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { Clock, User } from 'lucide-react'

interface PostsPageProps {
  searchParams: Promise<{
    category?: string
    page?: string
  }>
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
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const limit = 12
  const { posts, total } = await getPosts(params.category, page, limit)
  const categories = await getCategories()
  const totalPages = Math.ceil(total / limit)

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6 font-mono">All Posts</h1>
        
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <Link href="/posts">
              <Button 
                variant={!params.category ? "default" : "outline"}
                size="sm"
                className="font-mono rounded-lg"
              >
                All
              </Button>
            </Link>
            {categories.map((category) => (
              <Link key={category.id} href={`/posts?category=${category.slug}`}>
                <Button 
                  variant={params.category === category.slug ? "default" : "outline"}
                  size="sm"
                  className="font-mono rounded-lg"
                >
                  {category.name}
                </Button>
              </Link>
            ))}
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 ml-auto font-mono">
            {total} posts
          </p>
        </div>
      </div>

      {posts.length === 0 ? (
        <Card className="glass">
          <CardContent className="text-center py-12">
            <p className="text-gray-500 font-mono">No posts found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/posts/${post.slug}`} className="group">
              <Card className="h-full glass glass-hover hover-lift cursor-pointer">
                {post.featured_image && (
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardContent className="p-6">
                  {post.category && (
                    <span className={`inline-block px-2 py-1 text-xs font-mono rounded-md mb-3 text-white ${
                      post.category.slug === 'gaming' ? 'gradient-gaming' :
                      post.category.slug === 'anime' ? 'gradient-anime' :
                      post.category.slug === 'ai' ? 'gradient-ai' :
                      post.category.slug === 'sports' ? 'gradient-sports' :
                      post.category.slug === 'music' ? 'gradient-music' :
                      post.category.slug === 'news' ? 'gradient-news' :
                      'bg-gray-500'
                    }`}>
                      {post.category.name}
                    </span>
                  )}
                  
                  <h3 className="font-mono font-bold line-clamp-2 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 font-mono">
                    {post.excerpt || post.content}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 font-mono">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{post.author?.name || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(post.published_at || post.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          {page > 1 && (
            <Link href={`/posts?${params.category ? `category=${params.category}&` : ''}page=${page - 1}`}>
              <Button variant="outline" className="font-mono">← Previous</Button>
            </Link>
          )}
          
          <span className="px-4 text-sm text-gray-600 font-mono">
            Page {page} of {totalPages}
          </span>
          
          {page < totalPages && (
            <Link href={`/posts?${params.category ? `category=${params.category}&` : ''}page=${page + 1}`}>
              <Button variant="outline" className="font-mono">Next →</Button>
            </Link>
          )}
        </div>
      )}
    </main>
  )
}