/**
 * POST /api/calculadora — persistência da Calculadora v2 (Sprint 4 / S4.1).
 *
 * Substitui a versão v1 (que chamava IA) por persistência pura com
 * **server-side recompute** anti-adulteração (ADR-7):
 *   - Recebe payload completo (etapa1, inputs, premissas, resultado, insight, token).
 *   - Recalcula `resultado` e `insight` no server usando o motor puro
 *     (src/lib/calculadora/*). Server sempre vence.
 *   - Divergência > 1% → log warn + evento `payload_tampered` (sem bloquear).
 *   - Upsert por token: idempotente (mesmo token → update).
 *   - Upsert em `leads` por email (origem = 'calculadora').
 *   - Rate limit in-memory 5/hora/IP (ADR-8: aceito como débito v1).
 *   - LGPD: consent.given obrigatório.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { calcular } from '@/lib/calculadora/formulas'
import { selecionarInsight } from '@/lib/calculadora/insights'
import { submissaoSchema } from '@/lib/calculadora/schema'
import { detectarAdulteracao } from '@/lib/calculadora/anti-tamper'
import { calcLeadScore } from '@/lib/calculadora/score'
import { publicResultUrl } from '@/lib/calculadora-server/public-url'
import { syncCalculadoraToRD } from '@/lib/crm/rd-calculadora'
import { trackCalcEventServer } from '@/lib/analytics/calculadora-events-server'
import type {
  CalculadoraInputs,
  InsightId,
  Premissas,
} from '@/lib/calculadora/types'

// ── Rate limit in-memory (ADR-8: débito v1, migrar para Vercel KV pós go-live) ──
const rateMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60 * 60 * 1000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  // ── Rate limit ───────────────────────────────────────────────────────────
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { ok: false, error: 'rate_limit', message: 'Limite atingido. Tente em 1 hora.' },
      { status: 429 },
    )
  }

  // ── Parse + Zod ──────────────────────────────────────────────────────────
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }
  const parsed = submissaoSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: 'invalid_payload',
        details: parsed.error.flatten(),
      },
      { status: 400 },
    )
  }
  const d = parsed.data

  // ── Server-side recompute (ADR-7) ────────────────────────────────────────
  const inputs: CalculadoraInputs = d.inputs
  const premissas: Premissas = d.premissas
  const serverResultado = calcular(inputs, premissas)
  const serverInsight = selecionarInsight({
    crm_funcional: inputs.crm_funcional,
    roi_no_periodo: serverResultado.roi_no_periodo,
    receita_no_periodo: serverResultado.receita_no_periodo,
    receita_em_pipeline: serverResultado.receita_em_pipeline,
  })
  const tampered = detectarAdulteracao(d.resultado, serverResultado)
  if (tampered) {
    console.warn(
      '[calculadora] divergência client↔server > 1%:',
      JSON.stringify({
        clientRoi: d.resultado.roi_no_periodo,
        serverRoi: serverResultado.roi_no_periodo,
        token: d.token,
      }),
    )
    await trackCalcEventServer({
      event_name: 'payload_tampered',
      result_token: d.token,
      metadata: {
        client_roi_periodo: d.resultado.roi_no_periodo,
        server_roi_periodo: serverResultado.roi_no_periodo,
      },
    })
  }
  const insightPrincipal: InsightId = serverInsight.principal

  // ── Persistência ─────────────────────────────────────────────────────────
  const ua = req.headers.get('user-agent') || 'unknown'
  const score = calcLeadScore({
    investimento_mensal: inputs.investimento_mensal,
    ticket_medio: inputs.ticket_medio,
    crm_funcional: inputs.crm_funcional,
    roi_total: serverResultado.roi_total,
  })

  let leadId: string | null = null
  let resultId: string | null = null
  const emailLower = d.etapa1.email.toLowerCase().trim()
  const url = publicResultUrl(req, d.token)

  try {
    const payload = await getPayload({ config: configPromise })

    // 1. Upsert Leads por email
    const existingLead = await payload.find({
      collection: 'leads',
      where: { email: { equals: emailLower } },
      limit: 1,
    })
    if (existingLead.docs[0]) {
      const lead = existingLead.docs[0]
      leadId = String(lead.id)
      await payload.update({
        collection: 'leads',
        id: lead.id,
        data: {
          nome: d.etapa1.nome,
          empresa: d.etapa1.empresa,
        } as never,
      })
    } else {
      const newLead = await payload.create({
        collection: 'leads',
        data: {
          nome: d.etapa1.nome,
          email: emailLower,
          empresa: d.etapa1.empresa,
          origem: 'calculadora',
          rd_sync_status: 'pending',
          ip_address: ip,
        } as never,
      })
      leadId = String(newLead.id)
    }

    // 2. Upsert CalculadoraResults por token (idempotente)
    const retentionDate = new Date()
    retentionDate.setMonth(retentionDate.getMonth() + 24)

    const dadosResultado = {
      nome: d.etapa1.nome,
      email: emailLower,
      empresa: d.etapa1.empresa,
      setor: d.etapa1.setor,
      lead: leadId,
      // Inputs Etapa 2
      calc_investimento_mensal: inputs.investimento_mensal,
      calc_canais_selecionados: inputs.canais,
      calc_ticket_medio: inputs.ticket_medio,
      calc_modelo_negocio: inputs.modelo,
      calc_periodo_meses: String(inputs.periodo),
      calc_crm_funcional: inputs.crm_funcional,
      // Premissas (server-side são as do payload — lead pode ter editado)
      calc_premissa_cpl: premissas.cpl,
      calc_premissa_taxa_qualif: premissas.taxa_qualificacao,
      calc_premissa_conv_mql_cliente: premissas.conversao_mql_cliente,
      calc_premissa_ciclo_dias: premissas.ciclo_dias,
      calc_premissas_editadas: d.premissas_editadas,
      // Resultado server (sempre vence)
      calc_investimento_total: serverResultado.investimento_total,
      calc_leads_gerados: serverResultado.leads_gerados,
      calc_mqls: serverResultado.mqls,
      calc_clientes_total: serverResultado.clientes_fechados,
      calc_clientes_no_periodo: serverResultado.clientes_no_periodo,
      calc_clientes_pipeline: serverResultado.clientes_em_pipeline,
      calc_receita_periodo: serverResultado.receita_no_periodo,
      calc_receita_pipeline: serverResultado.receita_em_pipeline,
      calc_roi_periodo: serverResultado.roi_no_periodo,
      calc_roi_total: serverResultado.roi_total,
      // Insight server
      calc_insight_principal: insightPrincipal,
      calc_insight_override: serverInsight.override_ie,
      // Metadados
      calc_url_resultado: d.token,
      score,
      consent: {
        given: true,
        timestamp: new Date().toISOString(),
        ip,
        userAgent: ua,
        policyVersion: d.consent.policyVersion,
      },
      retentionUntil: retentionDate.toISOString(),
    }

    const existing = await payload.find({
      collection: 'calculadora-results',
      where: { calc_url_resultado: { equals: d.token } },
      limit: 1,
    })
    if (existing.docs[0]) {
      const updated = await payload.update({
        collection: 'calculadora-results',
        id: existing.docs[0].id,
        data: dadosResultado as never,
      })
      resultId = String(updated.id)
    } else {
      const created = await payload.create({
        collection: 'calculadora-results',
        data: dadosResultado as never,
      })
      resultId = String(created.id)
    }
  } catch (err) {
    console.error('[calculadora] persistência falhou:', err)
    return NextResponse.json(
      { ok: false, error: 'persistence_error' },
      { status: 500 },
    )
  }

  // ── RD sync (fire-and-forget, não bloqueia resposta) ────────────────────
  void syncCalculadoraToRD({
    email: emailLower,
    nome: d.etapa1.nome,
    empresa: d.etapa1.empresa,
    setor: d.etapa1.setor,
    crm_funcional: inputs.crm_funcional,
    investimento_mensal: inputs.investimento_mensal,
    ticket_medio: inputs.ticket_medio,
    modelo: inputs.modelo,
    periodo: inputs.periodo,
    roi_no_periodo: serverResultado.roi_no_periodo,
    roi_total: serverResultado.roi_total,
    insight_principal: insightPrincipal,
    insight_override_ie: serverInsight.override_ie,
    result_token: d.token,
    url_resultado: url,
  })
    .then(async (r) => {
      if (r.mode === 'rd-station' && r.success) {
        try {
          const payload = await getPayload({ config: configPromise })
          if (resultId) {
            await payload.update({
              collection: 'calculadora-results',
              id: resultId,
              data: { rd_sync_status: 'synced' } as never,
            })
          }
        } catch {}
      } else if (r.mode === 'skipped') {
        try {
          const payload = await getPayload({ config: configPromise })
          if (resultId) {
            await payload.update({
              collection: 'calculadora-results',
              id: resultId,
              data: { rd_sync_status: 'skipped' } as never,
            })
          }
        } catch {}
      } else if (!r.success) {
        try {
          const payload = await getPayload({ config: configPromise })
          if (resultId) {
            await payload.update({
              collection: 'calculadora-results',
              id: resultId,
              data: { rd_sync_status: 'failed' } as never,
            })
          }
        } catch {}
      }
    })
    .catch(() => {})

  return NextResponse.json({
    ok: true,
    token: d.token,
    url,
    score,
    insight: insightPrincipal,
    tampered,
  })
}
