'use client'

/*
  HeroVisual — page-specific animated SVG hero decorations
  Each variant is tailored to the page context, using the same
  design language as the homepage ambient orbs.
  All animations respect prefers-reduced-motion via CSS.
*/

import React from 'react'

// ── Shared styles injected once ──────────────────────────────────────────────
const CSS = `
@keyframes hv-bar-rise {
  from { transform: scaleY(0); opacity: 0; }
  to   { transform: scaleY(1); opacity: 1; }
}
@keyframes hv-float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-12px); }
}
@keyframes hv-float-alt {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33%       { transform: translateY(-8px) rotate(1deg); }
  66%       { transform: translateY(4px) rotate(-0.5deg); }
}
@keyframes hv-bubble-in {
  0%   { opacity: 0; transform: translateY(14px) scale(0.88); }
  60%  { opacity: 1; transform: translateY(-2px) scale(1.02); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes hv-orbit {
  from { transform: rotate(0deg) translateX(60px) rotate(0deg); }
  to   { transform: rotate(360deg) translateX(60px) rotate(-360deg); }
}
@keyframes hv-orbit-reverse {
  from { transform: rotate(0deg) translateX(44px) rotate(0deg); }
  to   { transform: rotate(-360deg) translateX(44px) rotate(360deg); }
}
@keyframes hv-pulse-ring {
  0%   { transform: scale(0.85); opacity: 0.6; }
  50%  { transform: scale(1);    opacity: 0.2; }
  100% { transform: scale(0.85); opacity: 0.6; }
}
@keyframes hv-fade-slide {
  from { opacity: 0; transform: translateX(16px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes hv-path-draw {
  from { stroke-dashoffset: 400; }
  to   { stroke-dashoffset: 0; }
}
@media (prefers-reduced-motion: reduce) {
  [class*="hv-"] { animation: none !important; }
}
`

function InjectCSS() {
  return <style dangerouslySetInnerHTML={{ __html: CSS }} />
}

// ── Base container ───────────────────────────────────────────────────────────
function HeroCanvas({ children }: { children: React.ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <InjectCSS />
      {children}
    </div>
  )
}

// ── 1. Método — Rising bar chart ─────────────────────────────────────────────
export function MetodoHeroVisual() {
  const bars = [
    { h: 60, delay: 0.1 },
    { h: 90, delay: 0.25 },
    { h: 120, delay: 0.4 },
    { h: 80, delay: 0.55 },
    { h: 150, delay: 0.7 },
    { h: 110, delay: 0.85 },
    { h: 180, delay: 1.0 },
  ]

  return (
    <HeroCanvas>
      {/* Ambient glow behind chart */}
      <div
        className="absolute"
        style={{
          right: '6%',
          top: '8%',
          width: 480,
          height: 380,
          background: 'radial-gradient(ellipse at center, hsl(158 92% 70% / 0.06) 0%, transparent 70%)',
        }}
      />

      {/* Bar chart SVG */}
      <svg
        viewBox="0 0 320 200"
        className="absolute"
        style={{
          right: '4%',
          top: '10%',
          width: 'min(380px, 42vw)',
          opacity: 0.55,
        }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Grid lines */}
        {[0, 50, 100, 150, 200].map((y, i) => (
          <line
            key={i}
            x1="30"
            y1={200 - y}
            x2="310"
            y2={200 - y}
            stroke="rgba(109,249,198,0.08)"
            strokeWidth="1"
          />
        ))}

        {/* Bars */}
        {bars.map((bar, i) => {
          const x = 40 + i * 38
          const barColor = i === bars.length - 1 ? '#6DF9C6' : i >= bars.length - 3 ? 'rgba(109,249,198,0.55)' : 'rgba(109,249,198,0.25)'
          return (
            <g key={i}>
              <rect
                x={x}
                y={200 - bar.h}
                width="22"
                height={bar.h}
                fill={barColor}
                rx="3"
                style={{
                  transformOrigin: `${x + 11}px 200px`,
                  animation: `hv-bar-rise 0.7s cubic-bezier(0.34,1.56,0.64,1) ${bar.delay}s both`,
                }}
              />
            </g>
          )
        })}

        {/* Trend line */}
        <polyline
          points="51,140 89,110 127,120 165,152 203,90 241,105 279,20"
          stroke="#6DF9C6"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="400"
          fill="none"
          style={{
            animation: 'hv-path-draw 1.8s ease 0.3s both',
          }}
        />

        {/* Dot on latest point */}
        <circle
          cx="279"
          cy="20"
          r="4"
          fill="#6DF9C6"
          style={{
            animation: 'hv-float 3s ease-in-out 1.8s infinite',
          }}
        />

        {/* Axes */}
        <line x1="30" y1="0" x2="30" y2="200" stroke="rgba(109,249,198,0.15)" strokeWidth="1" />
        <line x1="30" y1="200" x2="310" y2="200" stroke="rgba(109,249,198,0.15)" strokeWidth="1" />
      </svg>

      {/* Floating metric card */}
      <div
        className="absolute rounded-xl border"
        style={{
          right: '8%',
          top: '62%',
          padding: '10px 16px',
          background: 'rgba(3,34,48,0.85)',
          borderColor: 'rgba(109,249,198,0.18)',
          backdropFilter: 'blur(8px)',
          animation: 'hv-float-alt 4s ease-in-out 1.2s infinite',
          opacity: 0,
          animationFillMode: 'forwards',
          animationDelay: '1.2s',
        }}
      >
        <p style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(109,249,198,0.5)', margin: '0 0 3px' }}>
          Pipeline
        </p>
        <p style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 20, fontWeight: 700, color: '#6DF9C6', margin: 0 }}>
          +R$ 75MM
        </p>
      </div>
    </HeroCanvas>
  )
}

// ── 2. Atuação — Vertical sector nodes ──────────────────────────────────────
export function AtuacaoHeroVisual() {
  const sectors = [
    { label: 'Construção', angle: 0, color: '#6DF9C6', delay: 0.1 },
    { label: 'Agronegócio', angle: 60, color: '#93BAFB', delay: 0.25 },
    { label: 'Tecnologia', angle: 120, color: '#a78bfa', delay: 0.4 },
    { label: 'Automotivo', angle: 180, color: '#6DF9C6', delay: 0.55 },
    { label: 'Indústrias', angle: 240, color: '#93BAFB', delay: 0.7 },
    { label: 'Serviços', angle: 300, color: '#a78bfa', delay: 0.85 },
  ]
  const R = 90
  const cx = 160
  const cy = 130

  return (
    <HeroCanvas>
      <div
        className="absolute"
        style={{
          right: '3%',
          top: '5%',
          width: 500,
          height: 420,
          background: 'radial-gradient(ellipse at center, hsl(218 94% 78% / 0.05) 0%, transparent 65%)',
        }}
      />

      <svg
        viewBox="0 0 320 260"
        className="absolute"
        style={{
          right: '3%',
          top: '8%',
          width: 'min(420px, 45vw)',
          opacity: 0.6,
        }}
        fill="none"
      >
        {/* Outer pulse ring */}
        <circle
          cx={cx} cy={cy} r={R + 28}
          stroke="rgba(147,186,251,0.12)"
          strokeWidth="1"
          strokeDasharray="6 4"
          style={{ animation: 'hv-pulse-ring 4s ease-in-out infinite' }}
        />
        {/* Middle ring */}
        <circle
          cx={cx} cy={cy} r={R}
          stroke="rgba(109,249,198,0.1)"
          strokeWidth="1"
        />
        {/* Center circle */}
        <circle cx={cx} cy={cy} r={22} fill="rgba(109,249,198,0.08)" stroke="rgba(109,249,198,0.25)" strokeWidth="1" />
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fill="rgba(109,249,198,0.8)" fontSize="8" fontFamily="'IBM Plex Mono', monospace" fontWeight="600">UGS</text>

        {/* Sector nodes */}
        {sectors.map((s) => {
          const rad = (s.angle * Math.PI) / 180
          const nx = cx + Math.cos(rad) * R
          const ny = cy + Math.sin(rad) * R
          return (
            <g key={s.label}
              style={{
                animation: `hv-bubble-in 0.5s ease ${s.delay}s both`,
              }}
            >
              {/* Connector line */}
              <line
                x1={cx + Math.cos(rad) * 23}
                y1={cy + Math.sin(rad) * 23}
                x2={nx - Math.cos(rad) * 18}
                y2={ny - Math.sin(rad) * 18}
                stroke={`${s.color}30`}
                strokeWidth="1"
                strokeDasharray="3 2"
              />
              {/* Node */}
              <circle cx={nx} cy={ny} r={16} fill={`${s.color}12`} stroke={`${s.color}35`} strokeWidth="1" />
              <text
                x={nx}
                y={ny}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={s.color}
                fontSize="6"
                fontFamily="'IBM Plex Mono', monospace"
                fontWeight="600"
              >
                {s.label.substring(0, 6)}
              </text>
            </g>
          )
        })}
      </svg>
    </HeroCanvas>
  )
}

// ── 3. Cases — Floating metric cards ────────────────────────────────────────
export function CasesHeroVisual() {
  const cards = [
    {
      label: 'Pipeline Gerado',
      value: '+R$ 75MM',
      color: '#6DF9C6',
      style: { right: '12%', top: '14%', animationDelay: '0.1s', animation: 'hv-float 5s ease-in-out 0.1s infinite' },
    },
    {
      label: 'Ciclo médio reduzido',
      value: '−40%',
      color: '#93BAFB',
      style: { right: '4%', top: '44%', animationDelay: '0.6s', animation: 'hv-float-alt 4.5s ease-in-out 0.6s infinite' },
    },
    {
      label: 'Leads qualificados',
      value: '+3.2×',
      color: '#a78bfa',
      style: { right: '16%', top: '68%', animationDelay: '1.1s', animation: 'hv-float 6s ease-in-out 1.1s infinite' },
    },
  ]

  return (
    <HeroCanvas>
      <div
        className="absolute"
        style={{
          right: '2%',
          top: '5%',
          width: 460,
          height: 420,
          background: 'radial-gradient(ellipse at 60% 40%, hsl(158 92% 70% / 0.05) 0%, transparent 70%)',
        }}
      />

      {cards.map((card) => (
        <div
          key={card.label}
          className="absolute rounded-xl border"
          style={{
            ...card.style,
            padding: '12px 18px',
            background: 'rgba(3,34,48,0.9)',
            borderColor: `${card.color}22`,
            backdropFilter: 'blur(8px)',
            minWidth: 140,
            opacity: 0,
            animationFillMode: 'forwards',
          }}
        >
          <p style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: `${card.color}80`, margin: '0 0 4px' }}>
            {card.label}
          </p>
          <p style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 22, fontWeight: 700, color: card.color, margin: 0, letterSpacing: '-0.02em' }}>
            {card.value}
          </p>
        </div>
      ))}
    </HeroCanvas>
  )
}

// ── 4. Ferramentas — Orbiting tool icons ─────────────────────────────────────
export function FerramentasHeroVisual() {
  return (
    <HeroCanvas>
      <div
        className="absolute"
        style={{
          right: '4%',
          top: '5%',
          width: 480,
          height: 400,
          background: 'radial-gradient(ellipse at center, hsl(158 92% 70% / 0.06) 0%, transparent 70%)',
        }}
      />

      <svg
        viewBox="0 0 320 280"
        className="absolute"
        style={{
          right: '3%',
          top: '6%',
          width: 'min(400px, 44vw)',
          opacity: 0.55,
        }}
        fill="none"
      >
        {/* Center — calculator icon */}
        <circle cx="160" cy="140" r="32" fill="rgba(109,249,198,0.1)" stroke="rgba(109,249,198,0.3)" strokeWidth="1.5" />
        <rect x="148" y="128" width="24" height="24" rx="3" stroke="rgba(109,249,198,0.7)" strokeWidth="1.5" />
        <path d="M152 134h16M152 139h16M152 144h7M165 144h3" stroke="rgba(109,249,198,0.7)" strokeWidth="1.2" strokeLinecap="round" />

        {/* Orbit 1 — outer ring */}
        <circle cx="160" cy="140" r="72" stroke="rgba(109,249,198,0.06)" strokeWidth="1" strokeDasharray="4 4" />
        {/* Orbit 2 — inner ring */}
        <circle cx="160" cy="140" r="50" stroke="rgba(147,186,251,0.06)" strokeWidth="1" strokeDasharray="4 4" />

        {/* Orbiting icons */}
        {/* Chart icon — orbit 1 */}
        <g style={{ transformOrigin: '160px 140px', animation: 'hv-orbit 8s linear infinite' }}>
          <circle cx="160" cy="68" r="14" fill="rgba(109,249,198,0.08)" stroke="rgba(109,249,198,0.25)" strokeWidth="1" />
          <path d="M153 76l3-5 3 4 3-7 3 4" stroke="rgba(109,249,198,0.7)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Clipboard icon — orbit 1 */}
        <g style={{ transformOrigin: '160px 140px', animation: 'hv-orbit 8s linear 2.7s infinite' }}>
          <circle cx="160" cy="68" r="14" fill="rgba(147,186,251,0.08)" stroke="rgba(147,186,251,0.25)" strokeWidth="1" />
          <rect x="153" y="63" width="14" height="14" rx="2" stroke="rgba(147,186,251,0.7)" strokeWidth="1.2" />
          <path d="M156 68h8M156 71h8M156 74h5" stroke="rgba(147,186,251,0.7)" strokeWidth="1.2" strokeLinecap="round" />
        </g>

        {/* Settings icon — orbit 2 */}
        <g style={{ transformOrigin: '160px 140px', animation: 'hv-orbit-reverse 5s linear infinite' }}>
          <circle cx="160" cy="90" r="12" fill="rgba(167,139,250,0.08)" stroke="rgba(167,139,250,0.25)" strokeWidth="1" />
          <circle cx="160" cy="90" r="4" stroke="rgba(167,139,250,0.7)" strokeWidth="1.2" />
          <path d="M160 84v2M160 94v2M154 90h2M164 90h2" stroke="rgba(167,139,250,0.7)" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      </svg>
    </HeroCanvas>
  )
}

// ── 5. Sobre — Network / connection graph ────────────────────────────────────
export function SobreHeroVisual() {
  const nodes = [
    { cx: 200, cy: 80, r: 28, color: '#6DF9C6', label: 'Unfold', delay: 0 },
    { cx: 280, cy: 150, r: 18, color: '#93BAFB', label: 'Clientes', delay: 0.2 },
    { cx: 140, cy: 160, r: 18, color: '#93BAFB', label: 'Método', delay: 0.35 },
    { cx: 240, cy: 220, r: 14, color: '#a78bfa', label: 'RevOps', delay: 0.5 },
    { cx: 160, cy: 230, r: 14, color: '#a78bfa', label: 'Growth', delay: 0.65 },
    { cx: 310, cy: 90, r: 12, color: '#fbbf24', label: 'BR', delay: 0.8 },
  ]

  const edges = [
    [0, 1], [0, 2], [1, 3], [2, 4], [1, 5], [3, 4],
  ]

  return (
    <HeroCanvas>
      <div
        className="absolute"
        style={{
          right: '2%',
          top: '4%',
          width: 500,
          height: 400,
          background: 'radial-gradient(ellipse at 55% 45%, hsl(218 94% 78% / 0.06) 0%, transparent 65%)',
        }}
      />

      <svg
        viewBox="0 0 340 280"
        className="absolute"
        style={{
          right: '2%',
          top: '8%',
          width: 'min(420px, 45vw)',
          opacity: 0.5,
        }}
        fill="none"
      >
        {/* Edges */}
        {edges.map(([a, b], i) => (
          <line
            key={i}
            x1={nodes[a].cx} y1={nodes[a].cy}
            x2={nodes[b].cx} y2={nodes[b].cy}
            stroke="rgba(109,249,198,0.12)"
            strokeWidth="1"
            strokeDasharray="4 3"
            style={{ animation: `hv-fade-slide 0.6s ease ${nodes[a].delay + 0.2}s both` }}
          />
        ))}

        {/* Nodes */}
        {nodes.map((n) => (
          <g
            key={n.label}
            style={{
              animation: `hv-bubble-in 0.5s ease ${n.delay}s both, hv-float ${3 + n.delay}s ease-in-out ${n.delay + 0.5}s infinite`,
            }}
          >
            <circle cx={n.cx} cy={n.cy} r={n.r} fill={`${n.color}10`} stroke={`${n.color}35`} strokeWidth="1.2" />
            <text
              x={n.cx} y={n.cy}
              textAnchor="middle" dominantBaseline="middle"
              fill={n.color} fontSize="7"
              fontFamily="'IBM Plex Mono', monospace"
              fontWeight="600"
            >
              {n.label}
            </text>
          </g>
        ))}
      </svg>
    </HeroCanvas>
  )
}

// ── 6. Blog — Chat bubbles ───────────────────────────────────────────────────
export function BlogHeroVisual() {
  const bubbles = [
    {
      text: 'Como estruturar um funil de growth?',
      isLeft: true,
      delay: 0.1,
      top: '12%',
      right: '18%',
    },
    {
      text: 'CRM integrado com marketing.',
      isLeft: false,
      delay: 0.5,
      top: '32%',
      right: '5%',
    },
    {
      text: 'Diagnóstico de maturidade UGS.',
      isLeft: true,
      delay: 0.9,
      top: '54%',
      right: '14%',
    },
    {
      text: 'Pipeline previsível em 90 dias.',
      isLeft: false,
      delay: 1.3,
      top: '72%',
      right: '4%',
    },
  ]

  return (
    <HeroCanvas>
      <div
        className="absolute"
        style={{
          right: '2%',
          top: '4%',
          width: 480,
          height: 420,
          background: 'radial-gradient(ellipse at 50% 50%, hsl(218 94% 78% / 0.05) 0%, transparent 70%)',
        }}
      />

      {bubbles.map((b, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: b.top,
            right: b.right,
            maxWidth: 240,
            opacity: 0,
            animation: `hv-bubble-in 0.5s cubic-bezier(0.34,1.4,0.64,1) ${b.delay}s forwards, hv-float ${4 + i * 0.5}s ease-in-out ${b.delay + 0.5}s infinite`,
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '9px 14px',
              borderRadius: b.isLeft ? '14px 14px 14px 4px' : '14px 14px 4px 14px',
              background: b.isLeft ? 'rgba(3,34,48,0.9)' : 'rgba(109,249,198,0.12)',
              border: `1px solid ${b.isLeft ? 'rgba(109,249,198,0.15)' : 'rgba(109,249,198,0.3)'}`,
              backdropFilter: 'blur(6px)',
            }}
          >
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              lineHeight: 1.5,
              color: b.isLeft ? 'rgba(231,231,231,0.75)' : 'rgba(109,249,198,0.9)',
              margin: 0,
              whiteSpace: 'nowrap',
            }}>
              {b.text}
            </p>
          </div>
        </div>
      ))}
    </HeroCanvas>
  )
}
