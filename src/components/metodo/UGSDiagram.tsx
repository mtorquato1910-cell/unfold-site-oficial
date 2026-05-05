'use client'

const PILLARS = [
  { n: '01', title: 'Diagnosticar', sub: 'Enxergue antes de agir.' },
  { n: '02', title: 'Estruturar', sub: 'Construa o sistema.' },
  { n: '03', title: 'Operar', sub: 'Execute com método e dados.' },
  { n: '04', title: 'Evoluir', sub: 'Aprenda, escale, repita.' },
]

function PilarCard({ n, title, sub }: { n: string; title: string; sub: string }) {
  return (
    <div
      style={{
        background: 'rgba(94,234,212,0.04)',
        border: '1px solid rgba(94,234,212,0.25)',
        borderLeft: '4px solid #5EEAD4',
        borderRadius: '12px',
        padding: '16px 18px 16px 20px',
        boxSizing: 'border-box',
      }}
    >
      <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '11px', color: '#5EEAD4', marginBottom: '6px', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px 0' }}>{n}.</p>
      <p style={{ fontSize: '18px', fontWeight: 600, color: '#F1F5F9', margin: '0 0 4px 0', lineHeight: 1.3 }}>{title}</p>
      <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>{sub}</p>
    </div>
  )
}

function NucleusUGS() {
  return (
    <div
      style={{
        width: '140px',
        height: '140px',
        borderRadius: '50%',
        border: '1.5px solid #5EEAD4',
        background: 'radial-gradient(circle, rgba(94,234,212,0.08) 0%, transparent 70%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'ugs-nucleus-pulse 4s ease-in-out infinite',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: '28px', fontWeight: 700, color: '#5EEAD4', lineHeight: 1 }}>UGS</span>
      <span style={{ fontSize: '9px', color: '#5EEAD4', opacity: 0.6, letterSpacing: '2px', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono',monospace", marginTop: '4px' }}>SISTEMA</span>
    </div>
  )
}

export function UGSDiagram() {
  return (
    <>
      <style>{`
        @keyframes ugs-nucleus-pulse {
          0%, 100% { box-shadow: 0 0 12px rgba(94,234,212,0.35); }
          50%       { box-shadow: 0 0 28px rgba(94,234,212,0.65); transform: scale(1.03); }
        }
      `}</style>

      {/* ── DESKTOP (lg+): Diamond SVG ── */}
      <div className="hidden lg:block w-full">
        <svg
          viewBox="0 0 700 520"
          width="100%"
          style={{ display: 'block', overflow: 'visible' }}
          aria-label="Diagrama UGS — ciclo de 4 pilares"
        >
          <defs>
            <radialGradient id="ugs-nbg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#5EEAD4" stopOpacity="0.09"/>
              <stop offset="100%" stopColor="#5EEAD4" stopOpacity="0"/>
            </radialGradient>
            <filter id="ugs-dot-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <marker id="ugs-arr" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0 0.5 L6 3.5 L0 6.5 Z" fill="rgba(94,234,212,0.55)"/>
            </marker>
          </defs>

          {/* ── Connecting arrows (drawn first, behind cards) ── */}
          {/* D (right) → E (top): from (470,75) to (590,215) */}
          <path d="M 470,75 Q 590,75 590,215" stroke="rgba(94,234,212,0.35)" strokeWidth="1.2" strokeDasharray="6 8" fill="none" markerEnd="url(#ugs-arr)"/>
          {/* E (bottom) → O (right): from (590,305) to (470,445) */}
          <path d="M 590,305 Q 590,445 470,445" stroke="rgba(94,234,212,0.35)" strokeWidth="1.2" strokeDasharray="6 8" fill="none" markerEnd="url(#ugs-arr)"/>
          {/* O (left) → Ev (bottom): from (230,445) to (110,305) */}
          <path d="M 230,445 Q 110,445 110,305" stroke="rgba(94,234,212,0.35)" strokeWidth="1.2" strokeDasharray="6 8" fill="none" markerEnd="url(#ugs-arr)"/>
          {/* Ev (top) → D (left): from (110,215) to (230,75) */}
          <path d="M 110,215 Q 110,75 230,75" stroke="rgba(94,234,212,0.35)" strokeWidth="1.2" strokeDasharray="6 8" fill="none" markerEnd="url(#ugs-arr)"/>

          {/* ── Animation path (invisible reference) ── */}
          <path
            id="ugs-cycle"
            d="M 470,75 Q 590,75 590,215 L 590,305 Q 590,445 470,445 L 230,445 Q 110,445 110,305 L 110,215 Q 110,75 230,75 L 470,75"
            fill="none"
            stroke="none"
          />

          {/* ── Animated pulse dot (drawn before cards → cards occlude when crossing) ── */}
          <circle r="4" fill="#5EEAD4" filter="url(#ugs-dot-glow)">
            <animateMotion dur="12s" repeatCount="indefinite">
              <mpath href="#ugs-cycle"/>
            </animateMotion>
          </circle>

          {/* ── Card: 01 Diagnosticar (top center) ── */}
          <rect x="230" y="30" width="240" height="90" rx="12" fill="rgba(94,234,212,0.04)" stroke="rgba(94,234,212,0.25)" strokeWidth="1"/>
          <rect x="230" y="34" width="4" height="82" rx="2" fill="#5EEAD4"/>
          <text x="248" y="55"  fontSize="11" fontFamily="'IBM Plex Mono',monospace" fill="#5EEAD4" letterSpacing="1">01.</text>
          <text x="248" y="75"  fontSize="19" fontWeight="600" fill="#F1F5F9">Diagnosticar</text>
          <text x="248" y="96"  fontSize="13" fill="#94A3B8">Enxergue antes de agir.</text>

          {/* ── Card: 02 Estruturar (right center) ── */}
          <rect x="492" y="215" width="200" height="90" rx="12" fill="rgba(94,234,212,0.04)" stroke="rgba(94,234,212,0.25)" strokeWidth="1"/>
          <rect x="492" y="219" width="4" height="82" rx="2" fill="#5EEAD4"/>
          <text x="510" y="240" fontSize="11" fontFamily="'IBM Plex Mono',monospace" fill="#5EEAD4" letterSpacing="1">02.</text>
          <text x="510" y="260" fontSize="19" fontWeight="600" fill="#F1F5F9">Estruturar</text>
          <text x="510" y="280" fontSize="13" fill="#94A3B8">Construa o sistema.</text>

          {/* ── Card: 03 Operar (bottom center) ── */}
          <rect x="230" y="400" width="240" height="90" rx="12" fill="rgba(94,234,212,0.04)" stroke="rgba(94,234,212,0.25)" strokeWidth="1"/>
          <rect x="230" y="404" width="4" height="82" rx="2" fill="#5EEAD4"/>
          <text x="248" y="425" fontSize="11" fontFamily="'IBM Plex Mono',monospace" fill="#5EEAD4" letterSpacing="1">03.</text>
          <text x="248" y="445" fontSize="19" fontWeight="600" fill="#F1F5F9">Operar</text>
          <text x="248" y="466" fontSize="13" fill="#94A3B8">Execute com método e dados.</text>

          {/* ── Card: 04 Evoluir (left center) ── */}
          <rect x="8" y="215" width="200" height="90" rx="12" fill="rgba(94,234,212,0.04)" stroke="rgba(94,234,212,0.25)" strokeWidth="1"/>
          <rect x="8" y="219" width="4" height="82" rx="2" fill="#5EEAD4"/>
          <text x="26"  y="240" fontSize="11" fontFamily="'IBM Plex Mono',monospace" fill="#5EEAD4" letterSpacing="1">04.</text>
          <text x="26"  y="260" fontSize="19" fontWeight="600" fill="#F1F5F9">Evoluir</text>
          <text x="26"  y="280" fontSize="13" fill="#94A3B8">Aprenda, escale, repita.</text>

          {/* ── Nucleus UGS (last → always on top) ── */}
          <circle cx="350" cy="260" r="70" fill="url(#ugs-nbg)" stroke="#5EEAD4" strokeWidth="1.5">
            <animate attributeName="r"             values="70;72;70"     dur="4s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
            <animate attributeName="stroke-opacity" values="0.7;1;0.7"   dur="4s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
          </circle>
          <text x="350" y="252" textAnchor="middle" fontSize="30" fontWeight="700" fill="#5EEAD4">UGS</text>
          <text x="350" y="273" textAnchor="middle" fontSize="10"  fill="#5EEAD4" fillOpacity="0.6" fontFamily="'IBM Plex Mono',monospace" letterSpacing="2">SISTEMA</text>
        </svg>
      </div>

      {/* ── TABLET (md–lg): 2×2 grid + nucleus ── */}
      <div className="hidden md:flex lg:hidden flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          {PILLARS.map((p) => <PilarCard key={p.n} {...p} />)}
        </div>
        <div className="flex justify-center pt-2">
          <NucleusUGS />
        </div>
      </div>

      {/* ── MOBILE (<md): vertical list with cycle indicator ── */}
      <div className="md:hidden flex flex-col gap-3">
        {PILLARS.map((p, i) => (
          <div key={p.n}>
            <PilarCard {...p} />
            {i < 3 && (
              <div className="flex justify-center py-1">
                <svg width="20" height="28" viewBox="0 0 20 28">
                  <line x1="10" y1="0" x2="10" y2="20" stroke="rgba(94,234,212,0.35)" strokeWidth="1.2" strokeDasharray="4 4"/>
                  <path d="M5 17 L10 24 L15 17" stroke="rgba(94,234,212,0.45)" strokeWidth="1.2" fill="none"/>
                </svg>
              </div>
            )}
          </div>
        ))}
        <div className="flex items-center gap-3 mt-1">
          <div className="h-px flex-1" style={{ borderTop: '1px dashed rgba(94,234,212,0.2)' }}/>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '9px', color: '#5EEAD4', opacity: 0.5, letterSpacing: '2px', textTransform: 'uppercase' }}>ciclo</span>
          <div className="h-px flex-1" style={{ borderTop: '1px dashed rgba(94,234,212,0.2)' }}/>
        </div>
      </div>
    </>
  )
}
