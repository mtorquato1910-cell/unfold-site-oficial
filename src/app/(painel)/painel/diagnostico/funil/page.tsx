import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { getSession } from '@/lib/painel-auth'
import PainelLayout from '@/components/painel/PainelLayout'

import FunilClient, { type FunilData } from './FunilClient'

export const dynamic = 'force-dynamic'

type ParamsPromise = Promise<{ [key: string]: string | string[] | undefined }>

async function carregarDados(searchParams: Record<string, string | undefined>): Promise<FunilData> {
  const payload = await getPayload({ config: configPromise })

  // ── Filtros (data, setor, faixa_fit) ─────────────────────────────
  const dataDe = searchParams.de ? new Date(searchParams.de).toISOString() : undefined
  const dataAte = searchParams.ate ? new Date(searchParams.ate).toISOString() : undefined
  const setor = searchParams.setor || undefined
  const faixaFit = searchParams.faixa_fit || undefined

  const whereEvents: Record<string, unknown> = {}
  const whereResults: Record<string, unknown> = {}
  if (dataDe || dataAte) {
    const range: Record<string, string> = {}
    if (dataDe) range.greater_than_equal = dataDe
    if (dataAte) range.less_than_equal = dataAte
    whereEvents.createdAt = range
    whereResults.createdAt = range
  }
  if (faixaFit) whereResults.faixa_fit = { equals: faixaFit }

  // ── Contagem de eventos por nome ─────────────────────────────────
  const eventos = [
    'diagnostico_iniciado',
    'etapa_1_concluida',
    'diagnostico_concluido',
    'pdf_baixado',
    'agendamento_concluido',
  ] as const

  const counts: Record<string, number> = {}
  for (const ev of eventos) {
    try {
      const { totalDocs } = await payload.count({
        collection: 'diagnostico-events',
        where: { ...whereEvents, event_name: { equals: ev } } as never,
      })
      counts[ev] = totalDocs
    } catch {
      counts[ev] = 0
    }
  }

  // ── Resultados (para distribuição Fit + top padrões + filtro setor) ─
  let results: Array<{
    id: string | number
    faixa_fit?: string
    setor?: string
    padroes_exibidos?: unknown
    score_total?: number
    lead_email?: string
    url_resultado_hash?: string
    createdAt?: string
  }> = []
  try {
    const { docs } = await payload.find({
      collection: 'diagnostico-results',
      where: whereResults as never,
      limit: 1000,
      sort: '-createdAt',
    })
    results = docs as never
  } catch {
    /* fallback */
  }

  // Setor está em Leads, não em Results. Filtro por setor exige join.
  if (setor) {
    try {
      const { docs: leadsFiltrados } = await payload.find({
        collection: 'leads',
        where: { setor: { equals: setor } },
        limit: 1000,
      })
      const emails = new Set(leadsFiltrados.map((l) => (l as { email: string }).email))
      results = results.filter((r) => r.lead_email && emails.has(r.lead_email))
    } catch {
      /* mantém results sem filtro se a query falhar */
    }
  }

  // Distribuição por faixa Fit.
  const distFaixaFit: Record<string, number> = {
    'fit-alto': 0,
    'fit-medio': 0,
    'fit-baixo': 0,
    desfit: 0,
  }
  for (const r of results) {
    if (r.faixa_fit && r.faixa_fit in distFaixaFit) distFaixaFit[r.faixa_fit]++
  }

  // Top padrões acionados.
  const topPadroes: Record<string, number> = {}
  for (const r of results) {
    const lista = Array.isArray(r.padroes_exibidos)
      ? (r.padroes_exibidos as string[])
      : typeof r.padroes_exibidos === 'string'
        ? (() => {
            try {
              const parsed = JSON.parse(r.padroes_exibidos as string)
              return Array.isArray(parsed) ? (parsed as string[]) : []
            } catch {
              return []
            }
          })()
        : []
    for (const p of lista) topPadroes[p] = (topPadroes[p] || 0) + 1
  }

  return {
    counts: {
      iniciado: counts.diagnostico_iniciado || 0,
      etapa1: counts.etapa_1_concluida || 0,
      concluido: counts.diagnostico_concluido || 0,
      pdfBaixado: counts.pdf_baixado || 0,
      agendado: counts.agendamento_concluido || 0,
    },
    distFaixaFit,
    topPadroes,
    totalResultados: results.length,
    filtros: { de: searchParams.de, ate: searchParams.ate, setor, faixa_fit: faixaFit },
  }
}

export default async function FunilPage({
  searchParams,
}: {
  searchParams: ParamsPromise
}) {
  const user = await getSession()
  if (!user) redirect('/admin/login')

  const sp = await searchParams
  const normalized: Record<string, string | undefined> = {}
  for (const k of Object.keys(sp)) {
    const v = sp[k]
    normalized[k] = Array.isArray(v) ? v[0] : v
  }
  const dados = await carregarDados(normalized)

  return (
    <PainelLayout user={user}>
      <FunilClient data={dados} />
    </PainelLayout>
  )
}
