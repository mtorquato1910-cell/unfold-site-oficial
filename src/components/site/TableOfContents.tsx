'use client'

import { useEffect, useState } from 'react'
import type { TocItem } from '@/lib/article-toc'

/**
 * Índice de navegação do artigo (estilo "Navegue pelo índice").
 *
 * - Lista os títulos (h2/h3) do post como âncoras.
 * - Destaca a seção atual via IntersectionObserver (scroll-spy).
 * - Barra de progresso de leitura no topo.
 * - Scroll suave ao clicar (o offset do header fixo vem do `scroll-mt` aplicado
 *   aos títulos no tema de tipografia).
 */
export default function TableOfContents({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? '')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter(Boolean) as HTMLElement[]
    if (!headings.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length) {
          const top = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
          )
          setActive(top.target.id)
        }
      },
      { rootMargin: '-110px 0px -65% 0px', threshold: [0, 1] },
    )
    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [items])

  useEffect(() => {
    function onScroll() {
      const doc = document.documentElement
      const max = doc.scrollHeight - doc.clientHeight
      setProgress(max > 0 ? Math.min(100, Math.max(0, (doc.scrollTop / max) * 100)) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleClick(e: React.MouseEvent, id: string) {
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActive(id)
    history.replaceState(null, '', `#${id}`)
  }

  if (items.length < 2) return null

  return (
    <nav aria-label="Índice do artigo" className="text-sm">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40 mb-3">
        Navegue pelo índice
      </p>

      {/* Barra de progresso de leitura */}
      <div className="h-1 w-full rounded-full bg-border/60 overflow-hidden mb-5">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ul className="space-y-1 border-l border-border">
        {items.map((it) => {
          const isActive = active === it.id
          return (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                onClick={(e) => handleClick(e, it.id)}
                className={[
                  'block -ml-px border-l-2 py-1.5 transition-colors leading-snug',
                  it.level === 3 ? 'pl-6 text-[13px]' : 'pl-4',
                  isActive
                    ? 'border-primary text-primary font-medium'
                    : 'border-transparent text-foreground/55 hover:text-foreground/90',
                ].join(' ')}
              >
                {it.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
