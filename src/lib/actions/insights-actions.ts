'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireRole } from '@/lib/painel-auth'

const FEATURED_LIMIT = 6

export async function toggleInsightFeatured(id: string, featured: boolean) {
  await requireRole('editor')
  const payload = await getPayload({ config })

  // Enforcement do limite (S15 AC21)
  if (featured) {
    const current = await payload.find({
      collection: 'insights-variations',
      where: { featured: { equals: true } },
      limit: 0,
    })
    if (current.totalDocs >= FEATURED_LIMIT) {
      throw new Error(
        `Limite de ${FEATURED_LIMIT} insights publicados atingido. Despublique algum antes.`,
      )
    }
  }

  await payload.update({
    collection: 'insights-variations',
    id,
    data: { featured } as any,
  })
  revalidatePath('/admin/insights')
  revalidatePath('/')
  return { ok: true }
}

export async function updateInsightPublishOrder(id: string, publishOrder: number) {
  await requireRole('editor')
  const payload = await getPayload({ config })
  await payload.update({
    collection: 'insights-variations',
    id,
    data: { publishOrder } as any,
  })
  revalidatePath('/admin/insights')
  revalidatePath('/')
  return { ok: true }
}

export async function getFeaturedCount() {
  const payload = await getPayload({ config })
  const result = await payload.count({
    collection: 'insights-variations',
    where: { featured: { equals: true } },
  })
  return { count: result.totalDocs, limit: FEATURED_LIMIT }
}
