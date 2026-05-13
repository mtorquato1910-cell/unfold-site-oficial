/**
 * Export CSV dos resultados de diagnóstico — usado pelo dashboard funil do painel.
 * Aceita os mesmos filtros: de, ate, setor, faixa_fit.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { getSession } from '@/lib/painel-auth'

interface ResultDoc {
  id: string | number
  lead_email?: string
  score_total?: number
  score_fit?: number
  faixa_fit?: string
  faixa_consolidada?: string
  padroes_exibidos?: unknown
  caminhos_exibidos?: unknown
  url_resultado_hash?: string
  data_inicio?: string
  data_conclusao?: string
  agendou?: boolean
  createdAt?: string
}

function readArray(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[]
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? (parsed as string[]) : []
    } catch {
      return []
    }
  }
  return []
}

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return ''
  const s = typeof v === 'string' ? v : String(v)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export async function GET(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const de = url.searchParams.get('de')
  const ate = url.searchParams.get('ate')
  const setor = url.searchParams.get('setor') || undefined
  const faixaFit = url.searchParams.get('faixa_fit') || undefined

  const where: Record<string, unknown> = {}
  if (de || ate) {
    const range: Record<string, string> = {}
    if (de) range.greater_than_equal = new Date(de).toISOString()
    if (ate) range.less_than_equal = new Date(ate).toISOString()
    where.createdAt = range
  }
  if (faixaFit) where.faixa_fit = { equals: faixaFit }

  const payload = await getPayload({ config: configPromise })
  let results: ResultDoc[] = []
  try {
    const { docs } = await payload.find({
      collection: 'diagnostico-results',
      where: where as never,
      limit: 5000, // proteção contra export gigantesco
      sort: '-createdAt',
    })
    results = docs as never
  } catch (err) {
    console.error('[export-csv] erro:', err)
  }

  if (setor) {
    try {
      const { docs: leads } = await payload.find({
        collection: 'leads',
        where: { setor: { equals: setor } },
        limit: 5000,
      })
      const emails = new Set(leads.map((l) => (l as { email: string }).email))
      results = results.filter((r) => r.lead_email && emails.has(r.lead_email))
    } catch {
      /* mantém sem filtro */
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
  const header = [
    'criado_em',
    'lead_email',
    'score_consolidado',
    'faixa_consolidada',
    'score_fit',
    'faixa_fit',
    'padroes_exibidos',
    'caminhos_exibidos',
    'data_inicio',
    'data_conclusao',
    'agendou',
    'url_resultado',
  ].join(',')

  const linhas = results.map((r) => {
    const padroes = readArray(r.padroes_exibidos).join('|')
    const caminhos = readArray(r.caminhos_exibidos).join('|')
    const urlPub = r.url_resultado_hash ? `${baseUrl}/diagnostico/r/${r.url_resultado_hash}` : ''
    return [
      csvCell(r.createdAt),
      csvCell(r.lead_email),
      csvCell(r.score_total),
      csvCell(r.faixa_consolidada),
      csvCell(r.score_fit),
      csvCell(r.faixa_fit),
      csvCell(padroes),
      csvCell(caminhos),
      csvCell(r.data_inicio),
      csvCell(r.data_conclusao),
      csvCell(r.agendou ? 'sim' : 'nao'),
      csvCell(urlPub),
    ].join(',')
  })

  const csv = [header, ...linhas].join('\n')
  const filename = `diagnostico-export-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse('\uFEFF' + csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
