import { supabaseAdmin } from '@/lib/supabase/server'

// Reserved system routes that should never be used as slugs
const RESERVED_SLUGS = [
  'api',
  'dashboard',
  'admin',
  'auth',
  'sign-in',
  'sign-up',
  'posts',
  'categories',
  'tags',
  'authors',
  'rss',
  'sitemap',
  'robots',
  'favicon',
  'static',
  'assets',
  '_next',
  'public',
  'webhooks',
  'debug'
] as const

export type SlugType = 'post' | 'category' | 'tag'

/**
 * Generate a URL-friendly slug from a title/name
 */
export function generate_slug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Check if a slug is reserved
 */
export function is_reserved_slug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug as any)
}

/**
 * Check if a slug exists in the database for a specific type
 */
export async function slug_exists(
  slug: string, 
  type: SlugType, 
  exclude_id?: string
): Promise<boolean> {
  const table = type === 'post' ? 'posts' : 
                type === 'category' ? 'categories' : 
                'tags'
  
  let query = supabaseAdmin
    .from(table)
    .select('id')
    .eq('slug', slug)
  
  if (exclude_id) {
    query = query.neq('id', exclude_id)
  }
  
  const { data, error } = await query.single()
  
  if (error && error.code !== 'PGRST116') {
    console.error(`Error checking slug existence for ${type}:`, error)
    return true // Assume exists to be safe
  }
  
  return !!data
}

/**
 * Check for cross-table slug conflicts
 */
export async function has_cross_table_conflicts(
  slug: string, 
  current_type: SlugType,
  exclude_id?: string
): Promise<{ conflicts: boolean; conflicting_types: SlugType[] }> {
  const types_to_check: SlugType[] = ['post', 'category', 'tag'].filter(
    type => type !== current_type
  )
  
  const conflicting_types: SlugType[] = []
  
  for (const type of types_to_check) {
    const exists = await slug_exists(slug, type)
    if (exists) {
      conflicting_types.push(type)
    }
  }
  
  return {
    conflicts: conflicting_types.length > 0,
    conflicting_types
  }
}

/**
 * Generate a unique slug by appending numbers if conflicts exist
 */
export async function generate_unique_slug(
  base_text: string,
  type: SlugType,
  exclude_id?: string,
  allow_cross_table_conflicts = false
): Promise<{ slug: string; had_conflicts: boolean }> {
  let base_slug = generate_slug(base_text)
  let had_conflicts = false
  
  // Check if it's a reserved slug
  if (is_reserved_slug(base_slug)) {
    base_slug = `${base_slug}-${type}`
    had_conflicts = true
  }
  
  let attempt = 0
  let candidate_slug = base_slug
  
  while (attempt < 100) { // Prevent infinite loops
    // Check same-table conflicts
    const same_table_conflict = await slug_exists(candidate_slug, type, exclude_id)
    
    // Check cross-table conflicts if not allowed
    let cross_table_conflict = false
    if (!allow_cross_table_conflicts) {
      const { conflicts } = await has_cross_table_conflicts(candidate_slug, type, exclude_id)
      cross_table_conflict = conflicts
    }
    
    if (!same_table_conflict && !cross_table_conflict) {
      return { slug: candidate_slug, had_conflicts }
    }
    
    // Generate next candidate
    attempt++
    candidate_slug = `${base_slug}-${attempt}`
    had_conflicts = true
  }
  
  // Fallback with timestamp if we hit the limit
  const timestamp = Date.now().toString().slice(-6)
  return { 
    slug: `${base_slug}-${timestamp}`, 
    had_conflicts: true 
  }
}

/**
 * Validate and suggest a slug
 */
export async function validate_and_suggest_slug(
  proposed_slug: string,
  type: SlugType,
  exclude_id?: string,
  allow_cross_table_conflicts = false
): Promise<{
  is_valid: boolean
  suggested_slug: string
  issues: string[]
}> {
  const issues: string[] = []
  
  // Basic format validation
  const slug_pattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  if (!slug_pattern.test(proposed_slug)) {
    issues.push('Slug must contain only lowercase letters, numbers, and hyphens')
  }
  
  // Length validation
  if (proposed_slug.length < 1) {
    issues.push('Slug cannot be empty')
  }
  
  if (proposed_slug.length > 100) {
    issues.push('Slug is too long (max 100 characters)')
  }
  
  // Reserved slug check
  if (is_reserved_slug(proposed_slug)) {
    issues.push(`"${proposed_slug}" is a reserved system route`)
  }
  
  // Same-table conflict check
  if (await slug_exists(proposed_slug, type, exclude_id)) {
    issues.push(`A ${type} with this slug already exists`)
  }
  
  // Cross-table conflict check
  if (!allow_cross_table_conflicts) {
    const { conflicts, conflicting_types } = await has_cross_table_conflicts(
      proposed_slug, 
      type, 
      exclude_id
    )
    if (conflicts) {
      issues.push(
        `This slug conflicts with existing ${conflicting_types.join(', ')}`
      )
    }
  }
  
  const is_valid = issues.length === 0
  
  // Suggest an alternative if invalid
  let suggested_slug = proposed_slug
  if (!is_valid) {
    const { slug } = await generate_unique_slug(
      proposed_slug, 
      type, 
      exclude_id, 
      allow_cross_table_conflicts
    )
    suggested_slug = slug
  }
  
  return {
    is_valid,
    suggested_slug,
    issues
  }
}

/**
 * Get routing priority for conflict resolution
 * Lower number = higher priority
 */
export function get_routing_priority(type: SlugType): number {
  switch (type) {
    case 'post': return 1    // Highest priority
    case 'category': return 2
    case 'tag': return 3     // Lowest priority
    default: return 999
  }
}

/**
 * Resolve routing conflicts by checking which content should take precedence
 */
export async function resolve_slug_routing(slug: string): Promise<{
  type: SlugType | null
  content_id: string | null
  has_conflicts: boolean
  all_matches: Array<{ type: SlugType; id: string }>
}> {
  const all_matches: Array<{ type: SlugType; id: string }> = []
  
  // Check all tables for matches
  const types: SlugType[] = ['post', 'category', 'tag']
  
  for (const type of types) {
    const table = type === 'post' ? 'posts' : 
                  type === 'category' ? 'categories' : 
                  'tags'
    
    const { data } = await supabaseAdmin
      .from(table)
      .select('id')
      .eq('slug', slug)
      .single()
    
    if (data) {
      all_matches.push({ type, id: data.id })
    }
  }
  
  if (all_matches.length === 0) {
    return {
      type: null,
      content_id: null,
      has_conflicts: false,
      all_matches: []
    }
  }
  
  // Sort by priority (lower number = higher priority)
  all_matches.sort((a, b) => 
    get_routing_priority(a.type) - get_routing_priority(b.type)
  )
  
  const winner = all_matches[0]
  
  return {
    type: winner.type,
    content_id: winner.id,
    has_conflicts: all_matches.length > 1,
    all_matches
  }
}