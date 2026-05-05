import { getSession } from '@/lib/painel-auth'
import { getDashboardStats, getRecentLeads, getRecentDiagnosticos } from '@/lib/painel-api'
import PainelLayout from '@/components/painel/PainelLayout'
import { StatCard, GlassCard } from '@/components/painel/ui'
import { Sparkles, ArrowUpRight, FileText, Briefcase, MessageSquareQuote, Users, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function PainelDashboardPage() {
  const user = await getSession()
  if (!user) redirect('/admin/login')

  const [stats, recentLeads, recentDiag] = await Promise.all([
    getDashboardStats(),
    getRecentLeads(5),
    getRecentDiagnosticos(4),
  ])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const name = user.name || user.email.split('@')[0]

  return (
    <PainelLayout user={user}>
      <div className="max-w-7xl">
        {/* Hero */}
        <div className="mb-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] mb-3 flex items-center gap-2"
             style={{ color: 'hsl(158 92% 70% / 0.8)' }}>
            <Sparkles className="h-3 w-3" />
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="font-display text-[44px] sm:text-[52px] font-semibold leading-[1.05]"
              style={{ letterSpacing: '-0.03em', color: 'hsl(0 0% 91%)' }}>
            {greeting},{' '}
            <span className="text-gradient-mint">{name}</span>.
          </h1>
          <p className="mt-3 text-[15px] text-dim-2 max-w-xl leading-relaxed">
            Aqui está o resumo do seu conteúdo, leads e diagnósticos da Unfold Growth.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-10">
          <StatCard label="Posts" value={stats.posts} hint="Blog & artigos" />
          <StatCard label="Cases" value={stats.cases} hint="Histórias de sucesso" />
          <StatCard label="Leads" value={stats.leads} hint="Capturados" />
          <StatCard label="Diagnósticos" value={stats.diagnosticos} hint="Quiz preenchidos" />
          <StatCard label="Depoimentos" value={stats.testimonials} />
          <StatCard label="Prompts IA" value={stats.prompts} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent leads */}
          <GlassCard className="lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-display text-[17px] font-medium" style={{ letterSpacing: '-0.022em', color: 'hsl(0 0% 91%)' }}>
                  Leads recentes
                </h3>
                <p className="text-[12px] text-dim-2 mt-0.5">Últimos contatos capturados pelo site</p>
              </div>
              <Link href="/painel/leads"
                    className="text-[11px] font-medium inline-flex items-center gap-1"
                    style={{ color: 'hsl(158 92% 70%)' }}>
                Ver todos <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            {recentLeads.length === 0 ? (
              <div className="text-center py-12 text-[13px] text-dim">Nenhum lead ainda</div>
            ) : (
              <div style={{ borderTop: '1px solid hsl(0 0% 100% / 0.04)' }}>
                {recentLeads.map((l: any) => (
                  <div key={l.id} className="flex items-center justify-between py-3"
                       style={{ borderBottom: '1px solid hsl(0 0% 100% / 0.04)' }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full text-[hsl(158_92%_70%)] text-xs font-semibold ring-1"
                           style={{ background: 'hsl(158 92% 70% / 0.1)', borderColor: 'hsl(158 92% 70% / 0.2)' }}>
                        {(l.name?.[0] ?? '?').toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium truncate" style={{ color: 'hsl(0 0% 91%)' }}>{l.name}</div>
                        <div className="text-[11px] text-dim truncate">{l.email}</div>
                      </div>
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-wider"
                         style={{ color: 'hsl(158 92% 70% / 0.8)' }}>
                      {l.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Quick actions */}
          <GlassCard>
            <h3 className="font-display text-[17px] font-medium mb-4"
                style={{ letterSpacing: '-0.022em', color: 'hsl(0 0% 91%)' }}>
              Atalhos
            </h3>
            <div className="space-y-1">
              {[
                { icon: FileText, label: 'Posts / Blog', href: '/painel/posts' },
                { icon: Briefcase, label: 'Cases', href: '/painel/cases' },
                { icon: MessageSquareQuote, label: 'Depoimentos', href: '/painel/testimonials' },
                { icon: Users, label: 'Leads', href: '/painel/leads' },
                { icon: ClipboardList, label: 'Diagnósticos', href: '/painel/diagnostico' },
              ].map((s) => (
                <Link key={s.href} href={s.href}
                      className="group flex items-center gap-3 rounded-lg p-2.5 -mx-2.5 transition-all"
                      style={{ color: 'hsl(0 0% 91%)' }}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg ring-1 transition"
                       style={{ background: 'hsl(158 92% 70% / 0.1)', borderColor: 'hsl(158 92% 70% / 0.15)', color: 'hsl(158 92% 70%)' }}>
                    <s.icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </div>
                  <span className="text-[13px] flex-1 font-medium">{s.label}</span>
                  <ArrowUpRight className="h-3 w-3 text-dim opacity-0 group-hover:opacity-100 transition" />
                </Link>
              ))}
            </div>
          </GlassCard>

          {/* Recent diagnostics */}
          <GlassCard className="lg:col-span-3">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-display text-[17px] font-medium" style={{ letterSpacing: '-0.022em', color: 'hsl(0 0% 91%)' }}>
                  Diagnósticos recentes
                </h3>
                <p className="text-[12px] text-dim-2 mt-0.5">Últimos resultados de maturidade</p>
              </div>
              <Link href="/painel/diagnostico"
                    className="text-[11px] font-medium inline-flex items-center gap-1"
                    style={{ color: 'hsl(158 92% 70%)' }}>
                Ver todos <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            {recentDiag.length === 0 ? (
              <div className="text-center py-12 text-[13px] text-dim">Nenhum diagnóstico ainda</div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {recentDiag.map((d: any) => (
                  <div key={d.id} className="rounded-xl p-4 transition"
                       style={{ border: '1px solid hsl(158 92% 70% / 0.1)', background: 'hsl(0 0% 100% / 0.02)' }}>
                    <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-dim mb-2">
                      {d.maturityLevel ?? d.maturity_level ?? '—'}
                    </div>
                    <div className="text-[14px] font-medium truncate" style={{ color: 'hsl(0 0% 91%)' }}>
                      {d.company}
                    </div>
                    <div className="mt-3 flex items-end justify-between">
                      <span className="font-display text-[28px] font-semibold leading-none"
                            style={{ color: 'hsl(158 92% 70%)' }}>
                        {d.score}
                      </span>
                      <span className="font-mono text-[9px] text-dim">
                        {new Date(d.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </PainelLayout>
  )
}
