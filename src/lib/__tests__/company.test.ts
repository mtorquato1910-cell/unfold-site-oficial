import { describe, it, expect } from 'vitest'
import { buildOrganizationSchema, toE164Display, telHref, whatsappHref, officialProfiles } from '../company'
import type { PublicSiteSettings } from '../site-settings'

const BASE = 'https://unfoldgrowth.com.br'

const settings = (over: Partial<PublicSiteSettings> = {}): PublicSiteSettings => ({
  tagline: 't',
  cidade: 'Maceió – AL',
  email_contato: 'gabriel@unfoldgrowth.com.br',
  telefone: '(82) 99647-1621',
  whatsapp: '(82) 99647-1621',
  endereco: null,
  cnpj: null,
  linkedin: 'https://www.linkedin.com/company/unfoldgrowth',
  instagram: null,
  youtube: null,
  facebook: null,
  twitter: null,
  site_name: 'Unfold Growth',
  meta_descricao_padrao: null,
  email_dpo: null,
  lgpd_aviso_cookies: '',
  calendar_embed_url: null,
  calendar_label: '',
  ...over,
})

describe('telefone', () => {
  it('formata para schema e links', () => {
    expect(toE164Display('(82) 99647-1621')).toBe('+55-82-99647-1621')
    expect(toE164Display('+55 82 99647-1621')).toBe('+55-82-99647-1621')
    expect(toE164Display('')).toBeUndefined()
    expect(telHref('(82) 99647-1621')).toBe('tel:+5582996471621')
    expect(whatsappHref('(82) 99647-1621')).toBe('https://wa.me/5582996471621')
    // DDD 55 (RS) sem código do país não pode ser confundido com o +55
    expect(telHref('(55) 99999-1234')).toBe('tel:+5555999991234')
    expect(telHref('+55 55 99999-1234')).toBe('tel:+5555999991234')
  })
})

describe('buildOrganizationSchema', () => {
  it('tem @id fixo, logo que existe e os dados da empresa', () => {
    const s = buildOrganizationSchema(BASE, settings())
    expect(s['@id']).toBe(`${BASE}/#organization`)
    expect((s.logo as any).url).toBe(`${BASE}/unfold-wordmark.png`)
    expect(s.telephone).toBe('+55-82-99647-1621')
    expect(s.email).toBe('gabriel@unfoldgrowth.com.br')
    expect((s.address as any).addressLocality).toBe('Maceió')
    expect((s.address as any).addressRegion).toBe('AL')
    expect((s.memberOf as any[]).map((m) => m.name)).toEqual(['Assespro', 'Abradi Alagoas'])
    expect(s.sameAs).toEqual(['https://www.linkedin.com/company/unfoldgrowth'])
    expect(JSON.stringify(s)).not.toContain('logo.svg')
  })

  it('sameAs acompanha as redes configuradas no painel (mesma lista do rodapé)', () => {
    const s = settings({ instagram: 'https://instagram.com/unfold' })
    expect(buildOrganizationSchema(BASE, s).sameAs).toEqual(officialProfiles(s))
  })

  it('campos sem dado não entram (nunca inventa endereço, CNPJ ou fundador)', () => {
    const s = buildOrganizationSchema(BASE, settings({ telefone: null, whatsapp: null, linkedin: null }))
    expect(s.telephone).toBeUndefined()
    expect(s.sameAs).toBeUndefined()
    expect(s.taxID).toBeUndefined()
    expect(s.founder).toBeUndefined()
    expect((s.address as any).streetAddress).toBeUndefined()
  })

  it('usa endereço e CNPJ quando preenchidos no painel', () => {
    const s = buildOrganizationSchema(BASE, settings({ endereco: 'Rua X, 10 – Centro', cnpj: '00.000.000/0001-00' }))
    expect((s.address as any).streetAddress).toBe('Rua X, 10 – Centro')
    expect(s.taxID).toBe('00.000.000/0001-00')
  })
})
