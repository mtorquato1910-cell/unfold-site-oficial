'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireRole } from '@/lib/painel-auth'

export type HomeStatInput = {
  prefix?: string
  value: number
  suffix?: string
  label: string
}

export type HomeSettingsInput = {
  hero_eyebrow?: string
  hero_title?: string
  hero_subtitle?: string
  hero_cta_primary_label?: string
  hero_cta_primary_href?: string
  hero_cta_secondary_label?: string
  hero_cta_secondary_href?: string
  hero_video_url?: string
  stats?: HomeStatInput[]
  stats_extra_text?: string
  client_logos_title?: string
}

export async function getHomeSettingsRaw() {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'home-settings', depth: 1 })
}

export async function updateHomeSettings(data: HomeSettingsInput) {
  await requireRole('admin')

  // Sanitização básica
  if (data.hero_title && data.hero_title.length > 300) {
    throw new Error('Título do hero muito longo (max 300 caracteres)')
  }
  if (data.hero_subtitle && data.hero_subtitle.length > 600) {
    throw new Error('Subtítulo muito longo (max 600 caracteres)')
  }
  if (data.stats && data.stats.length > 6) {
    throw new Error('Máximo de 6 stats')
  }

  const payload = await getPayload({ config })
  await payload.updateGlobal({
    slug: 'home-settings',
    data: data as any,
  })

  // Cache invalidation
  revalidateTag('home-settings')
  revalidatePath('/')
  revalidatePath('/admin/home-config')

  return { ok: true }
}
