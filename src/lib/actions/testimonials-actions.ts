'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireRole } from '@/lib/painel-auth'

export type TestimonialInput = {
  nome: string
  cargo?: string
  empresa: string
  depoimento: string
  vertical?: string
  avaliacao?: number
  destaque?: boolean
  ativo?: boolean
  ordem?: number
  foto?: string
  logo_empresa?: string
}

// Aceita só IDs de media. No Postgres o relacionamento é integer, então string
// numérica é coercida p/ Number (evita "field is invalid"). UUID fica string.
function mediaId(v?: string): string | number | undefined {
  if (!v) return undefined
  if (/^\d+$/.test(v)) return Number(v)
  return /^[a-f0-9-]{8,}$/i.test(v) ? v : undefined
}

function validate(data: TestimonialInput) {
  if (!data.nome?.trim()) throw new Error('Nome obrigatório')
  if (!data.empresa?.trim()) throw new Error('Empresa obrigatória')
  if (!data.depoimento?.trim() || data.depoimento.length < 20) {
    throw new Error('Depoimento precisa ter pelo menos 20 caracteres')
  }
}

export async function createTestimonial(data: TestimonialInput) {
  try {
    await requireRole('editor')
    validate(data)
    const payload = await getPayload({ config })
    const created = await payload.create({
      collection: 'testimonials',
      data: {
        nome: data.nome,
        cargo: data.cargo,
        empresa: data.empresa,
        depoimento: data.depoimento,
        vertical: data.vertical as any,
        avaliacao: data.avaliacao ?? 5,
        destaque: !!data.destaque,
        ativo: data.ativo ?? true,
        ordem: data.ordem ?? 0,
        foto: mediaId(data.foto),
        logo_empresa: mediaId(data.logo_empresa),
      } as any,
    })
    revalidatePath('/admin/testimonials')
    revalidatePath('/')
    revalidateTag('testimonials')
    return { ok: true, id: created.id }
  } catch (e: any) {
    console.error('[createTestimonial]', e)
    return { ok: false, error: e?.message || 'Falha ao salvar' }
  }
}

export async function updateTestimonial(id: string, data: TestimonialInput) {
  try {
    await requireRole('editor')
    validate(data)
    const payload = await getPayload({ config })
    await payload.update({
      collection: 'testimonials',
      id,
      data: {
        nome: data.nome,
        cargo: data.cargo,
        empresa: data.empresa,
        depoimento: data.depoimento,
        vertical: data.vertical as any,
        avaliacao: data.avaliacao,
        destaque: data.destaque,
        ativo: data.ativo,
        ordem: data.ordem,
        foto: mediaId(data.foto),
        logo_empresa: mediaId(data.logo_empresa),
      } as any,
    })
    revalidatePath('/admin/testimonials')
    revalidatePath('/')
    revalidateTag('testimonials')
    return { ok: true }
  } catch (e: any) {
    console.error('[updateTestimonial]', e)
    return { ok: false, error: e?.message || 'Falha ao salvar' }
  }
}

export async function deleteTestimonial(id: string) {
  await requireRole('editor')
  const payload = await getPayload({ config })
  await payload.delete({ collection: 'testimonials', id })
  revalidatePath('/admin/testimonials')
  revalidatePath('/')
  revalidateTag('testimonials')
  return { ok: true }
}

export async function toggleTestimonialDestaque(id: string, destaque: boolean) {
  await requireRole('editor')
  const payload = await getPayload({ config })
  await payload.update({
    collection: 'testimonials',
    id,
    data: { destaque } as any,
  })
  revalidatePath('/admin/testimonials')
  revalidatePath('/')
  revalidateTag('testimonials')
  return { ok: true }
}

export async function toggleTestimonialAtivo(id: string, ativo: boolean) {
  await requireRole('editor')
  const payload = await getPayload({ config })
  await payload.update({
    collection: 'testimonials',
    id,
    data: { ativo } as any,
  })
  revalidatePath('/admin/testimonials')
  revalidatePath('/')
  revalidateTag('testimonials')
  return { ok: true }
}
