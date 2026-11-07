'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireRole } from '@/lib/painel-auth'

type FlexibleData = Record<string, any>

/**
 * Categories: schema {nome, slug, pilar, descricao, intro, meta_description, ordem}.
 * Aceita 'name'/'description' antigo e mapeia. Campo ausente no input = não mexe.
 */

function mapCategory(input: FlexibleData) {
  const data: FlexibleData = {}
  const nome = input.nome ?? input.name
  if (nome !== undefined) data.nome = String(nome).trim()
  if (input.slug !== undefined) data.slug = String(input.slug).trim()
  const pilar = input.pilar ?? input.pillar
  if (pilar !== undefined) data.pilar = pilar
  const descricao = input.descricao ?? input.description
  if (descricao !== undefined) data.descricao = descricao
  if (input.intro !== undefined) data.intro = String(input.intro || '').trim() || null
  if (input.meta_description !== undefined) data.meta_description = String(input.meta_description || '').trim() || null
  if (input.ordem !== undefined && input.ordem !== '') data.ordem = Number(input.ordem) || 0
  return data
}

/** Tudo que mostra categoria: blog, páginas de categoria, artigos, home, sitemap e llms. */
function revalidateCategoryPages() {
  revalidatePath('/admin/categories')
  revalidatePath('/blog')
  revalidatePath('/blog/categoria/[slug]', 'page')
  revalidatePath('/blog/[slug]', 'page')
  revalidatePath('/')
  revalidatePath('/sitemap.xml')
  revalidatePath('/llms.txt')
}

export async function createCategory(input: FlexibleData) {
  await requireRole('editor')
  const data = mapCategory(input)
  if (!data.nome?.trim()) throw new Error('Nome obrigatório')
  if (!data.slug?.trim()) throw new Error('Slug obrigatório')

  const payload = await getPayload({ config })
  const created = await payload.create({ collection: 'categories', data: data as any })
  revalidateCategoryPages()
  return { ok: true, id: created.id }
}

export async function updateCategory(id: string, input: FlexibleData) {
  await requireRole('editor')
  const payload = await getPayload({ config })
  const data = mapCategory(input)
  if (data.nome !== undefined && !data.nome) throw new Error('Nome obrigatório')
  // O slug é a URL da página da categoria: não muda ao renomear (preserva a indexação).
  delete data.slug
  await payload.update({ collection: 'categories', id, data: data as any })
  revalidateCategoryPages()
  return { ok: true }
}

export async function deleteCategory(id: string) {
  await requireRole('editor')
  const payload = await getPayload({ config })
  await payload.delete({ collection: 'categories', id })
  revalidateCategoryPages()
  return { ok: true }
}
