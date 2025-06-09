import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { 
  Gamepad2, 
  Sparkles, 
  Brain, 
  Trophy, 
  Music, 
  TrendingUp,
  ArrowRight,
  Clock,
  User
} from 'lucide-react'

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
    .limit(8)

  return data || []
}

const categories = [
  { 
    name: 'Gaming', 
    slug: 'gaming', 
    icon: Gamepad2, 
    gradient: 'gradient-gaming',
    description: 'Latest gaming news, reviews, and esports'
  },
  { 
    name: 'Anime', 
    slug: 'anime', 
    icon: Sparkles, 
    gradient: 'gradient-anime',
    description: 'Anime reviews, news, and culture'
  },
  { 
    name: 'AI', 
    slug: 'ai', 
    icon: Brain, 
    gradient: 'gradient-ai',
    description: 'Artificial intelligence and machine learning'
  },
  { 
    name: 'Sports', 
    slug: 'sports', 
    icon: Trophy, 
    gradient: 'gradient-sports',
    description: 'Sports news, analysis, and highlights'
  },
  { 
    name: 'Music', 
    slug: 'music', 
    icon: Music, 
    gradient: 'gradient-music',
    description: 'Music reviews, news, and playlists'
  },
  { 
    name: 'Finance', 
    slug: 'finance', 
    icon: TrendingUp, 
    gradient: 'gradient-finance',
    description: 'Market analysis and financial insights'
  },
]

export default async function Home() {
  const posts = await getRecentPosts()

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 font-mono">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Feed
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 font-mono max-w-2xl mx-auto">
            A minimalist blog platform for tech enthusiasts, gamers, and digital culture aficionados
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/posts">
              <Button 
                size="lg" 
                className="font-mono bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
              >
                Explore Posts
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button 
                size="lg" 
                variant="outline" 
                className="font-mono border-gray-300 dark:border-gray-700"
              >
                Start Writing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center font-mono">Explore Topics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Link 
                  key={category.slug} 
                  href={`/posts?category=${category.slug}`}
                  className="group"
                >
                  <Card className="h-full glass glass-hover hover-lift cursor-pointer overflow-hidden">
                    <div className={`h-2 ${category.gradient}`} />
                    <CardContent className="p-6 text-center">
                      <div className={`inline-flex p-3 rounded-xl ${category.gradient} text-white mb-3`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-mono font-bold text-sm mb-1">{category.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {category.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Recent Posts Section */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold font-mono">Recent Posts</h2>
            <Link href="/posts">
              <Button variant="ghost" className="font-mono group">
                View all posts 
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                        post.category.slug === 'finance' ? 'gradient-finance' :
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Card className="glass p-12 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 font-mono">Join Our Community</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 font-mono">
              Share your thoughts on gaming, anime, AI, sports, music, and finance
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="font-mono bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200">
                  Get Started
                </Button>
              </Link>
              <Link href="/api/rss" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="font-mono">
                  Subscribe RSS
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </main>
  )
}