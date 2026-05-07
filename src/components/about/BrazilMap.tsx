'use client'

import { useEffect, useRef, useState } from 'react'

type Location = { id: string; name: string; path: string }
type BrazilMapData = { label: string; viewBox: string; locations: Location[] }

// eslint-disable-next-line @typescript-eslint/no-require-imports
const brazilData = require('@svg-maps/brazil') as { default?: BrazilMapData } & BrazilMapData
const mapData: BrazilMapData = brazilData.default ?? brazilData

const HIGHLIGHTED = new Set(['al', 'ba', 'mg', 'sc', 'sp', 'mt', 'ms', 'go', 'pe', 'pr'])

const STATE_NAMES: Record<string, string> = {
  al: 'Alagoas', ba: 'Bahia', mg: 'Minas Gerais', sc: 'Santa Catarina',
  sp: 'São Paulo', mt: 'Mato Grosso', ms: 'Mato Grosso do Sul',
  go: 'Goiás', pe: 'Pernambuco', pr: 'Paraná',
}

const ANIMATION_DELAYS: Record<string, number> = {
  al: 0, pe: 0.6, ba: 1.2, mg: 1.8,
  sp: 3.0, pr: 3.6, sc: 4.2, go: 4.8, mt: 5.4, ms: 6.0,
}

// Ajuste fino vertical/horizontal por estado (em unidades do viewBox).
// Útil quando o centro geométrico do bounding box cai em uma "ponta" do estado.
const LABEL_OFFSETS: Record<string, { dx?: number; dy?: number }> = {
  al: { dx: 6, dy: 0 },     // estado pequeno, leve deslocamento à direita
  sp: { dx: 0, dy: -2 },
  pr: { dx: 0, dy: 0 },
  // SC: bbox estende pro sul (centróide cai no RS); empurra label pra cima
  sc: { dx: 0, dy: -10 },
  ms: { dx: -4, dy: 0 },
}

export function BrazilMap({ className = '' }: { className?: string }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [centroids, setCentroids] = useState<Record<string, { x: number; y: number }>>({})
  const svgRef = useRef<SVGSVGElement | null>(null)

  const { viewBox, locations } = mapData

  // Calcula o centro do bounding box de cada estado destacado após o render
  useEffect(() => {
    if (!svgRef.current) return
    const next: Record<string, { x: number; y: number }> = {}
    HIGHLIGHTED.forEach((id) => {
      const el = svgRef.current?.querySelector<SVGPathElement>(`path[data-uf="${id}"]`)
      if (!el) return
      const bbox = el.getBBox()
      const offset = LABEL_OFFSETS[id] ?? {}
      next[id] = {
        x: bbox.x + bbox.width / 2 + (offset.dx ?? 0),
        y: bbox.y + bbox.height / 2 + (offset.dy ?? 0),
      }
    })
    setCentroids(next)
  }, [])

  return (
    <div className={`relative ${className}`}>
      <style>{`
        @keyframes ugs-state-glow {
          0%, 100% { filter: drop-shadow(0 0 6px rgba(94,234,212,0.55)); }
          50%       { filter: drop-shadow(0 0 14px rgba(94,234,212,0.9)); }
        }
      `}</style>

      {hovered && STATE_NAMES[hovered] && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(94,234,212,0.10)',
            border: '1px solid rgba(94,234,212,0.35)',
            borderRadius: '8px',
            padding: '6px 12px',
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: '11px',
            color: '#5EEAD4',
            letterSpacing: '0.08em',
            pointerEvents: 'none',
            zIndex: 10,
            whiteSpace: 'nowrap',
          }}
        >
          {STATE_NAMES[hovered]}
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={viewBox}
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: 'auto', display: 'block' }}
        aria-label="Mapa do Brasil — estados de atuação da Unfold Growth destacados em verde"
      >
        {locations.map((loc) => {
          const isActive = HIGHLIGHTED.has(loc.id)
          const isHovered = hovered === loc.id
          const delay = ANIMATION_DELAYS[loc.id] ?? 0

          return (
            <path
              key={loc.id}
              data-uf={loc.id}
              id={loc.id}
              d={loc.path}
              fill={isActive ? '#5EEAD4' : 'transparent'}
              fillOpacity={isActive ? (isHovered ? 1 : 0.82) : 0}
              stroke="#0a0a0a"
              strokeWidth={1}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={{
                cursor: 'default',
                animation: isActive
                  ? `ugs-state-glow ${4 + (delay % 2)}s ease-in-out ${delay}s infinite`
                  : 'none',
                transition: 'fill-opacity 0.2s ease',
              }}
              onMouseEnter={() => setHovered(loc.id)}
              onMouseLeave={() => setHovered(null)}
            />
          )
        })}

        {/* Labels UF — posicionadas no centróide calculado em runtime */}
        {Object.entries(centroids).map(([id, { x, y }]) => (
          <text
            key={id}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fontFamily="'IBM Plex Mono',monospace"
            fontWeight="700"
            fill="#051512"
            fillOpacity="0.95"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {id.toUpperCase()}
          </text>
        ))}
      </svg>
    </div>
  )
}
