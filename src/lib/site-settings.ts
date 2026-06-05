import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'

export type PublicSiteSettings = {
  // Brand
  tagline: string
  cidade: string

  // Contato
  email_contato: string
  telefone: string | null
  whatsapp: string | null
  endereco: string | null
  cnpj: string | null

  // Redes
  linkedin: string | null
  instagram: string | null
  youtube: string | null
  facebook: string | null
  twitter: string | null

  // SEO
  site_name: string
  meta_descricao_padrao: string | null

  // LGPD
  email_dpo: string | null
  lgpd_aviso_cookies: string

  // Calendário
  calendar_embed_url: string | null
  calendar_label: string
}

const DEFAULTS: PublicSiteSettings = {
  tagline: 'Assessoria de growth para empresas com vendas complexas.',
  cidade: 'Maceió – AL · Brasil · Atuação nacional',
  email_contato: 'tecnologia@unfoldgrowth.com.br',
  telefone: null,
  whatsapp: null,
  endereco: null,
  cnpj: null,
  linkedin: null,
  instagram: null,
  youtube: null,
  facebook: null,
  twitter: null,
  site_name: 'Unfold Growth',
  meta_descricao_padrao: null,
  email_dpo: null,
  lgpd_aviso_cookies:
    'Usamos cookies para melhorar sua experiência. Ao continuar, você concorda com nossa Política de Privacidade.',
  calendar_embed_url: null,
  calendar_label: 'Agendar diagnóstico gratuito',
}

async function fetchSiteSettings(): Promise<PublicSiteSettings> {
  try {
    const payload = await getPayload({ config })
    const s: any = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
    return {
      tagline: s?.tagline || DEFAULTS.tagline,
      cidade: s?.cidade || DEFAULTS.cidade,
      email_contato: s?.email_contato || DEFAULTS.email_contato,
      telefone: s?.telefone || null,
      whatsapp: s?.whatsapp || null,
      endereco: s?.endereco || null,
      cnpj: s?.cnpj || null,
      linkedin: s?.linkedin || null,
      instagram: s?.instagram || null,
      youtube: s?.youtube || null,
      facebook: s?.facebook || null,
      twitter: s?.twitter || null,
      site_name: s?.site_name || DEFAULTS.site_name,
      meta_descricao_padrao: s?.meta_descricao_padrao || null,
      email_dpo: s?.email_dpo || null,
      lgpd_aviso_cookies: s?.lgpd_aviso_cookies || DEFAULTS.lgpd_aviso_cookies,
      calendar_embed_url: s?.calendar_embed_url || null,
      calendar_label: s?.calendar_label || DEFAULTS.calendar_label,
    }
  } catch {
    return DEFAULTS
  }
}

export const getPublicSiteSettings = unstable_cache(fetchSiteSettings, ['site-settings'], {
  tags: ['site-settings'],
  revalidate: 60,
})
