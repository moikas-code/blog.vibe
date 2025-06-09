# 🔗 Slug Management System

This guide explains how to prevent slug conflicts and ensure URL uniqueness in your blog platform.

## 📋 **Overview**

The slug management system prevents conflicts between:
- **Post slugs** vs **Category slugs** vs **Tag slugs**
- **User slugs** vs **Reserved system routes**
- **New slugs** vs **Existing content**

## 🛡️ **Conflict Prevention Strategies**

### 1. **Reserved Routes Protection**
```typescript
// These routes are automatically protected
const RESERVED_SLUGS = [
  'api', 'dashboard', 'admin', 'auth',
  'sign-in', 'sign-up', 'posts', 'categories',
  'tags', 'authors', 'rss', 'sitemap',
  'robots', 'favicon', 'static', 'assets',
  '_next', 'public', 'webhooks', 'debug'
]
```

### 2. **Database Constraints**
- `UNIQUE` constraints on slug columns in each table
- Cross-table validation through application logic
- Automatic numbering for conflicts (`my-post-1`, `my-post-2`)

### 3. **Routing Priority**
When conflicts exist, this is the resolution order:
1. **Posts** (highest priority)
2. **Categories** 
3. **Tags** (lowest priority)

## 🚀 **Usage Examples**

### Using the SlugInput Component

```tsx
import { SlugInput } from '@/components/ui/slug-input'

function CreatePostForm() {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: ''
  })

  return (
    <form>
      <div>
        <label>Title</label>
        <input 
          value={formData.title}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            title: e.target.value
          }))}
        />
      </div>

      <SlugInput
        type="post"
        value={formData.slug}
        onChange={(slug) => setFormData(prev => ({ ...prev, slug }))}
        auto_generate_from={formData.title}
        show_validation={true}
        show_preview={true}
      />
    </form>
  )
}
```

### Manual Slug Validation

```typescript
import { validate_and_suggest_slug } from '@/lib/utils/slug-manager'

async function checkSlug() {
  const result = await validate_and_suggest_slug(
    'my-proposed-slug',
    'post',
    undefined, // exclude_id for updates
    false // don't allow cross-table conflicts
  )

  if (!result.is_valid) {
    console.log('Issues:', result.issues)
    console.log('Suggested:', result.suggested_slug)
  }
}
```

### Server-Side Validation

```typescript
// In your API route
import { generate_unique_slug } from '@/lib/utils/slug-manager'

export async function POST(request: Request) {
  const { title } = await request.json()
  
  // Generate a guaranteed unique slug
  const { slug, had_conflicts } = await generate_unique_slug(
    title,
    'post'
  )
  
  if (had_conflicts) {
    console.log('Original slug had conflicts, used:', slug)
  }
  
  // Save to database...
}
```

## 🎯 **API Endpoints**

### Validate Slug
```bash
POST /api/slugs/validate
{
  "action": "validate",
  "slug": "my-slug",
  "type": "post",
  "exclude_id": "uuid-for-updates",
  "allow_cross_table_conflicts": false
}
```

### Generate Unique Slug
```bash
POST /api/slugs/validate
{
  "action": "generate", 
  "text": "My Awesome Post Title",
  "type": "post",
  "exclude_id": "uuid-for-updates",
  "allow_cross_table_conflicts": false
}
```

## 🔧 **Configuration Options**

### SlugInput Props
```typescript
interface SlugInputProps {
  type: 'post' | 'category' | 'tag'
  value?: string
  onChange?: (value: string) => void
  auto_generate_from?: string        // Auto-generate from title
  exclude_id?: string               // For updates
  allow_cross_table_conflicts?: boolean  // Allow conflicts between types
  show_validation?: boolean         // Show real-time validation
  show_preview?: boolean           // Show URL preview
  disabled?: boolean
}
```

### Validation Options
```typescript
interface UseSlugValidationOptions {
  type: 'post' | 'category' | 'tag'
  exclude_id?: string
  allow_cross_table_conflicts?: boolean
  auto_validate?: boolean          // Enable real-time validation
  debounce_ms?: number            // Validation delay (default: 500ms)
}
```

## ⚠️ **Important Considerations**

### 1. **Cross-Table Conflicts**
By default, the system prevents conflicts across all content types:
- Post "tech" conflicts with Category "tech"
- Solution: Use different slugs or enable `allow_cross_table_conflicts`

### 2. **URL Structure**
Current URL patterns:
- Posts: `/posts/[slug]`
- Categories: `/categories/[slug]` 
- Tags: `/tags/[slug]`

This separation prevents most routing conflicts naturally.

### 3. **SEO Implications**
- Consistent slug format improves SEO
- Avoid changing slugs after publication
- Use 301 redirects if slug changes are necessary

### 4. **Performance**
- Validation is debounced (500ms default)
- Database queries are optimized for slug lookups
- Use `exclude_id` parameter for updates to avoid self-conflicts

## 🚨 **Conflict Resolution**

### When Conflicts Occur:
1. **System suggests alternative** (`my-post-1`, `my-post-2`)
2. **User can accept suggestion** or manually edit
3. **Real-time validation** shows conflicts immediately
4. **Fallback to timestamp** if too many conflicts

### Emergency Scenarios:
```typescript
// If automatic resolution fails, timestamp fallback
const emergency_slug = `${base_slug}-${Date.now().toString().slice(-6)}`
```

## 🎨 **Visual Feedback**

The SlugInput component provides:
- ✅ **Green border/icon**: Slug is valid and available
- ❌ **Red border/icon**: Conflicts or validation errors  
- 🔄 **Blue border/icon**: Validation in progress
- 💡 **Suggestions**: Alternative slugs when conflicts exist
- 🔗 **URL Preview**: Shows final URL path

## 🔮 **Future Enhancements**

Planned improvements:
1. **Bulk slug validation** for imports
2. **Slug history tracking** for 301 redirects
3. **Custom slug patterns** per content type
4. **Multi-language slug support**
5. **Admin dashboard** for managing conflicts

---

## 📞 **Support**

If you encounter slug conflicts:
1. Check the validation messages in the UI
2. Use suggested alternatives
3. Consider different wording for titles
4. Contact support if system suggestions fail

Remember: **Unique, descriptive slugs are better for SEO anyway!** 🚀