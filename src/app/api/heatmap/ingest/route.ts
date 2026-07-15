/**
 * Ingestão do mapa de calor visual.
 * Recebe um lote de eventos ricos (click/rage/dead/error/move/scroll) e grava
 * em `site.heatmap_events` via INSERT direto no pool. Não autenticado (mesma
 * política de /api/track): validação por Zod, best-effort (nunca 500 para não
 * impactar a navegação). Só o browser com consentimento envia (LGPD no client).
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { insertHeatmapEvents } from '@/lib/heatmap/db'

const eventSchema = z.object({
  session_id: z.string().max(64),
  lead_hash: z.string().max(64).optional(),
  page_path: z.string().max(512),
  event_type: z.enum(['click', 'rage_click', 'dead_click', 'error_click', 'move', 'scroll']),
  device: z.enum(['desktop', 'tablet', 'mobile']),
  viewport_w: z.number().int().nonnegative().max(20000),
  viewport_h: z.number().int().nonnegative().max(20000),
  doc_w: z.number().int().nonnegative().max(200000),
  doc_h: z.number().int().nonnegative().max(500000),
  x_rel: z.number().min(0).max(1).optional(),
  y_abs: z.number().int().min(0).max(500000).optional(),
  y_rel: z.number().min(0).max(1).optional(),
  selector: z.string().max(1024).optional(),
  el_tag: z.string().max(40).optional(),
  el_text: z.string().max(80).optional(),
  off_x_pct: z.number().min(0).max(1).optional(),
  off_y_pct: z.number().min(0).max(1).optional(),
  scroll_depth_pct: z.number().min(0).max(1).optional(),
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

  try {
    // Normaliza page_path (defensivo — remove query string se vier).
    const events = parsed.data.events.map((e) => ({
      ...e,
      page_path: e.page_path.split('?')[0].split('#')[0] || '/',
    }))
    await insertHeatmapEvents(events)
  } catch (err) {
    console.warn('[api/heatmap/ingest] DB indisponível:', err)
    // best-effort — não devolve erro ao client.
  }

  return NextResponse.json({ ok: true })
}
