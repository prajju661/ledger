'use client'

import { motion } from 'framer-motion'
import { User, Shield, BarChart2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SettingsTab = 'profile' | 'security' | 'usage' | 'danger'

interface Tab {
  id: SettingsTab
  label: string
  icon: React.ReactNode
}

const TABS: Tab[] = [
  { id: 'profile',  label: 'Profile',    icon: <User size={16} /> },
  { id: 'security', label: 'Security',   icon: <Shield size={16} /> },
  { id: 'usage',    label: 'Usage',      icon: <BarChart2 size={16} /> },
  { id: 'danger',   label: 'Danger Zone', icon: <AlertTriangle size={16} /> },
]

interface SettingsTabsProps {
  activeTab: SettingsTab
  onChange: (tab: SettingsTab) => void
}

export function SettingsTabs({ activeTab, onChange }: SettingsTabsProps) {
  return (
    <>
      {/* Desktop: vertical list */}
      <nav
        className="hidden md:flex flex-col gap-1 w-40 shrink-0"
        aria-label="Settings navigation"
      >
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab
          const isDanger = tab.id === 'danger'
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                'text-left w-full',
                isActive && !isDanger && 'text-text-primary',
                isActive && isDanger && 'text-red-400',
                !isActive && 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]',
                !isActive && isDanger && 'hover:text-red-400'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="settings-tab-bg"
                  className={cn(
                    'absolute inset-0 rounded-xl',
                    isDanger ? 'bg-red-500/10' : 'bg-white/[0.06]'
                  )}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className={cn(
                'relative z-10',
                isDanger && isActive ? 'text-red-400' : '',
                isDanger && !isActive ? 'text-text-muted' : ''
              )}>
                {tab.icon}
              </span>
              <span className="relative z-10">{tab.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Mobile: horizontal scroll tabs */}
      <div className="md:hidden flex gap-1 overflow-x-auto pb-1 mb-4 scrollbar-hide">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab
          const isDanger = tab.id === 'danger'
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0',
                isActive && !isDanger && 'bg-white/[0.08] text-text-primary',
                isActive && isDanger && 'bg-red-500/10 text-red-400',
                !isActive && 'text-text-secondary'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          )
        })}
      </div>
    </>
  )
}
