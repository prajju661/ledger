'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { MobileSidebar } from '@/components/layout/MobileSidebar'
import type { Profile } from '@/types'

interface DashboardShellProps {
  user: Profile
  children: React.ReactNode
}

/**
 * Client shell that wraps the dashboard layout.
 * Holds the mobile sidebar open/close state.
 */
export function DashboardShell({ user, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-bg-surface overflow-hidden">
      {/* Desktop sidebar */}
      <Sidebar user={user} />

      {/* Mobile sidebar (bottom sheet) */}
      <MobileSidebar
        user={user}
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar user={user} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 relative">
          {children}
        </main>
      </div>
    </div>
  )
}
