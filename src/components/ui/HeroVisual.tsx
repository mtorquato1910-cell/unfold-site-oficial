'use client'

/*
  HeroVisual — Globe-style animated hero decorations for inner pages.
  Each variant shares a rotating-sphere aesthetic matching the homepage feel.
  Rendered as visible right-column elements in a 2-col hero grid.
  All animations loop infinitely and respect prefers-reduced-motion.
*/

import React from 'react'

const CSS = `
@keyframes hv-spin-slow   { from{transform:rotate(0deg)}   to{transform:rotate(360deg)} }
@keyframes hv-spin-med    { from{transform:rotate(0deg)}   to{transform:rotate(360deg)} }
@keyframes hv-spin-rev    { from{transform:rotate(0deg)}   to{transform:rotate(-360deg)} }
@keyframes hv-pulse-ring  { 0%,100%{opacity:.55;transform:scale(.94)} 50%{opacity:.15;transform:scale(1.04)} }
@keyframes hv-float       { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
@keyframes hv-float-alt   { 0%,100%{transform:translateY(0) rotate(0deg)} 40%{transform:translateY(-9px) rotate(.8deg)} 70%{transform:translateY(5px) rotate(-.4deg)} }
@keyframes hv-fade-in     { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes hv-dot-orbit   { from{transform:rotate(0deg) translateX(var(--r,90px)) rotate(0deg)} to{transform:rotate(360deg) translateX(var(--r,90px)) rotate(-360deg)} }
@keyframes hv-dot-orbit-r { from{transform:rotate(0deg) translateX(var(--r,60px)) rotate(0deg)} to{transform:rotate(-360deg) translateX(var(--r,60px)) rotate(360deg)} }
@keyframes hv-glow-pulse  { 0%,100%{opacity:.5} 50%{opacity:1} }
@keyframes hv-bar-up      { from{transform:scaleY(0);opacity:0} to{transform:scaleY(1);opacity:1} }
@keyframes hv-line-draw   { from{stroke-dashoffset:600} to{stroke-dashoffset:0} }
@keyframes hv-counter     { 0%{opacity:.4} 50%{opacity:1} 100%{opacity:.4} }
@keyframes hv-ripple      { 0%{transform:scale(.6);opacity:.7} 100%{transform:scale(2.2);opacity:0} }
@media (prefers-reduced-motion:reduce){
  [style*="hv-"]{animation:none!important}
  .hv-anim{animation:none!important}
}
`

/* ── Shared globe base SVG ────────────────────────────────────────── */
function GlobeSVG({
  size = 420,
  color1 = '#6DF9C6',
  color2 = '#93BAFB',
  children,
  className = '',
}: {
  size?: number
  color1?: string
  color2?: string
  children?: React.ReactNode
  className?: string
}) {
  const c = size / 2
  const r = size * 0.42
  const id = React.useId().replace(/:/g, '')
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        <radialGradient id={`glow-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={color1} stopOpacity="0.10" />
          <stop offset="60%"  stopColor={color1} stopOpacity="0.03" />
          <stop offset="100%" stopColor={color1} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`glow2-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={color2} stopOpacity="0.07" />
          <stop offset="100%" stopColor={color2} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background glow */}
      <circle cx={c} cy={c} r={r + 40} fill={`url(#glow-${id})`} />
      <circle cx={c} cy={c} r={r + 10} fill={`url(#glow2-${id})`} />

      {/* Outer ring */}
      <circle cx={c} cy={c} r={r}
        stroke={`${color1}22`} strokeWidth="1"
      />
      {/* Second ring */}
      <circle cx={c} cy={c} r={r * 0.72}
        stroke={`${color1}14`} strokeWidth="0.8" strokeDasharray="3 5"
      />

      {/* Rotating meridian ellipse 1 (equatorial) */}
      <g style={{ transformOrigin: `${c}px ${c}px`, animation: 'hv-spin-slow 22s linear infinite' }}>
        <ellipse cx={c} cy={c} rx={r} ry={r * 0.28}
          stroke={`${color1}28`} strokeWidth="1"
        />
      </g>

      {/* Rotating meridian ellipse 2 (tilted) */}
      <g style={{ transformOrigin: `${c}px ${c}px`, animation: 'hv-spin-slow 30s linear infinite reverse' }}>
        <ellipse cx={c} cy={c} rx={r * 0.35} ry={r}
          stroke={`${color2}22`} strokeWidth="0.8"
        />
      </g>

      {/* Rotating meridian ellipse 3 (diagonal) */}
      <g style={{ transformOrigin: `${c}px ${c}px`, animation: 'hv-spin-med 18s linear 1s infinite' }}>
        <ellipse cx={c} cy={c} rx={r} ry={r * 0.5}
          stroke={`${color1}18`} strokeWidth="0.8" strokeDasharray="4 6"
        />
      </g>

      {/* Outer dashed orbit */}
      <circle cx={c} cy={c} r={r + 22}
        stroke={`${color2}18`} strokeWidth="1" strokeDasharray="3 8"
        style={{ transformOrigin: `${c}px ${c}px`, animation: 'hv-spin-rev 35s linear infinite' }}
      />

      {children}
    </svg>
  )
}

/* ── 1. Método — globe + bar chart ─────────────────────────────────── */
export function MetodoHeroVisual() {
  const bars = [
    { h: 55, d: 0.0 },
    { h: 80, d: 0.1 },
    { h: 100, d: 0.2 },
    { h: 70, d: 0.3 },
    { h: 130, d: 0.4 },
    { h: 105, d: 0.5 },
    { h: 168, d: 0.6 },
  ]
  const c = 210

  return (
    <div className="relative w-full" style={{ aspectRatio: '1/1', maxWidth: 500 }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <GlobeSVG size={420} color1="#6DF9C6" color2="#93BAFB">
        {/* Axis */}
        <line x1="60" y1="330" x2="360" y2="330" stroke="rgba(109,249,198,0.15)" strokeWidth="1" />
        <line x1="70" y1="160" x2="70" y2="332" stroke="rgba(109,249,198,0.15)" strokeWidth="1" />

        {/* Bars */}
        {bars.map((b, i) => {
          const x = 85 + i * 37
          const bright = i >= bars.length - 2
          return (
            <rect
              key={i}
              x={x} y={330 - b.h} width="22" height={b.h} rx="3"
              fill={bright ? 'rgba(109,249,198,0.8)' : i >= bars.length - 4 ? 'rgba(109,249,198,0.4)' : 'rgba(109,249,198,0.18)'}
              style={{
                transformOrigin: `${x + 11}px 330px`,
                animation: `hv-bar-up 0.7s cubic-bezier(.34,1.4,.64,1) ${b.d}s both, hv-glow-pulse 3s ease-in-out ${1.5 + b.d}s infinite`,
              }}
            />
          )
        })}

        {/* Trend line */}
        <polyline
          points="96,275 133,255 170,260 207,290 244,220 281,235 318,162"
          stroke="#6DF9C6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="600" fill="none"
          style={{ animation: 'hv-line-draw 2s ease 0.4s both' }}
        />

        {/* Dot on latest bar */}
        <circle cx="318" cy="162" r="5" fill="#6DF9C6"
          style={{ animation: 'hv-glow-pulse 1.6s ease-in-out 2s infinite' }}
        />
        <circle cx="318" cy="162" r="10" fill="none" stroke="rgba(109,249,198,0.3)" strokeWidth="1"
          style={{ animation: 'hv-ripple 2s ease-out 2s infinite' }}
        />

        {/* Grid labels */}
        <text x="52" y="334" fontSize="8" fill="rgba(109,249,198,0.3)" fontFamily="'IBM Plex Mono',monospace">0</text>
        <text x="52" y="264" fontSize="8" fill="rgba(109,249,198,0.3)" fontFamily="'IBM Plex Mono',monospace">50k</text>
        <text x="52" y="214" fontSize="8" fill="rgba(109,249,198,0.3)" fontFamily="'IBM Plex Mono',monospace">100k</text>
        {[0, 70, 140].map((y, i) => (
          <line key={i} x1="70" y1={330 - y} x2="360" y2={330 - y}
            stroke="rgba(109,249,198,0.06)" strokeWidth="1"
          />
        ))}
      </GlobeSVG>

      {/* Floating card */}
      <div
        className="absolute"
        style={{
          bottom: '12%', right: '2%',
          padding: '12px 18px',
          background: 'rgba(2,28,42,0.92)',
          border: '1px solid rgba(109,249,198,0.2)',
          borderRadius: 12,
          backdropFilter: 'blur(10px)',
          animation: 'hv-fade-in 0.6s ease 1.4s both, hv-float-alt 5s ease-in-out 2s infinite',
          opacity: 0,
        }}
      >
        <p style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(109,249,198,0.55)', margin: '0 0 4px' }}>Pipeline gerado</p>
        <p style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 24, fontWeight: 700, color: '#6DF9C6', margin: 0, letterSpacing: '-0.02em' }}>+R$ 75MM</p>
      </div>

      {/* Secondary badge */}
      <div
        className="absolute"
        style={{
          top: '8%', left: '2%',
          padding: '8px 14px',
          background: 'rgba(2,28,42,0.88)',
          border: '1px solid rgba(147,186,251,0.2)',
          borderRadius: 10,
          backdropFilter: 'blur(8px)',
          animation: 'hv-fade-in 0.6s ease 1.8s both, hv-float 4s ease-in-out 2.4s infinite',
          opacity: 0,
        }}
      >
        <p style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(147,186,251,0.55)', margin: '0 0 3px' }}>Conversão</p>
        <p style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 18, fontWeight: 700, color: '#93BAFB', margin: 0 }}>3× maior</p>
      </div>
    </div>
  )
}

/* ── 2. Atuação — globe with orbiting sectors ──────────────────────── */
export function AtuacaoHeroVisual() {
  const sectors = [
    { label: 'Construção',  angle: -90,  color: '#6DF9C6', d: 0.1 },
    { label: 'Agronegócio', angle: -30,  color: '#93BAFB', d: 0.25 },
    { label: 'Tecnologia',  angle:  30,  color: '#a78bfa', d: 0.4 },
    { label: 'Automotivo',  angle:  90,  color: '#6DF9C6', d: 0.55 },
    { label: 'Indústrias',  angle:  150, color: '#93BAFB', d: 0.7 },
    { label: 'Serviços',    angle: -150, color: '#fbbf24', d: 0.85 },
  ]
  const c = 210
  const R = 148

  return (
    <div className="relative w-full" style={{ aspectRatio: '1/1', maxWidth: 500 }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <GlobeSVG size={420} color1="#93BAFB" color2="#6DF9C6">
        {/* Center node */}
        <circle cx={c} cy={c} r={26} fill="rgba(109,249,198,0.1)" stroke="rgba(109,249,198,0.35)" strokeWidth="1.5" />
        <text x={c} y={c + 1} textAnchor="middle" dominantBaseline="middle"
          fill="rgba(109,249,198,0.9)" fontSize="11"
          fontFamily="'IBM Plex Mono',monospace" fontWeight="700"
        >UGS</text>
        <circle cx={c} cy={c} r={34} fill="none" stroke="rgba(109,249,198,0.12)" strokeWidth="1"
          style={{ animation: 'hv-pulse-ring 3s ease-in-out infinite' }}
        />

        {/* Orbit ring */}
        <circle cx={c} cy={c} r={R} stroke="rgba(109,249,198,0.08)" strokeWidth="1" strokeDasharray="3 6" />

        {/* Sector nodes */}
        {sectors.map((s) => {
          const rad = (s.angle * Math.PI) / 180
          const nx = c + Math.cos(rad) * R
          const ny = c + Math.sin(rad) * R
          return (
            <g key={s.label} style={{ animation: `hv-fade-in 0.5s ease ${s.d}s both` }}>
              {/* Connector */}
              <line
                x1={c + Math.cos(rad) * 28} y1={c + Math.sin(rad) * 28}
                x2={nx - Math.cos(rad) * 22} y2={ny - Math.sin(rad) * 22}
                stroke={`${s.color}25`} strokeWidth="1" strokeDasharray="3 3"
              />
              {/* Node */}
              <circle cx={nx} cy={ny} r={20} fill={`${s.color}12`} stroke={`${s.color}40`} strokeWidth="1.2"
                style={{ animation: `hv-glow-pulse ${2.8 + s.d}s ease-in-out ${s.d + 1}s infinite` }}
              />
              <text x={nx} y={ny} textAnchor="middle" dominantBaseline="middle"
                fill={s.color} fontSize="7.5"
                fontFamily="'IBM Plex Mono',monospace" fontWeight="600"
              >
                {s.label.slice(0, 7)}
              </text>
            </g>
          )
        })}

        {/* Moving dot on orbit */}
        <g style={{ transformOrigin: `${c}px ${c}px`, animation: 'hv-spin-slow 14s linear infinite' }}>
          <circle cx={c} cy={c - R} r={4} fill="#6DF9C6" opacity="0.8" />
        </g>
        <g style={{ transformOrigin: `${c}px ${c}px`, animation: 'hv-spin-rev 20s linear infinite' }}>
          <circle cx={c} cy={c - R} r={3} fill="#93BAFB" opacity="0.7" />
        </g>
      </GlobeSVG>

      {/* Label badge */}
      <div className="absolute" style={{
        bottom: '8%', right: '4%',
        padding: '9px 14px',
        background: 'rgba(2,28,42,0.9)',
        border: '1px solid rgba(109,249,198,0.18)',
        borderRadius: 10,
        backdropFilter: 'blur(8px)',
        animation: 'hv-fade-in 0.6s ease 1.2s both, hv-float 5s ease-in-out 2s infinite',
        opacity: 0,
      }}>
        <p style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(109,249,198,0.5)', margin: '0 0 3px' }}>Verticais</p>
        <p style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 20, fontWeight: 700, color: '#6DF9C6', margin: 0 }}>6 setores</p>
      </div>
    </div>
  )
}

/* ── 3. Cases — floating metric cards (no globe) ───────────────────── */
export function CasesHeroVisual() {
  const cards = [
    {
      label: 'Pipeline Gerado',
      value: '+R$ 75MM',
      sub: 'em operações estruturadas',
      color: '#6DF9C6',
      style: { top: '4%', right: '5%' },
      delay: 0.1,
      dur: 5,
    },
    {
      label: 'Redução de Ciclo',
      value: '−40%',
      sub: 'no tempo de fechamento',
      color: '#93BAFB',
      style: { top: '36%', right: '18%' },
      delay: 0.5,
      dur: 4.5,
    },
    {
      label: 'Leads qualificados',
      value: '+3.2×',
      sub: 'por operação ativa',
      color: '#a78bfa',
      style: { top: '68%', right: '6%' },
      delay: 0.9,
      dur: 5.5,
    },
  ]

  return (
    <div className="relative w-full" style={{ aspectRatio: '1/1', maxWidth: 500 }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Background glow */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 60% 40%, rgba(109,249,198,0.06) 0%, transparent 70%)',
        borderRadius: '50%',
      }} />

      {/* Decorative SVG lines */}
      <svg viewBox="0 0 420 420" className="absolute inset-0 w-full h-full" fill="none">
        <line x1="80" y1="80" x2="340" y2="340" stroke="rgba(109,249,198,0.06)" strokeWidth="1" strokeDasharray="4 8" />
        <line x1="340" y1="80" x2="80" y2="340" stroke="rgba(147,186,251,0.05)" strokeWidth="1" strokeDasharray="4 8" />
        <circle cx="210" cy="210" r="160" stroke="rgba(109,249,198,0.05)" strokeWidth="1" strokeDasharray="2 10" />
        <circle cx="210" cy="210" r="100" stroke="rgba(147,186,251,0.06)" strokeWidth="1" strokeDasharray="3 8" />
        {/* Connecting lines between cards */}
        <line x1="330" y1="80" x2="300" y2="175" stroke="rgba(109,249,198,0.12)" strokeWidth="1" strokeDasharray="3 4"
          style={{ animation: 'hv-line-draw 1.5s ease 1s both' }}
        />
        <line x1="280" y1="185" x2="290" y2="295" stroke="rgba(147,186,251,0.12)" strokeWidth="1" strokeDasharray="3 4"
          style={{ animation: 'hv-line-draw 1.5s ease 1.4s both' }}
        />
      </svg>

      {/* Metric cards */}
      {cards.map((card) => (
        <div
          key={card.label}
          className="absolute"
          style={{
            ...card.style,
            padding: '16px 22px',
            background: 'rgba(2,28,42,0.92)',
            border: `1px solid ${card.color}28`,
            borderRadius: 14,
            backdropFilter: 'blur(12px)',
            minWidth: 190,
            boxShadow: `0 0 40px ${card.color}08`,
            opacity: 0,
            animation: `hv-fade-in 0.6s cubic-bezier(.34,1.2,.64,1) ${card.delay}s forwards, hv-float ${card.dur}s ease-in-out ${card.delay + 1}s infinite`,
          }}
        >
          <p style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: `${card.color}70`, margin: '0 0 6px' }}>{card.label}</p>
          <p style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 30, fontWeight: 700, color: card.color, margin: '0 0 4px', letterSpacing: '-0.03em', lineHeight: 1 }}>{card.value}</p>
          <p style={{ fontFamily: '"Inter",sans-serif', fontSize: 11, color: 'rgba(231,231,231,0.4)', margin: 0 }}>{card.sub}</p>
        </div>
      ))}

      {/* Small accent dot */}
      <div className="absolute" style={{
        bottom: '10%', left: '8%',
        width: 8, height: 8,
        borderRadius: '50%',
        background: '#6DF9C6',
        boxShadow: '0 0 16px #6DF9C6',
        animation: 'hv-glow-pulse 2s ease-in-out infinite',
      }} />
    </div>
  )
}

/* ── 4. Ferramentas — atom / electron orbit model ──────────────────── */
export function FerramentasHeroVisual() {
  const c = 210
  const orbitDefs = [
    { rx: 150, ry: 42,  angle:  0,  spinDur: 12, color: '#6DF9C6', dotDur:  8 },
    { rx: 150, ry: 42,  angle:  60, spinDur: 16, color: '#93BAFB', dotDur: 11 },
    { rx: 150, ry: 42,  angle: 120, spinDur: 20, color: '#a78bfa', dotDur: 14 },
  ]

  return (
    <div className="relative w-full" style={{ aspectRatio: '1/1', maxWidth: 500 }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <GlobeSVG size={420} color1="#6DF9C6" color2="#a78bfa">
        {/* Orbital rings + moving electrons */}
        {orbitDefs.map((o, i) => (
          <g key={i} style={{ transformOrigin: `${c}px ${c}px`, transform: `rotate(${o.angle}deg)` }}>
            {/* Ring */}
            <ellipse cx={c} cy={c} rx={o.rx} ry={o.ry}
              stroke={`${o.color}30`} strokeWidth="1"
            />
            {/* Electron dot */}
            <g style={{ transformOrigin: `${c}px ${c}px`, animation: `hv-spin-slow ${o.dotDur}s linear ${i * 0.5}s infinite` }}>
              <circle cx={c + o.rx} cy={c} r={5} fill={o.color}
                style={{ animation: `hv-glow-pulse 2s ease-in-out ${i * 0.4}s infinite` }}
              />
              <circle cx={c + o.rx} cy={c} r={10} fill="none" stroke={`${o.color}40`} strokeWidth="1"
                style={{ animation: `hv-ripple 2.5s ease-out ${i * 0.5 + 1}s infinite` }}
              />
            </g>
          </g>
        ))}

        {/* Center nucleus */}
        <circle cx={c} cy={c} r={32} fill="rgba(109,249,198,0.1)" stroke="rgba(109,249,198,0.35)" strokeWidth="1.5"
          style={{ animation: 'hv-pulse-ring 3s ease-in-out infinite' }}
        />
        <circle cx={c} cy={c} r={22} fill="rgba(109,249,198,0.12)" stroke="rgba(109,249,198,0.4)" strokeWidth="1" />

        {/* Calculator icon in nucleus */}
        <rect x={c-10} y={c-10} width="20" height="20" rx="3"
          stroke="rgba(109,249,198,0.7)" strokeWidth="1.4" fill="none"
        />
        <line x1={c-6} y1={c-4} x2={c+6} y2={c-4} stroke="rgba(109,249,198,0.7)" strokeWidth="1.2" strokeLinecap="round" />
        <line x1={c-6} y1={c+1} x2={c+6} y2={c+1} stroke="rgba(109,249,198,0.7)" strokeWidth="1.2" strokeLinecap="round" />
        <line x1={c-6} y1={c+6} x2={c-2} y2={c+6} stroke="rgba(109,249,198,0.7)" strokeWidth="1.2" strokeLinecap="round" />
        <line x1={c+2} y1={c+6} x2={c+6} y2={c+6} stroke="rgba(109,249,198,0.7)" strokeWidth="1.2" strokeLinecap="round" />

        {/* Labels for tools */}
        {[
          { x: 56,  y: 180, t: 'RD Station', c: '#6DF9C6' },
          { x: 280, y: 58,  t: 'Meta Ads',   c: '#93BAFB' },
          { x: 300, y: 335, t: 'Kommo CRM',  c: '#a78bfa' },
        ].map((l, i) => (
          <text key={i} x={l.x} y={l.y} textAnchor="middle"
            fill={l.c} fontSize="8.5" fontFamily="'IBM Plex Mono',monospace" fontWeight="600" opacity="0.7"
            style={{ animation: `hv-fade-in 0.5s ease ${i * 0.3 + 0.5}s both` }}
          >{l.t}</text>
        ))}
      </GlobeSVG>

      {/* Badge */}
      <div className="absolute" style={{
        bottom: '6%', right: '2%',
        padding: '10px 16px',
        background: 'rgba(2,28,42,0.9)',
        border: '1px solid rgba(109,249,198,0.2)',
        borderRadius: 10,
        backdropFilter: 'blur(8px)',
        animation: 'hv-fade-in 0.6s ease 1s both, hv-float-alt 5s ease-in-out 2s infinite',
        opacity: 0,
      }}>
        <p style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(109,249,198,0.5)', margin: '0 0 3px' }}>Integrações</p>
        <p style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 20, fontWeight: 700, color: '#6DF9C6', margin: 0 }}>Full-stack</p>
      </div>
    </div>
  )
}

/* ── 5. Sobre — globe with Brazil hotspots ─────────────────────────── */
export function SobreHeroVisual() {
  const c = 210
  const cities = [
    { label: 'Maceió, AL',  cx: 268, cy: 228, color: '#6DF9C6', r: 7, d: 0.5 },
    { label: 'São Paulo, SP', cx: 240, cy: 290, color: '#93BAFB', r: 6, d: 0.9 },
  ]
  const nodes = [
    { cx: 155, cy: 148, r: 14, color: '#6DF9C6', label: 'Growth',  d: 0.2 },
    { cx: 285, cy: 162, r: 14, color: '#93BAFB', label: 'RevOps',  d: 0.4 },
    { cx: 175, cy: 320, r: 12, color: '#a78bfa', label: 'Método',  d: 0.6 },
    { cx: 305, cy: 310, r: 12, color: '#fbbf24', label: 'Dados',   d: 0.8 },
  ]

  return (
    <div className="relative w-full" style={{ aspectRatio: '1/1', maxWidth: 500 }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <GlobeSVG size={420} color1="#6DF9C6" color2="#93BAFB">
        {/* Connection edges */}
        {[
          [cities[0], nodes[0]],
          [cities[0], nodes[1]],
          [cities[1], nodes[2]],
          [cities[1], nodes[3]],
          [nodes[0], nodes[1]],
          [nodes[2], nodes[3]],
        ].map(([a, b], i) => (
          <line key={i}
            x1={(a as typeof cities[0]).cx} y1={(a as typeof cities[0]).cy}
            x2={(b as typeof cities[0]).cx} y2={(b as typeof cities[0]).cy}
            stroke="rgba(109,249,198,0.14)" strokeWidth="1" strokeDasharray="3 4"
            style={{ animation: `hv-fade-in 0.5s ease ${0.3 + i * 0.15}s both` }}
          />
        ))}

        {/* City dots */}
        {cities.map((city) => (
          <g key={city.label} style={{ animation: `hv-fade-in 0.5s ease ${city.d}s both` }}>
            <circle cx={city.cx} cy={city.cy} r={city.r}
              fill={city.color} opacity="0.9"
              style={{ animation: `hv-glow-pulse 2s ease-in-out ${city.d}s infinite` }}
            />
            <circle cx={city.cx} cy={city.cy} r={city.r * 2}
              fill="none" stroke={`${city.color}40`} strokeWidth="1"
              style={{ animation: `hv-ripple 2.5s ease-out ${city.d + 0.5}s infinite` }}
            />
            <circle cx={city.cx} cy={city.cy} r={city.r * 3}
              fill="none" stroke={`${city.color}20`} strokeWidth="1"
              style={{ animation: `hv-ripple 2.5s ease-out ${city.d + 1}s infinite` }}
            />
            <text x={city.cx + 10} y={city.cy + 4}
              fill={city.color} fontSize="8" fontFamily="'IBM Plex Mono',monospace" fontWeight="600" opacity="0.8"
            >{city.label}</text>
          </g>
        ))}

        {/* Concept nodes */}
        {nodes.map((n) => (
          <g key={n.label} style={{ animation: `hv-fade-in 0.5s ease ${n.d}s both, hv-float ${3 + n.d}s ease-in-out ${n.d + 1}s infinite` }}>
            <circle cx={n.cx} cy={n.cy} r={n.r} fill={`${n.color}14`} stroke={`${n.color}40`} strokeWidth="1.2" />
            <text x={n.cx} y={n.cy} textAnchor="middle" dominantBaseline="middle"
              fill={n.color} fontSize="7" fontFamily="'IBM Plex Mono',monospace" fontWeight="600"
            >{n.label}</text>
          </g>
        ))}
      </GlobeSVG>

      {/* HQ Badge */}
      <div className="absolute" style={{
        top: '6%', right: '2%',
        padding: '10px 14px',
        background: 'rgba(2,28,42,0.92)',
        border: '1px solid rgba(109,249,198,0.2)',
        borderRadius: 10,
        backdropFilter: 'blur(8px)',
        animation: 'hv-fade-in 0.6s ease 1.4s both, hv-float 5s ease-in-out 2s infinite',
        opacity: 0,
      }}>
        <p style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(109,249,198,0.5)', margin: '0 0 3px' }}>Presença</p>
        <p style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 18, fontWeight: 700, color: '#6DF9C6', margin: 0 }}>10 estados</p>
      </div>
    </div>
  )
}

/* ── 6. Blog — globe with orbiting topic tags ──────────────────────── */
export function BlogHeroVisual() {
  const c = 210
  const tags = [
    { label: 'Growth B2B',    angle: -90,  r: 152, color: '#6DF9C6', d: 0.1 },
    { label: 'RevOps',        angle: -30,  r: 148, color: '#93BAFB', d: 0.3 },
    { label: 'CRM & Vendas',  angle:  30,  r: 150, color: '#a78bfa', d: 0.5 },
    { label: 'Geração Demanda', angle: 90, r: 148, color: '#6DF9C6', d: 0.7 },
    { label: 'Diagnóstico',   angle:  150, r: 152, color: '#fbbf24', d: 0.9 },
    { label: 'Estratégia',    angle: -150, r: 148, color: '#93BAFB', d: 1.1 },
  ]

  return (
    <div className="relative w-full" style={{ aspectRatio: '1/1', maxWidth: 500 }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <GlobeSVG size={420} color1="#93BAFB" color2="#6DF9C6">
        {/* Center icon — document */}
        <circle cx={c} cy={c} r={28} fill="rgba(147,186,251,0.1)" stroke="rgba(147,186,251,0.35)" strokeWidth="1.5"
          style={{ animation: 'hv-pulse-ring 3s ease-in-out infinite' }}
        />
        <rect x={c-10} y={c-12} width="20" height="24" rx="3"
          stroke="rgba(147,186,251,0.7)" strokeWidth="1.4" fill="none"
        />
        <line x1={c-6} y1={c-5} x2={c+6} y2={c-5} stroke="rgba(147,186,251,0.6)" strokeWidth="1.2" strokeLinecap="round" />
        <line x1={c-6} y1={c}   x2={c+6} y2={c}   stroke="rgba(147,186,251,0.6)" strokeWidth="1.2" strokeLinecap="round" />
        <line x1={c-6} y1={c+5} x2={c+2} y2={c+5} stroke="rgba(147,186,251,0.6)" strokeWidth="1.2" strokeLinecap="round" />

        {/* Topic tag nodes */}
        {tags.map((tag) => {
          const rad = (tag.angle * Math.PI) / 180
          const tx = c + Math.cos(rad) * tag.r
          const ty = c + Math.sin(rad) * tag.r
          return (
            <g key={tag.label}
              style={{
                animation: `hv-fade-in 0.5s ease ${tag.d}s both, hv-float ${3.5 + tag.d * 0.4}s ease-in-out ${tag.d + 1}s infinite`,
              }}
            >
              {/* Connector */}
              <line
                x1={c + Math.cos(rad) * 30} y1={c + Math.sin(rad) * 30}
                x2={tx - Math.cos(rad) * 28} y2={ty - Math.sin(rad) * 28}
                stroke={`${tag.color}20`} strokeWidth="0.8" strokeDasharray="2 4"
              />
              {/* Tag pill */}
              <rect
                x={tx - 36} y={ty - 11}
                width={72} height={22} rx={11}
                fill={`${tag.color}12`} stroke={`${tag.color}35`} strokeWidth="1"
              />
              <text x={tx} y={ty + 1} textAnchor="middle" dominantBaseline="middle"
                fill={tag.color} fontSize="7.5" fontFamily="'IBM Plex Mono',monospace" fontWeight="600"
              >{tag.label}</text>
            </g>
          )
        })}

        {/* Moving dot on outer orbit */}
        <g style={{ transformOrigin: `${c}px ${c}px`, animation: 'hv-spin-slow 18s linear infinite' }}>
          <circle cx={c} cy={c - 175} r={3.5} fill="#93BAFB" opacity="0.8" />
        </g>
      </GlobeSVG>

      {/* Article count badge */}
      <div className="absolute" style={{
        bottom: '8%', right: '2%',
        padding: '10px 16px',
        background: 'rgba(2,28,42,0.92)',
        border: '1px solid rgba(147,186,251,0.2)',
        borderRadius: 10,
        backdropFilter: 'blur(8px)',
        animation: 'hv-fade-in 0.6s ease 1.4s both, hv-float-alt 5s ease-in-out 2s infinite',
        opacity: 0,
      }}>
        <p style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(147,186,251,0.5)', margin: '0 0 3px' }}>Conteúdo técnico</p>
        <p style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 20, fontWeight: 700, color: '#93BAFB', margin: 0 }}>Método UGS</p>
      </div>
    </div>
  )
}
