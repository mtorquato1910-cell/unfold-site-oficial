'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireRole } from '@/lib/painel-auth'

/**
 * Posts actions com mapping inglês → PT-BR.
 * Aceita campos antigos (title/excerpt/category) e converte para schema real
 * (titulo/resumo/categoria) antes de persistir no Payload.
 */

type FlexibleData = Record<string, any>

function plainToRichText(text: string) {
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: text.split(/\n\n+/).map((para: string) => ({
        type: 'paragraph',
        format: '' as const,
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        children: para.split('\n').map((line: string) => ({
          type: 'text',
          format: 0,
          text: line,
          version: 1,
          mode: 'normal',
          style: '',
          detail: 0,
        })),
      })),
    },
  }
}

function mapPost(input: FlexibleData) {
  // Mapeia campos inglês → PT-BR e mantém PT-BR já corretos
  const titulo = input.titulo ?? input.title ?? ''
  const slug = input.slug ?? ''
  const resumo = input.resumo ?? input.excerpt ?? ''
  const conteudoPlain = input.content ?? input.conteudoText ?? null
  const conteudoRT = input.conteudo ?? (conteudoPlain ? plainToRichText(conteudoPlain) : undefined)
  const status = input.status ?? 'draft'
  const pilar = input.pilar ?? input.pillar ?? 'geral'
  const autor = input.autor ?? input.author ?? 'Equipe Unfold Growth'
  const tempo_leitura = input.tempo_leitura ?? input.reading_time ?? undefined
  const tags = Array.isArray(input.tags)
    ? input.tags.map((t: any) => (typeof t === 'string' ? { tag: t } : t))
    : []

  const categoria = input.categoria ?? input.category ?? undefined
  const imagem_destaque = input.imagem_destaque ?? input.cover_image ?? undefined

  // Destaque na Home (seção "Insights"). Sem isto, o post nunca aparece na home —
  // a home filtra por destaque_home === true.
  const destaque_home = input.destaque_home ?? input.featured_home ?? false

  const data: FlexibleData = {
    titulo,
    slug,
    resumo,
    status,
    pilar,
    autor,
    tags,
    destaque_home: !!destaque_home,
  }
  if (input.ordem_home != null && input.ordem_home !== '') {
    data.ordem_home = Number(input.ordem_home) || 0
  }
  // publicado_em é carimbado pelo hook beforeChange da collection (Posts.ts) na
  // primeira vez que o status vira "published" — não setamos aqui para não resetar
  // a data a cada edição.
  if (conteudoRT) data.conteudo = conteudoRT
  if (tempo_leitura) data.tempo_leitura = tempo_leitura
  if (typeof categoria === 'string' && categoria) {
    // Se cliente enviou categoria como string (não ID), ignora — relação só aceita ID
    // Aceita só se for ID numérico/UUID válido
    if (/^[a-f0-9-]{8,}$/i.test(categoria) || /^\d+$/.test(categoria)) {
      data.categoria = categoria
    }
  } else if (categoria) {
    data.categoria = categoria
  }
  // ID de mídia: no Postgres o relacionamento é integer — manda string numérica
  // dava "The following field is invalid: Imagem de destaque". Coerce p/ Number.
  if (imagem_destaque != null && imagem_destaque !== '') {
    const s = String(imagem_destaque)
    if (/^\d+$/.test(s)) data.imagem_destaque = Number(s)
    else if (/^[a-f0-9-]{8,}$/i.test(s)) data.imagem_destaque = imagem_destaque
  }

  return data
}

export async function createPost(input: FlexibleData) {
  try {
    await requireRole('editor')
    if (!input.title?.trim() && !input.titulo?.trim()) throw new Error('Título obrigatório')
    if (!input.slug?.trim()) throw new Error('Slug obrigatório')

    const payload = await getPayload({ config })
    const data = mapPost(input)
    const created = await payload.create({ collection: 'posts', data: data as any })
    revalidatePath('/admin/posts')
    revalidatePath('/blog')
    revalidatePath('/') // home (seção Insights)
    revalidateTag('posts')
    revalidateTag('home-insights')
    return { ok: true, id: created.id }
  } catch (e: any) {
    console.error('[createPost]', e)
    return { ok: false, error: e?.message || 'Falha ao salvar' }
  }
}

export async function updatePost(id: string, input: FlexibleData) {
  try {
    await requireRole('editor')
    const payload = await getPayload({ config })
    const data = mapPost(input)
    const updated: any = await payload.update({ collection: 'posts', id, data: data as any })
    revalidatePath('/admin/posts')
    revalidatePath('/blog')
    revalidatePath('/') // home (seção Insights)
    revalidateTag('posts')
    revalidateTag('home-insights')
    if (updated?.slug) revalidatePath(`/blog/${updated.slug}`)
    return { ok: true }
  } catch (e: any) {
    console.error('[updatePost]', e)
    return { ok: false, error: e?.message || 'Falha ao salvar' }
  }
}

export async function deletePost(id: string) {
  await requireRole('editor')
  const payload = await getPayload({ config })
  await payload.delete({ collection: 'posts', id })
  revalidatePath('/admin/posts')
  revalidatePath('/blog')
  return { ok: true }
}
