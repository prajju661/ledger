/** App-wide constants — import from here, never hardcode these inline */

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'LifeLedger AI'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// ─── Storage ─────────────────────────────────────────────────────────────────
export const ITEM_IMAGES_BUCKET =
  process.env.NEXT_PUBLIC_ITEM_IMAGES_BUCKET ?? 'item-images'
export const AVATARS_BUCKET =
  process.env.NEXT_PUBLIC_AVATARS_BUCKET ?? 'avatars'

// ─── Limits ───────────────────────────────────────────────────────────────────
export const MAX_ITEM_IMAGE_SIZE = 5 * 1024 * 1024   // 5 MB
export const MAX_AVATAR_SIZE     = 2 * 1024 * 1024   // 2 MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const AI_DAILY_MESSAGE_LIMIT = 50

// ─── Item Categories ─────────────────────────────────────────────────────────
export const ITEM_CATEGORIES = [
  'Documents',
  'Electronics',
  'Keys',
  'Clothing',
  'Jewelry',
  'Other',
] as const
export type ItemCategory = (typeof ITEM_CATEGORIES)[number]

// ─── Activity Log Categories ──────────────────────────────────────────────────
export const LOG_CATEGORIES = [
  'Maintenance',
  'Cleaning',
  'Health',
  'Finance',
  'Work',
  'Personal',
  'Other',
] as const
export type LogCategory = (typeof LOG_CATEGORIES)[number]

// ─── Routine Frequencies ──────────────────────────────────────────────────────
export const ROUTINE_FREQUENCIES = ['daily', 'weekly', 'monthly', 'custom'] as const
export type RoutineFrequency = (typeof ROUTINE_FREQUENCIES)[number]

// ─── Module Colors ────────────────────────────────────────────────────────────
export const MODULE_COLORS = {
  items:    '#06b6d4',  // cyan
  routines: '#10b981',  // emerald
  logs:     '#f59e0b',  // amber
  ai:       '#6366f1',  // indigo
} as const

// ─── Navigation ───────────────────────────────────────────────────────────────
export const NAV_ITEMS = [
  { label: 'Dashboard',    href: '/dashboard',          icon: 'LayoutDashboard', color: null },
  { label: 'WhereDidItGo', href: '/dashboard/items',    icon: 'Package',         color: MODULE_COLORS.items },
  { label: 'Repeat',       href: '/dashboard/routines', icon: 'RefreshCw',       color: MODULE_COLORS.routines },
  { label: 'LifeLog',      href: '/dashboard/logs',     icon: 'Activity',        color: MODULE_COLORS.logs },
  { label: 'LifeGuide AI', href: '/dashboard/ai-chat',  icon: 'MessageSquare',   color: MODULE_COLORS.ai },
  { label: 'Settings',     href: '/dashboard/settings', icon: 'Settings',        color: null },
] as const

// ─── API Endpoints ────────────────────────────────────────────────────────────
export const API = {
  items:    '/api/items',
  routines: '/api/routines',
  logs:     '/api/logs',
  aiChat:   '/api/ai/chat',
  profile:  '/api/profile',
} as const
