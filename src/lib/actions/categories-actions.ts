'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireRole } from '@/lib/painel-auth'

type FlexibleData = Record<string, any>

/**
 * Categories: schema {nome, slug, pilar, descricao}.
 * Aceita 'name'/'description' antigo e mapeia.
 */

function mapCategory(input: FlexibleData) {
  return {
    nome: input.nome ?? input.name ?? '',
    slug: input.slug ?? '',
    pilar: input.pilar ?? input.pillar ?? undefined,
    descricao: input.descricao ?? input.description ?? undefined,
  }
}

export async function createCategory(input: FlexibleData) {
  await requireRole('editor')
  const data = mapCategory(input)
  if (!data.nome?.trim()) throw new Error('Nome obrigatório')
  if (!data.slug?.trim()) throw new Error('Slug obrigatório')

  const payload = await getPayload({ config })
  const created = await payload.create({ collection: 'categories', data: data as any })
  revalidatePath('/admin/categories')
  revalidatePath('/blog')
  return { ok: true, id: created.id }
}

export async function updateCategory(id: string, input: FlexibleData) {
  await requireRole('editor')
  const payload = await getPayload({ config })
  const data = mapCategory(input)
  await payload.update({ collection: 'categories', id, data: data as any })
  revalidatePath('/admin/categories')
  revalidatePath('/blog')
  return { ok: true }
}

export async function deleteCategory(id: string) {
  await requireRole('editor')
  const payload = await getPayload({ config })
  await payload.delete({ collection: 'categories', id })
  revalidatePath('/admin/categories')
  revalidatePath('/blog')
  return { ok: true }
}
