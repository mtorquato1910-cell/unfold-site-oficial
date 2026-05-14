/**
 * Endpoint interno de eventos da Calculadora v2.
 *
 * Recebe `CalcEventPayload` (JSON ou sendBeacon) e persiste em `calculadora-events`.
 * Espelha `/api/analytics/event` do Diagnóstico — Sprint 4 / S4.5.
 *
 * Aceitação ampla (não autenticado): anti-flood já é feito client-side (dedup por
 * sessionStorage + debouncer). Server limita tamanho do payload por Zod.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { z } from 'zod'

// Fix pré-prod (auditoria @qa): rate limit 60/min/IP + tamanho máx body.
const rateMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 60
const RATE_WINDOW_MS = 60 * 1000
const MAX_BODY_BYTES = 4 * 1024 // 4kb — eventos são pequenos por design

function rateLimit(ip: string): boolean {
  const now = Date.now()
  const e = rateMap.get(ip)
  if (!e || now > e.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (e.count >= RATE_LIMIT) return false
  e.count++
  return true
}

const schema = z.object({
  event_name: z.enum([
    'calculadora_iniciada',
    'etapa_1_concluida',
    'calculadora_input_alterado',
    'premissa_alterada',
    'resultado_visualizado',
    'insight_exibido',
    'pdf_baixado',
    'resultado_compartilhado',
    'calculadora_para_diagnostico',
    'payload_tampered',
  ]),
  result_token: z.string().max(64).optional(),
  lead_email: z.string().email().optional(),
  session_id: z.string().max(64).optional(),
  metadata: z.record(z.unknown()).optional(),
})

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  if (!rateLimit(ip)) {
    return NextResponse.json({ ok: false, error: 'rate_limit' }, { status: 429 })
  }

  // Content-Length cheap-check antes de parsear o body (defesa contra flood)
  const cl = Number(req.headers.get('content-length') || 0)
  if (cl > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: 'payload_too_large' }, { status: 413 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 })
  }

  try {
    const payload = await getPayload({ config: configPromise })
    await payload.create({
      collection: 'calculadora-events',
      data: {
        event_name: parsed.data.event_name,
        result_token: parsed.data.result_token,
        lead_email: parsed.data.lead_email?.toLowerCase().trim(),
        session_id: parsed.data.session_id,
        metadata: parsed.data.metadata,
        ip_address:
          req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
        user_agent: req.headers.get('user-agent') || undefined,
      } as never,
    })
  } catch (err) {
    console.warn('[calculadora/events] DB indisponível:', err)
    // Não devolve 500 — analytics best-effort.
  }

  return NextResponse.json({ ok: true })
}
