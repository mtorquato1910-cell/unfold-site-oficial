'use client'

import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, useRef, type ReactNode } from 'react'
import { Orb } from './Orb'

export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`font-mono-tag ${className}`} style={{ color: 'var(--mint-deep)' }}>
      {children}
    </div>
  )
}

export function CountUp({
  to,
  suffix = '',
  duration = 1.4,
  decimals = 0,
}: {
  to: number
  suffix?: string
  duration?: number
  decimals?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const mv = useMotionValue(0)
  const rounded = useTransform(mv, (v) => v.toFixed(decimals))
  useEffect(() => {
    if (inView) {
      const controls = animate(mv, to, { duration, ease: [0.16, 1, 0.3, 1] })
      const unsub = rounded.on('change', (v) => {
        if (ref.current) ref.current.textContent = v + suffix
      })
      return () => {
        controls.stop()
        unsub()
      }
    }
  }, [inView, to, duration, suffix, mv, rounded])
  return (
    <span ref={ref} className="tabular">
      0{suffix}
    </span>
  )
}

export function StatCounter({
  value,
  label,
  source,
  suffix = '',
  staticValue,
}: {
  value?: number
  label: string
  source?: string
  suffix?: string
  staticValue?: string
}) {
  return (
    <Reveal className="relative pl-5 border-l hairline">
      <div
        className="font-display font-bold leading-none"
        style={{ fontSize: 'clamp(2.75rem, 6vw, 4.5rem)', color: 'var(--ink)' }}
      >
        {staticValue ?? <CountUp to={value ?? 0} suffix={suffix} />}
      </div>
      <div className="mt-3 max-w-xs" style={{ color: 'var(--ink-body)' }}>
        {label}
      </div>
      {source && <div className="font-mono-tag mt-3">{source}</div>}
    </Reveal>
  )
}

export function PullQuote({
  children,
  attribution,
}: {
  children: ReactNode
  attribution?: string
}) {
  return (
    <Reveal>
      <blockquote className="relative pl-6 md:pl-8 border-l-4" style={{ borderColor: 'var(--mint)' }}>
        <p
          className="font-serif italic"
          style={{ fontSize: 'clamp(1.5rem, 2.6vw, 2.25rem)', lineHeight: 1.25, color: 'var(--ink)' }}
        >
          &ldquo;{children}&rdquo;
        </p>
        {attribution && <div className="font-mono-tag mt-4">— {attribution}</div>}
      </blockquote>
    </Reveal>
  )
}

const ALLOWED_BANDS = new Set(['var(--paper)', 'var(--paper-band)', 'var(--mint-wash)'])
export function ChapterCover({
  num,
  eyebrow,
  title,
  intro,
  band,
}: {
  num: string
  eyebrow: string
  title: string
  intro?: string
  band?: string
}) {
  const bg = band && ALLOWED_BANDS.has(band) ? band : 'var(--paper-band)'
  return (
    <section className="relative overflow-hidden" style={{ background: bg }}>
      <Orb className="absolute -right-32 -top-20 w-[640px] opacity-[0.05] pointer-events-none select-none" />
      <div className="container-edit py-24 md:py-32 relative">
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
        <div className="grid md:grid-cols-[auto_1fr] gap-8 md:gap-16 items-start mt-6">
          <Reveal delay={0.1}>
            <div
              className="font-serif font-medium leading-[0.85]"
              style={{ fontSize: 'clamp(5.5rem, 14vw, 11rem)', color: 'var(--ink)', letterSpacing: '-0.04em' }}
            >
              {num}
            </div>
          </Reveal>
          <Reveal delay={0.2} className="md:pt-6">
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.85rem, 4vw, 3.25rem)', lineHeight: 1.08, color: 'var(--ink)' }}>
              {title}
            </h2>
            {intro && (
              <p className="mt-8 max-w-2xl text-lg" style={{ color: 'var(--ink-body)' }}>
                {intro}
              </p>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export function Section({
  children,
  band,
  id,
  className = '',
}: {
  children: ReactNode
  band?: 'paper' | 'band' | 'mint' | 'dark'
  id?: string
  className?: string
}) {
  const bg =
    band === 'band'
      ? 'var(--paper-band)'
      : band === 'mint'
        ? 'var(--mint-wash)'
        : band === 'dark'
          ? 'var(--feature-bg)'
          : 'var(--paper)'
  const color = band === 'dark' ? 'var(--paper)' : 'var(--ink-body)'
  return (
    <section id={id} className={className} style={{ background: bg, color }}>
      <div className="container-edit py-20 md:py-28">{children}</div>
    </section>
  )
}

export function SectionTitle({
  eyebrow,
  title,
  lede,
  dark = false,
}: {
  eyebrow?: string
  title: string
  lede?: string
  dark?: boolean
}) {
  return (
    <div className="max-w-3xl mb-12 md:mb-16">
      {eyebrow && (
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
      )}
      <Reveal delay={0.1}>
        <h3 className="mt-3 font-serif" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.08, color: dark ? 'var(--paper)' : 'var(--ink)' }}>
          {title}
        </h3>
      </Reveal>
      {lede && (
        <Reveal delay={0.2}>
          <p className="mt-6 text-lg" style={{ color: dark ? 'rgba(246,244,237,0.78)' : 'var(--ink-body)' }}>
            {lede}
          </p>
        </Reveal>
      )}
    </div>
  )
}
