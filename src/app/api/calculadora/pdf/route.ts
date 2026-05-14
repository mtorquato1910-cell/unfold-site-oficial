/**
 * GET /api/calculadora/pdf?token={token}
 *
 * Gera o PDF do resultado salvo. Implementação Sprint 5 / S5.3.
 *
 * - Dynamic import de @react-pdf/renderer e do template para que o bundle
 *   client da página /ferramentas/calculadora-trafego não puxe estes módulos.
 * - Reconstrói o resultado pelo motor puro a partir dos campos persistidos
 *   (defesa em profundidade: não confia em valores armazenados sem reverificar).
 * - Headers: application/pdf + Content-Disposition attachment.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { calcular } from '@/lib/calculadora/formulas'
import { publicResultUrl } from '@/lib/calculadora-server/public-url'
import type {
  Canal,
  CalculadoraInputs,
  InsightId,
  Modelo,
  Periodo,
  Premissas,
  Setor,
} from '@/lib/calculadora/types'

const TOKEN_RE = /^[a-f0-9]{32}$/

// Mini rate limit dedicado à rota de PDF (10/min/IP) — independente do POST.
const rateMap = new Map<string, { count: number; resetAt: number }>()
function rateLimit(ip: string): boolean {
  const now = Date.now()
  const e = rateMap.get(ip)
  if (!e || now > e.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (e.count >= 10) return false
  e.count++
  return true
}

interface CalcDoc {
  id: string
  empresa: string
  nome: string
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
  calc_insight_principal: InsightId
  calc_insight_override: boolean
  createdAt: string
}

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  if (!rateLimit(ip)) {
    return NextResponse.json({ ok: false, error: 'rate_limit' }, { status: 429 })
  }

  const url = new URL(req.url)
  const token = url.searchParams.get('token') || ''
  if (!TOKEN_RE.test(token)) {
    return NextResponse.json({ ok: false, error: 'invalid_token' }, { status: 400 })
  }

  let doc: CalcDoc | undefined
  try {
    const payload = await getPayload({ config: configPromise })
    const found = await payload.find({
      collection: 'calculadora-results',
      where: { calc_url_resultado: { equals: token } },
      limit: 1,
    })
    doc = found.docs[0] as unknown as CalcDoc | undefined
  } catch (err) {
    console.error('[calculadora/pdf] payload erro:', err)
    return NextResponse.json({ ok: false, error: 'db_error' }, { status: 500 })
  }
  if (!doc || !doc.calc_insight_principal) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
  }

  // Reconstrução defensiva do resultado.
  const inputs: CalculadoraInputs = {
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

  // Imports dinâmicos: @react-pdf/renderer é pesado, manter fora do client bundle.
  const [{ renderToBuffer }, { CalculadoraPDF }, React] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/lib/calculadora-pdf/template'),
    import('react'),
  ])

  const publicUrl = publicResultUrl(req, token)

  const geradoEm = new Date(doc.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const element = CalculadoraPDF({
    empresa: doc.empresa,
    nome: doc.nome,
    setor: doc.setor,
    inputs,
    premissas,
    resultado,
    insight: {
      principal: doc.calc_insight_principal,
      override_ie: doc.calc_insight_override,
    },
    geradoEm,
    url: publicUrl,
  })
  // Discard imports to keep eslint happy on unused React when CalculadoraPDF is called directly.
  void React
  const buffer = (await renderToBuffer(element)) as Buffer

  const fileSafe = (doc.empresa || 'resultado')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40)

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="calculadora-${fileSafe}-${token.slice(0, 8)}.pdf"`,
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      'X-Robots-Tag': 'noindex',
    },
  })
}
