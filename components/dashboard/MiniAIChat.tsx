'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'

export function MiniAIChat() {
  const [input, setInput] = useState('')
  const router            = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const msg = input.trim()
    if (msg) {
      router.push(`/dashboard/ai-chat?message=${encodeURIComponent(msg)}`)
    } else {
      router.push('/dashboard/ai-chat')
    }
  }

  return (
    <GlassCard accent="indigo" className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 animate-pulse"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.15))', boxShadow: '0 0 12px rgba(99,102,241,0.25)' }}
        >
          ✦
        </div>
        <span className="text-sm font-semibold text-text-primary">LifeGuide AI</span>
      </div>

      <p className="text-xs text-text-muted mb-3">
        Ask me anything about your items, routines, or activity history.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onClick={() => !input && router.push('/dashboard/ai-chat')}
          placeholder="Ask anything…"
          className="flex-1 glass-input text-sm py-2"
        />
        <button
          type="submit"
          className="w-9 h-9 flex items-center justify-center rounded-xl shrink-0 text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          aria-label="Open AI chat"
        >
          <ArrowRight size={14} />
        </button>
      </form>
    </GlassCard>
  )
}
