import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Mail, Phone, Building2, User } from 'lucide-react'
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

function brl(s: string | undefined): string {
  if (!s) return '—'
  const n = parseFloat(s.replace(/\D/g, ''))
  if (!isFinite(n)) return s
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
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

  const inputs = doc.inputs || {}
  const output = doc.output || {}
  const consent = doc.consent || {}
  const leadId = typeof doc.lead === 'object' ? doc.lead?.id : doc.lead

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
        description={`Submissão da Calculadora · ${formatDate(doc.createdAt)}`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Identificação */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <User className="h-4 w-4 text-mint" />
            <h3 className="font-display text-[15px] font-medium text-fg">Quem é</h3>
          </div>
          <dl className="space-y-3 text-[13px]">
            <div>
              <dt className="text-[10px] font-mono uppercase tracking-wider text-dim mb-0.5">Nome</dt>
              <dd className="text-fg font-medium">{doc.nome}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-mono uppercase tracking-wider text-dim mb-0.5">Email</dt>
              <dd className="text-fg flex items-center gap-1.5">
                <Mail className="h-3 w-3 text-dim" />
                <a href={`mailto:${doc.email}`} className="hover:text-mint">
                  {doc.email}
                </a>
              </dd>
            </div>
            {doc.telefone && (
              <div>
                <dt className="text-[10px] font-mono uppercase tracking-wider text-dim mb-0.5">
                  Telefone
                </dt>
                <dd className="text-fg flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-dim" />
                  {doc.telefone}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-[10px] font-mono uppercase tracking-wider text-dim mb-0.5">
                Empresa
              </dt>
              <dd className="text-fg flex items-center gap-1.5">
                <Building2 className="h-3 w-3 text-dim" />
                {doc.empresa}
              </dd>
            </div>
            {doc.cargo && (
              <div>
                <dt className="text-[10px] font-mono uppercase tracking-wider text-dim mb-0.5">
                  Cargo
                </dt>
                <dd className="text-fg">{doc.cargo}</dd>
              </div>
            )}
            {leadId && (
              <div>
                <dt className="text-[10px] font-mono uppercase tracking-wider text-dim mb-1">
                  Lead vinculado
                </dt>
                <Link
                  href={`/admin/leads`}
                  className="inline-flex items-center gap-1 text-mint text-[12px] hover:opacity-80"
                >
                  Ver no CRM <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}
            {doc.score !== null && doc.score !== undefined && (
              <div>
                <dt className="text-[10px] font-mono uppercase tracking-wider text-dim mb-0.5">
                  Score
                </dt>
                <dd>
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold"
                    style={
                      doc.score >= 70
                        ? {
                            background: 'hsl(158 92% 70% / 0.12)',
                            color: 'hsl(158 92% 70%)',
                            border: '1px solid hsl(158 92% 70% / 0.25)',
                          }
                        : doc.score >= 40
                          ? {
                              background: 'hsl(45 95% 65% / 0.10)',
                              color: 'hsl(45 95% 80%)',
                              border: '1px solid hsl(45 95% 65% / 0.25)',
                            }
                          : {
                              background: 'hsl(0 0% 100% / 0.04)',
                              color: 'hsl(0 0% 91% / 0.6)',
                              border: '1px solid hsl(0 0% 100% / 0.10)',
                            }
                    }
                  >
                    {doc.score}/100
                  </span>
                </dd>
              </div>
            )}
          </dl>
        </GlassCard>

        {/* Inputs */}
        <GlassCard className="lg:col-span-2">
          <h3 className="font-display text-[15px] font-medium text-fg mb-4">O que foi preenchido</h3>
          <dl className="grid gap-3 sm:grid-cols-2 text-[13px]">
            <Field label="Investimento atual">{brl(inputs.investimento_atual)}</Field>
            <Field label="Ticket médio">{brl(inputs.ticket_medio)}</Field>
            <Field label="Ciclo de vendas">{inputs.ciclo_vendas ? `${inputs.ciclo_vendas} dias` : '—'}</Field>
            <Field label="Meta de receita">{brl(inputs.objetivo_receita)}</Field>
            <Field label="Conv. lead → opo">{inputs.taxa_conversao_lead ? `${inputs.taxa_conversao_lead}%` : '—'}</Field>
            <Field label="Conv. opo → cliente">{inputs.taxa_conversao_opo ? `${inputs.taxa_conversao_opo}%` : '—'}</Field>
            <Field label="Vertical">{inputs.vertical || '—'}</Field>
            <Field label="Canais">{Array.isArray(inputs.canais) ? inputs.canais.join(', ') : '—'}</Field>
          </dl>
        </GlassCard>

        {/* Output */}
        <GlassCard className="lg:col-span-3">
          <h3 className="font-display text-[15px] font-medium text-fg mb-4">Resultado gerado</h3>
          <pre
            className="font-mono text-[11px] whitespace-pre-wrap leading-relaxed p-4 rounded-lg overflow-x-auto"
            style={{
              background: 'hsl(0 0% 100% / 0.02)',
              border: '1px solid hsl(158 92% 70% / 0.10)',
              color: 'hsl(0 0% 91% / 0.85)',
              maxHeight: '400px',
            }}
          >
            {JSON.stringify(output, null, 2)}
          </pre>
        </GlassCard>

        {/* LGPD */}
        <GlassCard className="lg:col-span-3">
          <h3 className="font-display text-[15px] font-medium text-fg mb-4">
            Consentimento LGPD
          </h3>
          <dl className="grid gap-3 md:grid-cols-3 text-[13px]">
            <Field label="Consentiu?">
              {consent.given ? (
                <span className="text-mint">Sim</span>
              ) : (
                <span style={{ color: 'hsl(0 70% 80%)' }}>Não</span>
              )}
            </Field>
            <Field label="Quando">
              {consent.timestamp ? formatDate(consent.timestamp) : '—'}
            </Field>
            <Field label="Versão da política">{consent.policyVersion || '—'}</Field>
            <Field label="IP">{consent.ip || '—'}</Field>
            <Field label="User-Agent">
              <span className="text-[11px] text-dim-2 font-mono break-all">{consent.userAgent || '—'}</span>
            </Field>
            <Field label="Retenção até">
              {doc.retentionUntil ? formatDate(doc.retentionUntil) : '—'}
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
