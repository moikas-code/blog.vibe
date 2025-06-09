import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { PlusCircle, Edit, Trash2, FolderPlus } from 'lucide-react'

async function getAuthorPosts(clerkId: string) {
  const { data: author } = await supabase
    .from('authors')
    .select('id')
    .eq('clerk_id', clerkId)
    .single()

  if (!author) return []

  const { data } = await supabase
    .from('posts')
    .select(`
      *,
      category:categories(name, slug)
    `)
    .eq('author_id', author.id)
    .order('created_at', { ascending: false })

  return data || []
}

export default async function DashboardPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  const posts = await getAuthorPosts(userId)

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/dashboard/categories">
            <Button variant="outline">
              <FolderPlus className="mr-2 h-4 w-4" />
              Manage Categories
            </Button>
          </Link>
          <Link href="/dashboard/posts/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Posts</CardTitle>
          <CardDescription>Manage your blog posts</CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              You haven't created any posts yet.
            </p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{post.title}</h3>
                    <p className="text-sm text-gray-500">
                      {post.published ? 'Published' : 'Draft'} •{' '}
                      {post.category?.name || 'Uncategorized'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link href={`/dashboard/posts/${post.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}