import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import {
  format,
  isToday,
  isYesterday,
  formatDistanceToNow,
  addDays,
  addWeeks,
  addMonths,
} from 'date-fns'

/**
 * Merges Tailwind classes safely, resolving conflicts.
 * Use this everywhere instead of raw template literals for class names.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date as a smart relative string.
 * Today → "Today at 2:30 PM"
 * Yesterday → "Yesterday at 9:00 AM"
 * Older → "Jan 14, 2025"
 */
export function formatRelativeDate(date: string | Date): string {
  const d = new Date(date)
  if (isToday(d)) return `Today at ${format(d, 'h:mm a')}`
  if (isYesterday(d)) return `Yesterday at ${format(d, 'h:mm a')}`
  return format(d, 'MMM d, yyyy')
}

/**
 * Returns a human-readable "time ago" string.
 * e.g. "2 hours ago", "3 days ago"
 */
export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

/**
 * Returns a time-appropriate greeting for the user.
 */
export function getGreeting(name: string): string {
  const h = new Date().getHours()
  if (h < 12) return `Good morning, ${name} 👋`
  if (h < 18) return `Good afternoon, ${name} 👋`
  return `Good evening, ${name} 👋`
}

/**
 * Calculates the next due date for a routine based on its frequency config.
 */
export function calculateNextDue(
  frequency: string,
  interval: number = 1,
  unit: string = 'days'
): Date {
  const today = new Date()
  if (frequency === 'daily') return addDays(today, 1)
  if (frequency === 'weekly') return addWeeks(today, interval)
  if (frequency === 'monthly') return addMonths(today, interval)
  if (frequency === 'custom') {
    if (unit === 'days') return addDays(today, interval)
    if (unit === 'weeks') return addWeeks(today, interval)
    if (unit === 'months') return addMonths(today, interval)
  }
  return today
}

/**
 * Truncates a string to a max length, adding ellipsis if needed.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength).trimEnd() + '…'
}

/**
 * Returns initials from a full name (max 2 chars).
 * "John Doe" → "JD", "Alice" → "A"
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('')
}

/**
 * Formats a number with compact notation.
 * 1200 → "1.2K", 1000000 → "1M"
 */
export function formatCompact(num: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact' }).format(num)
}
