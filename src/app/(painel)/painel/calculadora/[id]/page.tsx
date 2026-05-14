import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, ExternalLink, Mail, Phone, Building2, User } from 'lucide-react'
import { getSession } from '@/lib/painel-auth'
import { getDocument } from '@/lib/painel-api'
import PainelLayout from '@/components/painel/PainelLayout'
import { GlassCard, PageHeader } from '@/components/painel/ui'
import { SETORES } from '@/lib/calculadora/benchmarks'
import { INSIGHTS_BY_ID } from '@/lib/calculadora/insights'
import type { InsightId, Setor } from '@/lib/calculadora/types'

function formatDate(d: string): string {
  return new Date(d).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function brl(n: unknown): string {
  if (typeof n !== 'number' || !Number.isFinite(n)) return '—'
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function pct01(n: unknown): string {
  if (typeof n !== 'number' || !Number.isFinite(n)) return '—'
  return `${(n * 100).toFixed(1)}%`
}

function roiFmt(n: unknown): string {
  if (typeof n !== 'number' || !Number.isFinite(n)) return '—'
  const sinal = n >= 0 ? '+' : ''
  return `${sinal}${Math.round(n)}%`
}

export default async function CalculadoraDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getSession()
  if (!user) redirect('/admin/login')

  const doc: any = await getDocument('calculadora-results', id)
  if (!doc) notFound()

  const isV2 = Boolean(doc.calc_insight_principal)
  const setorLabel = doc.setor
    ? SETORES.find((s) => s.value === (doc.setor as Setor))?.label || doc.setor
    : '—'

  return (
    <PainelLayout user={user}>
      <Link
        href="/admin/calculadora"
        className="inline-flex items-center gap-1.5 text-[12px] text-mint-soft hover:opacity-80 mb-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar para listagem
      </Link>

      <PageHeader
        title={doc.empresa || doc.nome}
        description={`Submissão da Calculadora · ${formatDate(doc.createdAt)} · ${
          isV2 ? 'v2' : 'v1 (legacy)'
        }`}
        actions={
          isV2 && doc.calc_url_resultado ? (
            <div className="flex gap-2">
              <Link
                href={`/ferramentas/calculadora-trafego/r/${doc.calc_url_resultado}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px]"
                style={{
                  background: 'hsl(0 0% 100% / 0.04)',
                  color: 'hsl(0 0% 91%)',
                  border: '1px solid hsl(158 92% 70% / 0.15)',
                }}
              >
                <ExternalLink className="h-3 w-3" /> Ver no /r/{doc.calc_url_resultado.slice(0, 6)}…
              </Link>
              <a
                href={`/api/calculadora/pdf?token=${doc.calc_url_resultado}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px]"
                style={{
                  background: 'hsl(158 92% 70% / 0.12)',
                  color: 'hsl(158 92% 70%)',
                  border: '1px solid hsl(158 92% 70% / 0.25)',
                }}
              >
                <Download className="h-3 w-3" /> PDF
              </a>
            </div>
          ) : null
        }
      />

      {!isV2 && (
        <div
          className="mb-4 rounded-md px-3 py-2 text-[12px]"
          style={{
            background: 'hsl(45 95% 65% / 0.08)',
            color: 'hsl(45 95% 80%)',
            border: '1px solid hsl(45 95% 65% / 0.2)',
          }}
        >
          Registro v1 (legacy) — capturado antes da spec v2. Inputs/output exibidos como JSON bruto.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Card 1 — Identificação */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <User className="h-4 w-4 text-mint" />
            <h3 className="font-display text-[15px] font-medium text-fg">Quem é</h3>
          </div>
          <dl className="space-y-3 text-[13px]">
            <Field label="Nome">{doc.nome}</Field>
            <Field label="Email">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3 w-3 text-dim" />
                <a href={`mailto:${doc.email}`} className="hover:text-mint">
                  {doc.email}
                </a>
              </span>
            </Field>
            {doc.telefone && (
              <Field label="Telefone">
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-dim" />
                  {doc.telefone}
                </span>
              </Field>
            )}
            <Field label="Empresa">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3 w-3 text-dim" />
                {doc.empresa}
              </span>
            </Field>
            <Field label="Setor">{setorLabel}</Field>
            {doc.score !== null && doc.score !== undefined && (
              <Field label="Score">
                <ScorePill score={doc.score as number} />
              </Field>
            )}
          </dl>
        </GlassCard>

        {/* Card 2 — Inputs + Premissas (v2 só) */}
        {isV2 ? (
          <GlassCard className="lg:col-span-2">
            <h3 className="font-display text-[15px] font-medium text-fg mb-4">Inputs e premissas</h3>
            <div className="grid gap-3 sm:grid-cols-2 text-[13px]">
              <Field label="Investimento mensal">{brl(doc.calc_investimento_mensal)}</Field>
              <Field label="Ticket médio">{brl(doc.calc_ticket_medio)}</Field>
              <Field label="Período">{doc.calc_periodo_meses} meses</Field>
              <Field label="Modelo">{(doc.calc_modelo_negocio || '').toUpperCase()}</Field>
              <Field label="CRM funcional">{doc.calc_crm_funcional ? 'Sim' : 'Não'}</Field>
              <Field label="Canais">
                {Array.isArray(doc.calc_canais_selecionados)
                  ? doc.calc_canais_selecionados.join(' + ')
                  : '—'}
              </Field>
              <Field label="CPL aplicado">{brl(doc.calc_premissa_cpl)}</Field>
              <Field label="Taxa qualificação">{pct01(doc.calc_premissa_taxa_qualif)}</Field>
              <Field label="Conv. MQL → Cliente">{pct01(doc.calc_premissa_conv_mql_cliente)}</Field>
              <Field label="Ciclo">{doc.calc_premissa_ciclo_dias} dias</Field>
              <Field label="Premissas editadas?">
                {doc.calc_premissas_editadas ? 'Sim' : 'Não'}
              </Field>
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="lg:col-span-2">
            <h3 className="font-display text-[15px] font-medium text-fg mb-4">O que foi preenchido (v1)</h3>
            <pre
              className="font-mono text-[11px] whitespace-pre-wrap leading-relaxed p-4 rounded-lg overflow-x-auto"
              style={{
                background: 'hsl(0 0% 100% / 0.02)',
                border: '1px solid hsl(158 92% 70% / 0.10)',
                color: 'hsl(0 0% 91% / 0.85)',
                maxHeight: 400,
              }}
            >
              {JSON.stringify(doc.inputs || {}, null, 2)}
            </pre>
          </GlassCard>
        )}

        {/* Card 3 — Resultado (v2 só) */}
        {isV2 ? (
          <GlassCard className="lg:col-span-2">
            <h3 className="font-display text-[15px] font-medium text-fg mb-4">Resultado</h3>
            <div className="grid gap-3 sm:grid-cols-3 text-[13px]">
              <Field label="ROI no período">
                <span className="text-mint font-semibold">{roiFmt(doc.calc_roi_periodo)}</span>
              </Field>
              <Field label="ROI total (c/ pipeline)">
                <span className="text-mint font-semibold">{roiFmt(doc.calc_roi_total)}</span>
              </Field>
              <Field label="Investimento total">{brl(doc.calc_investimento_total)}</Field>
              <Field label="Leads gerados">
                {(doc.calc_leads_gerados ?? 0).toLocaleString('pt-BR')}
              </Field>
              <Field label="MQLs">{(doc.calc_mqls ?? 0).toLocaleString('pt-BR')}</Field>
              <Field label="Clientes (total)">{Math.round(doc.calc_clientes_total ?? 0)}</Field>
              <Field label="Clientes no período">
                {Math.round(doc.calc_clientes_no_periodo ?? 0)}
              </Field>
              <Field label="Clientes pipeline">
                {Math.round(doc.calc_clientes_pipeline ?? 0)}
              </Field>
              <Field label="Receita período">{brl(doc.calc_receita_periodo)}</Field>
              <Field label="Receita pipeline">{brl(doc.calc_receita_pipeline)}</Field>
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="lg:col-span-2">
            <h3 className="font-display text-[15px] font-medium text-fg mb-4">Resultado gerado (v1)</h3>
            <pre
              className="font-mono text-[11px] whitespace-pre-wrap leading-relaxed p-4 rounded-lg overflow-x-auto"
              style={{
                background: 'hsl(0 0% 100% / 0.02)',
                border: '1px solid hsl(158 92% 70% / 0.10)',
                color: 'hsl(0 0% 91% / 0.85)',
                maxHeight: 400,
              }}
            >
              {JSON.stringify(doc.output || {}, null, 2)}
            </pre>
          </GlassCard>
        )}

        {/* Card 4 — Insight (v2 só) */}
        {isV2 && (
          <GlassCard>
            <h3 className="font-display text-[15px] font-medium text-fg mb-3">Insight exibido</h3>
            <p className="font-mono text-[10px] text-mint mb-2">
              {doc.calc_insight_principal}
              {doc.calc_insight_override ? ' + I-E (override)' : ''}
            </p>
            <p className="text-[14px] font-semibold mb-2">
              {INSIGHTS_BY_ID[doc.calc_insight_principal as InsightId]?.titulo}
            </p>
            <p className="text-[12px] text-dim-2 leading-relaxed">
              {INSIGHTS_BY_ID[doc.calc_insight_principal as InsightId]?.manchete}
            </p>
          </GlassCard>
        )}

        {/* Card 5 — Funil & status */}
        {isV2 && (
          <GlassCard className="lg:col-span-2">
            <h3 className="font-display text-[15px] font-medium text-fg mb-4">Funil & status</h3>
            <dl className="grid gap-3 md:grid-cols-3 text-[13px]">
              <Field label="RD sync status">{doc.rd_sync_status || '—'}</Field>
              <Field label="Slack notificado?">
                {doc.notified_slack ? 'Sim' : 'Não'}
              </Field>
              <Field label="Email status">{doc.emailStatus || '—'}</Field>
              <Field label="Avançou para Diagnóstico?">
                {doc.calc_avancou_para_diagnostico ? 'Sim' : 'Não'}
              </Field>
              <Field label="Quando avançou">
                {doc.calc_data_avancou_diagnostico
                  ? formatDate(doc.calc_data_avancou_diagnostico)
                  : '—'}
              </Field>
              <Field label="Nutrição">{doc.nutricao_step_atual || 'pending'}</Field>
            </dl>
          </GlassCard>
        )}

        {/* Card 6 — LGPD (sempre) */}
        <GlassCard className="lg:col-span-3">
          <h3 className="font-display text-[15px] font-medium text-fg mb-4">
            Consentimento LGPD
          </h3>
          <dl className="grid gap-3 md:grid-cols-3 text-[13px]">
            <Field label="Consentiu?">
              {doc.consent?.given ? (
                <span className="text-mint">Sim</span>
              ) : (
                <span style={{ color: 'hsl(0 70% 80%)' }}>Não</span>
              )}
            </Field>
            <Field label="Quando">
              {doc.consent?.timestamp ? formatDate(doc.consent.timestamp) : '—'}
            </Field>
            <Field label="Versão da política">{doc.consent?.policyVersion || '—'}</Field>
            <Field label="IP">{doc.consent?.ip || '—'}</Field>
            <Field label="Retenção até">
              {doc.retentionUntil ? formatDate(doc.retentionUntil) : '—'}
            </Field>
            <Field label="Consent withdrawn">
              {doc.consent?.withdrawn ? (
                <span style={{ color: 'hsl(0 70% 80%)' }}>Sim</span>
              ) : (
                'Não'
              )}
            </Field>
          </dl>
        </GlassCard>
      </div>
    </PainelLayout>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-mono uppercase tracking-wider text-dim mb-0.5">{label}</dt>
      <dd className="text-fg">{children}</dd>
    </div>
  )
}

function ScorePill({ score }: { score: number }) {
  let bg = 'hsl(0 0% 100% / 0.04)'
  let color = 'hsl(0 0% 91% / 0.6)'
  let border = 'hsl(0 0% 100% / 0.10)'
  if (score >= 70) {
    bg = 'hsl(158 92% 70% / 0.12)'
    color = 'hsl(158 92% 70%)'
    border = 'hsl(158 92% 70% / 0.25)'
  } else if (score >= 40) {
    bg = 'hsl(45 95% 65% / 0.10)'
    color = 'hsl(45 95% 80%)'
    border = 'hsl(45 95% 65% / 0.25)'
  }
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold"
      style={{ background: bg, color, border: `1px solid ${border}` }}
    >
      {score}/100
    </span>
  )
}
