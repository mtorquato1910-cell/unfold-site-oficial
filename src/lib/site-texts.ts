import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'

/** Hero (cabeçalho) de uma página: tagline + título + subtítulo. */
export type PageHero = {
  eyebrow: string
  title: string
  subtitle: string
}

export type SiteTextsData = {
  metodo: PageHero
  atuacao: PageHero
  cases: PageHero
  ferramentas: PageHero
  sobre: PageHero
  blog: PageHero
  guia: PageHero
}

export const SITE_TEXTS_DEFAULTS: SiteTextsData = {
  metodo: {
    eyebrow: 'Método Unfold',
    title: 'O Unfold Growth System.',
    subtitle:
      'Um framework de crescimento estruturado para operações com vendas complexas. Quatro pilares, uma lógica integrada.',
  },
  atuacao: {
    eyebrow: 'Atuação',
    title: 'Verticais onde o UGS opera.',
    subtitle:
      'Cada setor tem suas próprias dinâmicas de compra, vocabulário e gargalos. Aplicamos o Unfold Growth System com micro-ângulos específicos por vertical.',
  },
  cases: {
    eyebrow: 'Resultados comprovados',
    title: 'Cases de crescimento {{secondary}}estruturado.{{/secondary}}',
    subtitle:
      'Cada case é a prova do método UGS aplicado a uma operação real — com diagnóstico, estrutura e resultado mensurável.',
  },
  ferramentas: {
    eyebrow: 'Ferramentas gratuitas',
    title: 'Ferramentas para diagnosticar e {{primary}}escalar sua operação.{{/primary}}',
    subtitle:
      'Projeções e diagnósticos práticos para entender onde sua operação de crescimento está e o que está travando — sem compromisso.',
  },
  sobre: {
    eyebrow: 'Sobre a Unfold Growth',
    title: 'Crescimento organizado, {{primary}}resultado previsível.{{/primary}}',
    subtitle:
      'Somos uma consultoria especializada em estruturar sistemas de crescimento para empresas com vendas complexas — conectando marketing, vendas, CRM e automação em uma operação integrada e orientada a resultado.',
  },
  blog: {
    eyebrow: 'Blog',
    title: 'Conteúdo técnico sobre {{secondary}}crescimento estruturado.{{/secondary}}',
    subtitle:
      'Diagnóstico, estrutura e operação — os três pilares do método UGS em forma de conhecimento aplicado.',
  },
  guia: {
    eyebrow: 'ESTUDO · ELEIÇÕES 2026 · UNFOLD ✕ FEAT.WORK',
    title: 'Guia de anúncios digitais para as {{primary}}Eleições de 2026{{/primary}}.',
    subtitle: 'Regras, plataformas, riscos e oportunidades da operação política online.',
  },
}

function pickHero(settings: any, key: keyof SiteTextsData): PageHero {
  const def = SITE_TEXTS_DEFAULTS[key]
  return {
    eyebrow: settings?.[`${key}_eyebrow`] || def.eyebrow,
    title: settings?.[`${key}_title`] || def.title,
    subtitle: settings?.[`${key}_subtitle`] || def.subtitle,
  }
}

async function fetchSiteTexts(): Promise<SiteTextsData> {
  try {
    const payload = await getPayload({ config })
    const settings: any = await payload.findGlobal({ slug: 'site-texts', depth: 0 })
    return {
      metodo: pickHero(settings, 'metodo'),
      atuacao: pickHero(settings, 'atuacao'),
      cases: pickHero(settings, 'cases'),
      ferramentas: pickHero(settings, 'ferramentas'),
      sobre: pickHero(settings, 'sobre'),
      blog: pickHero(settings, 'blog'),
      guia: pickHero(settings, 'guia'),
    }
  } catch {
    return SITE_TEXTS_DEFAULTS
  }
}

export const getSiteTexts = unstable_cache(fetchSiteTexts, ['site-texts'], {
  tags: ['site-texts'],
  revalidate: 60,
})
