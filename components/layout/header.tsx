'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UserButton, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Rss, Menu, X } from 'lucide-react'
import { SyncStatus } from '@/components/auth/sync-status'
import { RoleBadge } from '@/components/auth/role-badge'
import { BecomeAuthorButton } from '@/components/auth/become-author-button'
import { useUserRole } from '@/lib/hooks/use-user-role'

export function Header() {
  const { isSignedIn } = useUser()
  const { user_profile, can_create_posts, is_admin } = useUserRole()
  const [is_mobile_menu_open, set_is_mobile_menu_open] = useState(false)

  return (
    <>
      <SyncStatus />
      <header className="glass border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="container mx-auto px-3 sm:px-4 py-3">
          <nav className="flex items-center justify-between">
            {/* Logo and Desktop Navigation */}
            <div className="flex items-center space-x-4 sm:space-x-8">
              <Link href="/" className="text-lg sm:text-xl font-bold font-mono tracking-tight">
                Moikas: Signal
              </Link>
              
              {/* Desktop Navigation Links */}
              <div className="hidden md:flex items-center space-x-6">
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
            </div>
            
            {/* Desktop Right Side */}
            <div className="hidden md:flex items-center space-x-4">
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
            
            {/* Mobile Menu Button and User Button */}
            <div className="flex md:hidden items-center space-x-2">
              {isSignedIn && <UserButton afterSignOutUrl="/" />}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg"
                onClick={() => set_is_mobile_menu_open(!is_mobile_menu_open)}
              >
                {is_mobile_menu_open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </nav>
        </div>
        
        {/* Mobile Menu */}
        {is_mobile_menu_open && (
          <div className="md:hidden border-t border-gray-200/50 dark:border-gray-700/50 animate-in slide-in-from-top-2 duration-200">
            <div className="container mx-auto px-3 sm:px-4 py-4 space-y-3">
              <Link 
                href="/posts" 
                className="block text-sm font-mono text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors py-2"
                onClick={() => set_is_mobile_menu_open(false)}
              >
                Posts
              </Link>
              <Link 
                href="/categories" 
                className="block text-sm font-mono text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors py-2"
                onClick={() => set_is_mobile_menu_open(false)}
              >
                Categories
              </Link>
              {isSignedIn && can_create_posts && (
                <Link 
                  href="/dashboard" 
                  className="block text-sm font-mono text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors py-2"
                  onClick={() => set_is_mobile_menu_open(false)}
                >
                  Dashboard
                </Link>
              )}
              {isSignedIn && is_admin && (
                <Link 
                  href="/admin" 
                  className="block text-sm font-mono text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors py-2"
                  onClick={() => set_is_mobile_menu_open(false)}
                >
                  Admin
                </Link>
              )}
              
              <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50 space-y-3">
                <Link 
                  href="/api/rss" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm font-mono text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors py-2"
                  onClick={() => set_is_mobile_menu_open(false)}
                >
                  <Rss className="h-4 w-4" />
                  <span>RSS Feed</span>
                </Link>
                
                {isSignedIn ? (
                  <>
                    {user_profile && (
                      <div className="py-2">
                        <RoleBadge role={user_profile.role} />
                      </div>
                    )}
                    <div className="py-2">
                      <BecomeAuthorButton />
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link 
                      href="/sign-in"
                      onClick={() => set_is_mobile_menu_open(false)}
                    >
                      <Button variant="ghost" className="font-mono text-sm w-full justify-start">
                        Sign In
                      </Button>
                    </Link>
                    <Link 
                      href="/sign-up"
                      onClick={() => set_is_mobile_menu_open(false)}
                    >
                      <Button className="font-mono text-sm bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 w-full">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}