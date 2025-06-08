import { z } from 'zod'

export const create_post_schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly'),
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