/**
 * Endpoint de ingestão do mapa de calor.
 * Recebe um lote de eventos de navegação (pageview/click) e persiste em
 * `tracking-events`. Não autenticado (mesma política de /api/analytics/event):
 * validação por Zod, best-effort (nunca 500 para não impactar UX).
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { z } from 'zod'

const eventSchema = z.object({
  event_type: z.enum(['pageview', 'click']),
  path: z.string().max(512).optional(),
  referrer: z.string().max(1024).optional(),
  element: z.string().max(200).optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  viewport_w: z.number().optional(),
  session_id: z.string().max(64).optional(),
  lead_hash: z.string().max(64).optional(),
  metadata: z.record(z.unknown()).optional(),
})

const bodySchema = z.object({
  events: z.array(eventSchema).max(50),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 })
  }

  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined
  const ua = req.headers.get('user-agent') || undefined

  try {
    const payload = await getPayload({ config: configPromise })
    await Promise.all(
      parsed.data.events.map((e) =>
        payload.create({
          collection: 'tracking-events' as any,
          data: { ...e, ip_address: ip, user_agent: ua } as never,
        }),
      ),
    )
  } catch (err) {
    console.warn('[api/track] DB indisponível:', err)
    // best-effort — analytics não devolve erro ao client
  }

  return NextResponse.json({ ok: true })
}
