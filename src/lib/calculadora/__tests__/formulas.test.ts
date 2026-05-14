import { describe, expect, it } from 'vitest'
import { calcular, formatarExibicao } from '../formulas'
import { calcularDefaults, cplPonderado } from '../benchmarks'
import type { CalculadoraInputs, Premissas } from '../types'

/**
 * Cenário canônico do spec §11 — Marina Costa (Inova Sementes).
 *
 * Etapa 2:
 *   investimento_mensal = 15.000
 *   canais = Google + LinkedIn
 *   ticket_medio = 35.000
 *   modelo = B2B
 *   periodo = 12 meses
 *   setor = agro
 *
 * Premissas (defaults Agro / B2B / sem CRM):
 *   CPL = 352,50  /  taxa qualif = 18%  /  conv MQL→Cliente = 6%  /  ciclo = 90 dias
 */
const inputsMarinaSemCRM: CalculadoraInputs = {
  investimento_mensal: 15000,
  canais: ['google', 'linkedin'],
  ticket_medio: 35000,
  modelo: 'b2b',
  periodo: 12,
  crm_funcional: false,
}

const premissasMarinaSemCRM: Premissas = {
  cpl: 352.5,
  taxa_qualificacao: 0.18,
  conversao_mql_cliente: 0.06,
  ciclo_dias: 90,
}

describe('formulas.calcular — exemplo Marina sem CRM (spec §11.3)', () => {
  const r = calcular(inputsMarinaSemCRM, premissasMarinaSemCRM)

  it('investimento_total = 180.000', () => {
    expect(r.investimento_total).toBe(180000)
  })

  it('leads_gerados ≈ 510,64', () => {
    expect(r.leads_gerados).toBeCloseTo(510.64, 1)
  })

  it('mqls ≈ 91,92', () => {
    expect(r.mqls).toBeCloseTo(91.92, 1)
  })

  it('clientes_fechados ≈ 5,51', () => {
    expect(r.clientes_fechados).toBeCloseTo(5.51, 1)
  })

  it('fator_temporal = 0,75 (período 360 - ciclo 90)', () => {
    expect(r.fator_temporal).toBeCloseTo(0.75, 4)
  })

  it('clientes_no_periodo ≈ 4,14 / pipeline ≈ 1,38', () => {
    expect(r.clientes_no_periodo).toBeCloseTo(4.14, 1)
    expect(r.clientes_em_pipeline).toBeCloseTo(1.38, 1)
  })

  it('receita_no_periodo ≈ R$ 144.766 / pipeline ≈ R$ 48.255', () => {
    expect(r.receita_no_periodo).toBeCloseTo(144766, -2) // tolerância R$ 100
    expect(r.receita_em_pipeline).toBeCloseTo(48255, -2)
  })

  it('ROI no período ≈ -19,57% (exibe -20%)', () => {
    expect(r.roi_no_periodo).toBeCloseTo(-19.57, 1)
  })

  it('ROI total ≈ +7,23% (exibe +7%)', () => {
    expect(r.roi_total).toBeCloseTo(7.23, 1)
  })

  it('formatação respeita §6.2', () => {
    const f = formatarExibicao(r)
    expect(f.roi_no_periodo).toBe('-20%')
    expect(f.roi_total).toBe('+7%')
    expect(f.fator_temporal_pct).toBe('75%')
    expect(f.investimento_total).toContain('180.000')
    // 5,51 → "~6" (prefixo de aproximação por regra §6.2)
    expect(f.clientes_fechados.startsWith('~')).toBe(true)
  })
})

/**
 * Cenário §11.6 — Marina alterna CRM para Sim mantendo demais inputs.
 * Premissas P2 = 30%, P3 = 12% (defaults B2B com CRM).
 */
const premissasMarinaComCRM: Premissas = {
  cpl: 352.5,
  taxa_qualificacao: 0.3,
  conversao_mql_cliente: 0.12,
  ciclo_dias: 90,
}

describe('formulas.calcular — exemplo Marina com CRM (spec §11.6)', () => {
  const r = calcular(
    { ...inputsMarinaSemCRM, crm_funcional: true },
    premissasMarinaComCRM,
  )

  it('mqls ≈ 153,19 / clientes ≈ 18,38', () => {
    expect(r.mqls).toBeCloseTo(153.19, 1)
    expect(r.clientes_fechados).toBeCloseTo(18.38, 1)
  })

  it('receita_periodo ≈ R$ 482.553 / pipeline ≈ R$ 160.851', () => {
    expect(r.receita_no_periodo).toBeCloseTo(482553, -2)
    expect(r.receita_em_pipeline).toBeCloseTo(160851, -2)
  })

  it('ROI período ≈ +168% / ROI total ≈ +257%', () => {
    expect(r.roi_no_periodo).toBeCloseTo(168, 0)
    expect(r.roi_total).toBeCloseTo(257, 0)
  })

  it('formatação dos ROIs com sinal', () => {
    const f = formatarExibicao(r)
    expect(f.roi_no_periodo).toBe('+168%')
    expect(f.roi_total).toBe('+257%')
  })
})

describe('formulas — defaults vindos de calcularDefaults (integração benchmarks ↔ formulas)', () => {
  it('cenário Marina (agro + Google+LinkedIn) reproduz CPL 352,50', () => {
    const cpl = cplPonderado('agro', ['google', 'linkedin']).valor
    expect(cpl).toBeCloseTo(352.5, 2)
    const defaults = calcularDefaults({
      setor: 'agro',
      modelo: 'b2b',
      crm_funcional: false,
      canais: ['google', 'linkedin'],
    })
    const r = calcular(inputsMarinaSemCRM, {
      cpl: defaults.cpl.valor,
      taxa_qualificacao: defaults.taxa_qualificacao.valor,
      conversao_mql_cliente: defaults.conversao_mql_cliente.valor,
      ciclo_dias: defaults.ciclo_dias.valor,
    })
    expect(r.roi_no_periodo).toBeCloseTo(-19.57, 1)
  })
})

describe('formulas — casos de borda', () => {
  it('investimento_total = 0 → ROI = 0 (sem divisão por zero)', () => {
    const r = calcular(
      { ...inputsMarinaSemCRM, investimento_mensal: 0 },
      premissasMarinaSemCRM,
    )
    expect(r.investimento_total).toBe(0)
    expect(r.roi_no_periodo).toBe(0)
    expect(r.roi_total).toBe(0)
    expect(r.leads_gerados).toBe(0)
  })

  it('CPL = 0 → leads_gerados = 0 (não infinito)', () => {
    const r = calcular(inputsMarinaSemCRM, { ...premissasMarinaSemCRM, cpl: 0 })
    expect(r.leads_gerados).toBe(0)
    expect(r.mqls).toBe(0)
  })

  it('ciclo = período → fator_temporal = 0 (todo o resultado vira pipeline)', () => {
    const r = calcular(inputsMarinaSemCRM, { ...premissasMarinaSemCRM, ciclo_dias: 360 })
    expect(r.fator_temporal).toBe(0)
    expect(r.clientes_no_periodo).toBe(0)
    expect(r.clientes_em_pipeline).toBeCloseTo(r.clientes_fechados, 4)
  })

  it('ciclo > período → fator_temporal = 0 (não negativo)', () => {
    const r = calcular(
      { ...inputsMarinaSemCRM, periodo: 3 },
      { ...premissasMarinaSemCRM, ciclo_dias: 365 },
    )
    expect(r.fator_temporal).toBe(0)
    expect(r.receita_no_periodo).toBe(0)
  })

  it('ticket muito alto, B2B, ciclo curto, com CRM → ROI muito positivo', () => {
    const r = calcular(
      {
        investimento_mensal: 10000,
        canais: ['linkedin'],
        ticket_medio: 250000,
        modelo: 'b2b',
        periodo: 12,
        crm_funcional: true,
      },
      {
        cpl: 350,
        taxa_qualificacao: 0.3,
        conversao_mql_cliente: 0.12,
        ciclo_dias: 60,
      },
    )
    expect(r.roi_no_periodo).toBeGreaterThan(500)
  })
})

describe('formatarExibicao — regras §6.2', () => {
  it('inteiro arredondado de valor fracionário leva prefixo "~"', () => {
    const f = formatarExibicao(
      calcular(inputsMarinaSemCRM, premissasMarinaSemCRM),
    )
    // clientes_fechados = 5,51 → "~6"
    expect(f.clientes_fechados).toMatch(/^~/)
  })

  it('inteiro "limpo" (sem fracionário) não leva "~"', () => {
    const r = calcular(
      { ...inputsMarinaSemCRM, investimento_mensal: 10000, ticket_medio: 50000 },
      { ...premissasMarinaSemCRM, cpl: 100, taxa_qualificacao: 0.5, conversao_mql_cliente: 0.5, ciclo_dias: 30 },
    )
    const f = formatarExibicao(r)
    // 10000 × 12 = 120000 / 100 = 1200 leads (exato) → "1.200"
    expect(f.leads_gerados).toBe('1.200')
  })

  it('ROI exibe sinal explícito', () => {
    const r = calcular(inputsMarinaSemCRM, premissasMarinaSemCRM)
    const f = formatarExibicao(r)
    expect(f.roi_no_periodo.startsWith('-')).toBe(true)
    expect(f.roi_total.startsWith('+')).toBe(true)
  })
})
