'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PlusCircle, FolderPlus } from 'lucide-react'
import { use_user_role } from '@/lib/hooks/use-user-role'

export function DashboardHeader() {
  const { can_manage_categories } = use_user_role()

  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="flex gap-2">
        {can_manage_categories && (
          <Link href="/dashboard/categories">
            <Button variant="outline">
              <FolderPlus className="mr-2 h-4 w-4" />
              Manage Categories
            </Button>
          </Link>
        )}
        <Link href="/dashboard/posts/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>
    </div>
  )
}