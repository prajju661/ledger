'use client'

import { useState, useEffect } from 'react'

/**
 * Animates a number from 0 to target over duration ms.
 * Uses easeOutCubic for a satisfying deceleration.
 */
export function useCountUp(target: number, duration = 800): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (target === 0) { setCount(0); return }
    /* eslint-enable react-hooks/set-state-in-effect */

    let startTime = 0
    let rafId: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) {
        rafId = requestAnimationFrame(animate)
      }
    }

    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [target, duration])

  return count
}
