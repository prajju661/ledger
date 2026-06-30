'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { scaleIn, fadeIn } from '@/lib/animations'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const validate = () => {
    if (!email.trim()) {
      setEmailError('Email is required.')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email.')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      // Always show success — never reveal if email exists (security)
      setSubmitted(true)
    } catch {
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
        <div className="glass-modal p-10">
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

          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div key="form" variants={fadeIn} initial="hidden" animate="visible" exit="hidden">
                <h1 className="text-2xl font-bold text-text-primary mb-1">Forgot your password?</h1>
                <p className="text-sm text-text-secondary mb-7">
                  Enter your email and we&apos;ll send you a reset link.
                </p>

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
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

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    isLoading={loading}
                  >
                    Send Reset Link
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                className="text-center py-4"
              >
                <div className="flex justify-center mb-5">
                  <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle size={32} className="text-success" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-text-primary mb-2">Check your inbox</h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                  If an account exists for <span className="text-text-primary font-medium">{email}</span>,
                  you&apos;ll receive a password reset link shortly.
                </p>
                <p className="text-xs text-text-muted mt-3">
                  Don&apos;t see it? Check your spam folder.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-7 flex justify-center">
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft size={14} />
              Back to sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  )
}
