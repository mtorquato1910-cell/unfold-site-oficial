import { describe, expect, it } from 'vitest'
import { etapa1Schema, inputsSchema, premissasSchema, submissaoSchema } from '../schema'

describe('schema Zod — Etapa 1', () => {
  it('aceita payload válido', () => {
    const r = etapa1Schema.safeParse({
      nome: 'Marina Costa',
      email: 'marina@inova.com.br',
      empresa: 'Inova Sementes',
      telefone: '(11) 98888-7777',
      setor: 'agro',
    })
    expect(r.success).toBe(true)
  })

  it('rejeita telefone ausente (obrigatório)', () => {
    const r = etapa1Schema.safeParse({
      nome: 'Marina Costa',
      email: 'marina@inova.com.br',
      empresa: 'Inova Sementes',
      setor: 'agro',
    })
    expect(r.success).toBe(false)
  })

  it('rejeita email inválido', () => {
    const r = etapa1Schema.safeParse({
      nome: 'Marina',
      email: 'nope',
      empresa: 'X',
      setor: 'agro',
    })
    expect(r.success).toBe(false)
  })

  it('rejeita setor desconhecido', () => {
    const r = etapa1Schema.safeParse({
      nome: 'Marina',
      email: 'marina@x.com',
      empresa: 'X',
      setor: 'farmaceutico',
    })
    expect(r.success).toBe(false)
  })
})

describe('schema Zod — Inputs Etapa 2', () => {
  it('investimento mínimo é R$ 1.000', () => {
    const r = inputsSchema.safeParse({
      investimento_mensal: 999,
      canais: ['google'],
      ticket_medio: 5000,
      modelo: 'b2b',
      periodo: 6,
      crm_funcional: true,
    })
    expect(r.success).toBe(false)
  })

  it('exige ao menos 1 canal', () => {
    const r = inputsSchema.safeParse({
      investimento_mensal: 5000,
      canais: [],
      ticket_medio: 5000,
      modelo: 'b2b',
      periodo: 6,
      crm_funcional: true,
    })
    expect(r.success).toBe(false)
  })

  it('período só aceita 3/6/12', () => {
    const r = inputsSchema.safeParse({
      investimento_mensal: 5000,
      canais: ['google'],
      ticket_medio: 5000,
      modelo: 'b2b',
      periodo: 9,
      crm_funcional: true,
    })
    expect(r.success).toBe(false)
  })
})

describe('schema Zod — Premissas', () => {
  it('CPL fora de 30..800 falha', () => {
    expect(
      premissasSchema.safeParse({
        cpl: 25,
        taxa_qualificacao: 0.2,
        conversao_mql_cliente: 0.1,
        ciclo_dias: 60,
      }).success,
    ).toBe(false)
    expect(
      premissasSchema.safeParse({
        cpl: 900,
        taxa_qualificacao: 0.2,
        conversao_mql_cliente: 0.1,
        ciclo_dias: 60,
      }).success,
    ).toBe(false)
  })
})

describe('schema Zod — Submissão completa', () => {
  const base = {
    token: 'a'.repeat(32),
    etapa1: {
      nome: 'Marina Costa',
      email: 'marina@inova.com.br',
      empresa: 'Inova Sementes',
      telefone: '(11) 98888-7777',
      setor: 'agro' as const,
    },
    inputs: {
      investimento_mensal: 15000,
      canais: ['google' as const, 'linkedin' as const],
      ticket_medio: 35000,
      modelo: 'b2b' as const,
      periodo: 12 as const,
      crm_funcional: false,
    },
    premissas: {
      cpl: 352.5,
      taxa_qualificacao: 0.18,
      conversao_mql_cliente: 0.06,
      ciclo_dias: 90,
    },
    premissas_editadas: false,
    resultado: {
      investimento_total: 180000,
      leads_gerados: 510.64,
      mqls: 91.92,
      clientes_fechados: 5.51,
      fator_temporal: 0.75,
      clientes_no_periodo: 4.14,
      clientes_em_pipeline: 1.38,
      receita_no_periodo: 144766,
      receita_em_pipeline: 48255,
      roi_no_periodo: -19.57,
      roi_total: 7.23,
    },
    insight: { principal: 'I-D' as const, override_ie: false },
    consent: { given: true as const, policyVersion: 'v1.0' },
  }

  it('aceita payload Marina completo', () => {
    const r = submissaoSchema.safeParse(base)
    expect(r.success).toBe(true)
  })

  it('token deve ser 32 hex', () => {
    const r = submissaoSchema.safeParse({ ...base, token: 'short' })
    expect(r.success).toBe(false)
  })

  it('exige consent.given = true', () => {
    const r = submissaoSchema.safeParse({
      ...base,
      consent: { given: false as unknown as true, policyVersion: 'v1.0' },
    })
    expect(r.success).toBe(false)
  })
})
