import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/posts/create',
  '/api/posts/update/(.*)',
  '/api/posts/delete/(.*)',
  '/api/categories/create',
  '/api/categories/update/(.*)',
  '/api/categories/delete/(.*)',
])

// Initialize Supabase client for middleware
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default clerkMiddleware(async (auth, req) => {
  // Handle legacy post URLs
  const pathname = req.nextUrl.pathname
  const legacyPostMatch = pathname.match(/^\/posts\/([^\/]+)$/)
  
  if (legacyPostMatch && legacyPostMatch[1]) {
    const slug = legacyPostMatch[1]
    
    // Check if this is actually an author ID (UUID format)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(slug)) {
      // This is a legacy slug, not an author ID
      try {
        const { data: post } = await supabase
          .from('posts')
          .select('author_id, slug')
          .eq('slug', slug)
          .eq('published', true)
          .single()
        
        if (post) {
          // Redirect to the new URL structure
          return NextResponse.redirect(
            new URL(`/posts/${post.author_id}/${post.slug}`, req.url)
          )
        }
      } catch (error) {
        // Post not found, continue to 404
      }
    }
  }
  
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}