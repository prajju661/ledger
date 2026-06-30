'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { GlassCard } from '@/components/ui/GlassCard'
import { useCountUp } from '@/hooks/useCountUp'
import { fadeInUp } from '@/lib/animations'
import type { AccentColor } from '@/types'

interface StatsCardProps {
  label:         string
  value:         number
  icon:          React.ReactNode
  accentColor:   string
  accent:        AccentColor
  sparkline:     number[]
  href?:         string
}

export function StatsCard({
  label,
  value,
  icon,
  accentColor,
  accent,
  sparkline,
  href,
}: StatsCardProps) {
  const router       = useRouter()
  const displayValue = useCountUp(value, 800)

  const chartData = sparkline.map((v, i) => ({ i, v }))

  return (
    <motion.div variants={fadeInUp}>
      <GlassCard
        accent={accent}
        hover={!!href}
        className="p-4 cursor-pointer"
        onClick={href ? () => router.push(href) : undefined}
      >
        <div className="flex items-start justify-between mb-3">
          {/* Icon */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${accentColor}18` }}
          >
            <span style={{ color: accentColor }}>{icon}</span>
          </div>
          {/* Sparkline */}
          <div className="w-20 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={accentColor}
                  fill={`${accentColor}20`}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <p className="text-2xl font-bold text-text-primary leading-none mb-1">{displayValue}</p>
        <p className="text-xs text-text-secondary">{label}</p>
      </GlassCard>
    </motion.div>
  )
}
