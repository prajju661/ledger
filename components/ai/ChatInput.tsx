'use client'

import { useRef, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  value:      string
  onChange:   (v: string) => void
  onSend:     () => void
  isLoading:  boolean
  remaining:  number
  error?:     string | null
  onRetry?:   () => void
}

export function ChatInput({
  value,
  onChange,
  onSend,
  isLoading,
  remaining,
  error,
  onRetry,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() && !isLoading) onSend()
    }
  }

  const canSend = value.trim().length > 0 && !isLoading && remaining > 0

  return (
    <div className="p-4 border-t border-white/[0.06] bg-bg-elevated/60 backdrop-blur-xl">
      {/* Error banner */}
      {error && (
        <div
          className="flex items-center justify-between px-3 py-2 rounded-xl mb-3 text-sm"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <span className="text-red-400">⚠️ {error}</span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-xs text-red-400 hover:text-red-300 underline ml-3 shrink-0"
            >
              Retry
            </button>
          )}
        </div>
      )}

      <div className="flex items-end gap-2.5">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading || remaining <= 0}
          placeholder="Ask anything… 'where is my passport?'"
          rows={1}
          className={cn(
            'flex-1 glass-input resize-none text-sm leading-relaxed py-2.5 min-h-[42px]',
            (isLoading || remaining <= 0) && 'opacity-50 cursor-not-allowed'
          )}
          aria-label="Chat message input"
        />
        <button
          onClick={() => canSend && onSend()}
          disabled={!canSend}
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all',
            canSend
              ? 'text-white'
              : 'opacity-30 cursor-not-allowed glass'
          )}
          style={canSend ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' } : undefined}
          aria-label="Send message"
        >
          <ArrowUp size={16} />
        </button>
      </div>

      {/* Remaining count */}
      <p
        className={cn(
          'text-right text-[10px] mt-1.5',
          remaining < 5 ? 'text-red-400' : 'text-text-muted'
        )}
      >
        {remaining}/{50} messages today
      </p>
    </div>
  )
}
