'use client'

import { motion } from 'framer-motion'
import {
  Package, RefreshCw, Activity, MessageSquare,
} from 'lucide-react'
import { DashboardGreeting }  from './DashboardGreeting'
import { StatsCard }          from './StatsCard'
import { UpcomingRoutines }   from './UpcomingRoutines'
import { RecentActivity }     from './RecentActivity'
import { QuickActions }       from './QuickActions'
import { MiniAIChat }         from './MiniAIChat'
import { staggerContainer }   from '@/lib/animations'
import type { Routine, ActivityLog } from '@/types'

interface DashboardStats {
  totalItems:          number
  pendingRoutines:     number
  activitiesThisMonth: number
  aiChatsToday:        number
  sparklines: {
    items:    number[]
    routines: number[]
    logs:     number[]
    ai:       number[]
  }
}

interface DashboardPageClientProps {
  userName:  string
  stats:     DashboardStats
  routines:  Routine[]
  logs:      ActivityLog[]
}

const STAT_CARDS = [
  {
    key:         'totalItems',
    label:       'Items Stored',
    icon:        <Package size={18} />,
    accentColor: '#06b6d4',
    accent:      'cyan' as const,
    href:        '/dashboard/items',
    sparklineKey: 'items' as const,
  },
  {
    key:         'pendingRoutines',
    label:       'Pending Routines',
    icon:        <RefreshCw size={18} />,
    accentColor: '#10b981',
    accent:      'emerald' as const,
    href:        '/dashboard/routines',
    sparklineKey: 'routines' as const,
  },
  {
    key:         'activitiesThisMonth',
    label:       'Activities This Month',
    icon:        <Activity size={18} />,
    accentColor: '#f59e0b',
    accent:      'amber' as const,
    href:        '/dashboard/logs',
    sparklineKey: 'logs' as const,
  },
  {
    key:         'aiChatsToday',
    label:       'AI Chats Today',
    icon:        <MessageSquare size={18} />,
    accentColor: '#6366f1',
    accent:      'indigo' as const,
    href:        '/dashboard/ai-chat',
    sparklineKey: 'ai' as const,
  },
]

export function DashboardPageClient({ userName, stats, routines, logs }: DashboardPageClientProps) {
  return (
    <div className="space-y-6">
      {/* Greeting */}
      <DashboardGreeting name={userName} />

      {/* Stats row */}
      <motion.div
        className="grid grid-cols-2 xl:grid-cols-4 gap-3 overflow-x-auto"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {STAT_CARDS.map((card) => (
          <StatsCard
            key={card.key}
            label={card.label}
            value={stats[card.key as keyof DashboardStats] as number}
            icon={card.icon}
            accentColor={card.accentColor}
            accent={card.accent}
            sparkline={stats.sparklines[card.sparklineKey]}
            href={card.href}
          />
        ))}
      </motion.div>

      {/* Main grid */}
      <div className="grid xl:grid-cols-5 gap-4">
        {/* Left column: Routines + Activity */}
        <div className="xl:col-span-3 space-y-4">
          <UpcomingRoutines initialRoutines={routines} />
          <RecentActivity logs={logs} />
        </div>

        {/* Right column: Quick Actions + Mini AI */}
        <div className="xl:col-span-2 space-y-4">
          <QuickActions />
          <MiniAIChat />
        </div>
      </div>
    </div>
  )
}
