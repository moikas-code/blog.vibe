'use client'

import Link from 'next/link'
import { UserButton, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Rss } from 'lucide-react'
import { SyncStatus } from '@/components/auth/sync-status'
import { RoleBadge } from '@/components/auth/role-badge'
import { BecomeAuthorButton } from '@/components/auth/become-author-button'
import { use_user_role } from '@/lib/hooks/use-user-role'

export function Header() {
  const { isSignedIn } = useUser()
  const { user_profile, can_create_posts, is_admin } = use_user_role()

  return (
    <>
      <SyncStatus />
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-2xl font-bold">
              Blog Feed
            </Link>
            <Link href="/posts" className="hover:text-gray-600">
              Posts
            </Link>
            <Link href="/categories" className="hover:text-gray-600">
              Categories
            </Link>
            {isSignedIn && can_create_posts && (
              <Link href="/dashboard" className="hover:text-gray-600">
                Dashboard
              </Link>
            )}
            {isSignedIn && is_admin && (
              <Link href="/admin" className="hover:text-gray-600">
                Admin
              </Link>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/api/rss" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon">
                <Rss className="h-5 w-5" />
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
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button>Sign Up</Button>
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