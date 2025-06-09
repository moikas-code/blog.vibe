'use client'

import { forwardRef, useImperativeHandle, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  RefreshCw, 
  AlertTriangle,
  Link
} from 'lucide-react'
import { use_slug_validation } from '@/lib/hooks/use-slug-validation'
import { cn } from '@/lib/utils'

type SlugType = 'post' | 'category' | 'tag'

interface SlugInputProps {
  label?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  type: SlugType
  exclude_id?: string
  allow_cross_table_conflicts?: boolean
  auto_generate_from?: string
  disabled?: boolean
  className?: string
  show_validation?: boolean
  show_preview?: boolean
}

export interface SlugInputRef {
  validate: () => void
  generate_from_text: (text: string) => Promise<string>
  get_current_slug: () => string
  is_valid: boolean
}

export const SlugInput = forwardRef<SlugInputRef, SlugInputProps>(({
  label = 'Slug',
  placeholder = 'my-awesome-slug',
  value = '',
  onChange,
  type,
  exclude_id,
  allow_cross_table_conflicts = false,
  auto_generate_from,
  disabled = false,
  className,
  show_validation = true,
  show_preview = true
}, ref) => {
  const [manual_edit, set_manual_edit] = useState(false)
  
  const {
    validation_result,
    is_validating,
    current_slug,
    update_slug,
    validate_slug,
    generate_slug,
    is_valid,
    has_issues,
    suggested_slug,
    issues
  } = use_slug_validation({
    type,
    exclude_id,
    allow_cross_table_conflicts,
    auto_validate: true,
    debounce_ms: 300
  })

  // Initialize slug if provided
  if (value !== current_slug && !manual_edit) {
    update_slug(value)
  }

  // Auto-generate from text if provided
  if (auto_generate_from && !manual_edit && !current_slug) {
    generate_slug(auto_generate_from)
  }

  const handle_change = (new_value: string) => {
    set_manual_edit(true)
    update_slug(new_value)
    onChange?.(new_value)
  }

  const handle_auto_generate = async () => {
    if (auto_generate_from) {
      const generated = await generate_slug(auto_generate_from)
      set_manual_edit(false)
      onChange?.(generated)
    }
  }

  const handle_use_suggestion = () => {
    if (suggested_slug) {
      update_slug(suggested_slug)
      onChange?.(suggested_slug)
    }
  }

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    validate: validate_slug,
    generate_from_text: generate_slug,
    get_current_slug: () => current_slug,
    is_valid
  }))

  const get_status_icon = () => {
    if (is_validating) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
    }
    
    if (!current_slug) {
      return null
    }
    
    if (is_valid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const get_input_class = () => {
    if (!current_slug || !show_validation) return ''
    
    if (is_validating) return 'border-blue-300'
    if (is_valid) return 'border-green-300'
    return 'border-red-300'
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor="slug" className="font-mono">
          {label}
        </Label>
        
        {auto_generate_from && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handle_auto_generate}
            disabled={disabled || is_validating}
            className="font-mono text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Auto-generate
          </Button>
        )}
      </div>

      <div className="relative">
        <Input
          id="slug"
          type="text"
          placeholder={placeholder}
          value={current_slug}
          onChange={(e) => handle_change(e.target.value)}
          disabled={disabled}
          className={cn(
            'font-mono pr-10',
            get_input_class()
          )}
          pattern="[a-z0-9-]+"
          title="Only lowercase letters, numbers, and hyphens"
        />
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {get_status_icon()}
        </div>
      </div>

      {show_preview && current_slug && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link className="h-3 w-3" />
          <span className="font-mono text-xs">
            /{type === 'post' ? 'posts' : type === 'category' ? 'categories' : 'tags'}/{current_slug}
          </span>
        </div>
      )}

      {show_validation && validation_result && (
        <div className="space-y-2">
          {!is_valid && issues.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="font-mono text-xs">
                <ul className="list-disc pl-4 space-y-1">
                  {issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {!is_valid && suggested_slug && suggested_slug !== current_slug && (
            <Alert>
              <AlertDescription className="font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span>Suggested: <code>{suggested_slug}</code></span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handle_use_suggestion}
                    className="font-mono text-xs"
                  >
                    Use Suggestion
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {is_valid && current_slug && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="font-mono text-xs text-green-700">
                Slug is available and valid
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  )
})

SlugInput.displayName = 'SlugInput'