'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/(painel)/admin/login/actions'
import {
  LayoutDashboard, FileText, Briefcase, MessageSquareQuote,
  FolderTree, ImageIcon, Users, ClipboardList,
  HelpCircle, Sparkles, Bot,
  Settings, UserCog, Activity, LogOut, Search, Bell, Command, ChevronRight,
} from 'lucide-react'

type NavItem = { href: string; label: string; icon: React.ElementType; exact?: boolean; adminOnly?: boolean }
type Section = { label: string; items: NavItem[] }

const sections: Section[] = [
  {
    label: 'Geral',
    items: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true }],
  },
  {
    label: 'Conteúdo',
    items: [
      { href: '/admin/posts', label: 'Posts / Blog', icon: FileText },
      { href: '/admin/cases', label: 'Cases', icon: Briefcase },
      { href: '/admin/testimonials', label: 'Depoimentos', icon: MessageSquareQuote },
      { href: '/admin/categories', label: 'Categorias', icon: FolderTree },
      { href: '/admin/media', label: 'Mídia', icon: ImageIcon },
    ],
  },
  {
    label: 'Leads & CRM',
    items: [
      { href: '/admin/leads', label: 'Leads', icon: Users },
      { href: '/admin/diagnostico', label: 'Diagnósticos', icon: ClipboardList },
      { href: '/admin/quiz', label: 'Questões do Quiz', icon: HelpCircle },
      { href: '/admin/insights', label: 'Variações de Insights', icon: Sparkles },
      { href: '/admin/prompts', label: 'Prompts de IA', icon: Bot },
    ],
  },
  {
    label: 'Configurações',
    items: [
      { href: '/admin/settings', label: 'Configurações do Site', icon: Settings, adminOnly: true },
      { href: '/admin/users', label: 'Usuários', icon: UserCog, adminOnly: true },
      { href: '/admin/audit', label: 'Log de Auditoria', icon: Activity, adminOnly: true },
    ],
  },
]

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      className="group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-all duration-200"
      style={isActive
        ? { background: 'linear-gradient(90deg, hsl(158 92% 70% / 0.14) 0%, hsl(158 92% 70% / 0.04) 100%)', color: 'hsl(158 92% 80%)', boxShadow: 'inset 0 0 0 0.5px hsl(158 92% 70% / 0.2)' }
        : { color: 'hsl(0 0% 91% / 0.6)' }
      }
    >
      <Icon
        className="h-[15px] w-[15px] shrink-0 transition-transform"
        style={{ color: isActive ? 'hsl(158 92% 70%)' : 'inherit' }}
        strokeWidth={1.75}
      />
      <span className="font-medium">{item.label}</span>
      {isActive && (
        <span
          className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full"
          style={{ background: 'hsl(158 92% 70%)', boxShadow: '0 0 8px hsl(158 92% 70% / 0.6)' }}
        />
      )}
    </Link>
  )
}

export default function PainelLayout({
  children,
  user,
}: {
  children: React.ReactNode
  user: { email: string; role: string; name?: string } | null
}) {
  const pathname = usePathname()
  const allItems = sections.flatMap((s) => s.items)
  const currentItem = allItems.find((i) =>
    i.exact ? pathname === i.href : pathname.startsWith(i.href)
  )
  const isAdmin = user?.role === 'admin'

  return (
    <div
      className="painel-root flex min-h-screen bg-aurora noise relative"
      style={{ background: 'hsl(194 100% 8%)' }}
    >
      {/* Sidebar */}
      <aside
        className="hidden md:flex sticky top-0 h-screen flex-col z-20"
        style={{
          width: 260,
          borderRight: '1px solid hsl(158 92% 70% / 0.1)',
          background: 'hsl(197 100% 6% / 0.8)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Brand */}
        <div
          className="flex items-center gap-3 px-5 py-5"
          style={{ borderBottom: '1px solid hsl(158 92% 70% / 0.1)' }}
        >
          <div className="relative shrink-0">
            <div
              className="absolute inset-0 rounded-xl"
              style={{ background: 'hsl(158 92% 70% / 0.3)', filter: 'blur(8px)' }}
            />
            <div
              className="relative flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden ring-1"
              style={{ background: 'hsl(158 92% 70% / 0.15)', borderColor: 'hsl(158 92% 70% / 0.3)' }}
            >
              <Image src="/logo.jpeg" alt="Unfold" width={36} height={36} className="object-cover" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold leading-tight tracking-tight" style={{ color: 'hsl(0 0% 91%)' }}>
              Unfold Growth
            </div>
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-dim mt-0.5">
              Admin Console
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {sections.map((section) => {
            const visible = section.items.filter((i) => !i.adminOnly || isAdmin)
            if (visible.length === 0) return null
            return (
              <div key={section.label}>
                <div className="px-3 pb-2 font-mono text-[9px] uppercase tracking-[0.22em]"
                     style={{ color: 'hsl(0 0% 91% / 0.4)' }}>
                  {section.label}
                </div>
                <nav className="flex flex-col gap-0.5">
                  {visible.map((item) => {
                    const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
                    return <NavLink key={item.href} item={item} isActive={isActive} />
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
                className="relative flex h-8 w-8 items-center justify-center rounded-full text-[hsl(194_100%_8%)] text-xs font-semibold ring-1"
                style={{ background: 'linear-gradient(135deg, hsl(158 92% 70%) 0%, hsl(158 92% 60%) 100%)', borderColor: 'hsl(158 92% 70% / 0.3)' }}
              >
                {(user?.email?.[0] ?? 'U').toUpperCase()}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-medium" style={{ color: 'hsl(0 0% 91%)' }}>
                {user?.name || user?.email?.split('@')[0]}
              </div>
              <div className="font-mono text-[9px] uppercase tracking-[0.18em]"
                   style={{ color: 'hsl(158 92% 70% / 0.8)' }}>
                {user?.role ?? '—'}
              </div>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-md p-1.5 transition"
                style={{ color: 'hsl(0 0% 91% / 0.5)' }}
                title="Sair"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main */}
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
            borderBottom: '1px solid hsl(158 92% 70% / 0.1)',
            background: 'hsl(194 100% 8% / 0.7)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[12px] min-w-0">
            <span className="font-mono uppercase tracking-[0.18em] text-[10px] text-dim">Unfold</span>
            <ChevronRight className="h-3 w-3 text-dim shrink-0" />
            <span className="font-medium truncate" style={{ color: 'hsl(0 0% 91%)' }}>
              {currentItem?.label ?? 'Dashboard'}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Bell */}
            <button
              className="relative rounded-lg p-2 text-dim-2 transition"
              style={{ color: 'hsl(0 0% 91% / 0.5)' }}
            >
              <Bell className="h-4 w-4" />
              <span
                className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full"
                style={{ background: 'hsl(158 92% 70%)', boxShadow: '0 0 6px hsl(158 92% 70%)' }}
              />
            </button>
          </div>
        </header>

        <main className="flex-1 px-6 py-8 lg:px-10 animate-fade-in relative">
          {children}
        </main>
      </div>
    </div>
  )
}
