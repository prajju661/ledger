'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence }  from 'framer-motion'
import { ChatMessage }      from './ChatMessage'
import { TypingIndicator }  from './TypingIndicator'
import { SuggestedPrompts } from './SuggestedPrompts'
import { ChatInput }        from './ChatInput'
import { useChat }          from '@/hooks/useChat'

interface ChatAreaProps {
  userName:          string
  initialSessionId?: string | null
  initialMessage?:   string | null
  onSessionCreated?: (sessionId: string) => void
}

export function ChatArea({
  userName,
  initialSessionId,
  initialMessage,
  onSessionCreated,
}: ChatAreaProps) {
  const {
    messages,
    sessionId,
    isLoading,
    error,
    remaining,
    sendMessage,
    loadSession,
  } = useChat(50)

  const [input, setInput] = useState('')
  const bottomRef         = useRef<HTMLDivElement>(null)
  const autoSentRef       = useRef(false)
  const prevSessionId     = useRef<string | null>(null)

  // Load initial session if provided
  useEffect(() => {
    if (initialSessionId) {
      void loadSession(initialSessionId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSessionId])

  // Auto-send ?message= param exactly once on mount
  useEffect(() => {
    if (initialMessage && !autoSentRef.current) {
      autoSentRef.current = true
      void sendMessage(initialMessage)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage])

  // Notify parent when a new session is created
  useEffect(() => {
    if (sessionId && sessionId !== prevSessionId.current) {
      prevSessionId.current = sessionId
      onSessionCreated?.(sessionId)
    }
  }, [sessionId, onSessionCreated])

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = useCallback(() => {
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    void sendMessage(text)
  }, [input, isLoading, sendMessage])

  const handleSuggest = useCallback((prompt: string) => {
    void sendMessage(prompt)
  }, [sendMessage])

  const handleRetry = useCallback(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    if (lastUser) {
      void sendMessage(lastUser.message)
    }
  }, [messages, sendMessage])

  return (
    <div className="flex flex-col h-full flex-1 min-w-0">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-5">
        {messages.length === 0 && !isLoading ? (
          <SuggestedPrompts userName={userName} onSelect={handleSuggest} />
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} userName={userName} />
            ))}
            {isLoading && <TypingIndicator key="typing" />}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        isLoading={isLoading}
        remaining={remaining}
        error={error}
        onRetry={handleRetry}
      />
    </div>
  )
}
