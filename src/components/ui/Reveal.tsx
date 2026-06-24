'use client'

import { useEffect, useRef, type ReactNode, type ElementType } from 'react'

interface RevealProps {
  children: ReactNode
  delay?: number
  className?: string
  threshold?: number
  as?: ElementType
}

export function Reveal({
  children,
  delay = 0,
  className = '',
  threshold = 0.08,
  as: Tag = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reveal = () => el.classList.add('revealed')

    // Fallback de segurança: em navegadores sem IntersectionObserver (ou se ele
    // falhar), nunca deixe o conteúdo preso invisível — revela direto.
    if (typeof IntersectionObserver === 'undefined') {
      reveal()
      return
    }

    el.style.transitionDelay = `${delay}ms`

    // Check if element is already visible on mount (above the fold)
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      // Small delay so the browser has painted before animating
      const timer = setTimeout(reveal, 80)
      return () => clearTimeout(timer)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal()
          observer.unobserve(el)
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(el)

    // Rede de segurança: se por qualquer motivo o observer não disparar
    // (algumas WebViews mobile), garante o reveal após 1.2s.
    const safety = setTimeout(reveal, 1200)

    return () => {
      observer.disconnect()
      clearTimeout(safety)
    }
  }, [delay, threshold])

  return (
    <Tag ref={ref} className={`reveal-hidden ${className}`}>
      {children}
    </Tag>
  )
}
