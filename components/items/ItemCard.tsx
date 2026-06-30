'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MoreVertical, MapPin, Pencil, Trash2,
  FileText, Cpu, KeyRound, Shirt, Gem, Heart, Wrench, Box,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { timeAgo } from '@/lib/utils'
import { fadeInUp } from '@/lib/animations'
import type { Item } from '@/types'

interface ItemCardProps {
  item: Item
  onEdit: (item: Item) => void
  onDelete: (item: Item) => void
}

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  Documents:   { icon: FileText, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  Electronics: { icon: Cpu,      color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
  Keys:        { icon: KeyRound, color: '#eab308', bg: 'rgba(234,179,8,0.15)' },
  Clothing:    { icon: Shirt,    color: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
  Jewelry:     { icon: Gem,      color: '#ec4899', bg: 'rgba(236,72,153,0.15)' },
  Health:      { icon: Heart,    color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  Tools:       { icon: Wrench,   color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
  Other:       { icon: Box,      color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' },
}

export function ItemCard({ item, onEdit, onDelete }: ItemCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const catConfig = CATEGORY_CONFIG[item.category] ?? CATEGORY_CONFIG.Other
  const CategoryIcon = catConfig.icon

  // Close menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
        setConfirmDelete(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  return (
    <motion.div
      variants={fadeInUp}
      layout
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
    >
      <GlassCard accent="cyan" hover className="overflow-hidden flex flex-col h-full">
        {/* Image / icon area */}
        <div
          className="relative h-40 w-full shrink-0 overflow-hidden rounded-t-2xl"
          style={{ background: item.image_url ? undefined : catConfig.bg }}
        >
          {item.image_url ? (
            <>
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
              {/* Gradient overlay at bottom */}
              <div
                className="absolute inset-x-0 bottom-0 h-14 pointer-events-none"
                style={{
                  background: 'linear-gradient(to top, rgba(13,13,25,0.7) 0%, transparent 100%)',
                }}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <CategoryIcon
                size={40}
                style={{ color: catConfig.color, opacity: 0.85 }}
              />
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="flex-1 flex flex-col p-4 gap-2">
          {/* Name + menu */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-text-primary text-sm leading-snug line-clamp-2 flex-1">
              {item.name}
            </h3>

            {/* ⋮ Menu */}
            <div className="relative shrink-0" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen((o) => !o)
                  setConfirmDelete(false)
                }}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.07] transition-colors"
                aria-label="Item actions"
                aria-haspopup="true"
                aria-expanded={menuOpen}
              >
                <MoreVertical size={15} />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    className="absolute right-0 top-8 z-30 glass-modal rounded-xl py-1.5 min-w-[140px]"
                    initial={{ opacity: 0, scale: 0.92, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: -4 }}
                    transition={{ duration: 0.12 }}
                  >
                    {!confirmDelete ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setMenuOpen(false)
                            onEdit(item)
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.05] transition-colors"
                        >
                          <Pencil size={13} />
                          Edit
                        </button>
                        <div className="mx-2 h-px bg-white/[0.06] my-0.5" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setConfirmDelete(true)
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-error hover:bg-error/10 transition-colors"
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </>
                    ) : (
                      <div className="px-3 py-2 space-y-2">
                        <p className="text-xs text-text-secondary">Sure? Can&apos;t undo.</p>
                        <div className="flex gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setConfirmDelete(false)
                              setMenuOpen(false)
                            }}
                            className="flex-1 px-2 py-1 text-xs rounded-lg glass text-text-secondary hover:text-text-primary transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setMenuOpen(false)
                              setConfirmDelete(false)
                              onDelete(item)
                            }}
                            className="flex-1 px-2 py-1 text-xs rounded-lg bg-error/15 text-error hover:bg-error/25 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-text-secondary text-xs">
            <MapPin size={11} className="shrink-0 text-module-items" />
            <span className="truncate">{item.location}</span>
          </div>

          {/* Category badge */}
          <div>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border"
              style={{
                background: catConfig.bg,
                color: catConfig.color,
                borderColor: `${catConfig.color}33`,
              }}
            >
              {item.category}
            </span>
          </div>

          {/* Notes */}
          {item.notes && (
            <p className="text-xs text-text-muted truncate">{item.notes}</p>
          )}

          {/* Timestamp */}
          <p className="text-[10px] text-text-disabled mt-auto pt-1">
            Added {timeAgo(item.created_at)}
          </p>
        </div>
      </GlassCard>
    </motion.div>
  )
}
