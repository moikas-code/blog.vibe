export interface Author {
  id: string
  clerk_id: string
  name: string
  bio?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  published: boolean
  author_id: string
  category_id?: string
  featured_image?: string
  meta_description?: string
  published_at?: string
  created_at: string
  updated_at: string
  author?: Author
  category?: Category
  tags?: Tag[]
}

export interface Tag {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface PostTag {
  post_id: string
  tag_id: string
}