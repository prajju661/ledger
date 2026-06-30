'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { PackagePlus, PlusCircle, BookOpen, Sparkles } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { AddItemModal }    from '@/components/items/AddItemModal'
import { AddRoutineModal } from '@/components/routines/AddRoutineModal'
import { AddLogModal }     from '@/components/logs/AddLogModal'
import type { Item, Routine, ActivityLog } from '@/types'

interface QuickActionsProps {
  onItemAdded?:    (item: Item) => void
  onRoutineAdded?: (routine: Routine) => void
  onLogAdded?:     (log: ActivityLog) => void
}

const ACTIONS = [
  { label: 'Add Item',     icon: PackagePlus, accent: '#06b6d4', key: 'item'    },
  { label: 'New Routine',  icon: PlusCircle,  accent: '#10b981', key: 'routine' },
  { label: 'Log Activity', icon: BookOpen,    accent: '#f59e0b', key: 'log'     },
  { label: 'Ask AI',       icon: Sparkles,    accent: '#6366f1', key: 'ai'      },
] as const

type ModalKey = 'item' | 'routine' | 'log' | null

export function QuickActions({ onItemAdded, onRoutineAdded, onLogAdded }: QuickActionsProps) {
  const [openModal, setOpenModal] = useState<ModalKey>(null)
  const router = useRouter()

  const handleAction = (key: string) => {
    if (key === 'ai') {
      router.push('/dashboard/ai-chat')
    } else {
      setOpenModal(key as ModalKey)
    }
  }

  return (
    <>
      <GlassCard className="p-5">
        <h2 className="text-sm font-semibold text-text-primary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-2">
          {ACTIONS.map(({ label, icon: Icon, accent, key }) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleAction(key)}
              className="flex flex-col items-center gap-2 p-4 glass rounded-xl border border-white/[0.07] hover:border-current transition-all"
              style={{ color: accent }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${accent}15` }}
              >
                <Icon size={20} style={{ color: accent }} />
              </div>
              <span className="text-xs font-medium text-text-secondary">{label}</span>
            </motion.button>
          ))}
        </div>
      </GlassCard>

      {/* Modals */}
      <AddItemModal
        isOpen={openModal === 'item'}
        onClose={() => setOpenModal(null)}
        onSave={(item) => { onItemAdded?.(item); setOpenModal(null) }}
      />
      <AddRoutineModal
        isOpen={openModal === 'routine'}
        onClose={() => setOpenModal(null)}
        onSave={(routine) => { onRoutineAdded?.(routine); setOpenModal(null) }}
      />
      <AddLogModal
        isOpen={openModal === 'log'}
        onClose={() => setOpenModal(null)}
        onSave={(log) => { onLogAdded?.(log); setOpenModal(null) }}
      />
    </>
  )
}
