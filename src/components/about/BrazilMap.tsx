/*
  Brazil SVG Map — simplified geographic paths
  ViewBox: 0 0 500 560
  Projection: x = (lon + 73.9) × 11.09  |  y = (5.3 − lat) × 14.32
  Highlighted: AL, BA, MG, SC, SP, MT, MS, GO, PE, PR
*/

const HIGHLIGHTED = new Set(['AL', 'BA', 'MG', 'SC', 'SP', 'MT', 'MS', 'GO', 'PE', 'PR'])

const STATES: { id: string; d: string }[] = [
  // ── North ────────────────────────────────────────────────────────────────
  {
    id: 'RR',
    // lon -73.5→-59.5, lat 5.2→0.7 — NW corner, borders Venezuela/Guyana
    d: 'M4,1 L108,1 L160,54 L118,66 L4,47 Z',
  },
  {
    id: 'AP',
    // lon -54.5→-49.7, lat 4.5→0.8 — small NE coastal state
    d: 'M215,13 L268,13 L268,65 L215,65 Z',
  },
  {
    id: 'AM',
    // Huge W state — lon -73.5→-56, lat 2→-9.8
    d: 'M4,47 L155,47 L160,54 L165,90 L200,90 L200,220 L98,220 L4,176 Z',
  },
  {
    id: 'PA',
    // Large N state — lon -59→-46, lat 4.5→-8
    d: 'M160,54 L215,13 L268,65 L310,70 L310,192 L265,192 L200,176 L200,90 L165,90 Z',
  },
  {
    id: 'AC',
    // W state bordering Peru/Bolivia — lon -73.5→-66.5, lat -7→-11.5
    d: 'M4,176 L82,190 L82,262 L40,268 L4,233 Z',
  },
  {
    id: 'RO',
    // lon -66.5→-60, lat -7.8→-13.5
    d: 'M82,190 L155,190 L155,262 L82,262 Z',
  },
  {
    id: 'TO',
    // Central N-S state — lon -50→-46, lat -5→-13.5
    d: 'M265,148 L310,148 L310,262 L265,262 Z',
  },
  // ── Northeast ────────────────────────────────────────────────────────────
  {
    id: 'MA',
    // lon -48.5→-41, lat -1→-7.5
    d: 'M282,90 L310,90 L310,148 L330,148 L366,118 L366,183 L282,183 Z',
  },
  {
    id: 'PI',
    // lon -45.5→-40.3, lat -2.5→-10.9
    d: 'M366,118 L377,112 L377,232 L330,232 L330,148 L366,148 Z',
  },
  {
    id: 'CE',
    // lon -41→-37.3, lat -2.7→-7.9
    d: 'M366,112 L408,116 L408,190 L366,190 Z',
  },
  {
    id: 'RN',
    // Small — lon -38.5→-34.9, lat -4.8→-6.9
    d: 'M393,145 L434,145 L434,175 L408,190 L393,190 Z',
  },
  {
    id: 'PB',
    // Small — lon -38.8→-34.8, lat -6.8→-8.4
    d: 'M390,173 L434,173 L434,197 L390,197 Z',
  },
  {
    id: 'PE',
    // HIGHLIGHTED — lon -41→-34.8, lat -7.2→-9.5
    d: 'M366,179 L434,179 L434,212 L390,212 L366,212 Z',
  },
  {
    id: 'AL',
    // HIGHLIGHTED — Small — lon -38.2→-35, lat -8.8→-10.5
    d: 'M396,202 L432,202 L432,226 L396,226 Z',
  },
  {
    id: 'SE',
    // Tiny — lon -38.2→-36.4, lat -9.5→-11.6
    d: 'M396,212 L416,212 L416,242 L396,242 Z',
  },
  {
    id: 'BA',
    // HIGHLIGHTED — Large — lon -46.6→-37.3, lat -8.5→-18.4
    d: 'M303,198 L366,190 L406,235 L406,340 L303,340 Z',
  },
  // ── Center-West ──────────────────────────────────────────────────────────
  {
    id: 'MT',
    // HIGHLIGHTED — Large — lon -61→-50, lat -7.3→-18.1
    d: 'M144,176 L200,176 L200,220 L265,220 L265,336 L144,336 Z',
  },
  {
    id: 'GO',
    // HIGHLIGHTED — lon -53→-45, lat -12→-19.5
    d: 'M232,248 L310,248 L310,356 L232,356 Z',
  },
  {
    id: 'DF',
    // Tiny — lon -48.2→-47.3, lat -15.5→-16.1
    d: 'M282,298 L295,298 L295,306 L282,306 Z',
  },
  {
    id: 'MS',
    // HIGHLIGHTED — lon -61→-50.8, lat -17.2→-24.1
    d: 'M144,336 L256,336 L256,421 L144,421 Z',
  },
  // ── Southeast ────────────────────────────────────────────────────────────
  {
    id: 'MG',
    // HIGHLIGHTED — Large — lon -51.2→-39.8, lat -14→-22.9
    d: 'M252,277 L310,262 L378,277 L378,404 L252,404 Z',
  },
  {
    id: 'ES',
    // Small coastal — lon -41.5→-39.6, lat -17.8→-21.3
    d: 'M360,331 L380,331 L380,381 L360,381 Z',
  },
  {
    id: 'RJ',
    // Small coastal — lon -44.9→-40.9, lat -20.7→-23.4
    d: 'M322,372 L366,372 L366,411 L322,411 Z',
  },
  {
    id: 'SP',
    // HIGHLIGHTED — Large — lon -53.1→-44.1, lat -19.8→-25.3
    d: 'M231,359 L330,359 L330,438 L231,438 Z',
  },
  // ── South ────────────────────────────────────────────────────────────────
  {
    id: 'PR',
    // HIGHLIGHTED — lon -54.7→-48, lat -22.5→-26.7
    d: 'M212,398 L287,398 L287,458 L212,458 Z',
  },
  {
    id: 'SC',
    // HIGHLIGHTED — lon -54→-48.3, lat -25.9→-29.4
    d: 'M221,447 L284,447 L284,497 L221,497 Z',
  },
  {
    id: 'RS',
    // lon -57.6→-49.7, lat -27.1→-33.8
    d: 'M181,464 L268,464 L268,542 L220,560 L181,540 Z',
  },
]

export function BrazilMap({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 500 560"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Mapa do Brasil — estados de atuação da Unfold Growth destacados em verde"
    >
      <defs>
        {/* Glow for highlighted states */}
        <filter id="state-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Subtle shadow for all states */}
        <filter id="state-shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="rgba(0,0,0,0.3)" />
        </filter>
      </defs>

      {/* Render non-highlighted first (background layer) */}
      {STATES.filter((s) => !HIGHLIGHTED.has(s.id)).map((s) => (
        <path
          key={s.id}
          d={s.d}
          fill="rgba(255,255,255,0.05)"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="0.8"
          strokeLinejoin="round"
          filter="url(#state-shadow)"
        />
      ))}

      {/* Render highlighted on top */}
      {STATES.filter((s) => HIGHLIGHTED.has(s.id)).map((s) => (
        <path
          key={s.id}
          d={s.d}
          fill="#6DF9C6"
          fillOpacity="0.85"
          stroke="#6DF9C6"
          strokeWidth="0.6"
          strokeLinejoin="round"
          filter="url(#state-glow)"
        />
      ))}

      {/* State labels for highlighted states */}
      {[
        { id: 'AL', cx: 414, cy: 214 },
        { id: 'BA', cx: 355, cy: 265 },
        { id: 'MG', cx: 315, cy: 340 },
        { id: 'SC', cx: 253, cy: 472 },
        { id: 'SP', cx: 281, cy: 399 },
        { id: 'MT', cx: 205, cy: 256 },
        { id: 'MS', cx: 200, cy: 378 },
        { id: 'GO', cx: 271, cy: 302 },
        { id: 'PE', cx: 400, cy: 196 },
        { id: 'PR', cx: 250, cy: 428 },
      ].map((lbl) => (
        <text
          key={lbl.id}
          x={lbl.cx}
          y={lbl.cy}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="8"
          fontFamily="'IBM Plex Mono', monospace"
          fontWeight="600"
          fill="#001E29"
          opacity="0.8"
        >
          {lbl.id}
        </text>
      ))}
    </svg>
  )
}
