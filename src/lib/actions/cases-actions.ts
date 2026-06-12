'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireRole } from '@/lib/painel-auth'

type FlexibleData = Record<string, any>

/**
 * Cases actions com mapping inglês → schema real.
 * Schema: title (PT já), client (em vez de company), vertical (em vez de sector),
 * destacar_na_home (em vez de featured), challenge/solution, status, etc.
 */

const STATUS_MAP: Record<string, string> = {
  draft: 'draft',
  rascunho: 'draft',
  published: 'publicado',
  publicado: 'publicado',
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function mapCase(input: FlexibleData) {
  const title = input.title ?? input.titulo ?? ''
  // Slug é required + unique no schema. Se o front não enviar, derivamos do título
  // para não falhar com "Slug obrigatório".
  const slug = (input.slug?.trim() ? input.slug.trim() : slugify(title)) || ''

  const data: FlexibleData = {
    title,
    slug,
    client: input.client ?? input.cliente ?? input.company ?? input.empresa ?? '',
    vertical: input.vertical ?? input.sector ?? input.setor ?? undefined,
    tagline: input.tagline ?? input.subtitulo ?? undefined,
    challenge: input.challenge ?? input.desafio ?? undefined,
    solution: input.solution ?? input.solucao ?? undefined,
    destacar_na_home: input.destacar_na_home ?? input.featured ?? false,
    status: STATUS_MAP[input.status] ?? input.status ?? 'draft',
  }

  // Imagem de destaque: aceita ID numérico/UUID de media (campo upload relationTo: 'media')
  const imagem_destaque = input.imagem_destaque ?? input.cover_image ?? undefined
  if (imagem_destaque && (typeof imagem_destaque === 'string' || typeof imagem_destaque === 'number')) {
    if (/^[a-f0-9-]{8,}$/i.test(String(imagem_destaque)) || /^\d+$/.test(String(imagem_destaque))) {
      data.imagem_destaque = imagem_destaque
    }
  }

  // Result/metrics: aceita string única (legado) e converte
  if (typeof input.result === 'string' && input.result) {
    data.results = [{ metrica: 'Resultado', valor: input.result, contexto: '' }]
  }
  if (typeof input.metrics === 'string' && input.metrics) {
    const parts = input.metrics.split(',').map((s: string) => s.trim()).filter(Boolean)
    data.results = data.results || []
    parts.forEach((p: string) => {
      data.results.push({ metrica: p, valor: '', contexto: '' })
    })
  }

  return data
}

export async function createCase(input: FlexibleData) {
  try {
    await requireRole('editor')
    if (!input.title?.trim() && !input.titulo?.trim()) throw new Error('Título obrigatório')
    if (!input.slug?.trim()) throw new Error('Slug obrigatório')

    const payload = await getPayload({ config })
    const data = mapCase(input)
    const created = await payload.create({ collection: 'cases', data: data as any })
    revalidatePath('/admin/cases')
    revalidatePath('/cases')
    revalidatePath('/')
    return { ok: true, id: created.id }
  } catch (e: any) {
    console.error('[createCase]', e)
    return { ok: false, error: e?.message || 'Falha ao salvar' }
  }
}

export async function updateCase(id: string, input: FlexibleData) {
  try {
    await requireRole('editor')
    const payload = await getPayload({ config })
    const data = mapCase(input)
    const updated: any = await payload.update({ collection: 'cases', id, data: data as any })
    revalidatePath('/admin/cases')
    revalidatePath('/cases')
    revalidatePath('/')
    if (updated?.slug) revalidatePath(`/cases/${updated.slug}`)
    return { ok: true }
  } catch (e: any) {
    console.error('[updateCase]', e)
    return { ok: false, error: e?.message || 'Falha ao salvar' }
  }
}

export async function deleteCase(id: string) {
  await requireRole('editor')
  const payload = await getPayload({ config })
  await payload.delete({ collection: 'cases', id })
  revalidatePath('/admin/cases')
  revalidatePath('/cases')
  revalidatePath('/')
  return { ok: true }
}
