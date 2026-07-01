'use client'

import { useState, useCallback } from 'react'
import { PageTransition } from '@/components/layout/PageTransition'
import { ChatSidebar } from './ChatSidebar'
import { ChatArea }    from './ChatArea'

interface SessionPreview {
  session_id: string
  preview:    string
  updated_at: string
}

interface AiChatPageClientProps {
  sessions:        SessionPreview[]
  userName:        string
  initialMessage?: string | null
}

export function AiChatPageClient({
  sessions: initialSessions,
  userName,
  initialMessage,
}: AiChatPageClientProps) {
  const [sessions,          setSessions]          = useState(initialSessions)
  const [activeSessionId,   setActiveSessionId]   = useState<string | null>(null)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  // Incrementing this remounts ChatArea, giving a guaranteed clean slate
  const [chatKey,           setChatKey]           = useState(0)

  const handleNewChat = useCallback(() => {
    setActiveSessionId(null)
    setSelectedSessionId(null)
    setChatKey((k) => k + 1)
  }, [])

  const handleSelectSession = useCallback((sid: string) => {
    setSelectedSessionId(sid)
    setActiveSessionId(sid)
    setChatKey((k) => k + 1)
  }, [])

  const handleSessionCreated = useCallback((sid: string) => {
    setActiveSessionId(sid)
    setSessions((prev) => {
      const exists = prev.some((s) => s.session_id === sid)
      if (exists) return prev
      return [
        { session_id: sid, preview: 'New conversation', updated_at: new Date().toISOString() },
        ...prev,
      ]
    })
  }, [])

  return (
    <PageTransition>
    <div className="flex -m-6 h-[calc(100vh-64px)]">
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelect={handleSelectSession}
        onNewChat={handleNewChat}
      />
      <ChatArea
        key={chatKey}
        userName={userName}
        initialSessionId={selectedSessionId}
        initialMessage={initialMessage}
        onSessionCreated={handleSessionCreated}
      />
    </div>
    </PageTransition>
  )
}
