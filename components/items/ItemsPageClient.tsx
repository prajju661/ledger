'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Package2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ItemCard } from './ItemCard'
import { AddItemModal } from './AddItemModal'
import { ItemsSkeleton } from './ItemsSkeleton'
import { ItemsEmptyState } from './ItemsEmptyState'
import { staggerContainer, fadeInDown } from '@/lib/animations'
import { cn } from '@/lib/utils'
import type { Item } from '@/types'

interface ItemsPageClientProps {
  initialItems: Item[]
}

const CATEGORIES = ['All', 'Documents', 'Electronics', 'Keys', 'Clothing', 'Jewelry', 'Health', 'Tools', 'Other']

export function ItemsPageClient({ initialItems }: ItemsPageClientProps) {
  const [items,          setItems]          = useState<Item[]>(initialItems)
  const [search,         setSearch]         = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [isLoading,      setIsLoading]      = useState(false)
  const [isAddOpen,      setIsAddOpen]      = useState(false)
  const [editingItem,    setEditingItem]    = useState<Item | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Debounced search ────────────────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search])

  // ── Fetch when filters change ───────────────────────────────────────────────
  const fetchItems = useCallback(async (s: string, cat: string) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (s)   params.set('search', s)
      if (cat && cat !== 'All') params.set('category', cat)
      const res = await fetch(`/api/items?${params}`)
      const json = await res.json() as { data: { items: Item[] } | null; error: string | null }
      if (json.data) setItems(json.data.items)
    } catch {
      toast.error('Failed to load items.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Skip on initial mount (we already have initialItems from the server).
    // setState inside fetchItems is intentional — it's an async data fetch effect.
    if (debouncedSearch || activeCategory !== 'All') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchItems(debouncedSearch, activeCategory)
    }
  }, [debouncedSearch, activeCategory, fetchItems])

  // ── Category counts ─────────────────────────────────────────────────────────
  const categoryCounts = CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
    if (cat === 'All') {
      acc[cat] = initialItems.length
    } else {
      // Count from the full initialItems for the chip labels
      acc[cat] = initialItems.filter((i) => i.category === cat).length
    }
    return acc
  }, {})

  // ── Optimistic add ──────────────────────────────────────────────────────────
  const handleItemSaved = useCallback((savedItem: Item) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === savedItem.id)
      if (exists) {
        // Edit — replace in place
        return prev.map((i) => (i.id === savedItem.id ? savedItem : i))
      }
      // Add — prepend
      return [savedItem, ...prev]
    })
    toast.success(editingItem ? 'Item updated!' : 'Item saved!')
    setEditingItem(null)
  }, [editingItem])

  // ── Optimistic delete ───────────────────────────────────────────────────────
  const handleDelete = useCallback(async (item: Item) => {
    // Optimistic remove
    setItems((prev) => prev.filter((i) => i.id !== item.id))

    try {
      const res = await fetch(`/api/items/${item.id}`, { method: 'DELETE' })
      const json = await res.json() as { data: unknown; error: string | null }
      if (!res.ok || json.error) throw new Error(json.error ?? 'Delete failed')
      toast.success('Item deleted.')
    } catch {
      // Revert
      setItems((prev) => [item, ...prev])
      toast.error('Failed to delete item. Please try again.')
    }
  }, [])

  const isFiltered = debouncedSearch.length > 0 || activeCategory !== 'All'

  return (
    <div className="space-y-6">
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <motion.div
        variants={fadeInDown}
        initial="hidden"
        animate="visible"
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <h1
            className="text-2xl font-bold text-text-primary"
            style={{ textShadow: '0 0 20px rgba(6,182,212,0.3)' }}
          >
            WhereDidItGo
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Never lose track of anything again
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => { setEditingItem(null); setIsAddOpen(true) }}
          className="gap-2 shrink-0"
          style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}
        >
          <Package2 size={16} />
          Add Item
        </Button>
      </motion.div>

      {/* ── Search + filters ────────────────────────────────────────────────── */}
      <motion.div
        variants={fadeInDown}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        <Input
          placeholder="Search items by name, location, or notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search size={15} />}
        />

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat] ?? 0
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
                  isActive
                    ? 'bg-module-items text-bg-surface font-semibold'
                    : 'glass text-text-secondary hover:text-text-primary hover:border-white/20'
                )}
              >
                {cat}{cat !== 'All' && count > 0 ? ` (${count})` : ''}
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* ── Grid ────────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <ItemsSkeleton />
      ) : items.length === 0 ? (
        <ItemsEmptyState
          onAddItem={() => { setEditingItem(null); setIsAddOpen(true) }}
          isFiltered={isFiltered}
          query={debouncedSearch}
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onEdit={(i) => { setEditingItem(i); setIsAddOpen(true) }}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      <AddItemModal
        isOpen={isAddOpen}
        onClose={() => { setIsAddOpen(false); setEditingItem(null) }}
        onSave={handleItemSaved}
        initialData={editingItem}
      />
    </div>
  )
}
