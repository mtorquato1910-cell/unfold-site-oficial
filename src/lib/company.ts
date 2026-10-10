import type { PublicSiteSettings } from './site-settings'

/**
 * Dados da empresa para o Google (S06 — épico seo-tecnico-2026-10; Checklist SEO M09).
 *
 * Fonte do texto: "Versão para o site" enviada pelo cliente em 10/10/2026.
 * Contato, endereço, CNPJ e redes vêm do global `site-settings` (editável em
 * /painel/site-config) — assim schema, rodapé e /contato mostram SEMPRE os mesmos
 * dados (regra do Google: o que está no schema precisa estar visível na página).
 * Aqui ficam só os fatos que não têm campo no painel.
 *
 * Pendente do cliente (P5): rua/número/CEP, fundadores, ano de fundação, demais redes.
 * Campos vazios simplesmente não entram no schema — nunca inventar dado.
 */
export const COMPANY = {
  name: 'Unfold Growth',
  /** Descrição curta (schema, llms.txt). 1–2 frases, sem links nem preços. */
  description:
    'Assessoria de growth de Maceió (AL) para empresas B2B de ciclo de venda longo e decisão complexa. Integramos marketing, vendas, CRM e automação em um só sistema para gerar demanda previsível e resultado comercial mensurável.',
  locality: 'Maceió',
  region: 'AL',
  country: 'BR',
  /** Atende todo o Brasil, sem atendimento no local → Organization (não LocalBusiness). */
  areaServed: 'Brasil',
  hours: { label: 'Segunda a sexta, das 9h às 19h', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '19:00' },
  /** Associações reais e comprováveis (schema memberOf). */
  memberOf: ['Assespro', 'Abradi Alagoas'],
  /** Parcerias (texto visível; não é propriedade de schema). */
  partners: ['RD Station', 'Meta Business', 'Kommo'],
  /** Logo legível em fundo branco, ≥ 112×112 px (2064×453). */
  logo: { path: '/unfold-wordmark.png', width: 2064, height: 453 },
  /** P5 — preencher quando o cliente informar (nome + cargo). */
  founders: [] as { name: string; jobTitle?: string }[],
  /** P5 — AAAA. */
  foundingDate: null as string | null,
}

/** Telefone em formato internacional para schema (+55-82-99647-1621). */
export function toE164Display(phone: string | null | undefined): string | undefined {
  const digits = (phone || '').replace(/\D/g, '')
  if (digits.length < 10) return undefined
  const local = digits.startsWith('55') && digits.length > 11 ? digits.slice(2) : digits
  const ddd = local.slice(0, 2)
  const rest = local.slice(2)
  return `+55-${ddd}-${rest.slice(0, rest.length - 4)}-${rest.slice(-4)}`
}

/** Dígitos com o código do país. Só considera "55" como país com 12–13 dígitos
 *  (senão é o DDD 55 do RS: "(55) 99999-1234"). */
function withCountry(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return digits.startsWith('55') && digits.length >= 12 ? digits : `55${digits}`
}

/** Link `tel:` / `wa.me` a partir do telefone exibido. */
export const telHref = (phone: string) => `tel:+${withCountry(phone)}`
export const whatsappHref = (phone: string) => `https://wa.me/${withCountry(phone)}`

/** Perfis oficiais configurados no painel (mesma lista do rodapé = sameAs). */
export function officialProfiles(s: PublicSiteSettings): string[] {
  return [s.linkedin, s.instagram, s.youtube, s.facebook, s.twitter].filter((u): u is string => !!u)
}

export const ORGANIZATION_ID_PATH = '/#organization'
export const WEBSITE_ID_PATH = '/#website'

/** Organization (JSON-LD) com @id fixo — reutilizado como publisher e worksFor. */
export function buildOrganizationSchema(baseUrl: string, s: PublicSiteSettings): Record<string, unknown> {
  const telephone = toE164Display(s.telefone || s.whatsapp)
  const sameAs = officialProfiles(s)
  const address: Record<string, unknown> = {
    '@type': 'PostalAddress',
    addressLocality: COMPANY.locality,
    addressRegion: COMPANY.region,
    addressCountry: COMPANY.country,
  }
  if (s.endereco) address.streetAddress = s.endereco

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}${ORGANIZATION_ID_PATH}`,
    name: s.site_name || COMPANY.name,
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}${COMPANY.logo.path}`,
      width: COMPANY.logo.width,
      height: COMPANY.logo.height,
    },
    image: `${baseUrl}${COMPANY.logo.path}`,
    description: COMPANY.description,
    email: s.email_contato,
    address,
    areaServed: { '@type': 'Country', name: COMPANY.areaServed },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: s.email_contato,
      ...(telephone ? { telephone } : {}),
      areaServed: 'BR',
      availableLanguage: ['Portuguese'],
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: COMPANY.hours.days,
        opens: COMPANY.hours.opens,
        closes: COMPANY.hours.closes,
      },
    },
    memberOf: COMPANY.memberOf.map((name) => ({ '@type': 'Organization', name })),
  }
  if (telephone) schema.telephone = telephone
  if (sameAs.length) schema.sameAs = sameAs
  if (s.cnpj) schema.taxID = s.cnpj
  if (COMPANY.founders.length) {
    schema.founder = COMPANY.founders.map((f) => ({ '@type': 'Person', name: f.name, ...(f.jobTitle ? { jobTitle: f.jobTitle } : {}) }))
  }
  if (COMPANY.foundingDate) schema.foundingDate = COMPANY.foundingDate
  return schema
}
