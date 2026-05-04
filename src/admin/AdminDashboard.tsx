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
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1.5" y="1.5" width="15" height="15" rx="2" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M4.5 6h9M4.5 9h9M4.5 12h5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
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
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M2.5 16c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
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
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2.5 12l4-6 3.5 4 2.5-5L16.5 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.4"/>
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
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2l2.2 4.5 5 .7-3.6 3.5 0.85 4.95L9 13.3l-4.45 2.35.85-4.95-3.6-3.5 5-.7L9 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    ),
    color: '#fbbf24',
  },
  {
    label: 'Depoimentos',
    value: '—',
    sub: 'cadastrados',
    href: '/admin/collections/testimonials',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 3h14a1 1 0 011 1v8a1 1 0 01-1 1H9.5l-4 2.5V13H2a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M5 7.5h8M5 10h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    color: '#fb923c',
  },
]

const STATUS_COLOR: Record<string, string> = {
  publicado: '#6DF9C6',
  published: '#6DF9C6',
  rascunho: '#fbbf24',
  draft: '#fbbf24',
  pending_review: '#93BAFB',
  revisão: '#93BAFB',
}

const STATUS_LABEL: Record<string, string> = {
  publicado: 'publicado',
  published: 'publicado',
  rascunho: 'rascunho',
  draft: 'rascunho',
  pending_review: 'revisão',
}

const SOURCE_COLOR: Record<string, string> = {
  Diagnóstico: '#93BAFB',
  Formulário: '#6DF9C6',
  Calculadora: '#a78bfa',
}

const QUICK_ACTIONS = [
  { label: '+ Novo Post', href: '/admin/collections/posts/create', color: '#6DF9C6' },
  { label: '+ Novo Case', href: '/admin/collections/cases/create', color: '#93BAFB' },
  { label: '+ Depoimento', href: '/admin/collections/testimonials/create', color: '#fb923c' },
  { label: 'Ver Leads', href: '/admin/collections/leads', color: '#a78bfa' },
  { label: 'Aguardando Revisão', href: '/admin/collections/posts?where[status][equals]=pending_review', color: '#fbbf24' },
  { label: 'Configurações', href: '/admin/globals/site-settings', color: '#e7e7e7' },
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function AdminDashboard() {
  return (
    <div
      style={{
        padding: '0 0 56px 0',
        maxWidth: '1200px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* ── Welcome banner ──────────────────────────────────────────────── */}
      <div
        style={{
          marginBottom: '28px',
          padding: '22px 28px',
          background: 'linear-gradient(135deg, rgba(109,249,198,0.07) 0%, rgba(147,186,251,0.05) 100%)',
          border: '1px solid rgba(109,249,198,0.12)',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <p
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '10px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(109,249,198,0.5)',
              margin: '0 0 6px 0',
            }}
          >
            Unfold Growth — Admin
          </p>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#e7e7e7',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            {getGreeting()}! Gerencie o crescimento da Unfold.
          </h2>
        </div>
        <a
          href="/admin/globals/site-settings"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 18px',
            background: 'rgba(109,249,198,0.1)',
            border: '1px solid rgba(109,249,198,0.25)',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 500,
            color: '#6DF9C6',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="6.5" cy="6.5" r="1.8" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M6.5 1v1.2M6.5 10.8V12M1 6.5h1.2M10.8 6.5H12M2.1 2.1l.85.85M10.05 10.05l.85.85M2.1 10.9l.85-.85M10.05 2.95l.85-.85" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          Configurações do Site
        </a>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
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
              padding: '18px 20px',
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
              el.style.boxShadow = `0 8px 24px rgba(0,0,0,0.2), 0 0 0 1px ${card.color}20`
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
                top: '-24px',
                right: '-24px',
                width: '96px',
                height: '96px',
                background: `radial-gradient(circle, ${card.color}10 0%, transparent 70%)`,
                borderRadius: '50%',
                pointerEvents: 'none',
              }}
            />

            {/* Icon */}
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '9px',
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
                color: 'rgba(231,231,231,0.38)',
                margin: '0 0 5px 0',
              }}
            >
              {card.label}
            </p>

            {/* Value */}
            <p
              style={{
                fontSize: '26px',
                fontWeight: 700,
                color: card.color,
                margin: '0 0 3px 0',
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
                color: 'rgba(231,231,231,0.32)',
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        {/* Panel: Posts aguardando revisão */}
        <div
          style={{
            background: '#032230',
            border: '1px solid rgba(147,186,251,0.1)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid rgba(147,186,251,0.07)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '9px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(147,186,251,0.55)',
              }}
            >
              Posts — Aguardando Aprovação
            </span>
            <a
              href="/admin/collections/posts?where[status][equals]=pending_review"
              style={{ fontSize: '11px', color: 'rgba(231,231,231,0.35)', textDecoration: 'none' }}
            >
              Ver todos →
            </a>
          </div>
          <div style={{ padding: '8px 0' }}>
            <div style={{ padding: '28px 18px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'rgba(231,231,231,0.3)', margin: 0 }}>
                Nenhum post aguardando revisão.
              </p>
            </div>
          </div>
        </div>

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
              padding: '14px 18px',
              borderBottom: '1px solid rgba(109,249,198,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '9px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(109,249,198,0.5)',
              }}
            >
              Atividade — Conteúdo
            </span>
            <a
              href="/admin/collections/posts"
              style={{ fontSize: '11px', color: 'rgba(231,231,231,0.35)', textDecoration: 'none' }}
            >
              Ver todos →
            </a>
          </div>
          <div>
            {[
              { title: 'Publicar novo post', status: 'draft', time: 'Adicione conteúdo', href: '/admin/collections/posts/create' },
              { title: 'Criar um novo case de sucesso', status: 'draft', time: 'Mostre resultados', href: '/admin/collections/cases/create' },
              { title: 'Adicionar depoimento de cliente', status: 'draft', time: 'Prova social', href: '/admin/collections/testimonials/create' },
            ].map((item, i) => (
              <a
                key={i}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 18px',
                  borderBottom: i < 2 ? '1px solid rgba(109,249,198,0.04)' : 'none',
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
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#6DF9C6',
                    opacity: 0.4,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', color: '#e7e7e7', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </p>
                  <p style={{ fontSize: '11px', color: 'rgba(231,231,231,0.3)', margin: '2px 0 0 0' }}>
                    {item.time}
                  </p>
                </div>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: 'rgba(231,231,231,0.2)', flexShrink: 0 }}>
                  <path d="M2.5 6h7M7 3.5L9.5 6 7 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick actions bar ────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        {QUICK_ACTIONS.map((action) => (
          <a
            key={action.href}
            href={action.href}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '7px 14px',
              background: `${action.color}0c`,
              border: `1px solid ${action.color}22`,
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 500,
              color: action.color,
              textDecoration: 'none',
              transition: 'all 0.12s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.background = `${action.color}18`
              el.style.borderColor = `${action.color}40`
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.background = `${action.color}0c`
              el.style.borderColor = `${action.color}22`
            }}
          >
            {action.label}
          </a>
        ))}
      </div>
    </div>
  )
}
