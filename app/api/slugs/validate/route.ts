import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { 
  validate_and_suggest_slug, 
  generate_unique_slug,
  type SlugType 
} from '@/lib/utils/slug-manager'

const validate_slug_schema = z.object({
  slug: z.string().min(1),
  type: z.enum(['post', 'category', 'tag']),
  exclude_id: z.string().uuid().optional(),
  allow_cross_table_conflicts: z.boolean().default(false)
})

const generate_slug_schema = z.object({
  text: z.string().min(1),
  type: z.enum(['post', 'category', 'tag']),
  exclude_id: z.string().uuid().optional(),
  allow_cross_table_conflicts: z.boolean().default(false)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    
    if (action === 'validate') {
      const { slug, type, exclude_id, allow_cross_table_conflicts } = 
        validate_slug_schema.parse(body)
      
      const result = await validate_and_suggest_slug(
        slug,
        type as SlugType,
        exclude_id,
        allow_cross_table_conflicts
      )
      
      return NextResponse.json(result)
    }
    
    if (action === 'generate') {
      const { text, type, exclude_id, allow_cross_table_conflicts } = 
        generate_slug_schema.parse(body)
      
      const result = await generate_unique_slug(
        text,
        type as SlugType,
        exclude_id,
        allow_cross_table_conflicts
      )
      
      return NextResponse.json(result)
    }
    
    return NextResponse.json(
      { error: 'Invalid action. Use "validate" or "generate"' },
      { status: 400 }
    )
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Slug validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}