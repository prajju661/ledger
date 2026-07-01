'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

function getPasswordStrength(password: string): number {
  if (password.length === 0) return 0
  let score = 0
  if (password.length >= 8)                        score++
  if (/[A-Z]/.test(password))                      score++
  if (/[0-9]/.test(password))                      score++
  if (/[^A-Za-z0-9]/.test(password))               score++
  return score
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_COLORS = ['', 'bg-red-500', 'bg-amber-400', 'bg-amber-400', 'bg-emerald-400']
const STRENGTH_TEXT   = ['', 'text-red-400', 'text-amber-400', 'text-amber-400', 'text-emerald-400']

export function SecurityTab() {
  const [newPassword, setNewPassword]       = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew]               = useState(false)
  const [showConfirm, setShowConfirm]       = useState(false)
  const [isSaving, setIsSaving]             = useState(false)

  const strength    = getPasswordStrength(newPassword)
  const mismatch    = confirmPassword.length > 0 && newPassword !== confirmPassword
  const canSubmit   = newPassword.length >= 8 && strength >= 2 && newPassword === confirmPassword

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setIsSaving(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      })

      const json = await res.json()
      if (!res.ok || json.error) {
        toast.error(json.error ?? 'Failed to update password.')
        return
      }

      setNewPassword('')
      setConfirmPassword('')
      toast.success('Password updated successfully!')
    } catch {
      toast.error('Something went wrong. Try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <GlassCard className="p-6">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-5">
        Change Password
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* New password */}
        <div>
          <Input
            label="New Password"
            type={showNew ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            rightElement={
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="text-text-muted hover:text-text-secondary transition-colors"
                aria-label={showNew ? 'Hide password' : 'Show password'}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          {/* Strength meter — 4 segments */}
          {newPassword.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((seg) => (
                  <div
                    key={seg}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-all duration-300',
                      seg <= strength ? STRENGTH_COLORS[strength] : 'bg-white/10'
                    )}
                  />
                ))}
              </div>
              <p className={cn('text-xs', STRENGTH_TEXT[strength])}>
                {STRENGTH_LABELS[strength]}
              </p>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <Input
          label="Confirm New Password"
          type={showConfirm ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat new password"
          autoComplete="new-password"
          error={mismatch ? 'Passwords do not match.' : undefined}
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="text-text-muted hover:text-text-secondary transition-colors"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />

        <Button
          type="submit"
          isLoading={isSaving}
          disabled={!canSubmit || isSaving}
          className="w-full"
        >
          Update Password
        </Button>

        <p className="text-xs text-text-muted text-center">
          You&apos;ll stay signed in on this device after changing your password.
        </p>
      </form>
    </GlassCard>
  )
}
