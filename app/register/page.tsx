'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Bot, Mail, Lock, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { scaleIn } from '@/lib/animations'
import { APP_URL } from '@/lib/constants'

const shakeVariants = {
  idle: { x: 0 },
  shake: {
    x: [-10, 10, -8, 8, -4, 4, 0],
    transition: { duration: 0.5 },
  },
}

/** 0–4 strength score */
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

export default function RegisterPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [shake, setShake] = useState(false)

  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')
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
    setNameError('')
    setEmailError('')
    setPasswordError('')
    setConfirmError('')

    if (!name.trim()) {
      setNameError('Full name is required.')
      valid = false
    }
    if (!email.trim()) {
      setEmailError('Email is required.')
      valid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email.')
      valid = false
    }
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      triggerShake()
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email, password }),
      })
      const json: { data: unknown; error: string | null } = await res.json()

      if (!res.ok || json.error) {
        triggerShake()
        toast.error(json.error ?? 'Registration failed. Please try again.')
        return
      }

      toast.success('Account created! Signing you in…')
      router.push('/dashboard')
      router.refresh()
    } catch {
      triggerShake()
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleRegister = async () => {
    setGoogleLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${APP_URL}/api/auth/callback?next=/dashboard`,
        },
      })
      if (error) {
        toast.error('Google sign-up failed. Please try again.')
        setGoogleLoading(false)
      }
    } catch {
      toast.error('Google sign-up failed. Please try again.')
      setGoogleLoading(false)
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

          <h1 className="text-2xl font-bold text-text-primary mb-1">Create your account</h1>
          <p className="text-sm text-text-secondary mb-7">Start tracking your life today</p>

          <form onSubmit={handleRegister} noValidate className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError('') }}
              error={nameError}
              autoComplete="name"
              leftIcon={<User size={16} />}
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
              error={emailError}
              autoComplete="email"
              leftIcon={<Mail size={16} />}
            />

            <div className="space-y-2">
              <Input
                label="Password"
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
              label="Confirm Password"
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
              Create Account
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-xs text-text-muted">or</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          {/* Google */}
          <Button
            variant="ghost"
            size="lg"
            className="w-full"
            isLoading={googleLoading}
            onClick={handleGoogleRegister}
            type="button"
          >
            {!googleLoading && (
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continue with Google
          </Button>

          <p className="text-center text-sm text-text-secondary mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-accent-primary hover:text-accent-glow transition-colors font-medium">
              Sign in →
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </main>
  )
}
