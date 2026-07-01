'use client'

import { useState, useEffect } from 'react'

/**
 * Returns true when the given media query matches.
 * Uses window.matchMedia with a change listener for live updates.
 * SSR-safe: returns false on the server.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    // Initialise from the media query on mount (client only)
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}
