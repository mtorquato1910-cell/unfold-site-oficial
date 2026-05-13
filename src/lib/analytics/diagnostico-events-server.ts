/**
 * Analytics do Diagnóstico de Growth v2 — versão SERVER.
 *
 * NÃO importar de client components — este arquivo puxa Payload + pg.
 *
 * Use apenas em:
 *   - route handlers (`src/app/api/**`)
 *   - collection hooks
 *   - crons
 *
 * Para client, use `diagnostico-events.ts`.
 */

import { getPayload } from 'payload'
import configPromise from '@payload-config'

import type { EventPayload } from './diagnostico-events'

/**
 * Persiste um evento direto em `diagnostico-events` via Payload.
 * Best-effort: erros não propagam (analytics não pode quebrar fluxos críticos).
 */
export async function trackEventServer(p: EventPayload): Promise<void> {
  try {
    const payload = await getPayload({ config: configPromise })
    await payload.create({
      collection: 'diagnostico-events',
      data: {
        event_name: p.event_name,
        session_id: p.session_id,
        result_hash: p.result_hash,
        lead_email: p.lead_email,
        metadata: p.metadata,
      } as never,
    })
  } catch (err) {
    console.error('[analytics/server] erro:', err)
  }
}

// Re-export do tipo para conveniência.
export type { EventPayload, EventName } from './diagnostico-events'
