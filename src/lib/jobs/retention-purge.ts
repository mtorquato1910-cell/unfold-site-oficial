/**
 * Job: anonimiza CalculadoraResults expirados (LGPD).
 * Runs as part of /api/cron/tick.
 */

import { getPayload } from 'payload'
import config from '@payload-config'

const ANONYMIZE_BATCH = 50

export async function purgeExpiredCalculadora(): Promise<{ anonymized: number }> {
  let anonymized = 0
  try {
    const payload = await getPayload({ config })
    const now = new Date().toISOString()

    const result = await payload.find({
      collection: 'calculadora-results',
      where: { retentionUntil: { less_than: now } },
      limit: ANONYMIZE_BATCH,
      sort: 'retentionUntil',
    })

    for (const doc of result.docs as any[]) {
      // Anonimização: zera PII, mantém estatística (score + inputs sem identificação)
      await payload.update({
        collection: 'calculadora-results',
        id: doc.id,
        data: {
          nome: '[anonimizado]',
          email: `anonimo-${doc.id}@removed.local`,
          empresa: '[anonimizado]',
          cargo: null,
          telefone: null,
          consent: { ...(doc.consent || {}), ip: null, userAgent: null },
        } as any,
      })
      anonymized++
    }

    if (anonymized > 0) {
      try {
        await payload.create({
          collection: 'audit-log',
          data: {
            acao: 'lgpd.request' as any,
            entidade: 'calculadora-results:retention-purge',
            actor_email: 'system@unfoldgrowth.com.br',
            detalhes: JSON.stringify({ anonymized, runAt: now }),
            status: 'ok' as any,
          } as any,
        })
      } catch {}
    }
  } catch (err) {
    console.error('[retention-purge] erro:', err)
  }
  return { anonymized }
}
