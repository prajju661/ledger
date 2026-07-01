'use client'

import { useState, useCallback } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { createClient } from '@/lib/supabase/client'

export function DangerZoneTab() {
  const router = useRouter()
  const [modalOpen, setModalOpen]       = useState(false)
  const [confirmText, setConfirmText]   = useState('')
  const [isDeleting, setIsDeleting]     = useState(false)

  const canDelete = confirmText === 'DELETE'

  const handleDeleteAccount = useCallback(async () => {
    if (!canDelete) return

    setIsDeleting(true)
    try {
      const res = await fetch('/api/account', { method: 'DELETE' })
      const json = await res.json()

      if (!res.ok || json.error) {
        toast.error(json.error ?? 'Failed to delete account.')
        setIsDeleting(false)
        return
      }

      // Sign out client-side before redirecting
      const supabase = createClient()
      await supabase.auth.signOut()

      toast.success('Account deleted.')
      router.push('/')
    } catch {
      toast.error('Something went wrong. Try again.')
      setIsDeleting(false)
    }
  }, [canDelete, router])

  return (
    <>
      {/* Red-tinted danger card */}
      <div className="rounded-2xl p-6 border border-red-500/20 bg-red-500/5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={18} className="text-red-400" />
          <h3 className="text-base font-semibold text-red-400">Danger Zone</h3>
        </div>

        <p className="text-sm text-text-secondary mb-6 leading-relaxed">
          This will permanently delete all your data — items, routines, activity logs, and
          chat history. Your account will be removed immediately.{' '}
          <span className="text-red-400 font-medium">This action cannot be undone.</span>
        </p>

        <Button
          variant="danger"
          onClick={() => setModalOpen(true)}
          className="w-full gap-2"
        >
          <Trash2 size={16} />
          Delete My Account
        </Button>
      </div>

      {/* Confirmation modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          if (!isDeleting) {
            setModalOpen(false)
            setConfirmText('')
          }
        }}
        title="Delete Account"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
            <p className="text-sm text-red-300 leading-relaxed">
              All your data will be permanently deleted — items, routines, activity logs,
              AI chat history, and your profile. This cannot be reversed.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Type <span className="font-mono font-bold text-red-400">DELETE</span> to confirm
            </label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              autoComplete="off"
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => {
                setModalOpen(false)
                setConfirmText('')
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleDeleteAccount}
              disabled={!canDelete || isDeleting}
              isLoading={isDeleting}
            >
              Permanently Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
