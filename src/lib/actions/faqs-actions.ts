'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireRole } from '@/lib/painel-auth'

const ALLOWED_CATEGORIES = ['geral', 'diagnostico', 'metodo', 'cases', 'comercial'] as const

type FAQInput = {
  question: string
  answer: string
  category: string
  order: number
  published: boolean
}

function validate(data: FAQInput) {
  if (!data.question?.trim()) throw new Error('Pergunta obrigatória')
  if (!data.answer?.trim()) throw new Error('Resposta obrigatória')
  if (!ALLOWED_CATEGORIES.includes(data.category as any)) throw new Error('Categoria inválida')
}

function answerToRichText(text: string) {
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: [
        {
          type: 'paragraph',
          format: '' as const,
          indent: 0,
          version: 1,
          direction: 'ltr' as const,
          children: text.split('\n').map((line: string) => ({
            type: 'text',
            format: 0,
            text: line,
            version: 1,
            mode: 'normal',
            style: '',
            detail: 0,
          })),
        },
      ],
    },
  }
}

export async function createFAQ(data: FAQInput) {
  await requireRole('editor')
  validate(data)
  const payload = await getPayload({ config })
  const created = await payload.create({
    collection: 'faqs',
    data: {
      question: data.question,
      answer: answerToRichText(data.answer) as any,
      category: data.category as any,
      order: data.order,
      published: data.published,
    },
  })
  revalidatePath('/admin/faqs')
  if (data.published) revalidatePath('/sobre')
  return { ok: true, id: created.id }
}

export async function updateFAQ(id: string, data: FAQInput) {
  await requireRole('editor')
  validate(data)
  const payload = await getPayload({ config })
  await payload.update({
    collection: 'faqs',
    id,
    data: {
      question: data.question,
      answer: answerToRichText(data.answer) as any,
      category: data.category as any,
      order: data.order,
      published: data.published,
    },
  })
  revalidatePath('/admin/faqs')
  revalidatePath('/sobre')
  revalidateTag('faqs')
  return { ok: true }
}

export async function deleteFAQ(id: string) {
  await requireRole('editor')
  const payload = await getPayload({ config })
  await payload.delete({ collection: 'faqs', id })
  revalidatePath('/admin/faqs')
  revalidatePath('/sobre')
  revalidateTag('faqs')
  return { ok: true }
}

export async function toggleFAQPublished(id: string, published: boolean) {
  await requireRole('editor')
  const payload = await getPayload({ config })
  await payload.update({ collection: 'faqs', id, data: { published } })
  revalidatePath('/admin/faqs')
  revalidatePath('/sobre')
  revalidateTag('faqs')
  return { ok: true }
}
