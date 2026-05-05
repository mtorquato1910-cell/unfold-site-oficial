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

function mapCase(input: FlexibleData) {
  const data: FlexibleData = {
    title: input.title ?? input.titulo ?? '',
    slug: input.slug ?? '',
    client: input.client ?? input.cliente ?? input.company ?? input.empresa ?? '',
    vertical: input.vertical ?? input.sector ?? input.setor ?? undefined,
    tagline: input.tagline ?? input.subtitulo ?? undefined,
    challenge: input.challenge ?? input.desafio ?? undefined,
    solution: input.solution ?? input.solucao ?? undefined,
    destacar_na_home: input.destacar_na_home ?? input.featured ?? false,
    status: STATUS_MAP[input.status] ?? input.status ?? 'draft',
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
}

export async function updateCase(id: string, input: FlexibleData) {
  await requireRole('editor')
  const payload = await getPayload({ config })
  const data = mapCase(input)
  const updated: any = await payload.update({ collection: 'cases', id, data: data as any })
  revalidatePath('/admin/cases')
  revalidatePath('/cases')
  revalidatePath('/')
  if (updated?.slug) revalidatePath(`/cases/${updated.slug}`)
  return { ok: true }
}

export async function deleteCase(id: string) {
  await requireRole('admin')
  const payload = await getPayload({ config })
  await payload.delete({ collection: 'cases', id })
  revalidatePath('/admin/cases')
  revalidatePath('/cases')
  revalidatePath('/')
  return { ok: true }
}
