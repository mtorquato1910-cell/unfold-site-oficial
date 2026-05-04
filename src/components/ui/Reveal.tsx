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
  threshold = 0.15,
  as: Tag = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    el.style.transitionDelay = `${delay}ms`

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed')
          observer.unobserve(el)
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay, threshold])

  return (
    <Tag ref={ref} className={`reveal-hidden ${className}`}>
      {children}
    </Tag>
  )
}
