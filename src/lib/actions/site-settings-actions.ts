'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireRole } from '@/lib/painel-auth'

export type SiteContactInput = {
  email_contato?: string
  email_notificacoes?: string
  email_dpo?: string
  telefone?: string
  whatsapp?: string
  linkedin?: string
  instagram?: string
  youtube?: string
  facebook?: string
  twitter?: string
  endereco?: string
  cnpj?: string
}

export async function getSiteSettings() {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'site-settings' })
}

export async function updateSiteContact(data: SiteContactInput) {
  await requireRole('admin')
  const payload = await getPayload({ config })
  await payload.updateGlobal({
    slug: 'site-settings',
    data: data as any,
  })
  revalidatePath('/admin/site-config')
  revalidatePath('/')
  revalidatePath('/contato')
  revalidatePath('/sobre')
  return { ok: true }
}
