'use client'

/**
 * Hook utilitário: anima um número alvo com easing exponencial.
 * Respeita `prefers-reduced-motion` (volta imediato).
 *
 * Compatível com SSR: começa no valor alvo se não houver `window`.
 */

import { useEffect, useRef, useState } from 'react'

interface Options {
  /** Duração da animação em ms. Default 280ms. */
  durationMs?: number
}

export function useAnimatedNumber(target: number, options: Options = {}): number {
  const { durationMs = 280 } = options
  const [value, setValue] = useState<number>(() =>
    typeof window === 'undefined' ? target : target,
  )
  const rafRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const startValueRef = useRef<number>(target)

  useEffect(() => {
    if (typeof window === 'undefined') {
      setValue(target)
      return
    }
    const prefersReduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setValue(target)
      return
    }
    startValueRef.current = value
    startTimeRef.current = null
    const tick = (ts: number) => {
      if (startTimeRef.current === null) startTimeRef.current = ts
      const elapsed = ts - startTimeRef.current
      const t = Math.min(1, elapsed / durationMs)
      // easeOutCubic — saída suave
      const eased = 1 - Math.pow(1 - t, 3)
      const next = startValueRef.current + (target - startValueRef.current) * eased
      setValue(next)
      if (t < 1) {
        rafRef.current = window.requestAnimationFrame(tick)
      } else {
        setValue(target)
        rafRef.current = null
      }
    }
    rafRef.current = window.requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs])

  return value
}
