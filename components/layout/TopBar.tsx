'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Settings, LogOut, Menu, Check, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { format, parseISO, isPast, isToday } from 'date-fns'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import type { Profile, Routine } from '@/types'

interface TopBarProps {
  user: Profile
  onMenuClick: () => void
}

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':          'Dashboard',
  '/dashboard/items':    'WhereDidItGo',
  '/dashboard/routines': 'Repeat',
  '/dashboard/logs':     'LifeLog',
  '/dashboard/ai-chat':  'LifeGuide AI',
  '/dashboard/settings': 'Settings',
}

function dueLabelShort(nextDue: string): string {
  const d = parseISO(nextDue)
  if (isToday(d)) return 'Today'
  if (isPast(d)) {
    const days = Math.floor((Date.now() - d.getTime()) / 86_400_000)
    return `${days}d overdue`
  }
  return format(d, 'MMM d')
}

export function TopBar({ user, onMenuClick }: TopBarProps) {
  const pathname  = usePathname()
  const router    = useRouter()

  const [userMenuOpen,  setUserMenuOpen]  = useState(false)
  const [bellOpen,      setBellOpen]      = useState(false)
  const [signingOut,    setSigningOut]    = useState(false)
  const [overdue,       setOverdue]       = useState<Routine[]>([])
  const [completing,    setCompleting]    = useState<string | null>(null)

  const menuRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLDivElement>(null)

  const pageTitle = PAGE_TITLES[pathname] ?? 'LifeLedger AI'

  // ── Fetch overdue routines ────────────────────────────────────────────────
  const fetchOverdue = useCallback(async () => {
    try {
      const res  = await fetch('/api/routines?filter=overdue&limit=10')
      const json = await res.json() as { data: { routines: Routine[] } | null }
      if (json.data) setOverdue(json.data.routines)
    } catch {
      // silent — bell badge just shows 0
    }
  }, [])

  useEffect(() => {
    void fetchOverdue()
    // Refresh every 5 minutes
    const id = setInterval(() => void fetchOverdue(), 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [fetchOverdue])

  // ── Close menus on outside click ──────────────────────────────────────────
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ── Complete a routine from the notification dropdown ─────────────────────
  const handleComplete = useCallback(async (id: string) => {
    setCompleting(id)
    try {
      const res  = await fetch(`/api/routines/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'complete' }),
      })
      const json = await res.json() as { data: { routine: Routine } | null; error: string | null }
      if (!res.ok || json.error) throw new Error(json.error ?? 'Failed')

      setOverdue((prev) => prev.filter((r) => r.id !== id))
      toast.success('Routine completed! 🎉')
    } catch {
      toast.error('Failed to complete routine.')
    } finally {
      setCompleting(null)
    }
  }, [])

  // ── Logout ────────────────────────────────────────────────────────────────
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

  const overdueCount = overdue.length

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

        {/* ── Notification bell ── */}
        <div className="relative" ref={bellRef}>
          <Button
            variant="icon"
            size="icon"
            aria-label={`Notifications${overdueCount > 0 ? ` — ${overdueCount} overdue` : ''}`}
            onClick={() => setBellOpen((o) => !o)}
            className="relative"
          >
            <Bell size={18} />
            {/* Red badge */}
            {overdueCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-error text-white text-[9px] font-bold leading-none pointer-events-none">
                {overdueCount > 9 ? '9+' : overdueCount}
              </span>
            )}
          </Button>

          {/* Notification dropdown */}
          <AnimatePresence>
            {bellOpen && (
              <motion.div
                className="absolute right-0 top-12 w-80 glass-modal rounded-xl z-50 overflow-hidden"
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <Bell size={14} className="text-text-muted" />
                    <span className="text-sm font-semibold text-text-primary">Notifications</span>
                  </div>
                  {overdueCount > 0 && (
                    <span className="text-xs text-error font-medium">
                      {overdueCount} overdue
                    </span>
                  )}
                </div>

                {/* List */}
                <div className="max-h-72 overflow-y-auto">
                  {overdueCount === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <div className="w-10 h-10 rounded-full bg-module-routines/10 flex items-center justify-center mx-auto mb-2">
                        <Bell size={16} className="text-module-routines" />
                      </div>
                      <p className="text-sm text-module-routines font-medium">All caught up!</p>
                      <p className="text-xs text-text-muted mt-0.5">No overdue routines.</p>
                    </div>
                  ) : (
                    <div className="py-1.5">
                      {overdue.map((routine) => (
                        <div
                          key={routine.id}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03] transition-colors"
                        >
                          {/* Urgency dot */}
                          <div className="w-2 h-2 rounded-full bg-error shrink-0" />

                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-text-primary truncate font-medium">
                              {routine.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <RefreshCw size={10} className="text-text-muted shrink-0" />
                              <p className="text-[11px] text-error">
                                {dueLabelShort(routine.next_due)}
                              </p>
                            </div>
                          </div>

                          {/* Complete button */}
                          <button
                            onClick={() => void handleComplete(routine.id)}
                            disabled={completing === routine.id}
                            className={cn(
                              'flex items-center justify-center w-7 h-7 rounded-lg shrink-0 transition-all',
                              'border border-module-routines/30 text-module-routines',
                              'hover:bg-module-routines/10 active:scale-95',
                              completing === routine.id && 'opacity-50 cursor-not-allowed'
                            )}
                            aria-label={`Complete ${routine.title}`}
                          >
                            {completing === routine.id ? (
                              <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Check size={13} />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer — link to routines page */}
                <div className="border-t border-white/[0.06] px-4 py-2.5">
                  <Link
                    href="/dashboard/routines"
                    onClick={() => setBellOpen(false)}
                    className="text-xs text-text-secondary hover:text-module-routines transition-colors"
                  >
                    View all routines →
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── User avatar + dropdown ── */}
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
                {/* User info */}
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {user.name}
                  </p>
                </div>

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

                <div className="border-t border-white/[0.06] my-1" />

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
