'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/(painel)/painel/login/actions'
import {
  LayoutDashboard, FileText, Briefcase, MessageSquareQuote,
  FolderTree, Image as ImageIcon, Users, ClipboardList,
  HelpCircle, Sparkles as SparklesIcon, Radar, Megaphone,
  Settings, UserCog, Activity, LogOut, Search, Command, ChevronRight, Flame,
} from 'lucide-react'
import BellDropdown from './BellDropdown'

type Item = { to: string; label: string; icon: any; end?: boolean; admin?: boolean }
type Section = { label: string; items: Item[] }

const sections: Section[] = [
  {
    label: 'Geral',
    items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Conteúdo',
    items: [
      { to: '/admin/posts', label: 'Posts / Blog', icon: FileText },
      { to: '/admin/cases', label: 'Cases', icon: Briefcase },
      { to: '/admin/testimonials', label: 'Depoimentos', icon: MessageSquareQuote },
      { to: '/admin/banners', label: 'Banners', icon: Megaphone },
      { to: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
      { to: '/admin/categories', label: 'Categorias', icon: FolderTree },
      { to: '/admin/media', label: 'Mídia', icon: ImageIcon },
    ],
  },
  {
    label: 'Leads & CRM',
    items: [
      { to: '/admin/leads', label: 'Leads', icon: Users },
      { to: '/admin/heatmap', label: 'Mapa de Calor', icon: Flame },
      { to: '/admin/diagnostico', label: 'Diagnósticos', icon: ClipboardList },
      { to: '/admin/mapa-icp', label: 'Radar de Comitê', icon: Radar },
      { to: '/admin/calculadora', label: 'Calculadora', icon: ClipboardList },
      { to: '/admin/quiz', label: 'Questões do Quiz', icon: HelpCircle },
      { to: '/admin/insights', label: 'Variações de Insights', icon: SparklesIcon },
    ],
  },
  {
    label: 'Configurações',
    items: [
      { to: '/admin/home-config', label: 'Home (Hero + Stats + Logos)', icon: Settings, admin: true },
      { to: '/admin/site-config', label: 'Site (contato + redes)', icon: Settings, admin: true },
      { to: '/admin/users', label: 'Usuários', icon: UserCog, admin: true },
      { to: '/admin/audit', label: 'Log de Auditoria', icon: Activity, admin: true },
    ],
  },
]

function cx(...args: (string | false | null | undefined)[]) {
  return args.filter(Boolean).join(' ')
}

export default function PainelLayout({
  children,
  user,
}: {
  children: React.ReactNode
  user: { email: string; role: string; name?: string } | null
}) {
  const pathname = usePathname()
  const role = user?.role
  const allItems = sections.flatMap((s) => s.items)
  const currentItem = allItems.find((i) =>
    i.end ? pathname === i.to : pathname.startsWith(i.to)
  )

  return (
    <div className="painel-root flex min-h-screen bg-aurora noise relative">
      {/* ============ Sidebar ============ */}
      <aside
        className="hidden md:flex sticky top-0 h-screen w-[260px] flex-col z-20"
        style={{
          background: 'hsl(197 100% 6% / 0.8)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRight: '1px solid hsl(158 92% 70% / 0.1)',
        }}
      >
        {/* Brand */}
        <div
          className="flex items-center gap-3 px-5 py-5"
          style={{ borderBottom: '1px solid hsl(158 92% 70% / 0.1)' }}
        >
          <div className="relative h-9 w-9 rounded-xl overflow-hidden ring-1 shrink-0" style={{ borderColor: 'hsl(158 92% 70% / 0.3)' }}>
            <Image src="/logo-unfold.jpeg" alt="Unfold" fill className="object-cover" />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold leading-tight text-fg">Unfold Growth</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-dim mt-0.5">
              Admin Console
            </div>
          </div>
        </div>

        {/* Nav sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {sections.map((section) => {
            const visible = section.items.filter((i) => !i.admin || role === 'admin')
            if (visible.length === 0) return null
            return (
              <div key={section.label}>
                <div className="px-3 pb-2 font-mono text-[9px] uppercase tracking-[0.22em] text-dim">
                  {section.label}
                </div>
                <nav className="flex flex-col gap-0.5">
                  {visible.map((item) => {
                    const isActive = item.end ? pathname === item.to : pathname.startsWith(item.to)
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.to}
                        href={item.to}
                        className={cx(
                          'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-all duration-200',
                          isActive ? 'nav-active' : 'nav-idle'
                        )}
                      >
                        <Icon
                          className="h-[15px] w-[15px] shrink-0"
                          style={{ color: isActive ? 'hsl(158 92% 70%)' : 'currentColor' }}
                          strokeWidth={1.75}
                        />
                        <span className="font-medium">{item.label}</span>
                        {isActive && (
                          <span
                            className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full"
                            style={{
                              background: 'hsl(158 92% 70%)',
                              boxShadow: '0 0 8px hsl(158 92% 70% / 0.6)',
                            }}
                          />
                        )}
                      </Link>
                    )
                  })}
                </nav>
              </div>
            )
          })}
        </div>

        {/* User card */}
        <div className="p-3" style={{ borderTop: '1px solid hsl(158 92% 70% / 0.1)' }}>
          <div className="glass flex items-center gap-3 rounded-xl p-2.5">
            <div className="relative shrink-0">
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: 'hsl(158 92% 70% / 0.3)', filter: 'blur(4px)' }}
              />
              <div
                className="relative flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
                style={{
                  background: 'linear-gradient(135deg, hsl(158 92% 70%) 0%, hsl(158 92% 60%) 100%)',
                  color: 'hsl(194 100% 8%)',
                  border: '1px solid hsl(158 92% 70% / 0.3)',
                }}
              >
                {(user?.email?.[0] ?? 'U').toUpperCase()}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-medium text-fg">
                {user?.name || user?.email?.split('@')[0]}
              </div>
              <div
                className="font-mono text-[9px] uppercase tracking-[0.18em]"
                style={{ color: 'hsl(158 92% 70% / 0.8)' }}
              >
                {role ?? '—'}
              </div>
            </div>
            <form action={logoutAction}>
              <button type="submit" className="icon-btn rounded-md p-1.5" title="Sair">
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* ============ Main ============ */}
      <div className="flex min-w-0 flex-1 flex-col relative">
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute -top-40 right-0 h-[400px] w-[400px] rounded-full"
          style={{ background: 'hsl(158 92% 70% / 0.06)', filter: 'blur(120px)' }}
        />

        {/* Header */}
        <header
          className="sticky top-0 z-10 flex h-14 items-center gap-4 px-6"
          style={{
            background: 'hsl(194 100% 8% / 0.7)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid hsl(158 92% 70% / 0.1)',
          }}
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[12px] min-w-0">
            <span className="font-mono uppercase tracking-[0.18em] text-[10px] text-dim">Unfold</span>
            <ChevronRight className="h-3 w-3 text-dim shrink-0" />
            <span className="font-medium truncate text-fg">{currentItem?.label ?? 'Dashboard'}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Search */}
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dim" />
              <input
                placeholder="Buscar…"
                className="h-8 w-72 pl-9 pr-12 text-[12px] rounded-lg"
                style={{
                  background: 'hsl(0 0% 100% / 0.03)',
                  border: '1px solid hsl(158 92% 70% / 0.1)',
                  color: 'hsl(0 0% 91%)',
                }}
              />
              <kbd
                className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-mono text-[9px]"
                style={{
                  border: '1px solid hsl(0 0% 100% / 0.1)',
                  background: 'hsl(0 0% 100% / 0.04)',
                  color: 'hsl(0 0% 91% / 0.42)',
                }}
              >
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </div>
            {/* Bell + dropdown */}
            <BellDropdown />
          </div>
        </header>

        <main className="flex-1 px-6 py-8 lg:px-10 animate-fade-in relative">
          {children}
        </main>
      </div>
    </div>
  )
}
