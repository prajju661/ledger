'use client'

import { useState } from 'react'
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { Tooltip } from '@/components/ui/Tooltip'
import type { Profile } from '@/types'

interface SidebarProps {
  user: Profile
}

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  accent: string | null
  accentClass: string | null
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    accent: null,
    accentClass: null,
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
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    setSigningOut(true)
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (!res.ok) throw new Error('Logout failed')
      router.push('/')
      router.refresh()
    } catch {
      toast.error('Failed to sign out. Please try again.')
      setSigningOut(false)
    }
  }

  return (
    <motion.aside
      className={cn(
        'hidden md:flex flex-col h-full shrink-0',
        'bg-bg-elevated/80 backdrop-blur-xl border-r border-white/[0.06]',
        'transition-none relative z-10'
      )}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
    >
      {/* Logo */}
      <div
        className={cn(
          'h-16 flex items-center border-b border-white/[0.06] shrink-0',
          collapsed ? 'justify-center px-0' : 'px-5'
        )}
      >
        <AnimatePresence mode="wait">
          {collapsed ? (
            <motion.div
              key="collapsed-logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 0 16px rgba(99,102,241,0.4)',
              }}
            >
              <Bot size={16} className="text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="full-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 0 16px rgba(99,102,241,0.4)',
                }}
              >
                <Bot size={16} className="text-white" />
              </div>
              <span className="font-bold text-sm text-text-primary leading-tight">
                LifeLedger<br />
                <span className="gradient-text font-extrabold">AI</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2">
        <ul className="space-y-0.5" role="list">
          {navItems.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            const isAI = item.href === '/dashboard/ai-chat'

            const linkContent = (
              <Link
                href={item.href}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-xl',
                  'text-sm font-medium transition-all duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
                  active
                    ? 'text-text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.05]',
                  active && 'bg-white/[0.07]'
                )}
                aria-current={active ? 'page' : undefined}
              >
                {/* Active accent bar */}
                {active && (
                  <motion.span
                    layoutId="active-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                    style={{
                      background: item.accent ?? 'linear-gradient(to bottom, #6366f1, #8b5cf6)',
                    }}
                  />
                )}

                {/* Icon */}
                <span className="relative shrink-0">
                  <Icon
                    size={18}
                    className={cn(
                      active && item.accentClass ? item.accentClass : '',
                      active && !item.accentClass ? 'text-accent-primary' : ''
                    )}
                  />
                  {/* Pulsing dot for AI item */}
                  {isAI && (
                    <span
                      className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-glow"
                      style={{ background: '#6366f1' }}
                    />
                  )}
                </span>

                {/* Label */}
                {!collapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </Link>
            )

            return (
              <li key={item.href}>
                {collapsed ? (
                  <Tooltip content={item.label} side="right">
                    {linkContent}
                  </Tooltip>
                ) : (
                  linkContent
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="shrink-0 border-t border-white/[0.06] p-2 space-y-0.5">
        {/* Settings */}
        {collapsed ? (
          <Tooltip content="Settings" side="right">
            <Link
              href="/dashboard/settings"
              className={cn(
                'flex items-center justify-center px-3 py-2.5 rounded-xl',
                'text-sm font-medium text-text-secondary',
                'hover:text-text-primary hover:bg-white/[0.05] transition-all duration-200',
                pathname === '/dashboard/settings' && 'text-text-primary bg-white/[0.07]'
              )}
              aria-current={pathname === '/dashboard/settings' ? 'page' : undefined}
            >
              <Settings size={18} />
            </Link>
          </Tooltip>
        ) : (
          <Link
            href="/dashboard/settings"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl',
              'text-sm font-medium text-text-secondary',
              'hover:text-text-primary hover:bg-white/[0.05] transition-all duration-200',
              pathname === '/dashboard/settings' && 'text-text-primary bg-white/[0.07]'
            )}
            aria-current={pathname === '/dashboard/settings' ? 'page' : undefined}
          >
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        )}

        {/* User + Logout */}
        {collapsed ? (
          <div className="flex flex-col items-center gap-1 pt-2 pb-1">
            <Avatar name={user.name} src={user.avatar_url} size={32} />
            <Tooltip content="Sign out" side="right">
              <button
                onClick={handleLogout}
                disabled={signingOut}
                className="mt-1 flex items-center justify-center w-8 h-8 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-all duration-200 disabled:opacity-40"
                aria-label="Sign out"
              >
                <LogOut size={14} />
              </button>
            </Tooltip>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
            <Avatar name={user.name} src={user.avatar_url} size={32} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate leading-tight">
                {user.name}
              </p>
            </div>
            <button
              onClick={handleLogout}
              disabled={signingOut}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-all duration-200 disabled:opacity-40"
              aria-label="Sign out"
            >
              {signingOut ? (
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogOut size={14} />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className={cn(
          'absolute -right-3 top-20 z-20',
          'w-6 h-6 rounded-full',
          'glass border border-white/[0.12]',
          'flex items-center justify-center',
          'text-text-secondary hover:text-text-primary',
          'transition-all duration-200 hover:scale-110'
        )}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight size={12} />
        ) : (
          <ChevronLeft size={12} />
        )}
      </button>
    </motion.aside>
  )
}
