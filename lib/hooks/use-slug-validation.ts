import { useState, useCallback, useEffect, useRef } from 'react'

// Simple debounce implementation
function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const timeout_ref = useRef<NodeJS.Timeout | undefined>(undefined)
  
  return useCallback((...args: Parameters<T>) => {
    clearTimeout(timeout_ref.current)
    timeout_ref.current = setTimeout(() => callback(...args), delay)
  }, [callback, delay]) as T
}

type SlugType = 'post' | 'category' | 'tag'

interface SlugValidationResult {
  is_valid: boolean
  suggested_slug: string
  issues: string[]
}

interface UseSlugValidationOptions {
  type: SlugType
  exclude_id?: string
  allow_cross_table_conflicts?: boolean
  auto_validate?: boolean
  debounce_ms?: number
}

export function useSlugValidation({
  type,
  exclude_id,
  allow_cross_table_conflicts = false,
  auto_validate = true,
  debounce_ms = 500
}: UseSlugValidationOptions) {
  const [validation_result, set_validation_result] = useState<SlugValidationResult | null>(null)
  const [is_validating, set_is_validating] = useState(false)
  const [current_slug, set_current_slug] = useState('')

  const validate_slug = useCallback(async (slug: string) => {
    if (!slug.trim()) {
      set_validation_result(null)
      return
    }

    set_is_validating(true)
    
    try {
      const response = await fetch('/api/slugs/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'validate',
          slug: slug.trim(),
          type,
          exclude_id,
          allow_cross_table_conflicts
        })
      })

      if (!response.ok) {
        throw new Error('Validation failed')
      }

      const result: SlugValidationResult = await response.json()
      set_validation_result(result)
    } catch (error) {
      console.error('Slug validation error:', error)
      set_validation_result({
        is_valid: false,
        suggested_slug: slug,
        issues: ['Validation failed. Please try again.']
      })
    } finally {
      set_is_validating(false)
    }
  }, [type, exclude_id, allow_cross_table_conflicts])

  const debounced_validate = useDebounce(validate_slug, debounce_ms)

  const generate_slug = useCallback(async (text: string) => {
    if (!text.trim()) return ''

    set_is_validating(true)
    
    try {
      const response = await fetch('/api/slugs/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          text: text.trim(),
          type,
          exclude_id,
          allow_cross_table_conflicts
        })
      })

      if (!response.ok) {
        throw new Error('Generation failed')
      }

      const result = await response.json()
      return result.slug
    } catch (error) {
      console.error('Slug generation error:', error)
      // Fallback to basic generation
      return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
    } finally {
      set_is_validating(false)
    }
  }, [type, exclude_id, allow_cross_table_conflicts])

  const update_slug = useCallback((slug: string) => {
    set_current_slug(slug)
    
    if (auto_validate) {
      debounced_validate(slug)
    }
  }, [auto_validate, debounced_validate])

  const force_validate = useCallback(() => {
    if (current_slug) {
      validate_slug(current_slug)
    }
  }, [current_slug, validate_slug])

  // Auto-generate slug from text
  const auto_generate_from_text = useCallback(async (text: string) => {
    const generated_slug = await generate_slug(text)
    update_slug(generated_slug)
    return generated_slug
  }, [generate_slug, update_slug])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup happens automatically with timeout refs
    }
  }, [])

  return {
    validation_result,
    is_validating,
    current_slug,
    update_slug,
    validate_slug: force_validate,
    generate_slug: auto_generate_from_text,
    
    // Computed properties
    is_valid: validation_result?.is_valid ?? true,
    has_issues: (validation_result?.issues?.length ?? 0) > 0,
    suggested_slug: validation_result?.suggested_slug,
    issues: validation_result?.issues ?? []
  }
}