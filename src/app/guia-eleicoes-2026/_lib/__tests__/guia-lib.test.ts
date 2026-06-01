/**
 * Testes das funções puras do hotsite Guia Eleições (S5.7).
 * Cobre validação, máscara/telefone, perfil→tag, builders de share/UTM, anonimização de IP.
 */
import { describe, it, expect } from 'vitest'
import { guiaLeadSchema } from '../validation'
import { PERFIL_OPTIONS, perfilTag, perfilLabel, isPerfilComercial } from '../perfil'
import { buildWhatsappUrl, buildMailtoUrl } from '../share'
import { anonymizeIp } from '../anonymize-ip'
import { formatPhoneBR, isValidPhoneBR, extractDigits } from '../../../../lib/format/phone-mask'

describe('guiaLeadSchema (RF-14..17)', () => {
  const valid = {
    nome: 'Maria Silva',
    email: 'maria@exemplo.com',
    telefone: '11999998888',
    perfil: 'candidato' as const,
  }

  it('aceita um cadastro válido', () => {
    expect(guiaLeadSchema.safeParse(valid).success).toBe(true)
  })

  it('rejeita nome com uma só palavra', () => {
    const r = guiaLeadSchema.safeParse({ ...valid, nome: 'Maria' })
    expect(r.success).toBe(false)
  })

  it('rejeita "a b" (palavras com menos de 2 letras)', () => {
    expect(guiaLeadSchema.safeParse({ ...valid, nome: 'a b' }).success).toBe(false)
  })

  it('normaliza espaços múltiplos no nome', () => {
    const r = guiaLeadSchema.safeParse({ ...valid, nome: '  Maria   Silva  ' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.nome).toBe('Maria Silva')
  })

  it('rejeita e-mail inválido', () => {
    expect(guiaLeadSchema.safeParse({ ...valid, email: 'naoeh' }).success).toBe(false)
  })

  it('aceita telefone fixo de 10 dígitos e celular de 11', () => {
    expect(guiaLeadSchema.safeParse({ ...valid, telefone: '1133334444' }).success).toBe(true)
    expect(guiaLeadSchema.safeParse({ ...valid, telefone: '11999998888' }).success).toBe(true)
  })

  it('rejeita telefone com menos de 10 dígitos', () => {
    expect(guiaLeadSchema.safeParse({ ...valid, telefone: '119999' }).success).toBe(false)
  })

  it('exige perfil entre as 4 opções', () => {
    expect(guiaLeadSchema.safeParse({ ...valid, perfil: 'invalido' }).success).toBe(false)
  })
})

describe('máscara de telefone (RF-17, telefone fixo 10 dígitos)', () => {
  it('formata 11 dígitos como celular', () => {
    expect(formatPhoneBR('11999998888')).toBe('(11) 99999-8888')
  })
  it('formata 10 dígitos como fixo', () => {
    expect(formatPhoneBR('1133334444')).toBe('(11) 3333-4444')
  })
  it('extractDigits remove tudo que não é dígito', () => {
    expect(extractDigits('(11) 99999-8888')).toBe('11999998888')
  })
  it('valida 10 e 11 dígitos; rejeita curto', () => {
    expect(isValidPhoneBR('1133334444')).toBe(true)
    expect(isValidPhoneBR('11999998888')).toBe(true)
    expect(isValidPhoneBR('119999')).toBe(false)
  })
})

describe('perfil → tag/label (RF-15/RF-22)', () => {
  it('mapeia cada perfil para sua tag', () => {
    expect(perfilTag('candidato')).toBe('perfil-candidato')
    expect(perfilTag('equipe-campanha')).toBe('perfil-equipe-campanha')
    expect(perfilTag('setor')).toBe('perfil-setor')
    expect(perfilTag('outro')).toBe('perfil-outro')
  })
  it('tem 4 opções com labels não vazios', () => {
    expect(PERFIL_OPTIONS).toHaveLength(4)
    PERFIL_OPTIONS.forEach((o) => expect(perfilLabel(o.value).length).toBeGreaterThan(0))
  })
  it('candidato e equipe são perfis comerciais', () => {
    expect(isPerfilComercial('candidato')).toBe(true)
    expect(isPerfilComercial('equipe-campanha')).toBe(true)
    expect(isPerfilComercial('setor')).toBe(false)
    expect(isPerfilComercial('outro')).toBe(false)
  })
})

describe('builders de compartilhamento (RF-31..33)', () => {
  it('WhatsApp inclui wa.me, UTMs e hash', () => {
    const url = buildWhatsappUrl('abcd1234')
    expect(url).toContain('https://wa.me/?text=')
    const decoded = decodeURIComponent(url)
    expect(decoded).toContain('utm_source=share')
    expect(decoded).toContain('utm_medium=whatsapp')
    expect(decoded).toContain('utm_campaign=guia-eleicoes-2026')
    expect(decoded).toContain('utm_content=abcd1234')
  })
  it('e-mail usa mailto com assunto e utm_medium=email', () => {
    const url = buildMailtoUrl('abcd1234')
    expect(url.startsWith('mailto:?')).toBe(true)
    const decoded = decodeURIComponent(url)
    expect(decoded).toContain('utm_medium=email')
    expect(decoded).toContain('Eleições de 2026')
  })
  it('omite utm_content quando não há hash', () => {
    expect(decodeURIComponent(buildWhatsappUrl())).not.toContain('utm_content=')
  })
})

describe('anonymizeIp (LOG-01)', () => {
  it('zera o último octeto de IPv4 (/24)', () => {
    expect(anonymizeIp('189.45.123.200')).toBe('189.45.123.0')
  })
  it('trata IPv6 (mantém /64)', () => {
    expect(anonymizeIp('2804:14d:5c3a:1234:abcd:1::1')).toBe('2804:14d:5c3a:1234::')
  })
  it('retorna unknown para vazio/indefinido', () => {
    expect(anonymizeIp('')).toBe('unknown')
    expect(anonymizeIp(undefined)).toBe('unknown')
    expect(anonymizeIp('unknown')).toBe('unknown')
  })
})
