/** All shared TypeScript interfaces and types for LifeLedger AI */

// ─── User / Auth ──────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  name: string
  avatar_url?: string | null
  created_at: string
  updated_at: string
}

// ─── WhereDidItGo ─────────────────────────────────────────────────────────────

export interface Item {
  id: string
  user_id: string
  name: string
  category: string
  location: string
  notes?: string | null
  image_url?: string | null
  created_at: string
  updated_at: string
}

export interface CreateItemInput {
  name: string
  category: string
  location: string
  notes?: string
  image_url?: string
}

export interface UpdateItemInput extends Partial<CreateItemInput> {
  id: string
}

// ─── Repeat (Routines) ────────────────────────────────────────────────────────

export interface Routine {
  id: string
  user_id: string
  title: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
  interval: number
  interval_unit?: 'days' | 'weeks' | 'months' | null
  next_due: string            // ISO date string (date only)
  reminder_time?: string | null // e.g. "09:00"
  notes?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RoutineCompletion {
  id: string
  routine_id: string
  user_id: string
  completed_at: string
  action: 'completed' | 'skipped'
}

export interface CreateRoutineInput {
  title: string
  frequency: Routine['frequency']
  interval?: number
  interval_unit?: Routine['interval_unit']
  next_due: string
  reminder_time?: string
  notes?: string
}

// ─── LifeLog ──────────────────────────────────────────────────────────────────

export interface ActivityLog {
  id: string
  user_id: string
  title: string
  category: string
  notes?: string | null
  completed_at: string
  created_at: string
}

export interface CreateLogInput {
  title: string
  category: string
  notes?: string
  completed_at?: string
}

// ─── AI Chat ─────────────────────────────────────────────────────────────────

export type Intent =
  | 'find_item'
  | 'add_item'
  | 'create_routine'
  | 'check_history'
  | 'pending_tasks'
  | 'general'

export interface ChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant'
  message: string
  intent?: Intent | null
  metadata?: Record<string, unknown> | null
  created_at: string
}

export interface ChatSession {
  id: string                // session_id UUID
  preview: string           // first message truncated
  updated_at: string
  messages: ChatMessage[]
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalItems: number
  pendingRoutines: number
  activitiesThisMonth: number
  aiChatsToday: number
}

// ─── Generic API Responses ────────────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  data: T
  error: null
}

export interface ApiError {
  data: null
  error: string
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError

// ─── UI State ─────────────────────────────────────────────────────────────────

export type AccentColor = 'cyan' | 'emerald' | 'amber' | 'indigo' | 'none'

export type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'icon'

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default'
