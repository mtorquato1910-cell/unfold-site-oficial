'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_GROUPS = [
  {
    id: 'geral',
    label: 'Geral',
    items: [
      {
        label: 'Dashboard',
        href: '/admin',
        exact: true,
        icon: (
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <rect x="1" y="1" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            <rect x="8.5" y="1" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            <rect x="1" y="8.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
        ),
      },
    ],
  },
  {
    id: 'conteudo',
    label: 'Conteúdo',
    items: [
      {
        label: 'Posts / Blog',
        href: '/admin/collections/posts',
        icon: (
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <rect x="1.5" y="1.5" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M4 5h7M4 7.5h7M4 10h4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        ),
      },
      {
        label: 'Cases',
        href: '/admin/collections/cases',
        icon: (
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M7.5 1.5l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L1.7 5.7l4-.6 1.8-3.6z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
          </svg>
        ),
      },
      {
        label: 'Depoimentos',
        href: '/admin/collections/testimonials',
        icon: (
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M2 2.5h11a1 1 0 011 1v6a1 1 0 01-1 1H8l-3.5 2V10.5H2a1 1 0 01-1-1v-6a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            <path d="M4.5 6h6M4.5 8h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        ),
      },
      {
        label: 'Categorias',
        href: '/admin/collections/categories',
        icon: (
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <rect x="1" y="1" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            <rect x="8.5" y="1" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            <rect x="1" y="8.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
        ),
      },
      {
        label: 'Mídia',
        href: '/admin/collections/media',
        icon: (
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <rect x="1.5" y="2.5" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            <circle cx="5" cy="6" r="1.2" stroke="currentColor" strokeWidth="1.1"/>
            <path d="M2 11l3-3.5 2.5 2.5 2-2L13 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
      },
    ],
  },
  {
    id: 'leads',
    label: 'Leads & CRM',
    items: [
      {
        label: 'Leads',
        href: '/admin/collections/leads',
        icon: (
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="7.5" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M2 13c0-2.5 2.5-4 5.5-4s5.5 1.5 5.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        ),
      },
      {
        label: 'Diagnósticos',
        href: '/admin/collections/diagnostico-results',
        icon: (
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M2 10l3-5 2.5 3 2-4L13 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="1.5" y="1.5" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
        ),
      },
      {
        label: 'Questões do Quiz',
        href: '/admin/collections/quiz-questions',
        icon: (
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M7.5 10.5v.5M7.5 4.5c0 0-2 .5-1.5 2.5.3 1.3 1.5 1.5 1.5 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        ),
      },
      {
        label: 'Variações de Insights',
        href: '/admin/collections/insights-variations',
        icon: (
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M7.5 1.5l1.3 2.6 2.9.4-2.1 2 .5 2.9L7.5 8l-2.6 1.4.5-2.9-2.1-2 2.9-.4L7.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            <path d="M2.5 11.5h10M4 13.5h7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        ),
      },
      {
        label: 'Prompts de IA',
        href: '/admin/collections/ai-prompts',
        icon: (
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M3 3h9a1 1 0 011 1v6a1 1 0 01-1 1H8l-3 2v-2H3a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            <path d="M5 6.5h5M5 8.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        ),
      },
    ],
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    items: [
      {
        label: 'Configurações do Site',
        href: '/admin/globals/site-settings',
        icon: (
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M2.4 2.4l1.1 1.1M11.5 11.5l1.1 1.1M2.4 12.6l1.1-1.1M11.5 3.5l1.1-1.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        ),
      },
      {
        label: 'Usuários',
        href: '/admin/collections/users',
        icon: (
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="5.5" cy="4" r="2" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M1 13c0-2 2-3.5 4.5-3.5S10 11 10 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M11 7.5l1.5 1.5L15 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
      },
      {
        label: 'Log de Auditoria',
        href: '/admin/collections/audit-log',
        icon: (
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <rect x="2" y="1.5" width="11" height="12" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M5 5h5M5 7.5h5M5 10h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        ),
      },
    ],
  },
]

export function AdminNav() {
  const pathname = usePathname()

  const isActive = (href: string, exact = false) => {
    if (exact || href === '/admin') return pathname === '/admin'
    return pathname?.startsWith(href) ?? false
  }

  return (
    <nav
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '8px 0 24px',
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {NAV_GROUPS.map((group, gi) => (
        <div
          key={group.id}
          style={{
            marginBottom: '2px',
            paddingTop: gi === 0 ? '8px' : '4px',
          }}
        >
          {/* Group label */}
          <span
            style={{
              display: 'block',
              padding: '10px 18px 5px',
              fontFamily: '"IBM Plex Mono", "SF Mono", monospace',
              fontSize: '9px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(109,249,198,0.3)',
              userSelect: 'none',
            }}
          >
            {group.label}
          </span>

          {/* Nav items */}
          {group.items.map((item) => {
            const active = isActive(item.href, (item as { exact?: boolean }).exact)
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '9px',
                  padding: '7px 14px 7px 18px',
                  margin: '1px 8px 1px 8px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: active ? 600 : 400,
                  color: active ? '#6DF9C6' : 'rgba(231,231,231,0.6)',
                  background: active
                    ? 'linear-gradient(90deg, rgba(109,249,198,0.12), rgba(109,249,198,0.05))'
                    : 'transparent',
                  borderLeft: active ? '2px solid #6DF9C6' : '2px solid transparent',
                  transition: 'all 0.12s ease',
                  position: 'relative',
                  lineHeight: '1.3',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  paddingLeft: active ? '16px' : '18px',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.color = '#e7e7e7'
                    el.style.background = 'rgba(109,249,198,0.04)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.color = 'rgba(231,231,231,0.6)'
                    el.style.background = 'transparent'
                  }
                }}
              >
                {/* Icon */}
                <span
                  style={{
                    flexShrink: 0,
                    opacity: active ? 1 : 0.55,
                    color: active ? '#6DF9C6' : 'currentColor',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {item.icon}
                </span>

                {item.label}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
