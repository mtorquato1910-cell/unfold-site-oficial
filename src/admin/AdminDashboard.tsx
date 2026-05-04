'use client'

import React from 'react'

const COLLECTIONS = [
  { label: 'Posts / Blog', href: '/admin/collections/posts', color: '#6DF9C6' },
  { label: 'Cases', href: '/admin/collections/cases', color: '#93BAFB' },
  { label: 'Leads', href: '/admin/collections/leads', color: '#6DF9C6' },
  { label: 'Diagnósticos', href: '/admin/collections/diagnostico-results', color: '#93BAFB' },
  { label: 'Questões do Quiz', href: '/admin/collections/quiz-questions', color: '#6DF9C6' },
  { label: 'Variações de Insights', href: '/admin/collections/insights-variations', color: '#93BAFB' },
  { label: 'Mídia', href: '/admin/collections/media', color: '#6DF9C6' },
  { label: 'Configurações do Site', href: '/admin/globals/site-settings', color: '#93BAFB' },
]

export function AdminDashboard() {
  return (
    <div style={{ padding: '0 0 48px 0' }}>
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, #032230 0%, #06293a 100%)',
        border: '1px solid rgba(109, 249, 198, 0.15)',
        borderRadius: '12px',
        padding: '36px 40px',
        marginBottom: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="dash-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#6DF9C6" />
                  <stop offset="60%" stopColor="#93BAFB" />
                  <stop offset="100%" stopColor="#6b59d0" />
                </linearGradient>
              </defs>
              <path d="M20 2 C30 2 38 10 38 20 C38 30 30 38 20 38 C10 38 2 30 2 20 C2 10 10 2 20 2 Z M20 12 L12 20 L20 28 L28 20 Z" fill="url(#dash-grad)" fillRule="evenodd" />
            </svg>
            <span style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#e7e7e7',
            }}>
              Unfold Growth
            </span>
          </div>
          <p style={{
            fontFamily: '"IBM Plex Mono", "SF Mono", Menlo, monospace',
            fontSize: '11px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#6DF9C6',
            margin: 0,
          }}>
            Growth Intelligence · Painel de Gestão
          </p>
        </div>
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          {[
            { v: '+R$ 75MM', l: 'em pipeline' },
            { v: '+R$ 850k', l: 'mídia gerenciada' },
            { v: '+25k', l: 'conteúdos' },
          ].map((s) => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: '"IBM Plex Mono", "SF Mono", Menlo, monospace',
                fontSize: '20px',
                fontWeight: 600,
                color: '#6DF9C6',
              }}>{s.v}</div>
              <div style={{
                fontSize: '11px',
                color: 'rgba(231, 231, 231, 0.45)',
                marginTop: '2px',
              }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick access */}
      <h2 style={{
        fontFamily: '"IBM Plex Mono", "SF Mono", Menlo, monospace',
        fontSize: '11px',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'rgba(109, 249, 198, 0.5)',
        marginBottom: '16px',
        fontWeight: 400,
      }}>
        Acesso rápido
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '12px',
      }}>
        {COLLECTIONS.map((c) => (
          <a
            key={c.href}
            href={c.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#032230',
              border: '1px solid rgba(109, 249, 198, 0.1)',
              borderRadius: '8px',
              padding: '14px 18px',
              textDecoration: 'none',
              color: '#e7e7e7',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.borderColor = `${c.color}40`
              el.style.background = '#06293a'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.borderColor = 'rgba(109, 249, 198, 0.1)'
              el.style.background = '#032230'
            }}
          >
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: c.color,
              flexShrink: 0,
            }} />
            {c.label}
          </a>
        ))}
      </div>
    </div>
  )
}
