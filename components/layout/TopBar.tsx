'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Settings, LogOut, Menu } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import type { Profile } from '@/types'

interface TopBarProps {
  user: Profile
  onMenuClick: () => void
}

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/items': 'WhereDidItGo',
  '/dashboard/routines': 'Repeat',
  '/dashboard/logs': 'LifeLog',
  '/dashboard/ai-chat': 'LifeGuide AI',
  '/dashboard/settings': 'Settings',
}

export function TopBar({ user, onMenuClick }: TopBarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const pageTitle = PAGE_TITLES[pathname] ?? 'LifeLedger AI'

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [userMenuOpen])

  const handleLogout = async () => {
    setSigningOut(true)
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (!res.ok) throw new Error('Logout failed')
      setUserMenuOpen(false)
      router.push('/')
      router.refresh()
    } catch {
      toast.error('Failed to sign out. Please try again.')
      setSigningOut(false)
    }
  }

  return (
    <header className="h-16 shrink-0 flex items-center px-4 md:px-6 gap-3 bg-bg-elevated/60 backdrop-blur-xl border-b border-white/[0.06] z-10">
      {/* Mobile hamburger */}
      <Button
        variant="icon"
        size="icon"
        className="md:hidden shrink-0"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <Menu size={18} />
      </Button>

      {/* Page title */}
      <h1 className="flex-1 text-base font-semibold text-text-primary truncate">
        {pageTitle}
      </h1>

      {/* Right actions */}
      <div className="flex items-center gap-1.5">
        {/* Notifications bell — wired with live data in Phase 5 */}
        <Button variant="icon" size="icon" aria-label="Notifications">
          <Bell size={18} />
        </Button>

        {/* User avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
            aria-label="User menu"
            aria-haspopup="true"
            aria-expanded={userMenuOpen}
          >
            <Avatar name={user.name} src={user.avatar_url} size={36} />
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                className="absolute right-0 top-12 w-56 glass-modal rounded-xl py-1.5 z-50"
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                {/* User info header */}
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {user.name}
                  </p>
                </div>

                {/* Links */}
                <div className="py-1">
                  <Link
                    href="/dashboard/settings"
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5',
                      'text-sm text-text-secondary hover:text-text-primary',
                      'hover:bg-white/[0.05] transition-colors duration-150'
                    )}
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings size={15} />
                    <span>Settings</span>
                  </Link>
                </div>

                {/* Divider */}
                <div className="border-t border-white/[0.06] my-1" />

                {/* Sign out */}
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    disabled={signingOut}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5',
                      'text-sm text-error hover:bg-error/10',
                      'transition-colors duration-150 disabled:opacity-40'
                    )}
                  >
                    {signingOut ? (
                      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <LogOut size={15} />
                    )}
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
