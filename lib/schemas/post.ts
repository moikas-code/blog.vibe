import { z } from 'zod'

// Enhanced slug validation schema
const slug_schema = z.string()
  .min(1, 'Slug is required')
  .max(100, 'Slug is too long (max 100 characters)')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
  .refine(slug => {
    // Check for reserved slugs
    const reserved = ['api', 'dashboard', 'admin', 'auth', 'sign-in', 'sign-up', 'posts', 'categories', 'tags', 'authors', 'rss', 'sitemap', 'robots', 'favicon', 'static', 'assets', '_next', 'public', 'webhooks', 'debug']
    return !reserved.includes(slug)
  }, 'This slug is reserved and cannot be used')

export const create_post_schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: slug_schema,
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  category_id: z.string().uuid().optional(),
  featured_image: z.string().url().optional().or(z.literal('')),
  meta_description: z.string().max(160).optional(),
  published: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
})

export const update_post_schema = create_post_schema.partial()

export type CreatePostInput = z.infer<typeof create_post_schema>
export type UpdatePostInput = z.infer<typeof update_post_schema>