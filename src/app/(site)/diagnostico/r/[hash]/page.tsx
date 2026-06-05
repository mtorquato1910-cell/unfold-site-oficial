import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import DiagnosticoResultadoV2 from '@/components/diagnostico/DiagnosticoResultadoV2'
import {
  getCalendlyURLsFromSettings,
  getContactEmailFromSettings,
  resolveCalendlyURL,
} from '@/lib/calendar/calendly'
import { LABEL_FAIXA } from '@/lib/scoring/textos'
import type {
  CodigoCaminho,
  CodigoInsight,
  DiagnosticoCompleto,
  FaixaFit,
  FaixaMaturidade,
} from '@/lib/scoring/types'

// Resultado público — não cachear, edits no admin precisam refletir imediatamente.
export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ hash: string }> }

interface ResultDoc {
  url_resultado_hash?: string
  lead_email?: string
  score_diagnosticar?: number | null
  score_estruturar?: number | null
  score_operar?: number | null
  score_evoluir?: number | null
  score_gestao?: number | null
  score_total?: number | null
  faixa_consolidada?: FaixaMaturidade | null
  fit_estrutural?: number | null
  fit_dor?: number | null
  fit_cabeca?: number | null
  fit_urgencia?: number | null
  score_fit?: number | null
  faixa_fit?: FaixaFit | null
  padroes_acionados?: unknown
  padroes_exibidos?: unknown
  caminhos_exibidos?: unknown
}

async function findByHash(hash: string): Promise<ResultDoc | null> {
  try {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'diagnostico-results',
      where: { url_resultado_hash: { equals: hash } },
      limit: 1,
    })
    return (docs[0] as unknown as ResultDoc) ?? null
  } catch {
    return null
  }
}

async function lookupNome(email?: string): Promise<string> {
  if (!email) return 'visitante'
  try {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'leads',
      where: { email: { equals: email } },
      limit: 1,
    })
    return (docs[0]?.nome as string) || 'visitante'
  } catch {
    return 'visitante'
  }
}

// Metadata sem PII — só score, faixa e branding (spec privacy + LGPD).
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { hash } = await params
  const doc = await findByHash(hash)
  if (!doc) {
    return { title: 'Diagnóstico não encontrado | Unfold Growth' }
  }
  const score = doc.score_total ?? 0
  const faixa = doc.faixa_consolidada ? LABEL_FAIXA[doc.faixa_consolidada] : 'em análise'
  const title = `Score ${score}/100 — ${faixa} | Diagnóstico de Growth`
  const description = `Resultado de um diagnóstico de growth pelo método UGS — score ${score}/100 (${faixa}). Faça o seu em unfoldgrowth.com.br/diagnostico.`
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      type: 'article',
      siteName: 'Unfold Growth',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

function readArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? (parsed as T[]) : []
    } catch {
      return []
    }
  }
  return []
}

export default async function DiagnosticoResultadoHashPage({ params }: Props) {
  const { hash } = await params
  const doc = await findByHash(hash)
  if (!doc) notFound()

  // Reconstrói o tipo DiagnosticoCompleto a partir do que está salvo no DB.
  const diag: DiagnosticoCompleto = {
    score_diagnosticar: doc.score_diagnosticar ?? 0,
    score_estruturar: doc.score_estruturar ?? 0,
    score_operar: doc.score_operar ?? 0,
    score_evoluir: doc.score_evoluir ?? 0,
    score_gestao: doc.score_gestao ?? 0,
    score_consolidado: doc.score_total ?? 0,
    faixa_consolidada: (doc.faixa_consolidada ?? 'critica') as FaixaMaturidade,
    faixas_eixos: {
      diagnosticar: faixaFromScore(doc.score_diagnosticar ?? 0),
      estruturar: faixaFromScore(doc.score_estruturar ?? 0),
      operar: faixaFromScore(doc.score_operar ?? 0),
      evoluir: faixaFromScore(doc.score_evoluir ?? 0),
      gestao: faixaFromScore(doc.score_gestao ?? 0),
    },
    fit_estrutural: doc.fit_estrutural ?? 0,
    fit_dor: doc.fit_dor ?? 0,
    fit_cabeca: doc.fit_cabeca ?? 0,
    fit_urgencia: doc.fit_urgencia ?? 0,
    score_fit: doc.score_fit ?? 0,
    faixa_fit: (doc.faixa_fit ?? 'desfit') as FaixaFit,
    padroes_acionados: readArray(doc.padroes_acionados),
    padroes_exibidos: readArray<CodigoInsight>(doc.padroes_exibidos),
    caminhos_exibidos: readArray<CodigoCaminho>(doc.caminhos_exibidos),
  }

  const nomeCompleto = await lookupNome(doc.lead_email)
  const primeiroNome = nomeCompleto.split(' ')[0] || nomeCompleto

  const urls = await getCalendlyURLsFromSettings()
  const calendlyUrl = resolveCalendlyURL(urls, diag.faixa_fit)
  const contactEmail =
    (await getContactEmailFromSettings()) || 'tecnologia@unfoldgrowth.com.br'

  return (
    <main className="min-h-screen pt-16">
      <DiagnosticoResultadoV2
        primeiroNome={primeiroNome}
        diag={diag}
        hash={hash}
        calendlyUrl={calendlyUrl}
        contactEmail={contactEmail}
      />
    </main>
  )
}

function faixaFromScore(s: number): FaixaMaturidade {
  if (s <= 25) return 'critica'
  if (s <= 50) return 'em-formacao'
  if (s <= 75) return 'estruturada'
  return 'madura'
}
