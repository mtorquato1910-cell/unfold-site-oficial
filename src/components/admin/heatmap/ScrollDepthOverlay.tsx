'use client'

/**
 * Overlay do modo ROLAGEM: heat vertical por profundidade (quantas sessões
 * chegaram a cada faixa) + a "linha da dobra" — a profundidade em que metade
 * das sessões parou de rolar. Estilo Clarity: quente no topo (todos veem),
 * frio embaixo (poucos veem).
 */

import type { ScrollBucket } from './useHeatmapData'

interface Props {
  buckets: ScrollBucket[]
  renderHeight: number
  opacity: number
  visible: boolean
}

function bandColor(fraction: number): string {
  if (fraction >= 0.8) return 'rgba(239, 68, 68, 0.42)' // vermelho
  if (fraction >= 0.6) return 'rgba(251, 146, 60, 0.42)' // laranja
  if (fraction >= 0.4) return 'rgba(253, 224, 71, 0.42)' // amarelo
  if (fraction >= 0.2) return 'rgba(74, 222, 128, 0.40)' // verde
  return 'rgba(43, 92, 230, 0.38)' // azul
}

export default function ScrollDepthOverlay({ buckets, renderHeight, opacity, visible }: Props) {
  if (buckets.length === 0) return null
  const maxSessions = Math.max(1, ...buckets.map((b) => b.sessions))

  // Dobra: primeira faixa onde a fração cai abaixo de 50%.
  let foldPct: number | null = null
  let foldFraction = 0
  for (const b of buckets) {
    const f = b.sessions / maxSessions
    if (f < 0.5) {
      foldPct = b.depth_pct
      foldFraction = f
      break
    }
  }
  // Fallback (páginas curtas onde todos rolam além de 50%): usa a maior queda
  // de retenção entre faixas consecutivas — onde a maioria para de descer.
  if (foldPct === null && buckets.length > 1) {
    let maxDrop = 0
    for (let i = 1; i < buckets.length; i++) {
      const drop = buckets[i - 1].sessions - buckets[i].sessions
      if (drop > maxDrop) {
        maxDrop = drop
        foldPct = buckets[i].depth_pct
        foldFraction = buckets[i].sessions / maxSessions
      }
    }
  }

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        pointerEvents: 'none',
        opacity: visible ? opacity : 0,
        transition: 'opacity 150ms ease',
      }}
    >
      {buckets.map((b, i) => {
        const next = buckets[i + 1]?.depth_pct ?? 100
        const top = (b.depth_pct / 100) * renderHeight
        const height = ((next - b.depth_pct) / 100) * renderHeight
        const fraction = b.sessions / maxSessions
        return (
          <div
            key={b.depth_pct}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top,
              height,
              background: bandColor(fraction),
            }}
          />
        )
      })}

      {foldPct !== null && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: (foldPct / 100) * renderHeight }}>
          <div style={{ height: 0, borderTop: '2px dashed rgba(255,255,255,0.9)' }} />
          <div
            style={{
              display: 'inline-block',
              margin: '4px 0 0 8px',
              padding: '2px 8px',
              borderRadius: 6,
              background: 'rgba(4, 20, 26, 0.9)',
              color: '#fff',
              fontSize: 11,
              fontFamily: 'var(--font-mono-label, monospace)',
            }}
          >
            Dobra · {Math.round(foldFraction * 100)}% das sessões viram até aqui (~{foldPct}% da página)
          </div>
        </div>
      )}
    </div>
  )
}
