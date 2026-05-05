'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireRole } from '@/lib/painel-auth'

type FlexibleData = Record<string, any>

/**
 * InsightsVariations actions com mapping inglês → PT-BR.
 * Schema real: titulo, nivel_fit (alto/medio/baixo), pilar, headline, corpo,
 * cta_texto, ativo, featured, publishOrder, nota_interna
 */

const NIVEL_FIT_MAP: Record<string, string> = {
  alto: 'alto',
  medio: 'medio',
  baixo: 'baixo',
  // Aliases legados
  basico: 'baixo',
  intermediario: 'medio',
  avancado: 'alto',
  expert: 'alto',
  high: 'alto',
  medium: 'medio',
  low: 'baixo',
}

function mapInsight(input: FlexibleData) {
  return {
    titulo: input.titulo ?? input.title ?? '',
    nivel_fit:
      NIVEL_FIT_MAP[input.nivel_fit ?? input.maturityLevel ?? input.level ?? 'medio'] ?? 'medio',
    pilar: input.pilar ?? input.dimension ?? 'geral',
    headline: input.headline ?? input.title ?? '',
    corpo: input.corpo ?? input.content ?? input.body ?? '',
    cta_texto: input.cta_texto ?? input.cta ?? 'Agendar conversa estratégica',
    ativo: input.ativo ?? input.active ?? true,
    featured: input.featured ?? false,
    publishOrder: input.publishOrder ?? 0,
    nota_interna: input.nota_interna ?? input.notes ?? undefined,
  }
}

export async function createInsight(input: FlexibleData) {
  await requireRole('editor')
  const data = mapInsight(input)
  if (!data.titulo?.trim()) throw new Error('Título obrigatório')
  if (!data.headline?.trim()) data.headline = data.titulo
  if (!data.corpo?.trim()) throw new Error('Corpo do insight obrigatório')

  const payload = await getPayload({ config })
  const created = await payload.create({ collection: 'insights-variations', data: data as any })
  revalidatePath('/admin/insights')
  revalidatePath('/')
  return { ok: true, id: created.id }
}

export async function updateInsight(id: string, input: FlexibleData) {
  await requireRole('editor')
  const data = mapInsight(input)
  const payload = await getPayload({ config })
  await payload.update({ collection: 'insights-variations', id, data: data as any })
  revalidatePath('/admin/insights')
  revalidatePath('/')
  return { ok: true }
}

export async function deleteInsight(id: string) {
  await requireRole('admin')
  const payload = await getPayload({ config })
  await payload.delete({ collection: 'insights-variations', id })
  revalidatePath('/admin/insights')
  revalidatePath('/')
  return { ok: true }
}
