/**
 * Acesso ao Postgres cru (pool do Payload) para o mapa de calor.
 *
 * A tabela `site.heatmap_events` e as funções de binning vivem fora das
 * collections do Payload (migration manual), então falamos direto com o pool
 * `pg` exposto pelo adapter @payloadcms/db-postgres — INSERT em lote na
 * ingestão e SELECT das RPCs de agregação na leitura.
 *
 * SERVER-ONLY. Nunca importar em componente client.
 */

import { getPayload } from 'payload'
import config from '@payload-config'

interface PgPool {
  query<T = Record<string, unknown>>(
    text: string,
    values?: unknown[],
  ): Promise<{ rows: T[] }>
}

async function getPool(): Promise<PgPool> {
  const payload = await getPayload({ config })
  const pool = (payload.db as unknown as { pool?: PgPool }).pool
  if (!pool) throw new Error('Postgres pool indisponível no adapter do Payload')
  return pool
}

export interface HeatIngestEvent {
  session_id: string
  lead_hash?: string | null
  page_path: string
  event_type: string
  device: string
  viewport_w: number
  viewport_h: number
  doc_w: number
  doc_h: number
  x_rel?: number | null
  y_abs?: number | null
  y_rel?: number | null
  selector?: string | null
  el_tag?: string | null
  el_text?: string | null
  off_x_pct?: number | null
  off_y_pct?: number | null
  scroll_depth_pct?: number | null
}

const COLS = [
  'session_id',
  'lead_hash',
  'page_path',
  'event_type',
  'device',
  'viewport_w',
  'viewport_h',
  'doc_w',
  'doc_h',
  'x_rel',
  'y_abs',
  'y_rel',
  'selector',
  'el_tag',
  'el_text',
  'off_x_pct',
  'off_y_pct',
  'scroll_depth_pct',
] as const

/** INSERT em lote (multi-row VALUES). Best-effort — o caller trata erros. */
export async function insertHeatmapEvents(events: HeatIngestEvent[]): Promise<void> {
  if (events.length === 0) return
  const pool = await getPool()

  const values: unknown[] = []
  const rows = events.map((e, i) => {
    const base = i * COLS.length
    const rec = e as unknown as Record<string, unknown>
    COLS.forEach((c) => values.push(rec[c] ?? null))
    const placeholders = COLS.map((_, j) => `$${base + j + 1}`)
    return `(${placeholders.join(', ')})`
  })

  const text = `INSERT INTO "site"."heatmap_events" (${COLS.join(', ')}) VALUES ${rows.join(', ')}`
  await pool.query(text, values)
}

// ── Consultas de agregação (RPCs) ──────────────────────────────────────────

export interface HeatPoint {
  gx: number
  gy: number
  weight: number
}
export interface HeatSelector {
  selector: string
  off_x: number
  off_y: number
  weight: number
}
export interface HeatPage {
  page_path: string
  events: number
}
export interface ScrollBucket {
  depth_pct: number
  sessions: number
}

export async function getPoints(
  path: string,
  device: string,
  from: string,
  to: string,
  eventType: string,
  grid: number,
): Promise<HeatPoint[]> {
  const pool = await getPool()
  const { rows } = await pool.query<HeatPoint>(
    'SELECT gx, gy, weight FROM "site".get_heatmap_points($1, $2, $3, $4, $5, $6)',
    [path, device, from, to, eventType, grid],
  )
  return rows
}

export async function getSelectors(
  path: string,
  device: string,
  from: string,
  to: string,
  eventType: string,
): Promise<HeatSelector[]> {
  const pool = await getPool()
  const { rows } = await pool.query<HeatSelector>(
    'SELECT selector, off_x, off_y, weight FROM "site".get_heatmap_selectors($1, $2, $3, $4, $5)',
    [path, device, from, to, eventType],
  )
  return rows
}

export async function getPages(
  from: string,
  to: string,
  eventType: string,
): Promise<HeatPage[]> {
  const pool = await getPool()
  const { rows } = await pool.query<HeatPage>(
    'SELECT page_path, events FROM "site".get_heatmap_pages($1, $2, $3)',
    [from, to, eventType],
  )
  return rows
}

export async function getScroll(
  path: string,
  device: string,
  from: string,
  to: string,
): Promise<ScrollBucket[]> {
  const pool = await getPool()
  const { rows } = await pool.query<ScrollBucket>(
    'SELECT depth_pct, sessions FROM "site".get_heatmap_scroll($1, $2, $3, $4)',
    [path, device, from, to],
  )
  return rows
}

/** Expurgo LGPD: apaga eventos do mapa de calor com mais de `days` dias. */
export async function purgeOldHeatmapEvents(days = 180): Promise<{ deleted: number }> {
  const pool = await getPool()
  const { rows } = await pool.query<{ count: string }>(
    `WITH del AS (
       DELETE FROM "site"."heatmap_events"
       WHERE created_at < now() - ($1 || ' days')::interval
       RETURNING 1
     )
     SELECT count(*)::text AS count FROM del`,
    [days],
  )
  return { deleted: Number(rows[0]?.count ?? 0) }
}
