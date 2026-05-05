'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireRole } from '@/lib/painel-auth'

export async function deleteCalculadoraResult(id: string, reason: string) {
  const me = await requireRole('admin')
  const payload = await getPayload({ config })

  // Snapshot antes de deletar (para AuditLog)
  let snapshot: any = null
  try {
    snapshot = await payload.findByID({ collection: 'calculadora-results', id })
  } catch {}

  await payload.delete({ collection: 'calculadora-results', id })

  // Log LGPD
  try {
    await payload.create({
      collection: 'audit-log',
      data: {
        acao: 'lgpd.request' as any,
        entidade: `calculadora-results:${id}`,
        actor_email: me.email,
        detalhes: JSON.stringify({
          reason,
          deletedAt: new Date().toISOString(),
          snapshot: snapshot ? { email: snapshot.email, empresa: snapshot.empresa } : null,
        }),
        status: 'ok' as any,
      } as any,
    })
  } catch (err) {
    console.error('[calculadora-actions] AuditLog falhou:', err)
  }

  revalidatePath('/admin/calculadora')
  return { ok: true }
}
