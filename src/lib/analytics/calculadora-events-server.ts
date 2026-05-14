/**
 * Analytics da Calculadora v2 — versão SERVER.
 *
 * NÃO importar de client components — puxa Payload + pg.
 * Use em route handlers, hooks de collection, crons.
 *
 * Cliente equivalente: `calculadora-events.ts` (sem `-server`).
 */

import { getPayload } from 'payload'
import configPromise from '@payload-config'

import type { CalcEventPayload } from './calculadora-events'

/**
 * Persiste um evento direto em `calculadora-events` via Payload.
 * Best-effort: erros não propagam.
 */
export async function trackCalcEventServer(p: CalcEventPayload): Promise<void> {
  try {
    const payload = await getPayload({ config: configPromise })
    await payload.create({
      collection: 'calculadora-events',
      data: {
        event_name: p.event_name,
        session_id: p.session_id,
        result_token: p.result_token,
        lead_email: p.lead_email?.toLowerCase().trim(),
        metadata: p.metadata,
      } as never,
    })
  } catch (err) {
    console.error('[calculadora-events/server] erro:', err)
  }
}

export type { CalcEventPayload, CalcEventName } from './calculadora-events'
