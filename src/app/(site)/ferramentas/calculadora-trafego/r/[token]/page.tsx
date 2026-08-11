/**
 * Página /r/[token] — Resultado salvo da Calculadora (S4.2 + fix pré-prod).
 *
 * SSR read-only: lê CalculadoraResults pelo token (calc_url_resultado) e renderiza
 * a tela com cards ROI + funil + insight + CTA. Sem edição.
 *
 * Headers e proteção:
 *   - X-Robots-Tag: noindex (aplicado no middleware — ver `src/middleware.ts`).
 *   - Rate limit 10/min/IP (também no middleware).
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { calcular } from '@/lib/calculadora/formulas'
import { INSIGHTS_BY_ID } from '@/lib/calculadora/insights'
import type { Canal, InsightId, Modelo, Periodo, Premissas, Setor } from '@/lib/calculadora/types'
import CardsROI from '../../_components/CardsROI'
import FunilVisual from '../../_components/FunilVisual'
import BlocoAcoesResultado from '../../_components/BlocoAcoesResultado'
import { SETORES } from '@/lib/calculadora/benchmarks'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Resultado · Calculadora de Performance | Unfold Growth',
  description: 'Resultado salvo da Calculadora de Performance.',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false } },
}

interface PageProps {
  params: Promise<{ token: string }>
}

const TOKEN_RE = /^[a-f0-9]{32}$/

interface CalcDoc {
  nome: string
  email: string
  empresa: string
  setor: Setor | null
  calc_investimento_mensal: number
  calc_canais_selecionados: Canal[]
  calc_ticket_medio: number
  calc_modelo_negocio: Modelo
  calc_periodo_meses: '3' | '6' | '12'
  calc_crm_funcional: boolean
  calc_premissa_cpl: number
  calc_premissa_taxa_qualif: number
  calc_premissa_conv_mql_cliente: number
  calc_premissa_ciclo_dias: number
  calc_premissas_editadas: boolean
  calc_insight_principal: InsightId
  calc_insight_override: boolean
  createdAt: string
}

export default async function ResultadoSalvoPage({ params }: PageProps) {
  const { token } = await params

  // Token mal formado → 404 sem nem consultar o banco (anti-scan).
  if (!TOKEN_RE.test(token)) notFound()

  const payload = await getPayload({ config: configPromise })
  const found = await payload.find({
    collection: 'calculadora-results',
    where: { calc_url_resultado: { equals: token } },
    limit: 1,
  })
  const doc = found.docs[0] as unknown as CalcDoc | undefined
  if (!doc || !doc.calc_insight_principal) notFound()

  // Reconstrói resultado pelo motor puro a partir dos inputs persistidos
  // (defesa em profundidade: nunca confiar nos números armazenados sem reverificar).
  const inputs = {
    investimento_mensal: doc.calc_investimento_mensal,
    canais: doc.calc_canais_selecionados,
    ticket_medio: doc.calc_ticket_medio,
    modelo: doc.calc_modelo_negocio,
    periodo: Number(doc.calc_periodo_meses) as Periodo,
    crm_funcional: doc.calc_crm_funcional,
  }
  const premissas: Premissas = {
    cpl: doc.calc_premissa_cpl,
    taxa_qualificacao: doc.calc_premissa_taxa_qualif,
    conversao_mql_cliente: doc.calc_premissa_conv_mql_cliente,
    ciclo_dias: doc.calc_premissa_ciclo_dias,
  }
  const resultado = calcular(inputs, premissas)
  const exibicao = {
    investimento_total: brl(resultado.investimento_total),
    leads_gerados: int(resultado.leads_gerados),
    mqls: int(resultado.mqls),
    clientes_fechados: intApprox(resultado.clientes_fechados),
    clientes_no_periodo: intApprox(resultado.clientes_no_periodo),
    clientes_em_pipeline: intApprox(resultado.clientes_em_pipeline),
    receita_no_periodo: brl(resultado.receita_no_periodo),
    receita_em_pipeline: brl(resultado.receita_em_pipeline),
    roi_no_periodo: roi(resultado.roi_no_periodo),
    roi_total: roi(resultado.roi_total),
    fator_temporal_pct: `${Math.round(resultado.fator_temporal * 100)}%`,
  }

  const insight = INSIGHTS_BY_ID[doc.calc_insight_principal]
  const overrideTexto = doc.calc_insight_override ? INSIGHTS_BY_ID['I-E'] : null
  const setorLabel = doc.setor
    ? SETORES.find((s) => s.value === doc.setor)?.label || doc.setor
    : '—'

  return (
    <main className="min-h-screen">
      <section className="pt-28 pb-8 md:pt-32 md:pb-10">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/75 mb-3">
            Resultado salvo · Calculadora de Performance
          </p>
          <h1 className="font-display font-bold tracking-tight text-3xl md:text-4xl max-w-3xl">
            {doc.empresa}
          </h1>
          <p className="mt-2 text-sm text-foreground/80">
            Gerado em {new Date(doc.createdAt).toLocaleDateString('pt-BR', { dateStyle: 'long' })} · Setor: {setorLabel}
          </p>
        </div>
      </section>

      <section className="pb-12">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 space-y-6">
          <CardsROI resultado={resultado} />
          <FunilVisual resultadoExibicao={exibicao} premissas={premissas} />
          <BlocoAcoesResultado token={token} />

          <article className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/8 to-primary/2 p-5 md:p-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary mb-3">
              Leitura {insight.id}
            </p>
            <h3 className="font-display font-bold text-xl md:text-2xl leading-tight mb-3">
              {insight.titulo}
            </h3>
            <p className="text-base text-foreground/85 font-medium leading-relaxed mb-3">
              {insight.manchete}
            </p>
            <p className="text-sm text-foreground/70 leading-relaxed">{insight.corpo}</p>
          </article>

          {overrideTexto && (
            <article className="rounded-2xl border border-secondary/25 bg-secondary/5 p-4 md:p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-secondary/85 mb-2">
                Observação adicional · I-E
              </p>
              <p className="text-sm text-foreground/85 font-medium leading-relaxed mb-2">
                {overrideTexto.manchete}
              </p>
              <p className="text-[13px] text-foreground/85 leading-relaxed">
                {overrideTexto.corpo}
              </p>
            </article>
          )}

          <section className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/12 to-primary/4 p-6 md:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary mb-3">
              Próximo passo
            </p>
            <p className="text-base md:text-lg text-foreground/90 leading-relaxed max-w-xl mb-5">
              Esse cálculo assume taxas médias de mercado. Quer descobrir como sua operação
              realmente performa contra esses benchmarks?
            </p>
            <a
              href="/diagnostico"
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground h-11 px-6 font-medium hover:bg-primary/90 transition-colors"
            >
              Fazer o Diagnóstico de Growth →
            </a>
            <p className="mt-3 text-[12px] text-foreground/80">
              Diagnóstico completo de 5 min · Gratuito
            </p>
          </section>

          <p className="text-[11px] text-foreground/70 text-center">
            Este link é privado. Não compartilhe publicamente.
          </p>
        </div>
      </section>
    </main>
  )
}

// ─── helpers de formatação (espelham regras §6.2 do spec) ───────────────────

function brl(n: number): string {
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  })
}
function int(n: number): string {
  return Math.round(n).toLocaleString('pt-BR')
}
function intApprox(n: number): string {
  const arr = Math.round(n)
  const fracionario = Math.abs(n - Math.trunc(n)) >= 0.005
  return fracionario ? `~${arr.toLocaleString('pt-BR')}` : arr.toLocaleString('pt-BR')
}
function roi(n: number): string {
  const sinal = n >= 0 ? '+' : ''
  return `${sinal}${Math.round(n)}%`
}
