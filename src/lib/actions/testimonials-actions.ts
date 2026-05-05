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
}

function validate(data: TestimonialInput) {
  if (!data.nome?.trim()) throw new Error('Nome obrigatório')
  if (!data.empresa?.trim()) throw new Error('Empresa obrigatória')
  if (!data.depoimento?.trim() || data.depoimento.length < 20) {
    throw new Error('Depoimento precisa ter pelo menos 20 caracteres')
  }
}

export async function createTestimonial(data: TestimonialInput) {
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
    } as any,
  })
  revalidatePath('/admin/testimonials')
  revalidatePath('/')
  revalidateTag('testimonials')
  return { ok: true, id: created.id }
}

export async function updateTestimonial(id: string, data: TestimonialInput) {
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
    } as any,
  })
  revalidatePath('/admin/testimonials')
  revalidatePath('/')
  revalidateTag('testimonials')
  return { ok: true }
}

export async function deleteTestimonial(id: string) {
  await requireRole('admin')
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
