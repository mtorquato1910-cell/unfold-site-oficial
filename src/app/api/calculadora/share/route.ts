/**
 * POST /api/calculadora/share
 *
 * Compartilha o resultado salvo por e-mail. Sprint 5 / S5.4.
 *
 * Body: `{ token: string, destinatario_email: string }`
 * - Valida token (UUID 32-hex) e e-mail.
 * - Carrega doc de `calculadora-results`.
 * - Renderiza o PDF dinamicamente (mesma stack do /pdf) e envia com Resend.
 * - Rate limit 3/hora/IP.
 * - Dispara evento `resultado_compartilhado` no tracker server.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { sendEmail } from '@/lib/email/adapter'
import { templateShareCalc } from '@/lib/email/templates-calc-v2'
import { trackCalcEventServer } from '@/lib/analytics/calculadora-events-server'
import { calcular } from '@/lib/calculadora/formulas'
import { publicResultUrl, siteBaseUrl } from '@/lib/calculadora-server/public-url'
import { normalizeEmail } from '@/lib/utils/email'
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

const rateMap = new Map<string, { count: number; resetAt: number }>()
function rateLimit(ip: string): boolean {
  const now = Date.now()
  const e = rateMap.get(ip)
  if (!e || now > e.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 })
    return true
  }
  if (e.count >= 3) return false
  e.count++
  return true
}

const schema = z.object({
  token: z.string().regex(TOKEN_RE, 'token inválido'),
  destinatario_email: z.string().email('e-mail inválido'),
  remetente_nome: z.string().min(1).max(120).optional(),
})

interface CalcDoc {
  empresa: string
  nome: string
  setor: Setor | null
  email: string
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

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  if (!rateLimit(ip)) {
    return NextResponse.json({ ok: false, error: 'rate_limit' }, { status: 429 })
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }
  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'invalid_payload', details: parsed.error.flatten() },
      { status: 400 },
    )
  }
  const destinatario = normalizeEmail(parsed.data.destinatario_email)

  // Busca doc
  let doc: CalcDoc | undefined
  try {
    const payload = await getPayload({ config: configPromise })
    const found = await payload.find({
      collection: 'calculadora-results',
      where: { calc_url_resultado: { equals: parsed.data.token } },
      limit: 1,
    })
    doc = found.docs[0] as unknown as CalcDoc | undefined
  } catch (err) {
    console.error('[calculadora/share] db erro:', err)
    return NextResponse.json({ ok: false, error: 'db_error' }, { status: 500 })
  }
  if (!doc) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
  }

  // Gera PDF (mesmo motor da rota /pdf — dynamic import para não inflar client bundle)
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

  const baseUrl = siteBaseUrl(req)
  const urlResultado = publicResultUrl(req, parsed.data.token)
  const unsubUrl = `${baseUrl}/api/calculadora/unsubscribe?t=${parsed.data.token}&e=${encodeURIComponent(destinatario)}`

  let pdfBuffer: Buffer | undefined
  try {
    const [{ renderToBuffer }, { CalculadoraPDF }, React] = await Promise.all([
      import('@react-pdf/renderer'),
      import('@/lib/calculadora-pdf/template'),
      import('react'),
    ])
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
      geradoEm: new Date(doc.createdAt).toLocaleDateString('pt-BR'),
      url: urlResultado,
    })
    void React
    pdfBuffer = (await renderToBuffer(element)) as Buffer
  } catch (err) {
    console.error('[calculadora/share] PDF render falhou:', err)
    // Segue sem anexo — link continua funcional.
  }

  const html = templateShareCalc({
    recipient_nome: 'Olá',
    remetente_nome: parsed.data.remetente_nome || doc.nome,
    empresa: doc.empresa,
    url_resultado: urlResultado,
    unsubscribe_url: unsubUrl,
  })

  const sent = await sendEmail({
    to: destinatario,
    subject: `Resultado da Calculadora de Performance · ${doc.empresa}`,
    html,
    replyTo: doc.email,
  })

  if (!sent.success) {
    return NextResponse.json(
      { ok: false, error: 'send_failed', detail: sent.error },
      { status: 502 },
    )
  }

  await trackCalcEventServer({
    event_name: 'resultado_compartilhado',
    result_token: parsed.data.token,
    lead_email: doc.email,
    metadata: { destinatario, mode: sent.mode },
  })

  // NB: anexo de PDF via Resend exige `attachments[]`. O adapter atual não expõe
  // attachments — fica como Fast-Follow. Para a v1 (S5.4) o e-mail contém o link
  // para o /r/[token], e o PDF está sempre disponível em /api/calculadora/pdf.
  return NextResponse.json({
    ok: true,
    mode: sent.mode,
    pdf_disponivel: Boolean(pdfBuffer),
  })
}
