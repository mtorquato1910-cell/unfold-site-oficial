'use client'

import React, { useState } from 'react'

const TABS = [
  { id: 'overview', label: 'Visão Geral' },
  { id: 'content', label: 'Conteúdo' },
  { id: 'leads', label: 'Leads & CRM' },
  { id: 'diagnostico', label: 'Diagnóstico' },
  { id: 'settings', label: 'Configurações' },
]

const CONTENT_SECTIONS = [
  {
    title: 'Blog & Insights',
    color: '#6DF9C6',
    items: [
      { label: 'Posts publicados', href: '/admin/collections/posts', icon: '📝', desc: 'Gerenciar artigos do blog' },
      { label: 'Categorias', href: '/admin/collections/categories', icon: '🏷️', desc: 'Organizar por categorias' },
      { label: 'Cases de sucesso', href: '/admin/collections/cases', icon: '🏆', desc: 'Portfólio e resultados' },
    ],
  },
  {
    title: 'Mídia',
    color: '#93BAFB',
    items: [
      { label: 'Biblioteca de Mídia', href: '/admin/collections/media', icon: '🖼️', desc: 'Imagens, vídeos e arquivos' },
    ],
  },
  {
    title: 'IA & Automação',
    color: '#a78bfa',
    items: [
      { label: 'Prompts de IA', href: '/admin/collections/ai-prompts', icon: '🤖', desc: 'Prompts para geração de insights' },
      { label: 'Variações de Insights', href: '/admin/collections/insights-variations', icon: '✨', desc: 'Respostas do diagnóstico' },
    ],
  },
]

const LEADS_SECTIONS = [
  {
    title: 'Captação de Leads',
    color: '#6DF9C6',
    items: [
      { label: 'Todos os Leads', href: '/admin/collections/leads', icon: '👥', desc: 'Base de contatos e prospects' },
    ],
  },
  {
    title: 'Diagnóstico de Growth',
    color: '#93BAFB',
    items: [
      { label: 'Resultados do Diagnóstico', href: '/admin/collections/diagnostico-results', icon: '📊', desc: 'Relatórios gerados pelo quiz' },
      { label: 'Questões do Quiz', href: '/admin/collections/quiz-questions', icon: '❓', desc: 'Editar perguntas e pesos' },
    ],
  },
]

const SETTINGS_SECTIONS = [
  {
    title: 'Site & Global',
    color: '#6DF9C6',
    items: [
      { label: 'Configurações do Site', href: '/admin/globals/site-settings', icon: '⚙️', desc: 'SEO, social, informações globais' },
    ],
  },
  {
    title: 'Sistema',
    color: '#fbbf24',
    items: [
      { label: 'Usuários', href: '/admin/collections/users', icon: '👤', desc: 'Gerenciar acessos ao painel' },
      { label: 'Log de Auditoria', href: '/admin/collections/audit-log', icon: '📋', desc: 'Histórico de alterações' },
    ],
  },
]

const STATS = [
  { value: '+R$ 75MM', label: 'em pipeline gerado', color: '#6DF9C6' },
  { value: '+R$ 850k', label: 'mídia gerenciada', color: '#93BAFB' },
  { value: '+25k', label: 'conteúdos produzidos', color: '#a78bfa' },
  { value: '12+', label: 'empresas atendidas', color: '#6DF9C6' },
]

function SectionGrid({ sections }: { sections: typeof CONTENT_SECTIONS }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {sections.map((section) => (
        <div key={section.title}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
          }}>
            <span style={{
              display: 'block',
              width: '3px',
              height: '14px',
              borderRadius: '2px',
              background: section.color,
              flexShrink: 0,
            }} />
            <span style={{
              fontFamily: '"IBM Plex Mono", "SF Mono", monospace',
              fontSize: '10px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: section.color,
              opacity: 0.7,
            }}>
              {section.title}
            </span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '10px',
          }}>
            {section.items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  background: '#032230',
                  border: '1px solid rgba(109, 249, 198, 0.08)',
                  borderRadius: '10px',
                  padding: '16px 18px',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.borderColor = `${section.color}35`
                  el.style.background = '#041c2b'
                  el.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.borderColor = 'rgba(109, 249, 198, 0.08)'
                  el.style.background = '#032230'
                  el.style.transform = 'translateY(0)'
                }}
              >
                <span style={{ fontSize: '20px', lineHeight: 1, flexShrink: 0, marginTop: '1px' }}>{item.icon}</span>
                <div>
                  <div style={{ color: '#e7e7e7', fontSize: '13px', fontWeight: 600, marginBottom: '3px' }}>
                    {item.label}
                  </div>
                  <div style={{ color: 'rgba(231,231,231,0.4)', fontSize: '11px', lineHeight: 1.4 }}>
                    {item.desc}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div style={{ padding: '0 0 64px 0', maxWidth: '1100px' }}>

      {/* ── Header banner ─────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #032230 0%, #041c2b 60%, #06293a 100%)',
        border: '1px solid rgba(109, 249, 198, 0.12)',
        borderRadius: '14px',
        padding: '36px 40px',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Ambient orb */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '280px',
          height: '280px',
          background: 'radial-gradient(circle at center, rgba(109,249,198,0.07) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-40px',
          left: '30%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle at center, rgba(147,186,251,0.06) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
          {/* Logo + title */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                <defs>
                  <linearGradient id="dg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#6DF9C6" />
                    <stop offset="60%" stopColor="#93BAFB" />
                    <stop offset="100%" stopColor="#6b59d0" />
                  </linearGradient>
                </defs>
                <path d="M20 2C30 2 38 10 38 20C38 30 30 38 20 38C10 38 2 30 2 20C2 10 10 2 20 2ZM20 12L12 20L20 28L28 20Z" fill="url(#dg)" fillRule="evenodd" />
              </svg>
              <span style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: '#e7e7e7' }}>
                Unfold Growth
              </span>
            </div>
            <p style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '10px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#6DF9C6',
              opacity: 0.7,
              margin: 0,
            }}>
              Growth Intelligence · Painel de Gestão
            </p>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
            {STATS.map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: s.color,
                  letterSpacing: '-0.01em',
                }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(231,231,231,0.4)', marginTop: '2px', whiteSpace: 'nowrap' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab navigation ────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        gap: '4px',
        borderBottom: '1px solid rgba(109, 249, 198, 0.08)',
        marginBottom: '32px',
        paddingBottom: '0',
      }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? 600 : 400,
              color: activeTab === tab.id ? '#6DF9C6' : 'rgba(231,231,231,0.5)',
              cursor: 'pointer',
              borderBottom: activeTab === tab.id ? '2px solid #6DF9C6' : '2px solid transparent',
              marginBottom: '-1px',
              transition: 'color 0.15s, border-color 0.15s',
              borderRadius: '4px 4px 0 0',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(231,231,231,0.8)'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(231,231,231,0.5)'
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Visão Geral ──────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '40px' }}>
            {[
              { label: 'Novo Post', href: '/admin/collections/posts/create', icon: '✏️', color: '#6DF9C6' },
              { label: 'Ver Leads', href: '/admin/collections/leads', icon: '👥', color: '#93BAFB' },
              { label: 'Diagnósticos', href: '/admin/collections/diagnostico-results', icon: '📊', color: '#a78bfa' },
              { label: 'Novo Case', href: '/admin/collections/cases/create', icon: '🏆', color: '#6DF9C6' },
              { label: 'Mídia', href: '/admin/collections/media', icon: '🖼️', color: '#93BAFB' },
              { label: 'Configurações', href: '/admin/globals/site-settings', icon: '⚙️', color: '#fbbf24' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#032230',
                  border: `1px solid ${item.color}18`,
                  borderRadius: '10px',
                  padding: '14px 16px',
                  textDecoration: 'none',
                  color: '#e7e7e7',
                  fontSize: '13px',
                  fontWeight: 500,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.borderColor = `${item.color}40`
                  el.style.background = '#041c2b'
                  el.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.borderColor = `${item.color}18`
                  el.style.background = '#032230'
                  el.style.transform = 'translateY(0)'
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                {item.label}
              </a>
            ))}
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(109,249,198,0.04) 0%, rgba(147,186,251,0.03) 100%)',
            border: '1px solid rgba(109, 249, 198, 0.08)',
            borderRadius: '10px',
            padding: '20px 24px',
          }}>
            <p style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '10px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(109,249,198,0.4)',
              marginBottom: '8px',
              margin: '0 0 8px 0',
            }}>
              Dica rápida
            </p>
            <p style={{ color: 'rgba(231,231,231,0.6)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
              Use as abas acima para navegar por seções. Leads e diagnósticos chegam automaticamente pelo site.
              Posts publicados aparecem na seção de Insights da página inicial.
            </p>
          </div>
        </div>
      )}

      {/* ── Tab: Conteúdo ─────────────────────────────────────────────────── */}
      {activeTab === 'content' && <SectionGrid sections={CONTENT_SECTIONS} />}

      {/* ── Tab: Leads & CRM ──────────────────────────────────────────────── */}
      {activeTab === 'leads' && (
        <div>
          <SectionGrid sections={LEADS_SECTIONS} />
          <div style={{
            marginTop: '32px',
            background: 'rgba(109,249,198,0.04)',
            border: '1px solid rgba(109,249,198,0.1)',
            borderRadius: '10px',
            padding: '20px 24px',
          }}>
            <p style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '10px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(109,249,198,0.5)',
              margin: '0 0 8px 0',
            }}>
              Integração RD Station
            </p>
            <p style={{ color: 'rgba(231,231,231,0.55)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
              Leads capturados pelo site são sincronizados automaticamente com o RD Station CRM via webhook.
              Diagnósticos geram contatos com as respostas do quiz como campos customizados.
            </p>
          </div>
        </div>
      )}

      {/* ── Tab: Diagnóstico ──────────────────────────────────────────────── */}
      {activeTab === 'diagnostico' && (
        <SectionGrid sections={[
          {
            title: 'Quiz de Diagnóstico',
            color: '#93BAFB',
            items: [
              { label: 'Resultados recebidos', href: '/admin/collections/diagnostico-results', icon: '📊', desc: 'Leads que completaram o quiz' },
              { label: 'Questões do Quiz', href: '/admin/collections/quiz-questions', icon: '❓', desc: 'Editar perguntas, pesos e categorias' },
              { label: 'Variações de Insights', href: '/admin/collections/insights-variations', icon: '✨', desc: 'Textos de recomendação por score' },
              { label: 'Prompts de IA', href: '/admin/collections/ai-prompts', icon: '🤖', desc: 'Prompts para geração de relatórios' },
            ],
          },
        ]} />
      )}

      {/* ── Tab: Configurações ────────────────────────────────────────────── */}
      {activeTab === 'settings' && <SectionGrid sections={SETTINGS_SECTIONS} />}
    </div>
  )
}
