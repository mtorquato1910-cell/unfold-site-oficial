/**
 * Job: sincroniza Leads pendentes com RD Station.
 * Chamado pelo cron /api/cron/tick.
 */

import { getPayload } from 'payload'
import config from '@payload-config'
import { syncContact } from '@/lib/crm/adapter'

const MAX_PER_RUN = 20
const MAX_RETRIES = 5

export async function syncPendingLeadsToRD(): Promise<{
  processed: number
  succeeded: number
  failed: number
  skipped: number
}> {
  let processed = 0
  let succeeded = 0
  let failed = 0
  let skipped = 0

  try {
    const payload = await getPayload({ config })

    // Pega leads com sync pendente, com consentimento
    const result = await payload.find({
      collection: 'leads',
      where: {
        and: [
          { rd_sync_status: { equals: 'pending' } },
          { consentimento_lgpd: { equals: true } },
        ],
      },
      limit: MAX_PER_RUN,
      sort: 'createdAt',
    })

    for (const lead of result.docs) {
      processed++
      const l: any = lead

      // Skip se já tentou demais
      const attempts = l.rd_sync_attempts ?? 0
      if (attempts >= MAX_RETRIES) {
        await payload.update({
          collection: 'leads',
          id: lead.id,
          data: { rd_sync_status: 'error' as any } as any,
        })
        skipped++
        continue
      }

      const sync = await syncContact({
        nome: l.nome,
        email: l.email,
        empresa: l.empresa,
        cargo: l.cargo,
        telefone: l.telefone,
        origem: l.origem,
      })

      if (sync.success) {
        await payload.update({
          collection: 'leads',
          id: lead.id,
          data: {
            rd_sync_status: (sync.mode === 'mock' ? 'mock' : 'synced') as any,
            rd_contact_id: sync.external_id,
          } as any,
        })
        succeeded++
      } else {
        await payload.update({
          collection: 'leads',
          id: lead.id,
          data: {
            rd_sync_status: (attempts + 1 >= MAX_RETRIES ? 'error' : 'pending') as any,
          } as any,
        })
        failed++
      }
    }
  } catch (err) {
    console.error('[sync-leads-rd] erro fatal:', err)
  }

  return { processed, succeeded, failed, skipped }
}
