'use client'

import { formatDistanceToNow, parseISO } from 'date-fns'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SessionPreview {
  session_id: string
  preview:    string
  updated_at: string
}

interface ChatSidebarProps {
  sessions:        SessionPreview[]
  activeSessionId: string | null
  onSelect:        (sessionId: string) => void
  onNewChat:       () => void
}

export function ChatSidebar({
  sessions,
  activeSessionId,
  onSelect,
  onNewChat,
}: ChatSidebarProps) {
  return (
    <aside
      className="hidden md:flex flex-col h-full border-r border-white/[0.06] bg-bg-elevated/60 backdrop-blur-xl"
      style={{ width: 264, minWidth: 264 }}
    >
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 12px rgba(99,102,241,0.3)' }}
          >
            ✦
          </span>
          <span className="font-semibold text-text-primary text-sm">LifeGuide AI</span>
        </div>

        {/* New chat button */}
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          <Plus size={14} />
          New Chat
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {sessions.length === 0 ? (
          <p className="text-xs text-text-muted text-center py-8 px-4">
            No conversations yet. Start a new chat!
          </p>
        ) : (
          <div className="space-y-0.5">
            {sessions.map((s) => (
              <button
                key={s.session_id}
                onClick={() => onSelect(s.session_id)}
                className={cn(
                  'w-full text-left px-3 py-2.5 rounded-xl transition-all relative',
                  activeSessionId === s.session_id
                    ? 'bg-white/[0.07] text-text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]'
                )}
              >
                {/* Active indicator */}
                {activeSessionId === s.session_id && (
                  <div
                    className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                    style={{ background: '#6366f1' }}
                  />
                )}
                <p className="text-xs font-medium truncate">{s.preview || 'New conversation'}</p>
                <p className="text-[10px] text-text-muted mt-0.5">
                  {formatDistanceToNow(parseISO(s.updated_at), { addSuffix: true })}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
