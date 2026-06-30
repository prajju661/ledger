'use client'

import { useState, useCallback } from 'react'
import type { ChatMessage } from '@/types'

interface SendResult {
  reply:      string
  intent:     string
  metadata:   Record<string, unknown> | null
  session_id: string
  remaining:  number
}

interface UseChatReturn {
  messages:   ChatMessage[]
  sessionId:  string | null
  isLoading:  boolean
  error:      string | null
  remaining:  number
  sendMessage: (text: string) => Promise<void>
  loadSession: (sessionId: string) => Promise<void>
  newSession:  () => void
}

export function useChat(initialRemaining = 50): UseChatReturn {
  const [messages,  setMessages]  = useState<ChatMessage[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [remaining, setRemaining] = useState(initialRemaining)

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return
    setError(null)
    setIsLoading(true)

    // Optimistic user message
    const tempUserMsg: ChatMessage = {
      id:         crypto.randomUUID(),
      session_id: sessionId ?? '',
      role:       'user',
      message:    text,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempUserMsg])

    try {
      const res = await fetch('/api/ai/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: text, session_id: sessionId }),
      })

      const json = await res.json() as { data: SendResult | null; error: string | null; remaining?: number }

      if (!res.ok || json.error || !json.data) {
        // On rate-limit (429), update the remaining counter from top-level field
        if (res.status === 429 && typeof json.remaining === 'number') {
          setRemaining(json.remaining)
        }
        throw new Error(json.error ?? 'AI request failed')
      }

      const { reply, intent, metadata, session_id: newSessionId, remaining: rem } = json.data

      // Update session id
      if (newSessionId && newSessionId !== sessionId) {
        setSessionId(newSessionId)
        // Fix session_id on optimistic message
        setMessages((prev) =>
          prev.map((m) => (m.id === tempUserMsg.id ? { ...m, session_id: newSessionId } : m))
        )
      }

      // Add AI reply
      const aiMsg: ChatMessage = {
        id:         crypto.randomUUID(),
        session_id: newSessionId ?? sessionId ?? '',
        role:       'assistant',
        message:    reply,
        intent:     intent as ChatMessage['intent'],
        metadata:   metadata as ChatMessage['metadata'],
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, aiMsg])
      setRemaining(rem)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id))
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, sessionId])

  const loadSession = useCallback(async (sid: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res  = await fetch(`/api/ai/sessions/${sid}`)
      const json = await res.json() as { data: { messages: ChatMessage[] } | null; error: string | null }
      if (json.data?.messages) {
        setMessages(json.data.messages)
        setSessionId(sid)
      }
    } catch {
      setError('Failed to load conversation.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const newSession = useCallback(() => {
    setMessages([])
    setSessionId(null)
    setError(null)
    setRemaining(initialRemaining)
  }, [initialRemaining])

  return { messages, sessionId, isLoading, error, remaining, sendMessage, loadSession, newSession }
}
