import { redirect, notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

interface LegacyPostPageProps {
  params: Promise<{
    slug: string
  }>
}

async function findPostBySlug(slug: string) {
  const { data } = await supabase
    .from('posts')
    .select('slug, author_id')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  return data
}

export default async function LegacyPostPage({ params }: LegacyPostPageProps) {
  const { slug } = await params
  const post = await findPostBySlug(slug)

  if (!post) {
    notFound()
  }
  
  // Redirect to the new URL structure
  redirect(`/posts/${post.author_id}/${post.slug}`)
}