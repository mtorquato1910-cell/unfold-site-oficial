import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Mail } from 'lucide-react'

import { getSession } from '@/lib/painel-auth'
import { getDocument } from '@/lib/painel-api'
import PainelLayout from '@/components/painel/PainelLayout'
import { GlassCard, PageHeader } from '@/components/painel/ui'
import { LABEL_EIXO, LABEL_FAIXA, LABEL_FAIXA_FIT } from '@/lib/scoring/textos'
import type { FaixaFit, FaixaMaturidade } from '@/lib/scoring/types'

import DiagnosticoDetailActions from './DiagnosticoDetailActions'

function formatDate(d?: string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const EIXOS = [
  { key: 'score_diagnosticar', label: LABEL_EIXO.diagnosticar },
  { key: 'score_estruturar', label: LABEL_EIXO.estruturar },
  { key: 'score_operar', label: LABEL_EIXO.operar },
  { key: 'score_evoluir', label: LABEL_EIXO.evoluir },
  { key: 'score_gestao', label: LABEL_EIXO.gestao },
] as const

function readArray(v: unknown): string[] {
  if (Array.isArray(v)) return v as string[]
  if (typeof v === 'string') {
    try {
      const parsed = JSON.parse(v)
      return Array.isArray(parsed) ? (parsed as string[]) : []
    } catch {
      return []
    }
  }
  return []
}

const FAIXA_COLOR: Record<string, { bg: string; color: string; border: string }> = {
  'fit-alto': { bg: 'hsl(158 92% 70% / 0.12)', color: 'hsl(158 92% 70%)', border: 'hsl(158 92% 70% / 0.3)' },
  'fit-medio': { bg: 'hsl(218 94% 78% / 0.12)', color: 'hsl(218 94% 78%)', border: 'hsl(218 94% 78% / 0.3)' },
  'fit-baixo': { bg: 'hsl(0 0% 100% / 0.04)', color: 'hsl(0 0% 91% / 0.6)', border: 'hsl(0 0% 100% / 0.10)' },
  desfit: { bg: 'hsl(0 0% 100% / 0.04)', color: 'hsl(0 0% 91% / 0.5)', border: 'hsl(0 0% 100% / 0.08)' },
}

export default async function DiagnosticoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getSession()
  if (!user) redirect('/admin/login')

  const doc = (await getDocument('diagnostico-results', id)) as Record<string, unknown> | null
  if (!doc) notFound()

  const leadEmail = String(doc.lead_email || '—')
  const scoreTotal = Number(doc.score_total ?? 0)
  const scoreFit = Number(doc.score_fit ?? 0)
  const faixaConsolidada = doc.faixa_consolidada as FaixaMaturidade | undefined
  const faixaFit = (doc.faixa_fit as FaixaFit | undefined) ?? 'desfit'
  const hash = doc.url_resultado_hash as string | undefined
  const padroesAcionados = readArray(doc.padroes_acionados)
  const padroesExibidos = readArray(doc.padroes_exibidos)
  const caminhosExibidos = readArray(doc.caminhos_exibidos)

  const fitColor = FAIXA_COLOR[faixaFit]

  return (
    <PainelLayout user={user}>
      <Link
        href="/painel/diagnostico"
        className="inline-flex items-center gap-1.5 text-[12px] text-[hsl(158_92%_70%_/_0.8)] hover:opacity-80 mb-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar para listagem
      </Link>

      <PageHeader
        title={leadEmail}
        description={`Score ${scoreTotal}/100 · ${LABEL_FAIXA_FIT[faixaFit]} · ${formatDate(doc.createdAt as string)}`}
      />

      {/* Ações administrativas */}
      <div className="mb-6">
        <DiagnosticoDetailActions id={id} hash={hash} />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Score total + faixas */}
        <GlassCard>
          <div className="text-[10px] font-mono uppercase tracking-wider text-[hsl(0_0%_91%_/_0.45)] mb-2">
            Score consolidado
          </div>
          <div className="font-display text-[48px] font-semibold leading-none text-[hsl(158_92%_70%)]">
            {scoreTotal}
            <span className="text-[20px] text-[hsl(0_0%_91%_/_0.4)]">/100</span>
          </div>
          {faixaConsolidada && (
            <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[hsl(0_0%_91%_/_0.7)]">
              {LABEL_FAIXA[faixaConsolidada]}
            </div>
          )}
          <div className="mt-4">
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider"
              style={{ background: fitColor.bg, color: fitColor.color, border: `1px solid ${fitColor.border}` }}
            >
              {LABEL_FAIXA_FIT[faixaFit]} · {scoreFit.toFixed(1)}
            </span>
          </div>
        </GlassCard>

        {/* 5 eixos */}
        <GlassCard className="lg:col-span-3">
          <h3 className="font-display text-[15px] font-medium mb-4">Camada 1 — Eixos do método UGS</h3>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
            {EIXOS.map((e) => {
              const v = Number(doc[e.key] ?? 0)
              return (
                <div key={e.key}>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[hsl(0_0%_91%_/_0.45)] mb-1">
                    {e.label}
                  </div>
                  <div className="font-display text-[24px] font-semibold leading-none">{v}</div>
                  <div className="mt-2 h-1.5 rounded-full overflow-hidden bg-[hsl(0_0%_100%_/_0.05)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${v}%`,
                        background:
                          v >= 76 ? 'hsl(158 92% 70%)' : v >= 51 ? 'hsl(218 94% 78%)' : v >= 26 ? 'hsl(250 64% 60%)' : 'hsl(0 75% 65%)',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </GlassCard>

        {/* Camada 2 — Fit Comercial */}
        <GlassCard className="lg:col-span-2">
          <h3 className="font-display text-[15px] font-medium mb-4">Camada 2 — Fit Comercial</h3>
          <dl className="grid grid-cols-2 gap-4 text-[12px]">
            <Item label="Fit Estrutural (40%)" value={fmt(doc.fit_estrutural)} />
            <Item label="Fit de Dor (30%)" value={fmt(doc.fit_dor)} />
            <Item label="Fit de Cabeça (20%)" value={fmt(doc.fit_cabeca)} />
            <Item label="Fit de Urgência (10%)" value={fmt(doc.fit_urgencia)} />
            <Item label="Score Fit" value={scoreFit.toFixed(2)} highlight />
            <Item label="Faixa" value={LABEL_FAIXA_FIT[faixaFit]} highlight />
          </dl>
        </GlassCard>

        {/* Camada 3 — Padrões e Caminhos */}
        <GlassCard className="lg:col-span-2">
          <h3 className="font-display text-[15px] font-medium mb-4">Camada 3 — Padrões e Caminhos</h3>
          <div className="space-y-4 text-[12px]">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[hsl(0_0%_91%_/_0.45)] mb-2">
                Padrões acionados ({padroesAcionados.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {padroesAcionados.length === 0 ? (
                  <span className="text-[hsl(0_0%_91%_/_0.45)]">—</span>
                ) : (
                  padroesAcionados.map((p) => (
                    <Chip key={p} label={p} active={padroesExibidos.includes(p)} />
                  ))
                )}
              </div>
              {padroesExibidos.length > 0 && (
                <p className="text-[10px] text-[hsl(158_92%_70%_/_0.8)] mt-2">
                  Top 3 exibidos: {padroesExibidos.join(' · ')}
                </p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[hsl(0_0%_91%_/_0.45)] mb-2">
                Caminhos exibidos
              </p>
              <div className="flex flex-wrap gap-1.5">
                {caminhosExibidos.length === 0 ? (
                  <span className="text-[hsl(0_0%_91%_/_0.45)]">—</span>
                ) : (
                  caminhosExibidos.map((c) => <Chip key={c} label={c} active />)
                )}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Metadados + Links */}
        <GlassCard className="lg:col-span-2">
          <h3 className="font-display text-[15px] font-medium mb-4">Vínculos & Metadados</h3>
          <dl className="space-y-3 text-[12px]">
            <div>
              <dt className="text-[10px] font-mono uppercase tracking-wider text-[hsl(0_0%_91%_/_0.45)] mb-0.5">
                Email
              </dt>
              <dd className="flex items-center gap-1.5">
                <Mail className="h-3 w-3 text-[hsl(0_0%_91%_/_0.45)]" />
                <a href={`mailto:${leadEmail}`} className="hover:text-[hsl(158_92%_70%)]">
                  {leadEmail}
                </a>
              </dd>
            </div>
            {hash && (
              <div>
                <dt className="text-[10px] font-mono uppercase tracking-wider text-[hsl(0_0%_91%_/_0.45)] mb-0.5">
                  URL pública
                </dt>
                <dd>
                  <a
                    href={`/diagnostico/r/${hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[hsl(158_92%_70%)] hover:opacity-80"
                  >
                    /diagnostico/r/{hash} <ExternalLink className="h-3 w-3" />
                  </a>
                </dd>
              </div>
            )}
            <Item label="Iniciou em" value={formatDate(doc.data_inicio as string)} />
            <Item label="Concluiu em" value={formatDate(doc.data_conclusao as string)} />
            <Item
              label="Tempo total"
              value={
                doc.tempo_total_segundos
                  ? `${Math.round(Number(doc.tempo_total_segundos) / 60)} min`
                  : '—'
              }
            />
            <Item
              label="Agendou?"
              value={doc.agendou ? `Sim · ${formatDate(doc.slot_agendado as string)}` : 'Não'}
            />
            <Item label="Email enviado?" value={doc.email_enviado ? 'Sim' : 'Não'} />
            <Item
              label="Notificou Gabriel?"
              value={doc.notificado_at ? formatDate(doc.notificado_at as string) : 'Não'}
            />
          </dl>
        </GlassCard>
      </div>
    </PainelLayout>
  )
}

function fmt(v: unknown): string {
  if (typeof v === 'number') return v.toFixed(1)
  return '—'
}

function Item({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <dt className="text-[10px] font-mono uppercase tracking-wider text-[hsl(0_0%_91%_/_0.45)] mb-0.5">
        {label}
      </dt>
      <dd className={`text-[13px] ${highlight ? 'font-semibold text-[hsl(158_92%_70%)]' : ''}`}>
        {value}
      </dd>
    </div>
  )
}

function Chip({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider border ${
        active
          ? 'bg-[hsl(158_92%_70%_/_0.12)] text-[hsl(158_92%_70%)] border-[hsl(158_92%_70%_/_0.3)]'
          : 'bg-[hsl(0_0%_100%_/_0.03)] text-[hsl(0_0%_91%_/_0.5)] border-[hsl(0_0%_100%_/_0.1)]'
      }`}
    >
      {label}
    </span>
  )
}
