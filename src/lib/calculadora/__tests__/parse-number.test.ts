import { describe, expect, it } from 'vitest'
import { parseLooseNumber, formatBRL } from '../parse-number'

describe('parseLooseNumber — formato BR (Sprint hotfix Bug 2)', () => {
  // Cenário de regressão reportado pelo cliente em 2026-05-15.
  it('aceita ticket médio de 10.000 (Bug 2)', () => {
    expect(parseLooseNumber('10000')).toBe(10000)
    expect(parseLooseNumber('10.000')).toBe(10000)
    expect(parseLooseNumber('10.000,00')).toBe(10000)
    expect(parseLooseNumber('R$ 10.000,00')).toBe(10000)
    expect(parseLooseNumber('R$ 10.000')).toBe(10000)
  })

  it('preserva valores sem separador de milhar', () => {
    expect(parseLooseNumber('1000')).toBe(1000)
    expect(parseLooseNumber('25000')).toBe(25000)
    expect(parseLooseNumber('999999')).toBe(999999)
  })

  it('parseia múltiplos pontos como milhar (5–7 dígitos)', () => {
    expect(parseLooseNumber('100.000')).toBe(100000)
    expect(parseLooseNumber('500.000')).toBe(500000)
    expect(parseLooseNumber('1.000.000')).toBe(1000000)
    expect(parseLooseNumber('1.500.000')).toBe(1500000)
  })

  it('trata vírgula como decimal BR', () => {
    expect(parseLooseNumber('1,5')).toBe(1.5)
    expect(parseLooseNumber('100,50')).toBe(100.5)
    expect(parseLooseNumber('1.000,50')).toBe(1000.5)
  })

  it('retorna 0 para entradas vazias ou inválidas', () => {
    expect(parseLooseNumber('')).toBe(0)
    expect(parseLooseNumber('abc')).toBe(0)
    expect(parseLooseNumber('R$')).toBe(0)
  })

  // Regressão I-2 do @qa: parseLooseNumber também atende investimento_mensal,
  // que tem .max(500000) no Zod. Valores típicos não devem regredir.
  it('cobre valores típicos de investimento_mensal sem regressão', () => {
    expect(parseLooseNumber('5.000')).toBe(5000)
    expect(parseLooseNumber('15.000')).toBe(15000)
    expect(parseLooseNumber('50.000')).toBe(50000)
    expect(parseLooseNumber('500.000')).toBe(500000)
    expect(parseLooseNumber('R$ 500.000,00')).toBe(500000)
  })

  it('ignora caracteres não numéricos e mantém o número', () => {
    expect(parseLooseNumber('R$ 25.000,00 BRL')).toBe(25000)
    expect(parseLooseNumber('  10000  ')).toBe(10000)
  })
})

describe('formatBRL', () => {
  it('formata como moeda BR sem casas decimais', () => {
    const out = formatBRL(10000)
    expect(out).toMatch(/R\$/)
    expect(out).toMatch(/10\.000/)
  })
})
