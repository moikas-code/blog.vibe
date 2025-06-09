'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TiptapEditor } from '@/components/editor/tiptap-editor'
import { create_post_schema } from '@/lib/schemas/post'
import { z } from 'zod'
import { ArrowLeft, Save, FileText, Tag, Image, Search } from 'lucide-react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
}

export default function NewPostPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category_id: '',
    featured_image: '',
    meta_description: '',
    published: false,
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch_categories()
  }, [])

  useEffect(() => {
    if (formData.title) {
      const generated_slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setFormData(prev => ({ ...prev, slug: generated_slug }))
    }
  }, [formData.title])

  const fetch_categories = async () => {
    const response = await fetch('/api/categories')
    if (response.ok) {
      const data = await response.json()
      setCategories(data)
    }
  }

  const handle_submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const validated_data = create_post_schema.parse(formData)
      
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated_data),
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        const error = await response.json()
        if (error.details) {
          const new_errors: Record<string, string> = {}
          error.details.forEach((detail: { path: string[]; message: string }) => {
            new_errors[detail.path[0]] = detail.message
          })
          setErrors(new_errors)
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const new_errors: Record<string, string> = {}
        error.errors.forEach((err) => {
          new_errors[err.path[0]] = err.message
        })
        setErrors(new_errors)
      }
    } finally {
      setLoading(false)
    }
  }

  const add_tag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const remove_tag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-lg">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold font-mono flex items-center gap-3">
            <FileText className="h-8 w-8" />
            Create New Post
          </h1>
        </div>
        <Button 
          onClick={handle_submit} 
          disabled={loading}
          className="font-mono rounded-lg glass gradient-ai"
        >
          <Save className="mr-2 h-4 w-4" />
          {loading ? 'Saving...' : 'Save Post'}
        </Button>
      </div>

      <form onSubmit={handle_submit} className="space-y-6">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="font-mono">Post Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title" className="font-mono">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter post title"
                className="font-mono"
              />
              {errors.title && <p className="text-sm text-red-500 mt-1 font-mono">{errors.title}</p>}
            </div>

            <div>
              <Label htmlFor="slug" className="font-mono">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="post-url-slug"
                className="font-mono"
              />
              {errors.slug && <p className="text-sm text-red-500 mt-1 font-mono">{errors.slug}</p>}
            </div>

            <div>
              <Label htmlFor="excerpt" className="font-mono">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief description of your post"
                rows={3}
                className="font-mono"
              />
            </div>

            <div>
              <Label htmlFor="category" className="font-mono">Category</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger className="font-mono">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="font-mono">
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="featured_image" className="font-mono flex items-center gap-2">
                <Image className="h-4 w-4" />
                Featured Image URL
              </Label>
              <Input
                id="featured_image"
                type="url"
                value={formData.featured_image}
                onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="font-mono"
              />
            </div>

            <div>
              <Label htmlFor="meta_description" className="font-mono flex items-center gap-2">
                <Search className="h-4 w-4" />
                Meta Description
              </Label>
              <Textarea
                id="meta_description"
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                placeholder="SEO meta description (max 160 characters)"
                maxLength={160}
                rows={2}
                className="font-mono"
              />
            </div>

            <div>
              <Label htmlFor="tags" className="font-mono flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      add_tag()
                    }
                  }}
                  placeholder="Add a tag"
                  className="font-mono"
                />
                <Button type="button" onClick={add_tag} variant="outline" className="font-mono rounded-lg">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 glass rounded-lg text-sm font-mono flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => remove_tag(tag)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="published"
                type="checkbox"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="published" className="cursor-pointer font-mono">
                Publish immediately
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="font-mono">Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-[400px] glass rounded-lg">
              <TiptapEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
              />
            </div>
            {errors.content && <p className="text-sm text-red-500 mt-1 font-mono">{errors.content}</p>}
          </CardContent>
        </Card>
      </form>
    </main>
  )
}