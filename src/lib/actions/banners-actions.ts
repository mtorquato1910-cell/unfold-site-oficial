'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireRole } from '@/lib/painel-auth'

type FlexibleData = Record<string, any>

function mapBanner(input: FlexibleData) {
  const data: FlexibleData = {
    titulo: input.titulo ?? input.title ?? '',
    tag: input.tag ?? undefined,
    descricao: input.descricao ?? input.description ?? undefined,
    cta_label: input.cta_label ?? input.ctaLabel ?? 'Saiba mais',
    link: input.link ?? '',
    ativo: input.ativo != null ? Boolean(input.ativo) : true,
    ordem: input.ordem != null && input.ordem !== '' ? Number(input.ordem) : 0,
  }

  // Relacionamento media: coerce string -> número (Postgres integer)
  const imagem = input.imagem ?? input.imagem_id ?? input.image ?? undefined
  if (imagem != null && imagem !== '') {
    const s = String(imagem)
    if (/^\d+$/.test(s)) data.imagem = Number(s)
    else if (/^[a-f0-9-]{8,}$/i.test(s)) data.imagem = imagem
  } else if (imagem === '') {
    data.imagem = null
  }

  return data
}

function revalidate() {
  revalidatePath('/admin/banners')
  revalidatePath('/blog')
  // Banners aparecem DENTRO das páginas de post (/blog/[slug]) — revalidar só
  // '/blog' (a lista) não purga os artigos. Invalida todo o segmento dinâmico.
  revalidatePath('/blog/[slug]', 'page')
}

export async function createBanner(input: FlexibleData) {
  try {
    await requireRole('editor')
    if (!input.titulo?.trim() && !input.title?.trim()) throw new Error('Título obrigatório')
    if (!input.link?.trim()) throw new Error('Link de destino obrigatório')

    const payload = await getPayload({ config })
    const created = await payload.create({ collection: 'banners', data: mapBanner(input) as any })

    revalidate()
    return { ok: true, id: created.id }
  } catch (e: any) {
    console.error('[createBanner]', e)
    return { ok: false, error: e?.message || 'Falha ao salvar' }
  }
}

export async function updateBanner(id: string, input: FlexibleData) {
  try {
    await requireRole('editor')
    const payload = await getPayload({ config })
    await payload.update({ collection: 'banners', id, data: mapBanner(input) as any })

    revalidate()
    return { ok: true }
  } catch (e: any) {
    console.error('[updateBanner]', e)
    return { ok: false, error: e?.message || 'Falha ao salvar' }
  }
}

export async function deleteBanner(id: string) {
  try {
    await requireRole('editor')
    const payload = await getPayload({ config })
    await payload.delete({ collection: 'banners', id })

    revalidate()
    return { ok: true }
  } catch (e: any) {
    console.error('[deleteBanner]', e)
    return { ok: false, error: e?.message || 'Falha ao excluir' }
  }
}
