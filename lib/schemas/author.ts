import { z } from 'zod'

export const create_author_schema = z.object({
  clerk_id: z.string().min(1, 'Clerk ID is required'),
  name: z.string().min(1, 'Name is required').max(100),
  bio: z.string().max(500).optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
})

export const update_author_schema = create_author_schema.partial().omit({ clerk_id: true })

export type CreateAuthorInput = z.infer<typeof create_author_schema>
export type UpdateAuthorInput = z.infer<typeof update_author_schema>