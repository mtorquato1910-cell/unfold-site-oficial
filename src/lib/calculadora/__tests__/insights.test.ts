import { describe, expect, it } from 'vitest'
import { INSIGHTS_BY_ID, selecionarInsight } from '../insights'

describe('selecionarInsight — tabela §7.1 (combinatória CRM × ROI)', () => {
  it('CRM=Sim & ROI ≥ 0 → I-A', () => {
    const r = selecionarInsight({
      crm_funcional: true,
      roi_no_periodo: 50,
      receita_no_periodo: 100000,
      receita_em_pipeline: 100000,
    })
    expect(r.principal).toBe('I-A')
  })

  it('CRM=Sim & ROI < 0 → I-B', () => {
    const r = selecionarInsight({
      crm_funcional: true,
      roi_no_periodo: -10,
      receita_no_periodo: 50000,
      receita_em_pipeline: 50000,
    })
    expect(r.principal).toBe('I-B')
  })

  it('CRM=Não & ROI ≥ 0 → I-C', () => {
    const r = selecionarInsight({
      crm_funcional: false,
      roi_no_periodo: 80,
      receita_no_periodo: 200000,
      receita_em_pipeline: 0,
    })
    expect(r.principal).toBe('I-C')
  })

  it('CRM=Não & ROI < 0 → I-D (caso Marina §11.4)', () => {
    const r = selecionarInsight({
      crm_funcional: false,
      roi_no_periodo: -20,
      receita_no_periodo: 144766,
      receita_em_pipeline: 48255,
    })
    expect(r.principal).toBe('I-D')
    // Marina §11.4: ratio 48255/144766 ≈ 0,33 — não aciona I-E
    expect(r.override_ie).toBe(false)
  })

  it('ROI exatamente 0 ainda é "≥ 0" → I-A (com CRM) / I-C (sem CRM)', () => {
    expect(
      selecionarInsight({
        crm_funcional: true,
        roi_no_periodo: 0,
        receita_no_periodo: 1000,
        receita_em_pipeline: 0,
      }).principal,
    ).toBe('I-A')
    expect(
      selecionarInsight({
        crm_funcional: false,
        roi_no_periodo: 0,
        receita_no_periodo: 1000,
        receita_em_pipeline: 0,
      }).principal,
    ).toBe('I-C')
  })
})

describe('selecionarInsight — override I-E (spec §7.1, ratio > 3)', () => {
  it('pipeline/periodo > 3 → override ativo', () => {
    const r = selecionarInsight({
      crm_funcional: true,
      roi_no_periodo: 5,
      receita_no_periodo: 100000,
      receita_em_pipeline: 400000,
    })
    expect(r.override_ie).toBe(true)
    expect(r.principal).toBe('I-A')
  })

  it('ratio ≤ 3 → override desligado', () => {
    const r = selecionarInsight({
      crm_funcional: true,
      roi_no_periodo: 5,
      receita_no_periodo: 100000,
      receita_em_pipeline: 300000,
    })
    expect(r.override_ie).toBe(false)
  })

  it('receita_no_periodo = 0 mas pipeline > 0 → override ativo (todo o resultado é futuro)', () => {
    const r = selecionarInsight({
      crm_funcional: true,
      roi_no_periodo: -100,
      receita_no_periodo: 0,
      receita_em_pipeline: 50000,
    })
    expect(r.override_ie).toBe(true)
  })

  it('tudo zero → override desligado', () => {
    const r = selecionarInsight({
      crm_funcional: false,
      roi_no_periodo: 0,
      receita_no_periodo: 0,
      receita_em_pipeline: 0,
    })
    expect(r.override_ie).toBe(false)
  })

  it('override I-E pode acompanhar qualquer principal (não substitui)', () => {
    for (const crm of [true, false]) {
      for (const roi of [10, -10]) {
        const r = selecionarInsight({
          crm_funcional: crm,
          roi_no_periodo: roi,
          receita_no_periodo: 10000,
          receita_em_pipeline: 40000,
        })
        expect(r.principal).toMatch(/^I-[ABCD]$/)
        expect(r.override_ie).toBe(true)
      }
    }
  })
})

describe('biblioteca de textos — integridade vs spec', () => {
  it('os 5 insights estão registrados', () => {
    expect(Object.keys(INSIGHTS_BY_ID).sort()).toEqual(['I-A', 'I-B', 'I-C', 'I-D', 'I-E'])
  })

  it('todos têm título, manchete e corpo não vazios', () => {
    for (const [id, t] of Object.entries(INSIGHTS_BY_ID)) {
      expect(t.titulo.length, `${id} título`).toBeGreaterThan(10)
      expect(t.manchete.length, `${id} manchete`).toBeGreaterThan(10)
      expect(t.corpo.length, `${id} corpo`).toBeGreaterThan(300)
    }
  })

  it('I-D abre exatamente como no spec §7.2', () => {
    expect(INSIGHTS_BY_ID['I-D'].manchete).toBe(
      'O problema não está no investimento. Está no sistema que recebe o lead.',
    )
  })
})
