'use client'

import Link from 'next/link'
import { UserButton, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Rss } from 'lucide-react'
import { SyncStatus } from '@/components/auth/sync-status'
import { RoleBadge } from '@/components/auth/role-badge'
import { BecomeAuthorButton } from '@/components/auth/become-author-button'
import { useUserRole } from '@/lib/hooks/use-user-role'

export function Header() {
  const { isSignedIn } = useUser()
  const { user_profile, can_create_posts, is_admin } = useUserRole()

  return (
    <>
      <SyncStatus />
      <header className="glass border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold font-mono tracking-tight">
              Feed
            </Link>
            <Link href="/posts" className="text-sm font-mono text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              Posts
            </Link>
            <Link href="/categories" className="text-sm font-mono text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              Categories
            </Link>
            {isSignedIn && can_create_posts && (
              <Link href="/dashboard" className="text-sm font-mono text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                Dashboard
              </Link>
            )}
            {isSignedIn && is_admin && (
              <Link href="/admin" className="text-sm font-mono text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                Admin
              </Link>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/api/rss" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="rounded-lg">
                <Rss className="h-4 w-4" />
              </Button>
            </Link>
            
            {isSignedIn ? (
              <>
                {user_profile && <RoleBadge role={user_profile.role} />}
                <BecomeAuthorButton />
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <div className="space-x-2">
                <Link href="/sign-in">
                  <Button variant="ghost" className="font-mono text-sm">Sign In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="font-mono text-sm bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
    </>
  )
}