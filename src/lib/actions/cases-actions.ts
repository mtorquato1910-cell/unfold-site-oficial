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

// A collection Cases só aceita 'rascunho' | 'publicado'. Enviar 'draft' quebra a
// validação do select (era a causa de cases não salvarem como rascunho).
const STATUS_MAP: Record<string, string> = {
  draft: 'rascunho',
  rascunho: 'rascunho',
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
    status: STATUS_MAP[input.status] ?? 'rascunho',
  }

  // Imagem de destaque: ID de media. Postgres usa integer no relacionamento — coerce
  // string numérica p/ Number (string crua dava "field is invalid").
  const imagem_destaque = input.imagem_destaque ?? input.cover_image ?? undefined
  if (imagem_destaque != null && imagem_destaque !== '') {
    const s = String(imagem_destaque)
    if (/^\d+$/.test(s)) data.imagem_destaque = Number(s)
    else if (/^[a-f0-9-]{8,}$/i.test(s)) data.imagem_destaque = imagem_destaque
  }

  // Result/metrics → array `results` (metrica/valor são required no schema, então
  // NÃO empurramos linhas com valor vazio — isso quebrava o save quando havia métricas).
  const results: Array<{ metrica: string; valor: string; contexto: string }> = []
  if (typeof input.result === 'string' && input.result.trim()) {
    results.push({ metrica: 'Resultado', valor: input.result.trim(), contexto: '' })
  }
  if (typeof input.metrics === 'string' && input.metrics.trim()) {
    // Aceita "Rótulo: valor" por item; sem ':' o texto vira o próprio valor.
    input.metrics
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean)
      .forEach((p: string) => {
        const [a, ...rest] = p.split(':')
        const valor = rest.join(':').trim()
        if (valor) results.push({ metrica: a.trim(), valor, contexto: '' })
        else results.push({ metrica: 'Métrica', valor: a.trim(), contexto: '' })
      })
  }
  if (results.length) {
    data.results = results
    // Também alimenta `highlights` (cards de métrica no site usam label/value).
    data.highlights = results.slice(0, 4).map((r) => ({ label: r.metrica, value: r.valor }))
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
