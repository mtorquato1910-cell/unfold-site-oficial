'use client'

import { useState } from 'react'

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

export function BrazilMap({ className = '' }: { className?: string }) {
  const [hovered, setHovered] = useState<string | null>(null)

  const { viewBox, locations } = mapData

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
              id={loc.id}
              d={loc.path}
              fill={isActive ? '#5EEAD4' : 'transparent'}
              fillOpacity={isActive ? (isHovered ? 1 : 0.82) : 0}
              stroke={isActive ? '#5EEAD4' : 'rgba(94,234,212,0.22)'}
              strokeWidth={isActive ? 0.6 : 0.8}
              strokeLinejoin="round"
              style={{
                cursor: isActive ? 'default' : 'default',
                animation: isActive
                  ? `ugs-state-glow ${4 + (delay % 2)}s ease-in-out ${delay}s infinite`
                  : 'none',
                transition: 'fill-opacity 0.2s ease, stroke-opacity 0.2s ease',
                strokeOpacity: isHovered && !isActive ? 0.45 : 1,
              }}
              onMouseEnter={() => setHovered(loc.id)}
              onMouseLeave={() => setHovered(null)}
            />
          )
        })}

        {/* State labels for active states */}
        {[
          { id: 'al', x: 528, y: 248 },
          { id: 'pe', x: 490, y: 230 },
          { id: 'ba', x: 440, y: 310 },
          { id: 'mg', x: 400, y: 400 },
          { id: 'sp', x: 330, y: 460 },
          { id: 'pr', x: 295, y: 510 },
          { id: 'sc', x: 285, y: 548 },
          { id: 'go', x: 330, y: 360 },
          { id: 'mt', x: 230, y: 320 },
          { id: 'ms', x: 260, y: 440 },
        ].map((lbl) => (
          <text
            key={lbl.id}
            x={lbl.x}
            y={lbl.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9"
            fontFamily="'IBM Plex Mono',monospace"
            fontWeight="700"
            fill="#051512"
            fillOpacity="0.85"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {lbl.id.toUpperCase()}
          </text>
        ))}
      </svg>
    </div>
  )
}
