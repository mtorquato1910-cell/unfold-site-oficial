'use client'

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react'

/**
 * Wrapper de scroll reveal. Aplica `data-inview` quando entra na viewport
 * (uma vez), e o CSS (`.r-reveal`) cuida da transição. Respeita
 * prefers-reduced-motion via a media query do redesign-dark.css.
 */
export function Reveal({
  children,
  as: Tag = 'div',
  stagger = false,
  className = '',
  style,
}: {
  children: ReactNode
  as?: ElementType
  stagger?: boolean
  className?: string
  style?: CSSProperties
}) {
  const ref = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || inView) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { rootMargin: '-12% 0px', threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [inView])

  return (
    <Tag
      ref={ref}
      className={`r-reveal ${className}`}
      data-inview={inView ? 'true' : 'false'}
      style={style}
      {...(stagger ? { 'data-stagger': '' } : {})}
    >
      {children}
    </Tag>
  )
}
