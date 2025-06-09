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

export const create_category_schema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  slug: slug_schema,
  description: z.string().max(200).optional(),
})

export const update_category_schema = create_category_schema.partial()

export type CreateCategoryInput = z.infer<typeof create_category_schema>
export type UpdateCategoryInput = z.infer<typeof update_category_schema>