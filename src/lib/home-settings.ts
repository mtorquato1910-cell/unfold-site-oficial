import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'

export type HomeStat = {
  prefix?: string
  value: number
  suffix?: string
  label: string
}

export type HomeClientLogo = {
  name: string
  logoUrl?: string
  website?: string
}

export type HomeSettingsData = {
  hero_eyebrow: string
  hero_title: string
  hero_subtitle: string
  hero_cta_primary_label: string
  hero_cta_primary_href: string
  hero_cta_secondary_label: string
  hero_cta_secondary_href: string
  hero_video_url: string | null
  hero_image_url: string | null
  stats: HomeStat[]
  stats_extra_text: string
  client_logos_title: string
  client_logos: HomeClientLogo[]
  partners_title: string
  partner_logos: HomeClientLogo[]
  // Método
  method_eyebrow: string
  method_title: string
  method_description: string
  method_cta_label: string
  method_cta_href: string
  // CTA Final
  final_cta_title: string
  final_cta_description: string
  final_cta_button_label: string
  final_cta_button_href: string
}

const DEFAULTS: HomeSettingsData = {
  hero_eyebrow: 'Growth Intelligence · Geração de demanda',
  hero_title: 'Organizamos crescimento digital em operações com vendas complexas.',
  hero_subtitle:
    'Estruturamos sistemas de crescimento que conectam marketing, vendas, CRM e automação em uma lógica integrada, previsível e orientada a resultado comercial.',
  hero_cta_primary_label: 'Solicite um Diagnóstico',
  hero_cta_primary_href: '/diagnostico',
  hero_cta_secondary_label: 'Conhecer o método',
  hero_cta_secondary_href: '/metodo',
  hero_video_url: null,
  hero_image_url: null,
  stats: [
    { prefix: '+R$ ', value: 75, suffix: 'MM', label: 'gerados em pipeline' },
    { prefix: '+R$ ', value: 850, suffix: 'k', label: 'gerenciados em mídia online' },
    { prefix: '+', value: 25, suffix: 'k', label: 'conteúdos produzidos' },
  ],
  stats_extra_text: 'Parceiros RD Station, Meta, Kommo',
  client_logos_title: 'Empresas que confiam na Unfold',
  client_logos: [
    { name: 'Grupo AV' },
    { name: 'Zest Inc' },
    { name: 'Ypê Investimentos' },
    { name: 'Grupo Luiz Jatobá' },
    { name: 'Inove Engenharia' },
    { name: 'OFM Systems' },
    { name: 'Mesha Tecnologia' },
    { name: 'Roga DX' },
    { name: 'Sementes Ipiranga' },
    { name: 'Grupo Maqnelson' },
    { name: 'Vertical Locações' },
    { name: 'Consórcio Nova Aravel' },
  ],
  partners_title: 'Parceiros oficiais',
  partner_logos: [],
  method_eyebrow: 'Método Unfold',
  method_title: 'Um sistema de crescimento, não mais uma série de ações isoladas.',
  method_description:
    'O Unfold Growth System (UGS) conecta as quatro alavancas do crescimento — Diagnosticar, Estruturar, Operar e Evoluir — em uma operação integrada, previsível e orientada a resultado comercial.',
  method_cta_label: 'Conheça o método UGS',
  method_cta_href: '/metodo',
  final_cta_title: 'Você já tem marketing e vendas. Falta o sistema que conecta tudo.',
  final_cta_description:
    'Solicite um diagnóstico gratuito. Em até 24h alguém da equipe entra em contato com uma análise inicial da sua operação de crescimento.',
  final_cta_button_label: 'Solicite um Diagnóstico',
  final_cta_button_href: '/diagnostico',
}

function mediaUrl(field: any): string | null {
  if (!field) return null
  if (typeof field === 'string') return null
  return field.url || null
}

function logosFromArray(arr: any[]): HomeClientLogo[] {
  if (!Array.isArray(arr) || arr.length === 0) return []
  return arr
    .map((row) => ({
      name: row.name || '',
      logoUrl: mediaUrl(row.logo) || undefined,
      website: row.website || undefined,
    }))
    .filter((r) => r.name)
}

async function fetchHomeSettings(): Promise<HomeSettingsData> {
  try {
    const payload = await getPayload({ config })
    const settings: any = await payload.findGlobal({ slug: 'home-settings', depth: 2 })
    const stats: HomeStat[] = Array.isArray(settings?.stats) && settings.stats.length > 0
      ? settings.stats.map((s: any) => ({
          prefix: s.prefix || '',
          value: s.value || 0,
          suffix: s.suffix || '',
          label: s.label || '',
        }))
      : DEFAULTS.stats
    const clientLogos = logosFromArray(settings?.client_logos)
    const partnerLogos = logosFromArray(settings?.partner_logos)

    return {
      hero_eyebrow: settings?.hero_eyebrow || DEFAULTS.hero_eyebrow,
      hero_title: settings?.hero_title || DEFAULTS.hero_title,
      hero_subtitle: settings?.hero_subtitle || DEFAULTS.hero_subtitle,
      hero_cta_primary_label: settings?.hero_cta_primary_label || DEFAULTS.hero_cta_primary_label,
      hero_cta_primary_href: settings?.hero_cta_primary_href || DEFAULTS.hero_cta_primary_href,
      hero_cta_secondary_label: settings?.hero_cta_secondary_label || DEFAULTS.hero_cta_secondary_label,
      hero_cta_secondary_href: settings?.hero_cta_secondary_href || DEFAULTS.hero_cta_secondary_href,
      hero_video_url: settings?.hero_video_url || null,
      hero_image_url: mediaUrl(settings?.hero_image),
      stats,
      stats_extra_text: settings?.stats_extra_text || DEFAULTS.stats_extra_text,
      client_logos_title: settings?.client_logos_title || DEFAULTS.client_logos_title,
      client_logos: clientLogos.length > 0 ? clientLogos : DEFAULTS.client_logos,
      partners_title: settings?.partners_title || DEFAULTS.partners_title,
      partner_logos: partnerLogos,
      method_eyebrow: settings?.method_eyebrow || DEFAULTS.method_eyebrow,
      method_title: settings?.method_title || DEFAULTS.method_title,
      method_description: settings?.method_description || DEFAULTS.method_description,
      method_cta_label: settings?.method_cta_label || DEFAULTS.method_cta_label,
      method_cta_href: settings?.method_cta_href || DEFAULTS.method_cta_href,
      final_cta_title: settings?.final_cta_title || DEFAULTS.final_cta_title,
      final_cta_description: settings?.final_cta_description || DEFAULTS.final_cta_description,
      final_cta_button_label: settings?.final_cta_button_label || DEFAULTS.final_cta_button_label,
      final_cta_button_href: settings?.final_cta_button_href || DEFAULTS.final_cta_button_href,
    }
  } catch {
    return DEFAULTS
  }
}

export const getHomeSettings = unstable_cache(fetchHomeSettings, ['home-settings'], {
  tags: ['home-settings'],
  revalidate: 60,
})
