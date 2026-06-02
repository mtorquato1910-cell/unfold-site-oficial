'use client'

import { useEffect, useRef } from 'react'
import { animate, useReducedMotion } from 'framer-motion'

/**
 * Número-herói com count-up ao entrar na viewport.
 *
 * - Parsing tolerante a sufixos/prefixos: '89%', '144M', '9h13', '2x', 'R$ 50'.
 * - O VALOR FINAL fica sempre no DOM (sr-only) para SEO e leitores de tela.
 * - prefers-reduced-motion → mostra o valor final sem animar.
 */
interface Parsed {
  prefix: string
  num: number
  decimals: number
  suffix: string
}

function parseStat(value: string): Parsed | null {
  const m = value.match(/^(\D*?)(\d[\d.,]*)(.*)$/)
  if (!m) return null
  const raw = m[2]
  const normalized = raw.replace(/\./g, '').replace(',', '.')
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

export function StatCounter({ value, className = '' }: { value: string; className?: string }) {
  const numRef = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()
  const parsed = parseStat(value)

  useEffect(() => {
    const node = numRef.current
    if (!node || !parsed) return

    // Sem parsing numérico ou movimento reduzido → mostra valor final direto.
    if (reduced) {
      node.textContent = fmt(parsed.num, parsed.decimals)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        io.disconnect()
        const controls = animate(0, parsed.num, {
          duration: 1.4,
          ease: [0.16, 1, 0.3, 1],
          onUpdate: (v) => {
            node.textContent = fmt(v, parsed.decimals)
          },
        })
        cleanup = () => controls.stop()
      },
      { threshold: 0.6 },
    )
    let cleanup = () => {}
    io.observe(node)
    return () => {
      io.disconnect()
      cleanup()
    }
  }, [parsed, reduced])

  // Fallback (valor não-numérico): renderiza como texto puro.
  if (!parsed) {
    return <span className={`r-stat-num ${className}`}>{value}</span>
  }

  return (
    <span className={`r-stat-num ${className}`} aria-label={value}>
      <span aria-hidden="true">
        {parsed.prefix}
        <span ref={numRef}>{fmt(parsed.num, parsed.decimals)}</span>
        {parsed.suffix}
      </span>
      <span className="sr-only">{value}</span>
    </span>
  )
}
