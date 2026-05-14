/**
 * Queries de agregação do dashboard da Calculadora (Sprint 5 / S5.1).
 *
 * Mantém SQL/Payload encapsulado para que o componente fique fino.
 * Uso: chamado de Server Component (`page.tsx`) — nunca de client.
 */

import { getPayload } from 'payload'
import config from '@payload-config'
import { normalizeEmail } from '@/lib/utils/email'
import type { InsightId, Setor } from '@/lib/calculadora/types'
import { SETORES } from '@/lib/calculadora/benchmarks'

export interface DashboardData {
  funil: {
    iniciadas: number
    etapa1: number
    resultadoVisto: number
    ctaClicado: number
    diagnosticoConcluido: number
  }
  distInsights: Record<InsightId, number>
  distInsightOverride: number
  distSetores: { setor: Setor | 'sem_setor'; label: string; count: number }[]
  premissasEditadas: { editaram: number; total: number; pct: number }
  roiMedioPorSetor: {
    setor: Setor
    label: string
    n: number
    roiPeriodoMedio: number | null
    roiTotalMedio: number | null
  }[]
  totalSubmissoes: number
}

export async function carregarDashboard(opts: {
  desdeIso: string
}): Promise<DashboardData> {
  const payload = await getPayload({ config })

  // ── Funil via calculadora-events ─────────────────────────────────────────
  async function contarEvento(name: string) {
    const r = await payload.find({
      collection: 'calculadora-events',
      where: {
        and: [
          { event_name: { equals: name } },
          { createdAt: { greater_than_equal: opts.desdeIso } },
        ],
      },
      limit: 0,
    })
    return r.totalDocs
  }

  const [iniciadas, etapa1, resultadoVisto, ctaClicado] = await Promise.all([
    contarEvento('calculadora_iniciada'),
    contarEvento('etapa_1_concluida'),
    contarEvento('resultado_visualizado'),
    contarEvento('calculadora_para_diagnostico'),
  ])

  // Diagnóstico concluído — pesquisa em diagnostico-events pelos emails que vieram da calc
  let diagnosticoConcluido = 0
  try {
    // Emails que clicaram no CTA da calc no período
    const ctas = await payload.find({
      collection: 'calculadora-events',
      where: {
        and: [
          { event_name: { equals: 'calculadora_para_diagnostico' } },
          { createdAt: { greater_than_equal: opts.desdeIso } },
        ],
      },
      limit: 1000,
    })
    const emails = Array.from(
      new Set(
        (ctas.docs as { lead_email?: string }[])
          .map((d) => normalizeEmail(d.lead_email || ''))
          .filter(Boolean),
      ),
    )
    if (emails.length > 0) {
      const concl = await payload.find({
        collection: 'diagnostico-events',
        where: {
          and: [
            { event_name: { equals: 'diagnostico_concluido' } },
            { lead_email: { in: emails } },
          ],
        },
        limit: 0,
      })
      diagnosticoConcluido = concl.totalDocs
    }
  } catch (err) {
    console.error('[dashboard] cruzamento diagnóstico falhou:', err)
  }

  // ── Distribuição de insights, setores, premissas editadas, ROI ───────────
  const results = await payload.find({
    collection: 'calculadora-results',
    where: {
      and: [
        { calc_insight_principal: { exists: true } },
        { createdAt: { greater_than_equal: opts.desdeIso } },
      ],
    },
    limit: 10000,
  })

  const distInsights: Record<InsightId, number> = { 'I-A': 0, 'I-B': 0, 'I-C': 0, 'I-D': 0 }
  let distOverride = 0
  const setoresMap = new Map<string, number>()
  let editaram = 0
  const roiAcc = new Map<string, { soma: number; somaTotal: number; n: number }>()

  for (const d of results.docs as Array<{
    calc_insight_principal?: InsightId
    calc_insight_override?: boolean
    setor?: Setor
    calc_premissas_editadas?: boolean
    calc_roi_periodo?: number
    calc_roi_total?: number
  }>) {
    if (d.calc_insight_principal && distInsights[d.calc_insight_principal] !== undefined) {
      distInsights[d.calc_insight_principal]++
    }
    if (d.calc_insight_override) distOverride++
    const s = d.setor || 'sem_setor'
    setoresMap.set(s, (setoresMap.get(s) || 0) + 1)
    if (d.calc_premissas_editadas) editaram++
    if (d.setor && typeof d.calc_roi_periodo === 'number') {
      const acc = roiAcc.get(d.setor) || { soma: 0, somaTotal: 0, n: 0 }
      acc.soma += d.calc_roi_periodo
      acc.somaTotal += d.calc_roi_total ?? 0
      acc.n++
      roiAcc.set(d.setor, acc)
    }
  }

  const total = results.totalDocs
  const distSetores = Array.from(setoresMap.entries())
    .map(([setor, count]) => ({
      setor: setor as Setor | 'sem_setor',
      label:
        setor === 'sem_setor'
          ? 'Sem setor'
          : SETORES.find((x) => x.value === setor)?.label || setor,
      count,
    }))
    .sort((a, b) => b.count - a.count)

  const roiMedioPorSetor = Array.from(roiAcc.entries())
    .map(([setor, { soma, somaTotal, n }]) => ({
      setor: setor as Setor,
      label: SETORES.find((x) => x.value === setor)?.label || setor,
      n,
      roiPeriodoMedio: n > 0 ? soma / n : null,
      roiTotalMedio: n > 0 ? somaTotal / n : null,
    }))
    .sort((a, b) => (b.roiPeriodoMedio ?? -Infinity) - (a.roiPeriodoMedio ?? -Infinity))

  return {
    funil: {
      iniciadas,
      etapa1,
      resultadoVisto,
      ctaClicado,
      diagnosticoConcluido,
    },
    distInsights,
    distInsightOverride: distOverride,
    distSetores,
    premissasEditadas: {
      editaram,
      total,
      pct: total > 0 ? (editaram / total) * 100 : 0,
    },
    roiMedioPorSetor,
    totalSubmissoes: total,
  }
}

/** Retorna o ISO de N dias atrás. */
export function isoDesde(dias: number): string {
  const d = new Date()
  d.setDate(d.getDate() - dias)
  return d.toISOString()
}
