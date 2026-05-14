import { describe, expect, it } from 'vitest'
import { calcLeadScore } from '../score'

describe('calcLeadScore (lead score v2 da Calculadora)', () => {
  it('mínimo é 30 (base) para inputs zerados sem CRM', () => {
    expect(
      calcLeadScore({
        investimento_mensal: 0,
        ticket_medio: 0,
        crm_funcional: false,
        roi_total: 0,
      }),
    ).toBe(30)
  })

  it('investimento 50k + ticket 50k + CRM + ROI > 100 → 100 (cap)', () => {
    expect(
      calcLeadScore({
        investimento_mensal: 50000,
        ticket_medio: 50000,
        crm_funcional: true,
        roi_total: 200,
      }),
    ).toBe(100)
  })

  it('investimento 15k + ticket 35k + sem CRM + ROI 7% (Marina §11.3) → 53', () => {
    // 30 (base) + 20 (inv 15k) + 15 (ticket 35k) + 0 + 0 = 65
    expect(
      calcLeadScore({
        investimento_mensal: 15000,
        ticket_medio: 35000,
        crm_funcional: false,
        roi_total: 7,
      }),
    ).toBe(65)
  })

  it('Marina §11.6 com CRM + ROI 257% → 85 (alto)', () => {
    // 30 + 20 (inv) + 15 (ticket) + 10 (crm) + 10 (roi>100) = 85
    expect(
      calcLeadScore({
        investimento_mensal: 15000,
        ticket_medio: 35000,
        crm_funcional: true,
        roi_total: 257,
      }),
    ).toBe(85)
  })

  it('cap 100 mesmo com valores extremos', () => {
    expect(
      calcLeadScore({
        investimento_mensal: 500000,
        ticket_medio: 1_000_000,
        crm_funcional: true,
        roi_total: 9999,
      }),
    ).toBe(100)
  })

  it('valor abaixo de 3k em investimento não bonifica', () => {
    // 30 base; ticket 2999 também não bonifica → 30
    expect(
      calcLeadScore({
        investimento_mensal: 2999,
        ticket_medio: 2999,
        crm_funcional: false,
        roi_total: 0,
      }),
    ).toBe(30)
  })
})
