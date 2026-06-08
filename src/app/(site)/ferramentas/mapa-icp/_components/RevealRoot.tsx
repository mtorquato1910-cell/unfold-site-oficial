'use client'

import { useEffect, useRef, type ReactNode } from 'react'

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
  }
}

interface RevealRootProps {
  /** Classe (hash do CSS Module) aplicada quando o elemento entra na viewport. */
  revealInClass: string
  children: ReactNode
}

function push(event: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(event)
}

/**
 * Client wrapper que:
 *  - revela elementos [data-reveal] via IntersectionObserver (respeita prefers-reduced-motion),
 *  - emite lp_view no mount,
 *  - emite scroll_50 / scroll_90 (uma vez cada) conforme profundidade de scroll.
 */
export default function RevealRoot({ revealInClass, children }: RevealRootProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    push({ event: 'lp_view', page: 'mapa-icp' })

    const root = ref.current
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    // Reveal-on-scroll
    let io: IntersectionObserver | null = null
    if (root) {
      const targets = Array.from(
        root.querySelectorAll<HTMLElement>('[data-reveal]')
      )
      if (reduceMotion) {
        targets.forEach((el) => el.classList.add(revealInClass))
      } else {
        io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add(revealInClass)
                io?.unobserve(entry.target)
              }
            })
          },
          { threshold: 0.16 }
        )
        targets.forEach((el) => io?.observe(el))
      }
    }

    // Scroll depth
    const fired = { 50: false, 90: false }
    const onScroll = () => {
      const doc = document.documentElement
      const scrollable = doc.scrollHeight - window.innerHeight
      if (scrollable <= 0) return
      const pct = (window.scrollY / scrollable) * 100
      if (!fired[50] && pct >= 50) {
        fired[50] = true
        push({ event: 'scroll_50', page: 'mapa-icp' })
      }
      if (!fired[90] && pct >= 90) {
        fired[90] = true
        push({ event: 'scroll_90', page: 'mapa-icp' })
        window.removeEventListener('scroll', onScroll)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      io?.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [revealInClass])

  return <div ref={ref}>{children}</div>
}
