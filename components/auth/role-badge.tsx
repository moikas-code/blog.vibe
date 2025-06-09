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
      variant: 'outline' as const,
      className: 'glass'
    },
    author: {
      label: 'Author',
      icon: Edit,
      variant: 'outline' as const,
      className: 'glass gradient-ai text-white border-0'
    },
    admin: {
      label: 'Admin',
      icon: Crown,
      variant: 'outline' as const,
      className: 'glass gradient-gaming text-white border-0'
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