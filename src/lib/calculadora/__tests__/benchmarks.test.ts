import { describe, expect, it } from 'vitest'
import {
  BENCHMARKS_VERSAO,
  CANAIS,
  CICLO_POR_SETOR,
  CPL_POR_SETOR_CANAL,
  SETORES,
  calcularDefaults,
  cplPonderado,
} from '../benchmarks'

describe('benchmarks — cobertura tabular', () => {
  it('expõe os 7 setores conforme spec §3.2', () => {
    const valores = SETORES.map((s) => s.value).sort()
    expect(valores).toEqual(
      ['agro', 'automotivo', 'construcao', 'industria', 'outro', 'saas', 'servicos_b2b'].sort(),
    )
  })

  it('cobre os 3 canais', () => {
    expect(CANAIS.map((c) => c.value).sort()).toEqual(['google', 'linkedin', 'meta'])
  })

  it('todo setor tem CPL para os 3 canais', () => {
    for (const setor of SETORES) {
      const row = CPL_POR_SETOR_CANAL[setor.value]
      expect(row.google.valor).toBeGreaterThan(0)
      expect(row.meta.valor).toBeGreaterThan(0)
      expect(row.linkedin.valor).toBeGreaterThan(0)
    }
  })

  it('todo setor tem ciclo padrão (B2B)', () => {
    for (const setor of SETORES) {
      expect(CICLO_POR_SETOR[setor.value].valor).toBeGreaterThanOrEqual(7)
    }
  })

  it('versão registrada', () => {
    expect(BENCHMARKS_VERSAO).toBe('v1.0')
  })
})

describe('cplPonderado — spec §5.2 P1', () => {
  it('Agro + Google+LinkedIn → R$ 352,50 (exemplo Marina §11.3)', () => {
    const { valor } = cplPonderado('agro', ['google', 'linkedin'])
    expect(valor).toBeCloseTo(352.5, 2)
  })

  it('Construção + Google+LinkedIn → R$ 312,50 (exemplo spec §5.2)', () => {
    const { valor } = cplPonderado('construcao', ['google', 'linkedin'])
    expect(valor).toBeCloseTo(312.5, 2)
  })

  it('canal único retorna o CPL daquele canal', () => {
    const { valor } = cplPonderado('saas', ['google'])
    expect(valor).toBe(170)
  })

  it('lista vazia retorna 0 com confiança baixa', () => {
    const result = cplPonderado('saas', [])
    expect(result.valor).toBe(0)
    expect(result.confianca).toBe('baixa')
  })

  it('reduz à menor confiança entre os canais usados', () => {
    // Agro tem confiança "baixa" em todos os canais.
    const { confianca } = cplPonderado('agro', ['google', 'meta'])
    expect(confianca).toBe('baixa')
  })
})

describe('calcularDefaults — spec §5.2', () => {
  it('B2B + CRM=Não → taxa qualif 18%, conv 6%', () => {
    const d = calcularDefaults({
      setor: 'agro',
      modelo: 'b2b',
      crm_funcional: false,
      canais: ['google', 'linkedin'],
    })
    expect(d.taxa_qualificacao.valor).toBeCloseTo(0.18, 4)
    expect(d.conversao_mql_cliente.valor).toBeCloseTo(0.06, 4)
  })

  it('B2B + CRM=Sim → taxa qualif 30%, conv 12%', () => {
    const d = calcularDefaults({
      setor: 'agro',
      modelo: 'b2b',
      crm_funcional: true,
      canais: ['google', 'linkedin'],
    })
    expect(d.taxa_qualificacao.valor).toBeCloseTo(0.3, 4)
    expect(d.conversao_mql_cliente.valor).toBeCloseTo(0.12, 4)
  })

  it('B2C usa 25% para conversão MQL→Cliente independente de CRM', () => {
    const semCrm = calcularDefaults({
      setor: 'saas',
      modelo: 'b2c',
      crm_funcional: false,
      canais: ['meta'],
    })
    const comCrm = calcularDefaults({
      setor: 'saas',
      modelo: 'b2c',
      crm_funcional: true,
      canais: ['meta'],
    })
    expect(semCrm.conversao_mql_cliente.valor).toBeCloseTo(0.25, 4)
    expect(comCrm.conversao_mql_cliente.valor).toBeCloseTo(0.25, 4)
  })

  it('B2C força ciclo de 14 dias mesmo em setor B2B clássico', () => {
    const d = calcularDefaults({
      setor: 'construcao',
      modelo: 'b2c',
      crm_funcional: false,
      canais: ['meta'],
    })
    expect(d.ciclo_dias.valor).toBe(14)
  })

  it('setor "outro" devolve defaults válidos', () => {
    const d = calcularDefaults({
      setor: 'outro',
      modelo: 'b2b',
      crm_funcional: false,
      canais: ['google'],
    })
    expect(d.cpl.valor).toBe(200)
    expect(d.ciclo_dias.valor).toBe(60)
  })
})
