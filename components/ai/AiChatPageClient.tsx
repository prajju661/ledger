'use client'

import { useState, useCallback } from 'react'
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
  const [sessions,         setSessions]         = useState(initialSessions)
  const [activeSessionId,  setActiveSessionId]  = useState<string | null>(null)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  const handleNewChat = useCallback(() => {
    setActiveSessionId(null)
    setSelectedSessionId(null)
  }, [])

  const handleSelectSession = useCallback((sid: string) => {
    setSelectedSessionId(sid)
    setActiveSessionId(sid)
  }, [])

  const handleSessionCreated = useCallback((sid: string) => {
    setActiveSessionId(sid)
    // Add to sessions list if not already present
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
    // -m-6 bleeds to layout edges, h-[calc(100vh-64px)] fills below the TopBar
    <div className="flex -m-6 h-[calc(100vh-64px)]">
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelect={handleSelectSession}
        onNewChat={handleNewChat}
      />
      <ChatArea
        userName={userName}
        initialSessionId={selectedSessionId}
        initialMessage={initialMessage}
        onSessionCreated={handleSessionCreated}
      />
    </div>
  )
}
