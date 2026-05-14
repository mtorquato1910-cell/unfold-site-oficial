import { describe, expect, it } from 'vitest'
import { detectarAdulteracao, detectarDivergencias } from '../anti-tamper'
import { calcular } from '../formulas'
import type { CalculadoraInputs, Premissas, Resultado } from '../types'

const inputsMarina: CalculadoraInputs = {
  investimento_mensal: 15000,
  canais: ['google', 'linkedin'],
  ticket_medio: 35000,
  modelo: 'b2b',
  periodo: 12,
  crm_funcional: false,
}
const premissasMarina: Premissas = {
  cpl: 352.5,
  taxa_qualificacao: 0.18,
  conversao_mql_cliente: 0.06,
  ciclo_dias: 90,
}

describe('anti-tamper.detectarAdulteracao', () => {
  it('mesmo resultado → sem adulteração', () => {
    const r = calcular(inputsMarina, premissasMarina)
    expect(detectarAdulteracao(r, r)).toBe(false)
  })

  it('cliente inflando ROI em 1000% → detecta', () => {
    const r = calcular(inputsMarina, premissasMarina)
    const adulterado: Resultado = { ...r, roi_no_periodo: 9999, roi_total: 9999 }
    expect(detectarAdulteracao(adulterado, r)).toBe(true)
  })

  it('cliente trocando insight via receita → detecta', () => {
    const r = calcular(inputsMarina, premissasMarina)
    // Lead malicioso tenta fingir que receita_no_periodo > 0 quando não é
    const adulterado: Resultado = { ...r, receita_no_periodo: 1_000_000 }
    expect(detectarAdulteracao(adulterado, r)).toBe(true)
  })

  it('cliente inflando leads_gerados → detecta', () => {
    const r = calcular(inputsMarina, premissasMarina)
    const adulterado: Resultado = { ...r, leads_gerados: r.leads_gerados * 2 }
    expect(detectarAdulteracao(adulterado, r)).toBe(true)
  })

  it('arredondamento de 1 centavo → não detecta (tolerância)', () => {
    const r = calcular(inputsMarina, premissasMarina)
    const quase: Resultado = {
      ...r,
      receita_no_periodo: r.receita_no_periodo + 0.5, // diferença minúscula
      leads_gerados: r.leads_gerados + 0.001,
    }
    expect(detectarAdulteracao(quase, r)).toBe(false)
  })

  it('zero × zero (ROI = 0) → não detecta com microdiferença', () => {
    const zero: Resultado = {
      investimento_total: 0,
      leads_gerados: 0,
      mqls: 0,
      clientes_fechados: 0,
      fator_temporal: 0,
      clientes_no_periodo: 0,
      clientes_em_pipeline: 0,
      receita_no_periodo: 0,
      receita_em_pipeline: 0,
      roi_no_periodo: 0,
      roi_total: 0,
    }
    expect(detectarAdulteracao(zero, zero)).toBe(false)
  })

  it('detectarDivergencias retorna lista nomeada para logging', () => {
    const r = calcular(inputsMarina, premissasMarina)
    const adulterado: Resultado = { ...r, roi_no_periodo: 500 }
    const diffs = detectarDivergencias(adulterado, r)
    expect(diffs.length).toBeGreaterThan(0)
    expect(diffs[0].campo).toBe('roi_no_periodo')
    expect(diffs[0].client).toBe(500)
  })
})
