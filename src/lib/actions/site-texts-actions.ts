'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireRole } from '@/lib/painel-auth'

export type HeroInput = {
  eyebrow: string
  title: string
  subtitle: string
}

/** Campos do hero da home — vivem em home-settings, não em site-texts. */
export type HomeHeroInput = {
  hero_eyebrow: string
  hero_title: string
  hero_subtitle: string
}

export type SiteTextsInput = {
  home: HomeHeroInput
  metodo: HeroInput
  atuacao: HeroInput
  cases: HeroInput
  ferramentas: HeroInput
  sobre: HeroInput
  blog: HeroInput
  guia: HeroInput
}

const PAGE_KEYS = [
  'metodo',
  'atuacao',
  'cases',
  'ferramentas',
  'sobre',
  'blog',
  'guia',
] as const

export async function getSiteTextsRaw() {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'site-texts' as any, depth: 0 })
}

function assertLen(hero: HeroInput, label: string) {
  if (hero.title && hero.title.length > 300) {
    throw new Error(`Título de "${label}" muito longo (máx. 300 caracteres)`)
  }
  if (hero.subtitle && hero.subtitle.length > 800) {
    throw new Error(`Subtítulo de "${label}" muito longo (máx. 800 caracteres)`)
  }
}

export async function updateSiteTexts(data: SiteTextsInput) {
  // Editar textos do site é permitido a qualquer usuário autenticado do painel.
  await requireRole('editor')

  PAGE_KEYS.forEach((k) => assertLen(data[k], k))
  assertLen(
    { eyebrow: data.home.hero_eyebrow, title: data.home.hero_title, subtitle: data.home.hero_subtitle },
    'home',
  )

  const payload = await getPayload({ config })

  // 1) Páginas → global site-texts (campos achatados: <page>_<campo>)
  const flat: Record<string, string> = {}
  PAGE_KEYS.forEach((k) => {
    flat[`${k}_eyebrow`] = data[k].eyebrow
    flat[`${k}_title`] = data[k].title
    flat[`${k}_subtitle`] = data[k].subtitle
  })
  await payload.updateGlobal({ slug: 'site-texts' as any, data: flat as any })

  // 2) Home → global home-settings (apenas os 3 campos do hero; updateGlobal faz merge)
  await payload.updateGlobal({
    slug: 'home-settings',
    data: {
      hero_eyebrow: data.home.hero_eyebrow,
      hero_title: data.home.hero_title,
      hero_subtitle: data.home.hero_subtitle,
    } as any,
  })

  // 3) Invalidação de cache
  revalidateTag('site-texts')
  revalidateTag('home-settings')
  revalidatePath('/')
  revalidatePath('/metodo')
  revalidatePath('/atuacao')
  revalidatePath('/cases')
  revalidatePath('/ferramentas')
  revalidatePath('/sobre')
  revalidatePath('/blog')
  revalidatePath('/guia-eleicoes-2026')
  revalidatePath('/admin/textos')

  return { ok: true }
}
