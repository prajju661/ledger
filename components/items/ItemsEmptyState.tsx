'use client'

import { motion } from 'framer-motion'
import { PackageSearch, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { fadeInUp } from '@/lib/animations'

interface ItemsEmptyStateProps {
  onAddItem: () => void
  isFiltered?: boolean
  query?: string
}

export function ItemsEmptyState({ onAddItem, isFiltered, query }: ItemsEmptyStateProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      {/* Animated illustration */}
      <motion.div
        className="mb-6 relative"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto"
          style={{
            background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(6,182,212,0.06))',
            border: '1px solid rgba(6,182,212,0.2)',
            boxShadow: '0 0 40px rgba(6,182,212,0.1)',
          }}
        >
          <PackageSearch size={36} className="text-module-items" />
        </div>
      </motion.div>

      {isFiltered ? (
        <>
          <h3 className="text-lg font-semibold text-text-primary mb-2">No items found</h3>
          <p className="text-sm text-text-secondary max-w-xs">
            {query
              ? `No items matching "${query}". Try a different search term.`
              : 'No items match this filter. Try a different category.'}
          </p>
        </>
      ) : (
        <>
          <h3 className="text-xl font-semibold text-text-primary mb-2">Nothing tracked yet</h3>
          <p className="text-sm text-text-secondary max-w-sm mb-7">
            Start by adding your first item — passport, charger, keys, anything you want to remember the location of.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={onAddItem}
            className="gap-2"
            style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}
          >
            <Plus size={16} />
            Add Your First Item
          </Button>
        </>
      )}
    </motion.div>
  )
}
