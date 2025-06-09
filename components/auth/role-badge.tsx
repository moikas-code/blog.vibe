'use client'

import { Badge } from '@/components/ui/badge'
import { Crown, Edit, User } from 'lucide-react'
import { UserRole } from '@/lib/hooks/use-user-role'

interface RoleBadgeProps {
  role: UserRole
  className?: string
}

export function RoleBadge({ role, className = '' }: RoleBadgeProps) {
  const role_config = {
    reader: {
      label: 'Reader',
      icon: User,
      variant: 'secondary' as const,
      className: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    },
    author: {
      label: 'Author',
      icon: Edit,
      variant: 'default' as const,
      className: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
    },
    admin: {
      label: 'Admin',
      icon: Crown,
      variant: 'destructive' as const,
      className: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
    }
  }

  const config = role_config[role]
  const Icon = config.icon

  return (
    <Badge 
      variant={config.variant}
      className={`flex items-center gap-1 ${config.className} ${className}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}