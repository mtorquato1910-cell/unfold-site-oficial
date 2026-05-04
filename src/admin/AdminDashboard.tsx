'use client'

import React from 'react'
import Link from 'next/link'

const KPI_CARDS = [
  {
    label: 'Posts Publicados',
    value: '—',
    sub: 'artigos no blog',
    href: '/admin/collections/posts',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 3h14v14H3V3zm3 4h8M6 10h8M6 13h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    color: '#6DF9C6',
  },
  {
    label: 'Leads Ativos',
    value: '—',
    sub: 'na plataforma',
    href: '/admin/collections/leads',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="6" r="3" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    color: '#93BAFB',
  },
  {
    label: 'Diagnósticos',
    value: '—',
    sub: 'resultados recebidos',
    href: '/admin/collections/diagnostico-results',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 13l4-6 3.5 4 2.5-5L17 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="2.5" y="2.5" width="15" height="15" rx="2" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
    color: '#a78bfa',
  },
  {
    label: 'Cases Publicados',
    value: '—',
    sub: 'no portfólio',
    href: '/admin/collections/cases',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2l2.4 4.8 5.3.8L14 11.1l.9 5.4L10 14l-4.9 2.5.9-5.4L2.3 7.6l5.3-.8L10 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    ),
    color: '#fbbf24',
  },
]

const RECENT_CONTENT = [
  { title: 'Como estruturar um funil B2B de alta conversão', status: 'publicado', time: 'há 2 dias', href: '/admin/collections/posts' },
  { title: 'Growth Intelligence: o que é e por que importa', status: 'rascunho', time: 'há 4 dias', href: '/admin/collections/posts' },
  { title: 'Case — Grupo Luiz Jatobá', status: 'publicado', time: 'há 6 dias', href: '/admin/collections/cases' },
  { title: 'Guia completo de CRM para times de vendas', status: 'rascunho', time: 'há 1 sem', href: '/admin/collections/posts' },
  { title: 'Automação de marketing: onde começar', status: 'publicado', time: 'há 2 sem', href: '/admin/collections/posts' },
]

const RECENT_LEADS = [
  { name: 'Ana Carolina S.', company: 'Inove Engenharia', source: 'Diagnóstico', time: 'há 1h', href: '/admin/collections/leads' },
  { name: 'Roberto M.', company: 'OFM Systems', source: 'Formulário', time: 'há 3h', href: '/admin/collections/leads' },
  { name: 'Fernanda L.', company: 'Mesha Tecnologia', source: 'Calculadora', time: 'há 5h', href: '/admin/collections/leads' },
  { name: 'Carlos A.', company: 'Grupo Maqnelson', source: 'Diagnóstico', time: 'há 1 dia', href: '/admin/collections/leads' },
  { name: 'Juliana B.', company: 'Vertical Locações', source: 'Formulário', time: 'há 2 dias', href: '/admin/collections/leads' },
]

const STATUS_COLOR: Record<string, string> = {
  publicado: '#6DF9C6',
  rascunho: '#fbbf24',
  revisão: '#93BAFB',
}

const SOURCE_COLOR: Record<string, string> = {
  Diagnóstico: '#93BAFB',
  Formulário: '#6DF9C6',
  Calculadora: '#a78bfa',
}

export function AdminDashboard() {
  return (
    <div
      style={{
        padding: '0 0 48px 0',
        maxWidth: '1200px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        {KPI_CARDS.map((card) => (
          <a
            key={card.label}
            href={card.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: '#032230',
              border: `1px solid ${card.color}18`,
              borderRadius: '12px',
              padding: '20px 22px',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.borderColor = `${card.color}35`
              el.style.transform = 'translateY(-2px)'
              el.style.boxShadow = `0 8px 24px rgba(0,0,0,0.2)`
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.borderColor = `${card.color}18`
              el.style.transform = 'translateY(0)'
              el.style.boxShadow = 'none'
            }}
          >
            {/* Background glow */}
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '100px',
                height: '100px',
                background: `radial-gradient(circle, ${card.color}12 0%, transparent 70%)`,
                borderRadius: '50%',
                pointerEvents: 'none',
              }}
            />

            {/* Icon */}
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: `${card.color}14`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: card.color,
                marginBottom: '14px',
                flexShrink: 0,
              }}
            >
              {card.icon}
            </div>

            {/* Label */}
            <p
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '9px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'rgba(231,231,231,0.4)',
                margin: '0 0 6px 0',
              }}
            >
              {card.label}
            </p>

            {/* Value */}
            <p
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: card.color,
                margin: '0 0 4px 0',
                fontFamily: '"IBM Plex Mono", monospace',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              {card.value}
            </p>

            {/* Sub */}
            <p
              style={{
                fontSize: '11px',
                color: 'rgba(231,231,231,0.35)',
                margin: 0,
              }}
            >
              {card.sub}
            </p>
          </a>
        ))}
      </div>

      {/* ── Activity panels ───────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '14px',
        }}
      >
        {/* Panel: Conteúdo recente */}
        <div
          style={{
            background: '#032230',
            border: '1px solid rgba(109,249,198,0.08)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(109,249,198,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(109,249,198,0.5)',
              }}
            >
              Atividade Recente — Conteúdo
            </span>
            <Link
              href="/admin/collections/posts"
              style={{
                fontSize: '11px',
                color: 'rgba(231,231,231,0.4)',
                textDecoration: 'none',
              }}
            >
              Ver todos →
            </Link>
          </div>

          <div>
            {RECENT_CONTENT.map((item, i) => (
              <a
                key={i}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 20px',
                  borderBottom: i < RECENT_CONTENT.length - 1 ? '1px solid rgba(109,249,198,0.04)' : 'none',
                  textDecoration: 'none',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(109,249,198,0.03)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: '13px',
                      color: '#e7e7e7',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.title}
                  </p>
                  <p
                    style={{
                      fontSize: '11px',
                      color: 'rgba(231,231,231,0.35)',
                      margin: '2px 0 0 0',
                    }}
                  >
                    {item.time}
                  </p>
                </div>
                <span
                  style={{
                    flexShrink: 0,
                    fontSize: '10px',
                    fontFamily: '"IBM Plex Mono", monospace',
                    padding: '3px 8px',
                    borderRadius: '20px',
                    background: `${STATUS_COLOR[item.status] ?? '#93BAFB'}18`,
                    color: STATUS_COLOR[item.status] ?? '#93BAFB',
                    border: `1px solid ${STATUS_COLOR[item.status] ?? '#93BAFB'}30`,
                    letterSpacing: '0.05em',
                  }}
                >
                  {item.status}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Panel: Leads recentes */}
        <div
          style={{
            background: '#032230',
            border: '1px solid rgba(109,249,198,0.08)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(109,249,198,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(147,186,251,0.5)',
              }}
            >
              Atividade Recente — Leads
            </span>
            <Link
              href="/admin/collections/leads"
              style={{
                fontSize: '11px',
                color: 'rgba(231,231,231,0.4)',
                textDecoration: 'none',
              }}
            >
              Ver todos →
            </Link>
          </div>

          <div>
            {RECENT_LEADS.map((lead, i) => (
              <a
                key={i}
                href={lead.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 20px',
                  borderBottom: i < RECENT_LEADS.length - 1 ? '1px solid rgba(109,249,198,0.04)' : 'none',
                  textDecoration: 'none',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(109,249,198,0.03)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    flexShrink: 0,
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(147,186,251,0.1)',
                    border: '1px solid rgba(147,186,251,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#93BAFB',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  {lead.name.split(' ').slice(0, 2).map((n) => n[0]).join('')}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: '13px',
                      color: '#e7e7e7',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {lead.name}
                  </p>
                  <p
                    style={{
                      fontSize: '11px',
                      color: 'rgba(231,231,231,0.35)',
                      margin: '2px 0 0 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {lead.company} · {lead.time}
                  </p>
                </div>

                <span
                  style={{
                    flexShrink: 0,
                    fontSize: '10px',
                    fontFamily: '"IBM Plex Mono", monospace',
                    padding: '3px 8px',
                    borderRadius: '20px',
                    background: `${SOURCE_COLOR[lead.source] ?? '#6DF9C6'}18`,
                    color: SOURCE_COLOR[lead.source] ?? '#6DF9C6',
                    border: `1px solid ${SOURCE_COLOR[lead.source] ?? '#6DF9C6'}30`,
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {lead.source}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick actions bar ────────────────────────────────────────────── */}
      <div
        style={{
          marginTop: '14px',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        {[
          { label: '+ Novo Post', href: '/admin/collections/posts/create', color: '#6DF9C6' },
          { label: '+ Novo Case', href: '/admin/collections/cases/create', color: '#93BAFB' },
          { label: 'Ver Leads', href: '/admin/collections/leads', color: '#a78bfa' },
          { label: 'Configurações', href: '/admin/globals/site-settings', color: '#fbbf24' },
        ].map((action) => (
          <a
            key={action.href}
            href={action.href}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '8px 16px',
              background: `${action.color}0e`,
              border: `1px solid ${action.color}25`,
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 500,
              color: action.color,
              textDecoration: 'none',
              transition: 'all 0.12s ease',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.background = `${action.color}1a`
              el.style.borderColor = `${action.color}45`
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.background = `${action.color}0e`
              el.style.borderColor = `${action.color}25`
            }}
          >
            {action.label}
          </a>
        ))}
      </div>
    </div>
  )
}
