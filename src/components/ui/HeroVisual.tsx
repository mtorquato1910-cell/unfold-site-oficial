'use client'

/*
  HeroVisual — Wireframe-globe hero decorations for inner pages.
  All variants share the same WireframeGlobe base (matching the unfoldgrowth.com.br/sobre
  reference): true 3D-feeling sphere with rotating meridians, parallels, glowing points
  and per-page contextual node overlays.

  Exports: MetodoHeroVisual, AtuacaoHeroVisual, CasesHeroVisual, FerramentasHeroVisual,
           SobreHeroVisual, BlogHeroVisual
*/

import React from 'react'

const CSS = `
@keyframes hv-spin       { from{transform:rotate(0deg)}   to{transform:rotate(360deg)} }
@keyframes hv-spin-rev   { from{transform:rotate(0deg)}   to{transform:rotate(-360deg)} }
@keyframes hv-pulse      { 0%,100%{opacity:.55;transform:scale(.94)} 50%{opacity:.15;transform:scale(1.06)} }
@keyframes hv-float      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes hv-float-alt  { 0%,100%{transform:translateY(0) rotate(0)} 40%{transform:translateY(-8px) rotate(.6deg)} 70%{transform:translateY(4px) rotate(-.4deg)} }
@keyframes hv-fade-in    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
@keyframes hv-glow       { 0%,100%{opacity:.55} 50%{opacity:1} }
@keyframes hv-ripple     { 0%{transform:scale(.6);opacity:.7} 100%{transform:scale(2.4);opacity:0} }
@keyframes hv-line-draw  { from{stroke-dashoffset:600} to{stroke-dashoffset:0} }
@media (prefers-reduced-motion:reduce){
  [style*="hv-"]{animation:none!important}
  .hv-anim{animation:none!important}
}
`

/* ── Wireframe Globe base ──────────────────────────────────────────────
   A proper rotating wireframe sphere built from:
   - Outer circle (silhouette)
   - 5 latitude ellipses (parallels) with depth fade
   - 7 longitude ellipses (meridians) tilted at different angles
   - Soft radial glow halo
   - Slow rotation on the longitude group (gives the globe its life)
─────────────────────────────────────────────────────────────────────── */
function WireframeGlobe({
  size = 460,
  color1 = '#6DF9C6',
  color2 = '#93BAFB',
  spin = 60, // seconds for full rotation
  children,
  className = '',
}: {
  size?: number
  color1?: string
  color2?: string
  spin?: number
  children?: React.ReactNode
  className?: string
}) {
  const c = size / 2
  const r = size * 0.42
  const id = React.useId().replace(/:/g, '')

  // Latitude (parallels) — fixed horizontal ellipses representing slices
  const parallels = [-0.85, -0.55, -0.25, 0, 0.25, 0.55, 0.85]
  // Longitude (meridians) — tilted vertical ellipses, rotated around center
  const meridians = [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5]

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: '100%', height: '100%', overflow: 'visible' }}
    >
      <defs>
        <radialGradient id={`halo-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={color1} stopOpacity="0.13" />
          <stop offset="55%"  stopColor={color1} stopOpacity="0.04" />
          <stop offset="100%" stopColor={color1} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`halo2-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={color2} stopOpacity="0.06" />
          <stop offset="100%" stopColor={color2} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`sphere-${id}`} cx="40%" cy="40%" r="65%">
          <stop offset="0%"   stopColor={color1} stopOpacity="0.04" />
          <stop offset="60%"  stopColor="#001E29" stopOpacity="0.0" />
          <stop offset="100%" stopColor="#001E29" stopOpacity="0.18" />
        </radialGradient>
      </defs>

      {/* outer halo */}
      <circle cx={c} cy={c} r={r + 50} fill={`url(#halo-${id})`} />
      <circle cx={c} cy={c} r={r + 18} fill={`url(#halo2-${id})`} />

      {/* sphere shading */}
      <circle cx={c} cy={c} r={r} fill={`url(#sphere-${id})`} />

      {/* outer silhouette */}
      <circle cx={c} cy={c} r={r}
        stroke={`${color1}38`} strokeWidth="1.1"
      />

      {/* dashed orbit just outside */}
      <circle cx={c} cy={c} r={r + 14}
        stroke={`${color2}22`} strokeWidth="0.8" strokeDasharray="2 7"
        style={{ transformOrigin: `${c}px ${c}px`, animation: `hv-spin-rev ${spin * 1.5}s linear infinite` }}
      />

      {/* Latitudes (parallels) — static, give the 3D feel */}
      {parallels.map((p, i) => {
        const ry = r * Math.sqrt(1 - p * p) * 0.30 // ellipse minor axis
        const cy = c + p * r
        // Fade lines further from equator
        const op = 0.10 + (1 - Math.abs(p)) * 0.16
        return (
          <ellipse
            key={`p-${i}`}
            cx={c} cy={cy} rx={r * Math.sqrt(1 - p * p)} ry={ry}
            stroke={color1} strokeOpacity={op} strokeWidth="0.8"
          />
        )
      })}

      {/* Meridians group — rotates slowly to give "spinning globe" effect */}
      <g style={{ transformOrigin: `${c}px ${c}px`, animation: `hv-spin ${spin}s linear infinite` }}>
        {meridians.map((deg, i) => {
          const op = 0.08 + (i % 2 === 0 ? 0.10 : 0.05)
          return (
            <g key={`m-${i}`} style={{ transformOrigin: `${c}px ${c}px`, transform: `rotate(${deg}deg)` }}>
              <ellipse
                cx={c} cy={c} rx={r * 0.18} ry={r}
                stroke={color1} strokeOpacity={op} strokeWidth="0.8"
              />
            </g>
          )
        })}
      </g>

      {/* Counter-rotating subtle equatorial highlight */}
      <g style={{ transformOrigin: `${c}px ${c}px`, animation: `hv-spin-rev ${spin * 0.8}s linear infinite` }}>
        <ellipse cx={c} cy={c} rx={r} ry={r * 0.08}
          stroke={color2} strokeOpacity="0.18" strokeWidth="0.9"
        />
      </g>

      {/* poles */}
      <circle cx={c} cy={c - r} r={2.2} fill={color1} opacity="0.55" />
      <circle cx={c} cy={c + r} r={2.2} fill={color1} opacity="0.35" />

      {/* Per-page overlays */}
      {children}
    </svg>
  )
}

/* ── Helpers ──────────────────────────────────────────────────────────── */
function NodePill({
  cx, cy, label, color, delay = 0, w = 78, h = 22,
}: { cx: number; cy: number; label: string; color: string; delay?: number; w?: number; h?: number }) {
  return (
    <g
      style={{
        transformOrigin: `${cx}px ${cy}px`,
        animation: `hv-fade-in 0.6s ease ${delay}s both, hv-float ${4 + delay}s ease-in-out ${delay + 1}s infinite`,
        opacity: 0,
      }}
    >
      <rect
        x={cx - w / 2} y={cy - h / 2}
        width={w} height={h} rx={h / 2}
        fill="rgba(2,28,42,0.85)"
        stroke={`${color}55`} strokeWidth="1"
      />
      <circle cx={cx - w / 2 + 9} cy={cy} r="3" fill={color}
        style={{ animation: `hv-glow 2.4s ease-in-out ${delay + 0.3}s infinite` }}
      />
      <text
        x={cx + 4} y={cy + 1}
        textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize="8.5" fontWeight="600"
        fontFamily="'IBM Plex Mono',monospace"
      >
        {label}
      </text>
    </g>
  )
}

function HotDot({
  cx, cy, color, size = 6, delay = 0,
}: { cx: number; cy: number; color: string; size?: number; delay?: number }) {
  return (
    <g style={{ animation: `hv-fade-in 0.5s ease ${delay}s both` }}>
      <circle cx={cx} cy={cy} r={size} fill={color} opacity="0.9"
        style={{ animation: `hv-glow 2s ease-in-out ${delay}s infinite` }}
      />
      <circle cx={cx} cy={cy} r={size * 2.2} fill="none" stroke={`${color}55`} strokeWidth="1"
        style={{ animation: `hv-ripple 2.6s ease-out ${delay + 0.5}s infinite` }}
      />
      <circle cx={cx} cy={cy} r={size * 3.6} fill="none" stroke={`${color}25`} strokeWidth="1"
        style={{ animation: `hv-ripple 2.6s ease-out ${delay + 1.1}s infinite` }}
      />
    </g>
  )
}

function FloatingCard({
  position, label, value, color, delay = 0, secondary,
}: {
  position: React.CSSProperties
  label: string
  value: string
  color: string
  delay?: number
  secondary?: boolean
}) {
  return (
    <div
      className="absolute"
      style={{
        ...position,
        padding: secondary ? '8px 14px' : '12px 18px',
        background: 'rgba(2,28,42,0.92)',
        border: `1px solid ${color}33`,
        borderRadius: 12,
        backdropFilter: 'blur(10px)',
        boxShadow: `0 0 36px ${color}10`,
        animation: `hv-fade-in 0.6s ease ${delay}s both, hv-float-alt ${5 + delay}s ease-in-out ${delay + 1}s infinite`,
        opacity: 0,
      }}
    >
      <p style={{
        fontFamily: '"IBM Plex Mono",monospace', fontSize: 9, letterSpacing: '0.2em',
        textTransform: 'uppercase', color: `${color}85`, margin: '0 0 4px',
      }}>{label}</p>
      <p style={{
        fontFamily: '"IBM Plex Mono",monospace',
        fontSize: secondary ? 18 : 24, fontWeight: 700, color, margin: 0, letterSpacing: '-0.02em',
      }}>{value}</p>
    </div>
  )
}

/* ── 1. SOBRE — globe + Brazil hotspots + concept nodes ───────────────── */
export function SobreHeroVisual() {
  const c = 230
  const cities = [
    { label: 'Maceió, AL',     cx: 296, cy: 246, color: '#6DF9C6', d: 0.4 },
    { label: 'São Paulo, SP',  cx: 268, cy: 320, color: '#93BAFB', d: 0.7 },
  ]
  const nodes = [
    { cx: 138, cy: 162, color: '#6DF9C6', label: 'Growth',  d: 0.2 },
    { cx: 318, cy: 178, color: '#93BAFB', label: 'RevOps',  d: 0.5 },
    { cx: 158, cy: 348, color: '#a78bfa', label: 'Método',  d: 0.8 },
    { cx: 340, cy: 340, color: '#fbbf24', label: 'Dados',   d: 1.0 },
  ]

  return (
    <div className="relative w-full" style={{ aspectRatio: '1/1', maxWidth: 520 }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <WireframeGlobe size={460} color1="#6DF9C6" color2="#93BAFB" spin={70}>
        {/* connection edges */}
        {[
          [cities[0], nodes[0]], [cities[0], nodes[1]],
          [cities[1], nodes[2]], [cities[1], nodes[3]],
        ].map(([a, b], i) => (
          <line key={i}
            x1={(a as typeof cities[0]).cx} y1={(a as typeof cities[0]).cy}
            x2={(b as typeof cities[0]).cx} y2={(b as typeof cities[0]).cy}
            stroke="rgba(109,249,198,0.18)" strokeWidth="1" strokeDasharray="3 4"
            style={{ animation: `hv-fade-in 0.5s ease ${0.3 + i * 0.15}s both` }}
          />
        ))}
        {cities.map((city) => (
          <g key={city.label}>
            <HotDot cx={city.cx} cy={city.cy} color={city.color} delay={city.d} />
            <text x={city.cx + 12} y={city.cy + 4}
              fill={city.color} fontSize="9" fontFamily="'IBM Plex Mono',monospace" fontWeight="600" opacity="0.85"
            >{city.label}</text>
          </g>
        ))}
        {nodes.map((n) => (
          <NodePill key={n.label} cx={n.cx} cy={n.cy} label={n.label} color={n.color} delay={n.d} w={70} />
        ))}
      </WireframeGlobe>
      <FloatingCard
        position={{ top: '4%', right: '0%' }}
        label="Presença" value="10 estados" color="#6DF9C6" delay={1.4} secondary
      />
    </div>
  )
}

/* ── 2. MÉTODO — globe + bar chart overlay ────────────────────────────── */
export function MetodoHeroVisual() {
  const bars = [55, 80, 100, 70, 130, 105, 168]

  return (
    <div className="relative w-full" style={{ aspectRatio: '1/1', maxWidth: 520 }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <WireframeGlobe size={460} color1="#6DF9C6" color2="#93BAFB" spin={70}>
        {/* axis */}
        <line x1="80" y1="350" x2="380" y2="350" stroke="rgba(109,249,198,0.18)" strokeWidth="1" />
        {/* bars */}
        {bars.map((h, i) => {
          const x = 100 + i * 38
          const bright = i >= bars.length - 2
          return (
            <rect
              key={i}
              x={x} y={350 - h} width="22" height={h} rx="3"
              fill={bright ? 'rgba(109,249,198,0.85)' : i >= bars.length - 4 ? 'rgba(109,249,198,0.45)' : 'rgba(109,249,198,0.2)'}
              style={{
                transformOrigin: `${x + 11}px 350px`,
                animation: `hv-fade-in 0.7s cubic-bezier(.34,1.4,.64,1) ${i * 0.08}s both, hv-glow 3s ease-in-out ${1.5 + i * 0.08}s infinite`,
              }}
            />
          )
        })}
        {/* trend line */}
        <polyline
          points="111,295 149,275 187,280 225,310 263,240 301,255 339,182"
          stroke="#6DF9C6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="600" fill="none"
          style={{ animation: 'hv-line-draw 2s ease 0.4s both' }}
        />
        {/* dot on latest */}
        <circle cx="339" cy="182" r="5" fill="#6DF9C6"
          style={{ animation: 'hv-glow 1.6s ease-in-out 2s infinite' }}
        />
        <circle cx="339" cy="182" r="10" fill="none" stroke="rgba(109,249,198,0.3)" strokeWidth="1"
          style={{ animation: 'hv-ripple 2s ease-out 2s infinite' }}
        />
      </WireframeGlobe>
      <FloatingCard
        position={{ bottom: '10%', right: '0%' }}
        label="Pipeline gerado" value="+R$ 75MM" color="#6DF9C6" delay={1.4}
      />
      <FloatingCard
        position={{ top: '6%', left: '0%' }}
        label="Conversão" value="3× maior" color="#93BAFB" delay={1.8} secondary
      />
    </div>
  )
}

/* ── 3. ATUAÇÃO — globe + orbiting sectors ────────────────────────────── */
export function AtuacaoHeroVisual() {
  const sectors = [
    { label: 'Construção',  angle: -90,  color: '#6DF9C6', d: 0.1 },
    { label: 'Agro',        angle: -30,  color: '#93BAFB', d: 0.25 },
    { label: 'Tech',        angle:  30,  color: '#a78bfa', d: 0.4 },
    { label: 'Auto',        angle:  90,  color: '#6DF9C6', d: 0.55 },
    { label: 'Indústria',   angle:  150, color: '#93BAFB', d: 0.7 },
    { label: 'Serviços',    angle: -150, color: '#fbbf24', d: 0.85 },
  ]
  const c = 230
  const R = 168

  return (
    <div className="relative w-full" style={{ aspectRatio: '1/1', maxWidth: 520 }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <WireframeGlobe size={460} color1="#93BAFB" color2="#6DF9C6" spin={80}>
        {/* center node */}
        <circle cx={c} cy={c} r={28} fill="rgba(109,249,198,0.12)" stroke="rgba(109,249,198,0.4)" strokeWidth="1.5" />
        <text x={c} y={c + 1} textAnchor="middle" dominantBaseline="middle"
          fill="rgba(109,249,198,0.9)" fontSize="11"
          fontFamily="'IBM Plex Mono',monospace" fontWeight="700"
        >UGS</text>
        <circle cx={c} cy={c} r={36} fill="none" stroke="rgba(109,249,198,0.15)" strokeWidth="1"
          style={{ animation: 'hv-pulse 3s ease-in-out infinite' }}
        />
        {sectors.map((s) => {
          const rad = (s.angle * Math.PI) / 180
          const nx = c + Math.cos(rad) * R
          const ny = c + Math.sin(rad) * R
          return (
            <g key={s.label} style={{ animation: `hv-fade-in 0.5s ease ${s.d}s both` }}>
              <line
                x1={c + Math.cos(rad) * 30} y1={c + Math.sin(rad) * 30}
                x2={nx - Math.cos(rad) * 22} y2={ny - Math.sin(rad) * 22}
                stroke={`${s.color}30`} strokeWidth="1" strokeDasharray="3 3"
              />
              <circle cx={nx} cy={ny} r={20} fill={`${s.color}14`} stroke={`${s.color}50`} strokeWidth="1.2"
                style={{ animation: `hv-glow ${2.8 + s.d}s ease-in-out ${s.d + 1}s infinite` }}
              />
              <text x={nx} y={ny + 1} textAnchor="middle" dominantBaseline="middle"
                fill={s.color} fontSize="8" fontFamily="'IBM Plex Mono',monospace" fontWeight="600"
              >{s.label}</text>
            </g>
          )
        })}
        {/* moving dot on orbit */}
        <g style={{ transformOrigin: `${c}px ${c}px`, animation: 'hv-spin 14s linear infinite' }}>
          <circle cx={c} cy={c - R} r={4} fill="#6DF9C6" opacity="0.9" />
        </g>
      </WireframeGlobe>
      <FloatingCard
        position={{ bottom: '8%', right: '0%' }}
        label="Verticais" value="6 setores" color="#6DF9C6" delay={1.3} secondary
      />
    </div>
  )
}

/* ── 4. CASES — globe + floating metric cards ─────────────────────────── */
export function CasesHeroVisual() {
  return (
    <div className="relative w-full" style={{ aspectRatio: '1/1', maxWidth: 520 }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <WireframeGlobe size={460} color1="#6DF9C6" color2="#93BAFB" spin={75}>
        {/* connecting lines between metric anchors */}
        <line x1="350" y1="80" x2="320" y2="195" stroke="rgba(109,249,198,0.18)" strokeWidth="1" strokeDasharray="3 4"
          style={{ animation: 'hv-line-draw 1.5s ease 1s both' }}
        />
        <line x1="300" y1="205" x2="310" y2="320" stroke="rgba(147,186,251,0.18)" strokeWidth="1" strokeDasharray="3 4"
          style={{ animation: 'hv-line-draw 1.5s ease 1.4s both' }}
        />
        {/* anchor dots */}
        <HotDot cx={350} cy={80}  color="#6DF9C6" size={5} delay={0.2} />
        <HotDot cx={300} cy={210} color="#93BAFB" size={4} delay={0.6} />
        <HotDot cx={310} cy={330} color="#a78bfa" size={5} delay={1.0} />
      </WireframeGlobe>
      <FloatingCard
        position={{ top: '2%', right: '0%' }}
        label="Pipeline gerado" value="+R$ 75MM" color="#6DF9C6" delay={0.4}
      />
      <FloatingCard
        position={{ top: '40%', right: '24%' }}
        label="Redução de ciclo" value="−40%" color="#93BAFB" delay={0.8} secondary
      />
      <FloatingCard
        position={{ bottom: '6%', right: '0%' }}
        label="Leads qualificados" value="+3.2×" color="#a78bfa" delay={1.2} secondary
      />
    </div>
  )
}

/* ── 5. FERRAMENTAS — globe + electron orbits ─────────────────────────── */
export function FerramentasHeroVisual() {
  const c = 230
  const orbits = [
    { rx: 165, ry: 46,  angle:  0,   color: '#6DF9C6', dur:  9 },
    { rx: 165, ry: 46,  angle:  60,  color: '#93BAFB', dur: 12 },
    { rx: 165, ry: 46,  angle: 120,  color: '#a78bfa', dur: 15 },
  ]

  return (
    <div className="relative w-full" style={{ aspectRatio: '1/1', maxWidth: 520 }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <WireframeGlobe size={460} color1="#6DF9C6" color2="#a78bfa" spin={75}>
        {orbits.map((o, i) => (
          <g key={i} style={{ transformOrigin: `${c}px ${c}px`, transform: `rotate(${o.angle}deg)` }}>
            <ellipse cx={c} cy={c} rx={o.rx} ry={o.ry}
              stroke={`${o.color}38`} strokeWidth="1"
            />
            <g style={{ transformOrigin: `${c}px ${c}px`, animation: `hv-spin ${o.dur}s linear ${i * 0.5}s infinite` }}>
              <circle cx={c + o.rx} cy={c} r={5} fill={o.color}
                style={{ animation: `hv-glow 2s ease-in-out ${i * 0.4}s infinite` }}
              />
              <circle cx={c + o.rx} cy={c} r={10} fill="none" stroke={`${o.color}50`} strokeWidth="1"
                style={{ animation: `hv-ripple 2.5s ease-out ${i * 0.5 + 1}s infinite` }}
              />
            </g>
          </g>
        ))}
        {/* nucleus */}
        <circle cx={c} cy={c} r={32} fill="rgba(109,249,198,0.12)" stroke="rgba(109,249,198,0.4)" strokeWidth="1.5"
          style={{ animation: 'hv-pulse 3s ease-in-out infinite' }}
        />
        <rect x={c-10} y={c-10} width="20" height="20" rx="3"
          stroke="rgba(109,249,198,0.8)" strokeWidth="1.4" fill="none"
        />
        <line x1={c-6} y1={c-4} x2={c+6} y2={c-4} stroke="rgba(109,249,198,0.7)" strokeWidth="1.2" strokeLinecap="round" />
        <line x1={c-6} y1={c+1} x2={c+6} y2={c+1} stroke="rgba(109,249,198,0.7)" strokeWidth="1.2" strokeLinecap="round" />
        <line x1={c-6} y1={c+6} x2={c+1} y2={c+6} stroke="rgba(109,249,198,0.7)" strokeWidth="1.2" strokeLinecap="round" />
      </WireframeGlobe>
      <FloatingCard
        position={{ bottom: '6%', right: '0%' }}
        label="Integrações" value="Full-stack" color="#6DF9C6" delay={1} secondary
      />
    </div>
  )
}

/* ── 6. BLOG — globe + orbiting topic tags ────────────────────────────── */
export function BlogHeroVisual() {
  const c = 230
  const tags = [
    { label: 'Growth B2B',     angle: -90,  r: 168, color: '#6DF9C6', d: 0.1 },
    { label: 'RevOps',         angle: -30,  r: 164, color: '#93BAFB', d: 0.3 },
    { label: 'CRM & Vendas',   angle:  30,  r: 168, color: '#a78bfa', d: 0.5 },
    { label: 'Geração Demanda',angle:  90,  r: 164, color: '#6DF9C6', d: 0.7 },
    { label: 'Diagnóstico',    angle:  150, r: 168, color: '#fbbf24', d: 0.9 },
    { label: 'Estratégia',     angle: -150, r: 164, color: '#93BAFB', d: 1.1 },
  ]

  return (
    <div className="relative w-full" style={{ aspectRatio: '1/1', maxWidth: 520 }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <WireframeGlobe size={460} color1="#93BAFB" color2="#6DF9C6" spin={80}>
        {/* center document icon */}
        <circle cx={c} cy={c} r={30} fill="rgba(147,186,251,0.12)" stroke="rgba(147,186,251,0.4)" strokeWidth="1.5"
          style={{ animation: 'hv-pulse 3s ease-in-out infinite' }}
        />
        <rect x={c-10} y={c-12} width="20" height="24" rx="3"
          stroke="rgba(147,186,251,0.8)" strokeWidth="1.4" fill="none"
        />
        <line x1={c-6} y1={c-5} x2={c+6} y2={c-5} stroke="rgba(147,186,251,0.7)" strokeWidth="1.2" strokeLinecap="round" />
        <line x1={c-6} y1={c}   x2={c+6} y2={c}   stroke="rgba(147,186,251,0.7)" strokeWidth="1.2" strokeLinecap="round" />
        <line x1={c-6} y1={c+5} x2={c+2} y2={c+5} stroke="rgba(147,186,251,0.7)" strokeWidth="1.2" strokeLinecap="round" />

        {tags.map((tag) => {
          const rad = (tag.angle * Math.PI) / 180
          const tx = c + Math.cos(rad) * tag.r
          const ty = c + Math.sin(rad) * tag.r
          return (
            <g key={tag.label}>
              <line
                x1={c + Math.cos(rad) * 32} y1={c + Math.sin(rad) * 32}
                x2={tx - Math.cos(rad) * 32} y2={ty - Math.sin(rad) * 32}
                stroke={`${tag.color}25`} strokeWidth="0.8" strokeDasharray="2 4"
              />
              <NodePill cx={tx} cy={ty} label={tag.label} color={tag.color} delay={tag.d} w={88} />
            </g>
          )
        })}
      </WireframeGlobe>
      <FloatingCard
        position={{ bottom: '6%', right: '0%' }}
        label="Conteúdo técnico" value="Método UGS" color="#93BAFB" delay={1.4} secondary
      />
    </div>
  )
}
