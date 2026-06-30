'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, X, FileText, Cpu, KeyRound, Shirt,
  Gem, Heart, Wrench, Box, ChevronDown,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { MAX_ITEM_IMAGE_SIZE, ALLOWED_IMAGE_TYPES } from '@/lib/constants'
import type { Item } from '@/types'

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  /** Called with the saved item on success */
  onSave: (item: Item) => void
  /** Pre-fill for edit mode */
  initialData?: Item | null
}

interface Category {
  label: string
  icon: React.ElementType
  color: string
}

const CATEGORIES: Category[] = [
  { label: 'Documents',   icon: FileText, color: '#3b82f6' },
  { label: 'Electronics', icon: Cpu,      color: '#06b6d4' },
  { label: 'Keys',        icon: KeyRound, color: '#eab308' },
  { label: 'Clothing',    icon: Shirt,    color: '#a855f7' },
  { label: 'Jewelry',     icon: Gem,      color: '#ec4899' },
  { label: 'Health',      icon: Heart,    color: '#ef4444' },
  { label: 'Tools',       icon: Wrench,   color: '#f97316' },
  { label: 'Other',       icon: Box,      color: '#94a3b8' },
]

const MAX_NOTES = 500

export function AddItemModal({ isOpen, onClose, onSave, initialData }: AddItemModalProps) {
  const isEdit = !!initialData

  // ── Form state ──────────────────────────────────────────────────────────────
  const [name,     setName]     = useState('')
  const [category, setCategory] = useState('Other')
  const [location, setLocation] = useState('')
  const [notes,    setNotes]    = useState('')
  const [catOpen,  setCatOpen]  = useState(false)
  const catRef = useRef<HTMLDivElement>(null)

  // ── Image state ─────────────────────────────────────────────────────────────
  const [imageFile,    setImageFile]    = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [removeImage,  setRemoveImage]  = useState(false)
  const [isDragging,   setIsDragging]   = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Validation ───────────────────────────────────────────────────────────────
  const [nameError,     setNameError]     = useState('')
  const [locationError, setLocationError] = useState('')
  const [imageError,    setImageError]    = useState('')

  // ── Loading ──────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false)

  // Pre-fill form fields when modal opens or switches between add/edit mode.
  // setState-in-effect is intentional here: we're synchronizing form state with
  // the modal's open state and initialData prop, which is a valid use case.
  useEffect(() => {
    if (!isOpen) return
    /* eslint-disable react-hooks/set-state-in-effect */
    if (initialData) {
      setName(initialData.name)
      setCategory(initialData.category)
      setLocation(initialData.location)
      setNotes(initialData.notes ?? '')
      setImagePreview(initialData.image_url ?? null)
      setImageFile(null)
      setRemoveImage(false)
    } else {
      setName('')
      setCategory('Other')
      setLocation('')
      setNotes('')
      setImageFile(null)
      setImagePreview(null)
      setRemoveImage(false)
    }
    setNameError('')
    setLocationError('')
    setImageError('')
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [isOpen, initialData])

  // Close category dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false)
      }
    }
    if (catOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [catOpen])

  // ── Image handling ────────────────────────────────────────────────────────────
  const handleFile = useCallback((file: File) => {
    setImageError('')
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError('Only JPG, PNG, and WEBP images are allowed.')
      return
    }
    if (file.size > MAX_ITEM_IMAGE_SIZE) {
      setImageError('Image must be smaller than 5MB.')
      return
    }
    setImageFile(file)
    setRemoveImage(false)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setRemoveImage(true)
    setImageError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    let valid = true
    setNameError('')
    setLocationError('')

    if (!name.trim()) { setNameError('Item name is required.'); valid = false }
    if (!location.trim()) { setLocationError('Location is required.'); valid = false }
    if (!valid) return

    setLoading(true)
    try {
      let res: Response

      if (imageFile) {
        const form = new FormData()
        form.append('name', name.trim())
        form.append('category', category)
        form.append('location', location.trim())
        form.append('notes', notes.trim())
        form.append('image', imageFile)
        if (isEdit) form.append('removeImage', 'false')

        res = isEdit
          ? await fetch(`/api/items/${initialData!.id}`, { method: 'PUT', body: form })
          : await fetch('/api/items', { method: 'POST', body: form })
      } else {
        const payload: Record<string, string> = {
          name: name.trim(),
          category,
          location: location.trim(),
          notes: notes.trim(),
        }
        if (isEdit && removeImage) payload.removeImage = 'true'

        res = isEdit
          ? await fetch(`/api/items/${initialData!.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
          : await fetch('/api/items', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
      }

      const json = await res.json() as { data: { item: Item } | null; error: string | null }

      if (!res.ok || json.error || !json.data) {
        throw new Error(json.error ?? 'Failed to save item.')
      }

      onSave(json.data.item)
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      setImageError(msg)
    } finally {
      setLoading(false)
    }
  }

  const selectedCat = CATEGORIES.find((c) => c.label === category) ?? CATEGORIES[7]
  const SelectedIcon = selectedCat.icon

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Item' : 'Add Item'}
      maxWidth="max-w-[480px]"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Name */}
        <Input
          label="Item Name"
          placeholder="e.g. Passport, Charger, Keys"
          value={name}
          onChange={(e) => { setName(e.target.value); setNameError('') }}
          error={nameError}
          autoComplete="off"
          maxLength={100}
        />

        {/* Category + Location row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Category dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Category</label>
            <div className="relative" ref={catRef}>
              <button
                type="button"
                onClick={() => setCatOpen((o) => !o)}
                className="glass-input flex items-center gap-2 w-full text-left text-sm"
                aria-haspopup="listbox"
                aria-expanded={catOpen}
              >
                <SelectedIcon size={14} style={{ color: selectedCat.color }} className="shrink-0" />
                <span className="flex-1 truncate text-text-primary">{category}</span>
                <ChevronDown size={14} className={cn('text-text-muted transition-transform', catOpen && 'rotate-180')} />
              </button>

              <AnimatePresence>
                {catOpen && (
                  <motion.ul
                    role="listbox"
                    className="absolute z-20 left-0 right-0 top-[calc(100%+4px)] glass-modal rounded-xl py-1.5 max-h-56 overflow-y-auto"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.12 }}
                  >
                    {CATEGORIES.map((cat) => {
                      const CatIcon = cat.icon
                      return (
                        <li
                          key={cat.label}
                          role="option"
                          aria-selected={category === cat.label}
                          onClick={() => { setCategory(cat.label); setCatOpen(false) }}
                          className={cn(
                            'flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer transition-colors',
                            category === cat.label
                              ? 'text-text-primary bg-white/[0.07]'
                              : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]'
                          )}
                        >
                          <CatIcon size={13} style={{ color: cat.color }} />
                          {cat.label}
                        </li>
                      )
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Location */}
          <Input
            label="Location"
            placeholder="e.g. Bedroom drawer"
            value={location}
            onChange={(e) => { setLocation(e.target.value); setLocationError('') }}
            error={locationError}
            autoComplete="off"
            maxLength={200}
          />
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-text-secondary">Notes</label>
            <span className={cn(
              'text-xs',
              notes.length > MAX_NOTES * 0.9 ? 'text-warning' : 'text-text-disabled'
            )}>
              {notes.length}/{MAX_NOTES}
            </span>
          </div>
          <textarea
            placeholder="Optional details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, MAX_NOTES))}
            rows={3}
            className="glass-input resize-none text-sm"
          />
        </div>

        {/* Image upload */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-secondary">Image</label>

          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-white/[0.08] h-36">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                aria-label="Remove image"
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200',
                isDragging
                  ? 'border-module-items bg-module-items/5'
                  : 'border-white/[0.12] hover:border-module-items/50 hover:bg-white/[0.02]'
              )}
              role="button"
              tabIndex={0}
              aria-label="Upload image"
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            >
              <Upload size={22} className="mx-auto mb-2 text-text-muted" />
              <p className="text-sm text-text-secondary">
                Drop image here or <span className="text-module-items">click to browse</span>
              </p>
              <p className="text-xs text-text-disabled mt-1">JPG, PNG, WEBP · max 5MB</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(',')}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />

          {imageError && (
            <p className="text-xs text-error" role="alert">{imageError}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="flex-1"
            isLoading={loading}
            style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}
          >
            {isEdit ? 'Save Changes' : 'Add Item'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
