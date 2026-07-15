'use client'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { Flame, Eye, Users, MousePointerClick, UserCheck, ArrowRight } from 'lucide-react'
import { PageHeader, StatCard, GlassCard, EmptyState } from '@/components/painel/ui'
import HeatmapSection from '@/components/admin/heatmap/HeatmapSection'

// Tipos espelhados de painel-api (definidos inline p/ não puxar código server no bundle client).
interface Journey {
  sessionId: string
  leadHash: string | null
  pages: string[]
  pageCount: number
  clickCount: number
  last: string
}
interface HeatmapData {
  totals: { pageviews: number; clicks: number; sessions: number; leads: number }
  byDay: { date: string; views: number }[]
  topPages: { path: string; views: number }[]
  topClicks: { element: string; count: number }[]
  journeys: Journey[]
  hasData: boolean
}

const MINT = 'hsl(158 92% 70%)'

function shortId(id: string) {
  return id.replace(/[^a-z0-9]/gi, '').slice(-4).toUpperCase()
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export default function HeatmapClient({
  data,
}: {
  data: HeatmapData
}) {
  const maxPage = Math.max(1, ...data.topPages.map((p) => p.views))
  const maxClick = Math.max(1, ...data.topClicks.map((c) => c.count))

  return (
    <div>
      <PageHeader
        eyebrow="Analytics · últimos 14 dias"
        title="Mapa de Calor"
        description="Por onde leads e visitantes passam no site — jornada por ID (sem nome), páginas mais vistas e cliques, com o overlay visual de calor sobre cada página."
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Visitas (pageviews)" value={data.totals.pageviews.toLocaleString('pt-BR')} hint="Páginas carregadas" />
        <StatCard label="Sessões" value={data.totals.sessions.toLocaleString('pt-BR')} hint="Visitantes únicos por aba" />
        <StatCard label="Leads identificados" value={data.totals.leads.toLocaleString('pt-BR')} hint="Cruzados por ID (hash)" />
        <StatCard label="Cliques" value={data.totals.clicks.toLocaleString('pt-BR')} hint="Interações capturadas" />
      </div>

      {!data.hasData ? (
        <EmptyState
          icon={Flame}
          title="Ainda sem dados de navegação"
          description="Assim que os visitantes navegarem pelo site (com o tracker no ar em produção), os indicadores, jornadas e cliques aparecem aqui automaticamente."
        />
      ) : (
        <>
          {/* Volume por dia */}
          <GlassCard className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-4 w-4 text-mint" strokeWidth={1.75} />
              <h3 className="font-display text-[15px] font-semibold text-fg">Visitas por dia</h3>
            </div>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <AreaChart data={data.byDay} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={MINT} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={MINT} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(158 92% 70% / 0.08)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: 'hsl(0 0% 91% / 0.5)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(0 0% 91% / 0.5)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(197 100% 6%)',
                      border: '1px solid hsl(158 92% 70% / 0.2)',
                      borderRadius: 12,
                      color: 'hsl(0 0% 91%)',
                      fontSize: 12,
                    }}
                    labelStyle={{ color: 'hsl(158 92% 70%)' }}
                  />
                  <Area type="monotone" dataKey="views" stroke={MINT} strokeWidth={2} fill="url(#fillViews)" name="Visitas" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Top páginas + Top cliques */}
          <div className="grid lg:grid-cols-2 gap-4 mb-8">
            <GlassCard>
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-4 w-4 text-mint" strokeWidth={1.75} />
                <h3 className="font-display text-[15px] font-semibold text-fg">Páginas mais vistas</h3>
              </div>
              <div className="space-y-2.5">
                {data.topPages.map((p) => (
                  <div key={p.path}>
                    <div className="flex items-center justify-between text-[12px] mb-1">
                      <span className="truncate text-dim-2 mr-2" title={p.path}>{p.path || '/'}</span>
                      <span className="font-mono text-fg shrink-0">{p.views}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(0 0% 100% / 0.05)' }}>
                      <div className="h-full rounded-full" style={{ width: `${(p.views / maxPage) * 100}%`, background: MINT }} />
                    </div>
                  </div>
                ))}
                {data.topPages.length === 0 && <p className="text-[12px] text-dim">Sem pageviews ainda.</p>}
              </div>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center gap-2 mb-4">
                <MousePointerClick className="h-4 w-4 text-mint" strokeWidth={1.75} />
                <h3 className="font-display text-[15px] font-semibold text-fg">Elementos mais clicados</h3>
              </div>
              <div className="space-y-2.5">
                {data.topClicks.map((c) => (
                  <div key={c.element}>
                    <div className="flex items-center justify-between text-[12px] mb-1">
                      <span className="truncate text-dim-2 mr-2" title={c.element}>{c.element}</span>
                      <span className="font-mono text-fg shrink-0">{c.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(0 0% 100% / 0.05)' }}>
                      <div className="h-full rounded-full" style={{ width: `${(c.count / maxClick) * 100}%`, background: 'hsl(217 93% 78%)' }} />
                    </div>
                  </div>
                ))}
                {data.topClicks.length === 0 && <p className="text-[12px] text-dim">Sem cliques capturados ainda.</p>}
              </div>
            </GlassCard>
          </div>

          {/* Jornadas por lead / sessão */}
          <GlassCard className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-mint" strokeWidth={1.75} />
              <h3 className="font-display text-[15px] font-semibold text-fg">Jornada por lead / sessão</h3>
              <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-dim">
                {data.journeys.length} sessões
              </span>
            </div>
            <div className="space-y-3">
              {data.journeys.map((j) => (
                <div key={j.sessionId} className="rounded-xl p-3" style={{ background: 'hsl(0 0% 100% / 0.03)', border: '1px solid hsl(158 92% 70% / 0.08)' }}>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {j.leadHash ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider" style={{ background: 'hsl(158 92% 70% / 0.12)', color: MINT, border: '1px solid hsl(158 92% 70% / 0.25)' }}>
                        <UserCheck className="h-3 w-3" /> Lead #{shortId(j.leadHash)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-dim" style={{ background: 'hsl(0 0% 100% / 0.04)', border: '1px solid hsl(0 0% 100% / 0.1)' }}>
                        Sessão #{shortId(j.sessionId)}
                      </span>
                    )}
                    <span className="font-mono text-[10px] text-dim">{j.pageCount} páginas · {j.clickCount} cliques</span>
                    <span className="ml-auto font-mono text-[10px] text-dim">{fmtDate(j.last)}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {j.pages.slice(0, 12).map((p, i) => (
                      <span key={i} className="inline-flex items-center gap-1">
                        <span className="rounded-md px-1.5 py-0.5 text-[11px] text-dim-2" style={{ background: 'hsl(0 0% 100% / 0.05)' }} title={p}>
                          {p.length > 24 ? p.slice(0, 24) + '…' : p || '/'}
                        </span>
                        {i < Math.min(j.pages.length, 12) - 1 && <ArrowRight className="h-3 w-3 text-dim shrink-0" />}
                      </span>
                    ))}
                    {j.pages.length === 0 && <span className="text-[11px] text-dim">Sem pageviews (só cliques).</span>}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </>
      )}

      {/* Overlay visual nativo (tipo Clarity/Hotjar) — abaixo do relatório */}
      <HeatmapSection initialPath={data.topPages[0]?.path || '/'} />
    </div>
  )
}
