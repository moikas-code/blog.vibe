'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tag, Home } from 'lucide-react'
import { useUserRole } from '@/lib/hooks/use-user-role'

export function DashboardHeader() {
  const { can_manage_categories } = useUserRole()

  return (
    <div className="glass rounded-lg p-4 mb-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="font-mono">
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        </Link>
        {can_manage_categories && (
          <Link href="/dashboard/categories">
            <Button variant="ghost" size="sm" className="font-mono">
              <Tag className="h-4 w-4 mr-2" />
              Categories
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}