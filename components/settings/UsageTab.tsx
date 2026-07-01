'use client'

import { motion } from 'framer-motion'
import { Package, RefreshCw, BookOpen, MessageSquare, Bot, Calendar } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { useCountUp } from '@/hooks/useCountUp'
import { staggerContainer, fadeInUp } from '@/lib/animations'
import type { ProfileStats } from '@/app/api/profile/stats/route'

interface StatItemProps {
  label: string
  value: number
  icon: React.ReactNode
  accentColor: string
}

function StatItem({ label, value, icon, accentColor }: StatItemProps) {
  const count = useCountUp(value, 1000)

  return (
    <motion.div variants={fadeInUp}>
      <GlassCard className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `${accentColor}20`, color: accentColor }}
          >
            {icon}
          </div>
        </div>
        <p
          className="text-2xl font-bold tabular-nums mb-1"
          style={{ color: accentColor }}
        >
          {count.toLocaleString()}
        </p>
        <p className="text-xs text-text-secondary">{label}</p>
      </GlassCard>
    </motion.div>
  )
}

interface UsageTabProps {
  stats: ProfileStats
}

export function UsageTab({ stats }: UsageTabProps) {
  const statItems = [
    { label: 'Items Stored',       value: stats.itemsCount,        icon: <Package size={18} />,       accentColor: '#06b6d4' },
    { label: 'Routines Created',   value: stats.routinesCount,     icon: <RefreshCw size={18} />,     accentColor: '#10b981' },
    { label: 'Activities Logged',  value: stats.logsCount,         icon: <BookOpen size={18} />,      accentColor: '#f59e0b' },
    { label: 'AI Conversations',   value: stats.chatSessionsCount, icon: <MessageSquare size={18} />, accentColor: '#6366f1' },
    { label: 'AI Messages Sent',   value: stats.aiMessagesCount,   icon: <Bot size={18} />,           accentColor: '#6366f1' },
    { label: 'Days on LifeLedger', value: stats.accountAgeDays,    icon: <Calendar size={18} />,      accentColor: '#8b5cf6' },
  ]

  return (
    <div>
      <p className="text-sm text-text-secondary mb-4">
        Your lifetime usage across all modules.
      </p>
      <motion.div
        className="grid grid-cols-2 gap-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {statItems.map((item) => (
          <StatItem
            key={item.label}
            label={item.label}
            value={item.value}
            icon={item.icon}
            accentColor={item.accentColor}
          />
        ))}
      </motion.div>
    </div>
  )
}
