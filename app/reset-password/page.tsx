'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Bot, Lock, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { scaleIn } from '@/lib/animations'

const shakeVariants = {
  idle: { x: 0 },
  shake: {
    x: [-10, 10, -8, 8, -4, 4, 0],
    transition: { duration: 0.5 },
  },
}

function getPasswordStrength(password: string): number {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

const strengthConfig = [
  { label: 'Too short',  color: 'bg-error' },
  { label: 'Weak',       color: 'bg-error' },
  { label: 'Fair',       color: 'bg-warning' },
  { label: 'Good',       color: 'bg-yellow-400' },
  { label: 'Strong',     color: 'bg-success' },
]

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}

function ResetPasswordForm() {
  const router = useRouter()
  // Supabase appends the token as a hash fragment — handled client-side automatically
  // by the Supabase JS client after exchangeCodeForSession via the callback route.
  // The user lands here after clicking the email link and being redirected by /api/auth/callback.
  useSearchParams() // keep for potential ?error param reads in future

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [confirmError, setConfirmError] = useState('')

  const strength = password.length > 0 ? getPasswordStrength(password) : -1
  const strengthInfo = strength >= 0 ? strengthConfig[strength] : null

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 600)
  }

  const validate = () => {
    let valid = true
    setPasswordError('')
    setConfirmError('')

    if (!password) {
      setPasswordError('Password is required.')
      valid = false
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters.')
      valid = false
    }
    if (!confirmPassword) {
      setConfirmError('Please confirm your password.')
      valid = false
    } else if (password !== confirmPassword) {
      setConfirmError('Passwords do not match.')
      valid = false
    }
    return valid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      triggerShake()
      return
    }

    setLoading(true)
    try {
      // updateUser works here because Supabase automatically establishes
      // a session from the token in the URL hash before this page renders.
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        triggerShake()
        toast.error(error.message ?? 'Failed to update password. Please request a new reset link.')
        return
      }

      toast.success('Password updated! Signing you in…')
      router.push('/dashboard')
      router.refresh()
    } catch {
      triggerShake()
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-bg-surface">
      <motion.div
        className="w-full max-w-[440px]"
        variants={scaleIn}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="glass-modal p-10"
          variants={shakeVariants}
          animate={shake ? 'shake' : 'idle'}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 0 20px rgba(99,102,241,0.4)',
              }}
            >
              <Bot size={20} className="text-white" />
            </div>
            <span className="font-extrabold text-lg gradient-text">LifeLedger AI</span>
          </div>

          <h1 className="text-2xl font-bold text-text-primary mb-1">Set new password</h1>
          <p className="text-sm text-text-secondary mb-7">
            Choose a strong password for your account.
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-2">
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError('') }}
                error={passwordError}
                autoComplete="new-password"
                leftIcon={<Lock size={16} />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="text-text-muted hover:text-text-secondary transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />

              {/* Strength meter */}
              {password.length > 0 && (
                <div className="space-y-1.5" aria-live="polite" aria-label={`Password strength: ${strengthInfo?.label}`}>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((seg) => (
                      <div
                        key={seg}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          strength >= seg ? strengthInfo!.color : 'bg-white/[0.08]'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${
                    strength <= 1 ? 'text-error' :
                    strength === 2 ? 'text-warning' :
                    strength === 3 ? 'text-yellow-400' :
                    'text-success'
                  }`}>
                    {strengthInfo?.label}
                  </p>
                </div>
              )}
            </div>

            <Input
              label="Confirm New Password"
              type={showConfirm ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setConfirmError('') }}
              error={confirmError}
              autoComplete="new-password"
              leftIcon={<Lock size={16} />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="text-text-muted hover:text-text-secondary transition-colors"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={loading}
            >
              Update Password
            </Button>
          </form>

          <div className="mt-7 flex justify-center">
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft size={14} />
              Back to sign in
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </main>
  )
}
