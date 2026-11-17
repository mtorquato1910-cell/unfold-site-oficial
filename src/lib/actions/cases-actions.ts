'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireRole } from '@/lib/painel-auth'
import { sanitizeRichHtml } from '@/lib/html-sanitize'
import { notifyIndexNow } from '@/lib/indexnow'
import { createSlugRedirect } from '@/lib/slug-redirect'

type FlexibleData = Record<string, any>

/**
 * Cases actions com mapping do form do painel → schema real.
 *
 * S10 (épico seo-tecnico-2026-10): o case é publicado "da mesma forma dos posts" —
 * texto corrido num editor só (`conteudo_html`), resumo (`excerpt`), campos de busca
 * (`meta_title`/`meta_description`), FAQ e "Números do case" (`highlights`, cartões).
 * Os campos antigos (challenge/solution/results) não são mais escritos pelo painel.
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

/** ISO válido ou null — datas inválidas/vazias não são gravadas. */
function parseDate(v: unknown): string | null {
  if (v == null || v === '') return null
  const d = new Date(String(v))
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

function mapCase(input: FlexibleData) {
  const title = input.title ?? input.titulo ?? ''
  // Slug é required + unique no schema. Se o front não enviar, derivamos do título.
  const slug = (input.slug?.trim() ? input.slug.trim() : slugify(title)) || ''

  const data: FlexibleData = {
    title,
    slug,
    client: input.client ?? input.cliente ?? input.company ?? input.empresa ?? '',
    vertical: input.vertical ?? input.sector ?? input.setor ?? undefined,
    destacar_na_home: input.destacar_na_home ?? input.featured ?? false,
    status: STATUS_MAP[input.status] ?? 'rascunho',
  }

  // Corpo único (editor rico, igual aos posts). Só sobrescreve quando enviado.
  const contentHtml = input.contentHtml ?? input.conteudo_html
  if (contentHtml != null) data.conteudo_html = sanitizeRichHtml(contentHtml)

  // Data de publicação editável (17/11/2026). Vazio = não mexe; o hook da collection
  // carimba na primeira publicação.
  const publishedAt = parseDate(input.published_at)
  if (publishedAt) data.published_at = publishedAt

  if (input.excerpt !== undefined) data.excerpt = String(input.excerpt || '').trim() || null
  if (input.meta_title !== undefined) data.meta_title = String(input.meta_title || '').trim() || null
  if (input.meta_description !== undefined) data.meta_description = String(input.meta_description || '').trim() || null

  // FAQ: mesmo formato dos posts — só pares completos.
  if (input.faq !== undefined) {
    const arr = Array.isArray(input.faq)
      ? input.faq
          .filter((q: any) => (q?.pergunta ?? '').trim() && (q?.resposta ?? '').trim())
          .map((q: any) => ({ pergunta: String(q.pergunta).trim(), resposta: String(q.resposta).trim() }))
      : []
    data.faq = arr.length ? arr : null
  }

  // Números do case (cartões): até 4 pares rótulo/valor completos.
  if (input.highlights !== undefined) {
    data.highlights = (Array.isArray(input.highlights) ? input.highlights : [])
      .map((h: any) => ({ label: String(h?.label ?? '').trim(), value: String(h?.value ?? '').trim() }))
      .filter((h: { label: string; value: string }) => h.label && h.value)
      .slice(0, 4)
  }

  // Imagem de destaque: ID de media. Postgres usa integer no relacionamento — coerce
  // string numérica p/ Number (string crua dava "field is invalid").
  const imagem_destaque = input.imagem_destaque ?? input.cover_image ?? undefined
  if (imagem_destaque != null && imagem_destaque !== '') {
    const s = String(imagem_destaque)
    if (/^\d+$/.test(s)) data.imagem_destaque = Number(s)
    else if (/^[a-f0-9-]{8,}$/i.test(s)) data.imagem_destaque = imagem_destaque
  } else if (imagem_destaque === '') {
    // Usuário removeu a imagem no painel → desvincula de fato (sem isto, a antiga permanecia).
    data.imagem_destaque = null
  }

  return data
}

function revalidateCases(slugs: (string | undefined | null)[] = []) {
  revalidatePath('/admin/cases')
  revalidatePath('/cases')
  revalidatePath('/sitemap.xml') // mantém o sitemap em dia sem depender de deploy
  revalidatePath('/llms.txt') // S09
  revalidatePath('/')
  for (const s of slugs) if (s) revalidatePath(`/cases/${s}`)
}

/** Revalidação + IndexNow após editar um case (editor completo e edição rápida). */
async function afterCaseUpdate(prev: any, updated: any) {
  revalidateCases([updated?.slug, prev?.slug])
  // IndexNow (S09): só quando muda algo que o buscador precisa rever — publicação,
  // slug ou conteúdo editorial (content_updated_at, mesma regra dos posts).
  const wasPub = prev?.status === 'publicado'
  const isPub = updated?.status === 'publicado'
  const changed =
    wasPub !== isPub || prev?.slug !== updated?.slug || prev?.content_updated_at !== updated?.content_updated_at
  if ((wasPub || isPub) && changed) {
    const paths = ['/cases', `/cases/${updated.slug}`]
    if (prev?.slug && prev.slug !== updated.slug) paths.push(`/cases/${prev.slug}`)
    await notifyIndexNow(paths)
  }
}

export async function createCase(input: FlexibleData) {
  try {
    await requireRole('editor')
    if (!input.title?.trim() && !input.titulo?.trim()) throw new Error('Título obrigatório')

    const payload = await getPayload({ config })
    const data = mapCase(input)
    if (!data.slug) throw new Error('Slug obrigatório')
    const created: any = await payload.create({ collection: 'cases', data: data as any })
    revalidateCases([created?.slug])
    if (created?.status === 'publicado') await notifyIndexNow([`/cases/${created.slug}`, '/cases'])
    return { ok: true, id: created.id, doc: created }
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
    const prev: any = await payload.findByID({ collection: 'cases', id, depth: 0 }).catch(() => null)
    const updated: any = await payload.update({ collection: 'cases', id, data: data as any })
    const redirected = await createSlugRedirect(payload, {
      base: '/cases',
      oldSlug: prev?.slug,
      newSlug: updated?.slug,
      wasPublished: prev?.status === 'publicado',
      id,
    })
    await afterCaseUpdate(prev, updated)
    return { ok: true, doc: updated, redirected }
  } catch (e: any) {
    console.error('[updateCase]', e)
    return { ok: false, error: e?.message || 'Falha ao salvar' }
  }
}

/**
 * Edição rápida de cases (pedido de 17/11/2026): título, slug, meta descrição, capa,
 * data de publicação e status. Grava só esses campos — não passa pelo mapCase, que
 * preenche padrões (cliente, destaque…) e sobrescreveria o que não aparece na tela.
 */
export async function quickUpdateCase(id: string, input: FlexibleData) {
  try {
    await requireRole('editor')
    const title = String(input.title ?? '').trim()
    const slug = slugify(String(input.slug ?? ''))
    if (!title) return { ok: false, error: 'Informe o título.' }
    if (!slug) return { ok: false, error: 'Informe o slug.' }

    const payload = await getPayload({ config })
    const prev: any = await payload.findByID({ collection: 'cases', id, depth: 0 }).catch(() => null)
    if (!prev) return { ok: false, error: 'Case não encontrado.' }
    if (slug !== prev.slug) {
      const taken = await payload.find({ collection: 'cases', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
      if (taken.docs.length) return { ok: false, error: `O slug "${slug}" já é usado por outro case.` }
    }

    const data: FlexibleData = {
      title,
      slug,
      status: STATUS_MAP[input.status] ?? 'rascunho',
      meta_description: String(input.meta_description ?? '').trim() || null,
    }
    const publishedAt = parseDate(input.published_at)
    if (publishedAt) data.published_at = publishedAt
    const img = String(input.imagem_destaque ?? '')
    if (!img) data.imagem_destaque = null
    else if (/^\d+$/.test(img)) data.imagem_destaque = Number(img)

    const updated: any = await payload.update({ collection: 'cases', id, data: data as any, depth: 1 })
    const redirected = await createSlugRedirect(payload, {
      base: '/cases',
      oldSlug: prev.slug,
      newSlug: slug,
      wasPublished: prev.status === 'publicado',
      id,
    })
    await afterCaseUpdate(prev, updated)
    return { ok: true, doc: updated, redirected }
  } catch (e: any) {
    console.error('[quickUpdateCase]', e)
    return { ok: false, error: e?.message || 'Falha ao salvar' }
  }
}

export async function deleteCase(id: string) {
  try {
    await requireRole('editor')
    const payload = await getPayload({ config })
    const prev: any = await payload.findByID({ collection: 'cases', id, depth: 0 }).catch(() => null)
    await payload.delete({ collection: 'cases', id })
    // Revalida a página do case excluído (senão o cache continuaria servindo 200).
    revalidateCases([prev?.slug])
    if (prev?.status === 'publicado') await notifyIndexNow([`/cases/${prev.slug}`, '/cases'])
    return { ok: true }
  } catch (e: any) {
    console.error('[deleteCase]', e)
    return { ok: false, error: e?.message || 'Falha ao excluir' }
  }
}

