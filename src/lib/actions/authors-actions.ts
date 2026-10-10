'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireRole } from '@/lib/painel-auth'

type FlexibleData = Record<string, any>

/**
 * Autores (S07 — épico seo-tecnico-2026-10). CRUD do painel /painel/autores.
 * Listas (perfis, temas) chegam como texto: uma URL por linha / temas por vírgula.
 */
function lines(v: unknown, sep: RegExp): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean)
  return String(v ?? '')
    .split(sep)
    .map((x) => x.trim())
    .filter(Boolean)
}

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

function mapAuthor(input: FlexibleData) {
  const nome = String(input.nome ?? '').trim()
  const data: FlexibleData = {
    nome,
    slug: slugify(String(input.slug || nome)),
    cargo: input.cargo?.trim() || null,
    bio_curta: input.bio_curta?.trim() || null,
    bio_completa: input.bio_completa?.trim() || null,
    foto_url: input.foto_url?.trim() || null,
    linkedin: input.linkedin?.trim() || null,
    perfis: lines(input.perfis, /\r?\n/).filter((u) => /^https?:\/\//i.test(u)),
    formacao: input.formacao?.trim() || null,
    experiencia: input.experiencia?.trim() || null,
    temas: lines(input.temas, /[,\n]/),
    registro_profissional: input.registro_profissional?.trim() || null,
    ativo: input.ativo !== false,
  }
  // Foto enviada pelo painel (id de media). '' = remover.
  if (input.foto !== undefined) {
    const n = Number(input.foto?.id ?? input.foto)
    data.foto = Number.isFinite(n) && n > 0 ? n : null
  }
  return data
}

function revalidateAuthorPages(slug?: string) {
  revalidatePath('/admin/autores')
  if (slug) revalidatePath(`/autor/${slug}`)
  revalidatePath('/blog/[slug]', 'page') // byline e box dos artigos
  revalidatePath('/sitemap.xml')
}

export async function createAuthor(input: FlexibleData) {
  try {
    await requireRole('editor')
    const data = mapAuthor(input)
    if (!data.nome) throw new Error('Nome obrigatório')
    const payload = await getPayload({ config })
    const doc = await payload.create({ collection: 'authors', data: data as any })
    revalidateAuthorPages(data.slug)
    return { ok: true, doc }
  } catch (e: any) {
    console.error('[createAuthor]', e)
    return { ok: false, error: e?.message || 'Falha ao salvar' }
  }
}

export async function updateAuthor(id: string, input: FlexibleData) {
  try {
    await requireRole('editor')
    const data = mapAuthor(input)
    if (!data.nome) throw new Error('Nome obrigatório')
    const payload = await getPayload({ config })
    const doc = await payload.update({ collection: 'authors', id, data: data as any })
    revalidateAuthorPages(data.slug)
    return { ok: true, doc }
  } catch (e: any) {
    console.error('[updateAuthor]', e)
    return { ok: false, error: e?.message || 'Falha ao salvar' }
  }
}

export async function deleteAuthor(id: string) {
  try {
    await requireRole('editor')
    const payload = await getPayload({ config })
    // Não apaga autor que ainda assina artigos — desative em vez disso.
    const { totalDocs } = await payload.count({
      collection: 'posts',
      where: { autores: { contains: id } },
    })
    if (totalDocs > 0) {
      return { ok: false, error: `Este autor assina ${totalDocs} artigo(s). Desative-o ou troque o autor dos artigos antes.` }
    }
    await payload.delete({ collection: 'authors', id })
    revalidateAuthorPages()
    return { ok: true }
  } catch (e: any) {
    console.error('[deleteAuthor]', e)
    return { ok: false, error: e?.message || 'Falha ao excluir' }
  }
}
