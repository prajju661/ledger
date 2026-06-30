'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  PackageSearch,
  RefreshCw,
  BookOpen,
  Bot,
  Settings,
  LogOut,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { mobileSheet } from '@/lib/animations'
import type { Profile } from '@/types'

interface MobileSidebarProps {
  user: Profile
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    accent: null as string | null,
    accentClass: null as string | null,
  },
  {
    href: '/dashboard/items',
    label: 'WhereDidItGo',
    icon: PackageSearch,
    accent: '#06b6d4',
    accentClass: 'text-module-items',
  },
  {
    href: '/dashboard/routines',
    label: 'Repeat',
    icon: RefreshCw,
    accent: '#10b981',
    accentClass: 'text-module-routines',
  },
  {
    href: '/dashboard/logs',
    label: 'LifeLog',
    icon: BookOpen,
    accent: '#f59e0b',
    accentClass: 'text-module-logs',
  },
  {
    href: '/dashboard/ai-chat',
    label: 'LifeGuide AI',
    icon: Bot,
    accent: '#6366f1',
    accentClass: 'text-module-ai',
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: Settings,
    accent: null,
    accentClass: null,
  },
]

export function MobileSidebar({ user, isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  // Close on route change
  useEffect(() => {
    onClose()
  }, [pathname, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    setSigningOut(true)
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (!res.ok) throw new Error('Logout failed')
      onClose()
      router.push('/')
      router.refresh()
    } catch {
      toast.error('Failed to sign out. Please try again.')
      setSigningOut(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Bottom sheet */}
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 md:hidden"
            style={{ height: '85vh' }}
            variants={mobileSheet}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="h-full glass-modal rounded-t-2xl rounded-b-none flex flex-col">
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-2 shrink-0">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] shrink-0">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                  >
                    <Bot size={16} className="text-white" />
                  </div>
                  <span className="font-bold text-text-primary">LifeLedger AI</span>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.05] transition-colors"
                  aria-label="Close navigation"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Nav */}
              <nav className="flex-1 overflow-y-auto px-3 py-4">
                <ul className="space-y-1" role="list">
                  {navItems.map((item) => {
                    const active = isActive(item.href)
                    const Icon = item.icon
                    const isAI = item.href === '/dashboard/ai-chat'

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            'relative flex items-center gap-4 px-4 py-3.5 rounded-xl',
                            'text-base font-medium transition-all duration-200',
                            active
                              ? 'text-text-primary bg-white/[0.07]'
                              : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]'
                          )}
                          aria-current={active ? 'page' : undefined}
                        >
                          {active && (
                            <span
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                              style={{
                                background: item.accent ?? 'linear-gradient(to bottom, #6366f1, #8b5cf6)',
                              }}
                            />
                          )}
                          <span className="relative shrink-0">
                            <Icon
                              size={20}
                              className={cn(
                                active && item.accentClass ? item.accentClass : '',
                                active && !item.accentClass ? 'text-accent-primary' : ''
                              )}
                            />
                            {isAI && (
                              <span
                                className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-glow"
                                style={{ background: '#6366f1' }}
                              />
                            )}
                          </span>
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </nav>

              {/* User section */}
              <div className="shrink-0 border-t border-white/[0.06] p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={user.name} src={user.avatar_url} size={40} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {user.name}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={signingOut}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-error hover:bg-error/10 transition-colors disabled:opacity-40"
                  >
                    {signingOut ? (
                      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <LogOut size={15} />
                    )}
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
