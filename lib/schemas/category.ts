import { z } from 'zod'

export const create_category_schema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly'),
  description: z.string().max(200).optional(),
})

export const update_category_schema = create_category_schema.partial()

export type CreateCategoryInput = z.infer<typeof create_category_schema>
export type UpdateCategoryInput = z.infer<typeof update_category_schema>