import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { Edit, Trash2, FileText, Plus } from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'

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
      <DashboardHeader />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-mono">Dashboard</h1>
        <Link href="/dashboard/posts/new">
          <Button className="font-mono rounded-lg glass gradient-ai">
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="font-mono flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your Posts
          </CardTitle>
          <CardDescription className="font-mono">Manage your blog posts</CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 font-mono mb-4">
                You haven&apos;t created any posts yet.
              </p>
              <Link href="/dashboard/posts/new">
                <Button className="font-mono rounded-lg glass gradient-ai">
                  Create Your First Post
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 glass rounded-lg hover-lift"
                >
                  <div className="flex-1">
                    <h3 className="font-mono font-bold mb-1">{post.title}</h3>
                    <div className="flex items-center gap-3 text-sm font-mono">
                      <span className={`px-2 py-1 rounded-md ${
                        post.published 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                      {post.category && (
                        <span className={`px-2 py-1 rounded-md text-white ${
                          post.category.slug === 'gaming' ? 'gradient-gaming' :
                          post.category.slug === 'anime' ? 'gradient-anime' :
                          post.category.slug === 'ai' ? 'gradient-ai' :
                          post.category.slug === 'sports' ? 'gradient-sports' :
                          post.category.slug === 'music' ? 'gradient-music' :
                          post.category.slug === 'finance' ? 'gradient-finance' :
                          'bg-gray-500'
                        }`}>
                          {post.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link href={`/dashboard/posts/${post.id}/edit`}>
                      <Button variant="ghost" size="sm" className="font-mono">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="font-mono text-red-600 hover:text-red-700">
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