import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Mail } from 'lucide-react'
import { getSession } from '@/lib/painel-auth'
import { getDocument } from '@/lib/painel-api'
import PainelLayout from '@/components/painel/PainelLayout'
import { GlassCard, PageHeader } from '@/components/painel/ui'

function formatDate(d: string): string {
  return new Date(d).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const PILARES = [
  { key: 'score_diagnosticar', label: 'Diagnosticar' },
  { key: 'score_estruturar', label: 'Estruturar' },
  { key: 'score_operar', label: 'Operar' },
  { key: 'score_evoluir', label: 'Evoluir' },
]

export default async function DiagnosticoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getSession()
  if (!user) redirect('/admin/login')

  const doc: any = await getDocument('diagnostico-results', id)
  if (!doc) notFound()

  const respostas: any[] = Array.isArray(doc.respostas_raw)
    ? doc.respostas_raw
    : doc.respostas_raw
      ? Object.values(doc.respostas_raw)
      : []

  const leadId = typeof doc.lead_id === 'object' ? doc.lead_id?.id : doc.lead_id
  const insight = typeof doc.insight_id === 'object' ? doc.insight_id : null

  const fitColor =
    doc.nivel_fit === 'alto'
      ? { bg: 'hsl(158 92% 70% / 0.12)', color: 'hsl(158 92% 70%)', border: 'hsl(158 92% 70% / 0.25)' }
      : doc.nivel_fit === 'medio'
        ? { bg: 'hsl(45 95% 65% / 0.10)', color: 'hsl(45 95% 80%)', border: 'hsl(45 95% 65% / 0.25)' }
        : { bg: 'hsl(0 0% 100% / 0.04)', color: 'hsl(0 0% 91% / 0.6)', border: 'hsl(0 0% 100% / 0.10)' }

  return (
    <PainelLayout user={user}>
      <Link
        href="/admin/diagnostico"
        className="inline-flex items-center gap-1.5 text-[12px] text-mint-soft hover:opacity-80 mb-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar para listagem
      </Link>

      <PageHeader
        title={`Diagnóstico ${doc.lead_email}`}
        description={`Score ${doc.score_total}/100 · Fit ${doc.nivel_fit} · ${formatDate(doc.createdAt)}`}
      />

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Score total */}
        <GlassCard>
          <div className="text-[10px] font-mono uppercase tracking-wider text-dim mb-2">Score total</div>
          <div className="font-display text-[48px] font-semibold leading-none text-mint">
            {doc.score_total}
            <span className="text-[20px] text-dim-2">/100</span>
          </div>
          <div className="mt-3">
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider"
              style={{
                background: fitColor.bg,
                color: fitColor.color,
                border: `1px solid ${fitColor.border}`,
              }}
            >
              Fit {doc.nivel_fit}
            </span>
          </div>
        </GlassCard>

        {/* Scores por pilar */}
        <GlassCard className="lg:col-span-3">
          <h3 className="font-display text-[15px] font-medium text-fg mb-4">Score por pilar</h3>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {PILARES.map((p) => {
              const v = doc[p.key] ?? 0
              return (
                <div key={p.key}>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-dim mb-1">
                    {p.label}
                  </div>
                  <div className="font-display text-[28px] font-semibold text-fg leading-none">
                    {v}
                  </div>
                  <div
                    className="mt-2 h-1.5 rounded-full overflow-hidden"
                    style={{ background: 'hsl(0 0% 100% / 0.05)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${v}%`,
                        background:
                          v >= 70
                            ? 'hsl(158 92% 70%)'
                            : v >= 40
                              ? 'hsl(45 95% 65%)'
                              : 'hsl(0 0% 91% / 0.3)',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </GlassCard>

        {/* Lead + Insight */}
        <GlassCard className="lg:col-span-2">
          <h3 className="font-display text-[15px] font-medium text-fg mb-4">Vínculos</h3>
          <dl className="space-y-3 text-[13px]">
            <div>
              <dt className="text-[10px] font-mono uppercase tracking-wider text-dim mb-0.5">Email</dt>
              <dd className="text-fg flex items-center gap-1.5">
                <Mail className="h-3 w-3 text-dim" />
                <a href={`mailto:${doc.lead_email}`} className="hover:text-mint">
                  {doc.lead_email}
                </a>
              </dd>
            </div>
            {leadId && (
              <div>
                <dt className="text-[10px] font-mono uppercase tracking-wider text-dim mb-1">Lead</dt>
                <Link
                  href={`/admin/leads`}
                  className="inline-flex items-center gap-1 text-mint text-[12px] hover:opacity-80"
                >
                  Ver no CRM <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}
            {insight && (
              <div>
                <dt className="text-[10px] font-mono uppercase tracking-wider text-dim mb-0.5">
                  Insight gerado
                </dt>
                <dd className="text-fg font-medium">{insight.titulo || insight.headline || '—'}</dd>
                {insight.headline && insight.headline !== insight.titulo && (
                  <p className="text-[12px] text-dim-2 mt-1">{insight.headline}</p>
                )}
              </div>
            )}
            <div>
              <dt className="text-[10px] font-mono uppercase tracking-wider text-dim mb-0.5">
                Email enviado?
              </dt>
              <dd className="text-fg">{doc.email_enviado ? 'Sim' : 'Não'}</dd>
            </div>
          </dl>
        </GlassCard>

        {/* Respostas raw */}
        <GlassCard className="lg:col-span-2">
          <h3 className="font-display text-[15px] font-medium text-fg mb-4">
            Respostas ({respostas.length})
          </h3>
          {respostas.length === 0 ? (
            <p className="text-[12px] text-dim">Sem respostas armazenadas</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {respostas.map((r: any, i: number) => (
                <div
                  key={i}
                  className="rounded-lg p-3 text-[12px]"
                  style={{
                    background: 'hsl(0 0% 100% / 0.02)',
                    border: '1px solid hsl(158 92% 70% / 0.10)',
                  }}
                >
                  <div className="text-dim mb-1 text-[10px] font-mono uppercase tracking-wider">
                    {r.questao_id || r.id || `Q${i + 1}`}
                  </div>
                  <div className="text-fg">{r.resposta_label || r.resposta || JSON.stringify(r)}</div>
                  {r.peso !== undefined && (
                    <div className="text-[10px] text-dim mt-1">peso: {r.peso}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </PainelLayout>
  )
}
