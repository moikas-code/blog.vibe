'use client'

import { useEffect, useState } from 'react'
import { useUserRole } from '@/lib/hooks/use-user-role'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RoleBadge } from '@/components/auth/role-badge'
import { Crown, Users, FileText, FolderOpen, Loader2 } from 'lucide-react'
import { UserRole } from '@/lib/hooks/use-user-role'
import { toast } from 'sonner'

interface UserProfile {
  id: string
  clerk_id: string
  name: string
  role: UserRole
  created_at: string
}

interface AdminStats {
  total_users: number
  total_posts: number
  total_categories: number
  admin_count: number
  author_count: number
  reader_count: number
}

export default function AdminPage() {
  const { is_admin, is_loading } = useUserRole()
  const [users, set_users] = useState<UserProfile[]>([])
  const [stats, set_stats] = useState<AdminStats | null>(null)
  const [loading_users, set_loading_users] = useState(true)
  const [promoting_user, set_promoting_user] = useState<string | null>(null)

  useEffect(() => {
    if (is_admin) {
      fetch_admin_data()
    }
  }, [is_admin])

  const fetch_admin_data = async () => {
    try {
      // Fetch all users
      const { data: users_data } = await supabase
        .from('authors')
        .select('id, clerk_id, name, role, created_at')
        .order('created_at', { ascending: false })

      if (users_data) {
        set_users(users_data)
      }

      // Fetch stats - use count property from response
      const { count: posts_count } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })

      const { count: categories_count } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })

      if (users_data && posts_count !== null && categories_count !== null) {
        const role_counts = users_data.reduce((acc, user) => {
          acc[`${user.role}_count`] = (acc[`${user.role}_count`] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        set_stats({
          total_users: users_data.length,
          total_posts: posts_count || 0,
          total_categories: categories_count || 0,
          admin_count: role_counts.admin_count || 0,
          author_count: role_counts.author_count || 0,
          reader_count: role_counts.reader_count || 0
        })
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
      toast.error('Failed to load admin data')
    } finally {
      set_loading_users(false)
    }
  }

  const promote_user = async (user_id: string, new_role: UserRole) => {
    set_promoting_user(user_id)
    
    try {
      const response = await fetch('/api/auth/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_user_id: user_id,
          role: new_role
        })
      })

      if (!response.ok) {
        throw new Error('Failed to promote user')
      }

      toast.success(`User promoted to ${new_role}`)
      await fetch_admin_data() // Refresh data
    } catch (error) {
      console.error('Error promoting user:', error)
      toast.error('Failed to promote user')
    } finally {
      set_promoting_user(null)
    }
  }

  if (is_loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!is_admin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto glass">
          <CardContent className="pt-6">
            <div className="text-center">
              <Crown className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-bold mb-2 font-mono">Admin Access Required</h2>
              <p className="text-gray-600 dark:text-gray-400 font-mono">
                You need admin privileges to access this page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <Crown className="h-8 w-8 text-purple-600" />
        <h1 className="text-3xl font-bold font-mono">Admin Dashboard</h1>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-mono">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{stats.total_users}</div>
              <div className="text-xs text-muted-foreground mt-1 font-mono">
                {stats.admin_count} admins, {stats.author_count} authors, {stats.reader_count} readers
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-mono">Total Posts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{stats.total_posts}</div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-mono">Categories</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{stats.total_categories}</div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-mono">System Health</CardTitle>
              <Crown className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 font-mono">Healthy</div>
              <div className="text-xs text-muted-foreground mt-1 font-mono">
                All systems operational
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Management */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="font-mono">User Management</CardTitle>
        </CardHeader>
        <CardContent>
          {loading_users ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-4 glass rounded-lg hover-lift"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-medium font-mono">{user.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <RoleBadge role={user.role} />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {user.role !== 'admin' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => promote_user(user.clerk_id, 'admin')}
                        disabled={promoting_user === user.id}
                        className="font-mono rounded-lg"
                      >
                        {promoting_user === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Make Admin'
                        )}
                      </Button>
                    )}
                    
                    {user.role === 'reader' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => promote_user(user.clerk_id, 'author')}
                        disabled={promoting_user === user.id}
                        className="font-mono rounded-lg"
                      >
                        {promoting_user === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Make Author'
                        )}
                      </Button>
                    )}
                    
                    {user.role === 'author' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => promote_user(user.clerk_id, 'reader')}
                        disabled={promoting_user === user.id}
                        className="font-mono rounded-lg"
                      >
                        {promoting_user === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Demote to Reader'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}