'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Edit, Shield, Plus, Tag } from 'lucide-react'
import { useUserRole } from '@/lib/hooks/use-user-role'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
  updated_at: string
}

export default function CategoriesManagementPage() {
  const { can_manage_categories, is_loading: role_loading } = useUserRole()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: ''
  })

  useEffect(() => {
    fetch_categories()
  }, [])

  const fetch_categories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const generate_slug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handle_input_change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updated = { ...prev, [name]: value }
      if (name === 'name' && !editingCategory) {
        updated.slug = generate_slug(value)
      }
      return updated
    })
  }

  const handle_submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingCategory 
        ? `/api/categories/${editingCategory.id}` 
        : '/api/categories'
      
      const method = editingCategory ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetch_categories()
        reset_form()
      } else {
        const error = await response.text()
        alert(`Error: ${error}`)
      }
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Failed to save category')
    } finally {
      setSubmitting(false)
    }
  }

  const handle_edit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || ''
    })
  }

  const handle_delete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetch_categories()
      } else {
        alert('Failed to delete category')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Failed to delete category')
    }
  }

  const reset_form = () => {
    setFormData({ name: '', slug: '', description: '' })
    setEditingCategory(null)
  }

  if (role_loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!can_manage_categories) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <CardTitle>Admin Access Required</CardTitle>
            <CardDescription>
              Only administrators can manage categories. Contact an admin to get promoted.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-mono flex items-center gap-3">
          <Tag className="h-8 w-8" />
          Manage Categories
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 font-mono">
          Create and manage categories for organizing your blog posts
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Category Form */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="font-mono flex items-center gap-2">
              {editingCategory ? (
                <><Edit className="h-5 w-5" /> Edit Category</>
              ) : (
                <><Plus className="h-5 w-5" /> Create New Category</>
              )}
            </CardTitle>
            <CardDescription className="font-mono">
              {editingCategory ? 'Update the category details' : 'Add a new category for organizing posts'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handle_submit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="font-mono">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handle_input_change}
                  required
                  placeholder="Technology"
                  className="font-mono"
                />
              </div>

              <div>
                <Label htmlFor="slug" className="font-mono">Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handle_input_change}
                  required
                  placeholder="technology"
                  pattern="[a-z0-9-]+"
                  title="Only lowercase letters, numbers, and hyphens"
                  className="font-mono"
                />
              </div>

              <div>
                <Label htmlFor="description" className="font-mono">Description (optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handle_input_change}
                  placeholder="Posts about technology and innovations"
                  rows={3}
                  className="font-mono"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="font-mono rounded-lg glass gradient-ai"
                >
                  {submitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </Button>
                {editingCategory && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={reset_form}
                    className="font-mono rounded-lg"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Categories List */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="font-mono">Existing Categories</CardTitle>
            <CardDescription className="font-mono">Manage your blog categories</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 font-mono text-center py-8">Loading categories...</p>
            ) : categories.length === 0 ? (
              <div className="text-center py-8">
                <Tag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 font-mono">No categories yet. Create your first category!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 glass rounded-lg hover-lift"
                  >
                    <div className="flex-1">
                      <h4 className="font-mono font-bold mb-1">{category.name}</h4>
                      <p className="text-sm text-gray-500 font-mono">/{category.slug}</p>
                      {category.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-mono">{category.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handle_edit(category)}
                        className="font-mono"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handle_delete(category.id)}
                        className="font-mono text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}