'use client'

import { useEffect } from 'react'

/**
 * Aplica count-up nos números-herói do conteúdo migrado (.stat-num /
 * .stat-destaque-num) ao entrarem na viewport. O valor final volta ao DOM ao
 * término (preserva texto para SEO/leitores). Respeita prefers-reduced-motion.
 */
interface Parsed {
  prefix: string
  num: number
  decimals: number
  suffix: string
}

function parse(value: string): Parsed | null {
  const m = value.match(/^(\D*?)(\d[\d.,]*)(.*)$/)
  if (!m) return null
  const normalized = m[2].replace(/\./g, '').replace(',', '.')
  const num = parseFloat(normalized)
  if (Number.isNaN(num)) return null
  const decimals = normalized.includes('.') ? normalized.split('.')[1].length : 0
  return { prefix: m[1], num, decimals, suffix: m[3] }
}

function fmt(n: number, decimals: number): string {
  return n.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function StatEnhancer() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const nodes = document.querySelectorAll<HTMLElement>(
      '.guia-prose .stat-num, .guia-prose .stat-destaque-num',
    )
    const observers: IntersectionObserver[] = []

    nodes.forEach((node) => {
      const raw = (node.textContent || '').trim()
      const p = parse(raw)
      if (!p) return

      const io = new IntersectionObserver(
        (entries) => {
          if (!entries[0]?.isIntersecting) return
          io.disconnect()
          const start = performance.now()
          const dur = 1400
          const step = (now: number) => {
            const t = Math.min(1, (now - start) / dur)
            const eased = 1 - Math.pow(1 - t, 3)
            node.textContent = p.prefix + fmt(p.num * eased, p.decimals) + p.suffix
            if (t < 1) requestAnimationFrame(step)
            else node.textContent = raw
          }
          requestAnimationFrame(step)
        },
        { threshold: 0.6 },
      )
      io.observe(node)
      observers.push(io)
    })

    return () => observers.forEach((io) => io.disconnect())
  }, [])

  return null
}
