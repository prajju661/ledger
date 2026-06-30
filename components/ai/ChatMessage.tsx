'use client'

import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { getInitials } from '@/lib/utils'
import { InlineResultCard } from './InlineResultCard'
import { IntentBadge } from './IntentBadge'
import type { ChatMessage as ChatMessageType } from '@/types'

interface ChatMessageProps {
  message: ChatMessageType
  userName?: string
}

export function ChatMessage({ message, userName = 'User' }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const time   = format(parseISO(message.created_at), 'h:mm a')

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex items-end justify-end gap-2.5"
      >
        <div className="flex flex-col items-end max-w-[75%]">
          <div
            className="px-4 py-2.5 rounded-2xl rounded-br-sm text-sm text-text-primary"
            style={{
              background:  'rgba(99,102,241,0.18)',
              border:      '1px solid rgba(99,102,241,0.25)',
            }}
          >
            {message.message}
          </div>
          <span className="text-[10px] text-text-muted mt-1">{time}</span>
        </div>
        {/* User avatar */}
        <div
          className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          {getInitials(userName)}
        </div>
      </motion.div>
    )
  }

  // AI message
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.05 }}
      className="flex items-start gap-2.5"
    >
      {/* AI avatar */}
      <div
        className="w-7 h-7 rounded-full shrink-0 mt-1 flex items-center justify-center text-xs"
        style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          boxShadow:  '0 0 10px rgba(99,102,241,0.3)',
        }}
      >
        ✦
      </div>

      <div className="max-w-[75%]">
        {/* Bubble */}
        <div className="glass px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm text-text-primary">
          <p className="leading-relaxed">{message.message}</p>

          {/* Inline result card */}
          {message.metadata && (
            <InlineResultCard metadata={message.metadata as Record<string, unknown>} />
          )}
        </div>

        {/* Intent badge + time */}
        <div className="flex items-center gap-2 mt-1.5 ml-1">
          {message.intent && <IntentBadge intent={message.intent} />}
          <span className="text-[10px] text-text-muted">{time}</span>
        </div>
      </div>
    </motion.div>
  )
}
