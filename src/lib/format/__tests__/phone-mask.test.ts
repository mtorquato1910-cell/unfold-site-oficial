/**
 * Testes de normalizePhoneBR — DDD válido + regra do 9º dígito (com/sem o 9).
 */
import { describe, it, expect } from 'vitest'
import {
  normalizePhoneBR,
  isValidPhoneBR,
  isValidMobileBR,
  isSuspiciousPhoneBR,
  formatPhoneBR,
} from '../phone-mask'

describe('normalizePhoneBR — celular com 9', () => {
  it('aceita celular de 11 dígitos e gera E.164', () => {
    const r = normalizePhoneBR('11999998888')
    expect(r.ok).toBe(true)
    expect(r.national).toBe('11999998888')
    expect(r.e164).toBe('5511999998888')
    expect(r.isMobile).toBe(true)
    expect(r.ddd).toBe('11')
  })

  it('aceita máscara e ignora não-dígitos', () => {
    expect(normalizePhoneBR('(11) 99999-8888').national).toBe('11999998888')
  })
})

describe('normalizePhoneBR — regra do 9º dígito', () => {
  it('insere o 9 em celular antigo de 10 dígitos (resto começa 6-9)', () => {
    const r = normalizePhoneBR('1188887777')
    expect(r.ok).toBe(true)
    expect(r.national).toBe('11988887777')
    expect(r.isMobile).toBe(true)
  })

  it('mantém telefone fixo de 10 dígitos (resto começa 2-5)', () => {
    const r = normalizePhoneBR('1133334444')
    expect(r.ok).toBe(true)
    expect(r.national).toBe('1133334444')
    expect(r.isMobile).toBe(false)
  })

  it('remove o prefixo de país 55', () => {
    expect(normalizePhoneBR('5511999998888').national).toBe('11999998888')
    expect(normalizePhoneBR('551133334444').national).toBe('1133334444')
  })
})

describe('normalizePhoneBR — inválidos', () => {
  it('rejeita DDD inexistente', () => {
    const r = normalizePhoneBR('0099998888')
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('ddd')
  })

  it('rejeita 11 dígitos cujo terceiro dígito não é 9', () => {
    const r = normalizePhoneBR('11888887777')
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('numero')
  })

  it('rejeita comprimento fora de 10/11', () => {
    expect(normalizePhoneBR('119999').reason).toBe('comprimento')
    expect(normalizePhoneBR('').reason).toBe('vazio')
  })
})

describe('normalizePhoneBR — números falsos (suspeitos)', () => {
  it('rejeita todos os dígitos iguais (9999999999 / 11999999999)', () => {
    expect(normalizePhoneBR('9999999999').reason).toBe('suspeito')
    expect(normalizePhoneBR('11999999999').reason).toBe('suspeito')
    // Rejeitado de qualquer forma (aqui pelo 3º dígito ≠ 9, antes da checagem de repetição).
    expect(normalizePhoneBR('11111111111').ok).toBe(false)
  })

  it('rejeita sequência óbvia no corpo (crescente/decrescente)', () => {
    expect(normalizePhoneBR('11987654321').reason).toBe('suspeito')
    expect(normalizePhoneBR('11912345678').reason).toBe('suspeito')
  })

  it('rejeita fixo com dígitos todos iguais', () => {
    expect(normalizePhoneBR('1133333333').reason).toBe('suspeito')
  })

  it('aceita celular real com dígitos variados', () => {
    expect(normalizePhoneBR('11991234567').ok).toBe(true)
    expect(normalizePhoneBR('11988887777').ok).toBe(true)
  })

  it('isSuspiciousPhoneBR opera sobre o número nacional', () => {
    expect(isSuspiciousPhoneBR('11999999999')).toBe(true)
    expect(isSuspiciousPhoneBR('11991234567')).toBe(false)
  })
})

describe('helpers isValidPhoneBR / isValidMobileBR', () => {
  it('isValidPhoneBR aceita fixo e celular válidos', () => {
    expect(isValidPhoneBR('1133334444')).toBe(true)
    expect(isValidPhoneBR('11999998888')).toBe(true)
    expect(isValidPhoneBR('0099998888')).toBe(false)
  })

  it('isValidMobileBR rejeita fixo', () => {
    expect(isValidMobileBR('1133334444')).toBe(false)
    expect(isValidMobileBR('11999998888')).toBe(true)
  })
})

describe('formatPhoneBR (máscara progressiva)', () => {
  it('formata celular completo', () => {
    expect(formatPhoneBR('11999998888')).toBe('(11) 99999-8888')
  })
  it('formata parcial', () => {
    expect(formatPhoneBR('119')).toBe('(11) 9')
  })
})
