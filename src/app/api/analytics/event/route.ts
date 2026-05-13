/**
 * Endpoint interno de eventos do Diagnóstico.
 * Recebe `EventPayload` (JSON ou sendBeacon) e persiste em `diagnostico-events`.
 *
 * Aceitação ampla (não autenticado) — anti-flood é responsabilidade do client
 * (dedup por sessionStorage). Server limita tamanho do payload e logs.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { z } from 'zod'

const schema = z.object({
  event_name: z.enum([
    'diagnostico_iniciado',
    'etapa_1_concluida',
    'etapa_2_pergunta',
    'diagnostico_concluido',
    'pdf_baixado',
    'resultado_compartilhado',
    'opt_in_nutricao',
    'agendamento_iniciado',
    'agendamento_concluido',
    'rd_webhook',
  ]),
  result_hash: z.string().max(64).optional(),
  lead_email: z.string().email().optional(),
  session_id: z.string().max(64).optional(),
  metadata: z.record(z.unknown()).optional(),
})

export async function POST(req: NextRequest) {
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
      collection: 'diagnostico-events',
      data: {
        ...parsed.data,
        ip_address:
          req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
        user_agent: req.headers.get('user-agent') || undefined,
      } as never,
    })
  } catch (err) {
    console.warn('[analytics/event] DB indisponível:', err)
    // Não devolve 500 para não impactar UX — analytics best-effort.
  }

  return NextResponse.json({ ok: true })
}
