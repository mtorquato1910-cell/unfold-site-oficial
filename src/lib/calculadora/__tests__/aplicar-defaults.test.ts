import { describe, expect, it } from 'vitest'
import { aplicarNovosDefaults, premissasFromDefaults } from '../aplicar-defaults'
import { calcularDefaults } from '../benchmarks'
import type { Premissas } from '../types'

/**
 * Regra §5.3 do spec.
 *
 * Quando o lead muda CRM funcional (input 6), modelo, setor ou canais, as
 * premissas devem ser atualizadas para os novos defaults — exceto se o lead
 * já editou aquela premissa manualmente.
 *
 * - Editada == default vigente (tolerância) → atualiza para novo default.
 * - Editada != default vigente → mantém o valor do lead.
 * - Não editada → atualiza.
 */

const defaultsAgroSemCRM = calcularDefaults({
  setor: 'agro',
  modelo: 'b2b',
  crm_funcional: false,
  canais: ['google', 'linkedin'],
})
const defaultsAgroComCRM = calcularDefaults({
  setor: 'agro',
  modelo: 'b2b',
  crm_funcional: true,
  canais: ['google', 'linkedin'],
})

describe('aplicarNovosDefaults — regra §5.3', () => {
  it('nenhuma premissa editada → todas atualizam para o novo default', () => {
    const atual = premissasFromDefaults(defaultsAgroSemCRM)
    const result = aplicarNovosDefaults({
      atual,
      defaultRef: atual,
      editadas: {
        cpl: false,
        taxa_qualificacao: false,
        conversao_mql_cliente: false,
        ciclo_dias: false,
      },
      novos: defaultsAgroComCRM,
    })
    expect(result).toEqual(premissasFromDefaults(defaultsAgroComCRM))
  })

  it('CPL editado manualmente → preservado quando CRM muda', () => {
    const atual: Premissas = {
      cpl: 200, // editado manualmente
      taxa_qualificacao: defaultsAgroSemCRM.taxa_qualificacao.valor,
      conversao_mql_cliente: defaultsAgroSemCRM.conversao_mql_cliente.valor,
      ciclo_dias: defaultsAgroSemCRM.ciclo_dias.valor,
    }
    const result = aplicarNovosDefaults({
      atual,
      defaultRef: premissasFromDefaults(defaultsAgroSemCRM),
      editadas: {
        cpl: true,
        taxa_qualificacao: false,
        conversao_mql_cliente: false,
        ciclo_dias: false,
      },
      novos: defaultsAgroComCRM,
    })
    // CPL editado preserva 200 (igual em sem/com CRM, mas a flag editada importa)
    expect(result.cpl).toBe(200)
    // P2/P3 não editadas → atualizam
    expect(result.taxa_qualificacao).toBeCloseTo(0.3, 6) // novo default com CRM
    expect(result.conversao_mql_cliente).toBeCloseTo(0.12, 6)
  })

  it('Taxa qualificação editada → preservada; conversão NÃO editada → atualiza', () => {
    const atual: Premissas = {
      cpl: defaultsAgroSemCRM.cpl.valor,
      taxa_qualificacao: 0.25, // editado pelo lead
      conversao_mql_cliente: defaultsAgroSemCRM.conversao_mql_cliente.valor,
      ciclo_dias: defaultsAgroSemCRM.ciclo_dias.valor,
    }
    const result = aplicarNovosDefaults({
      atual,
      defaultRef: premissasFromDefaults(defaultsAgroSemCRM),
      editadas: {
        cpl: false,
        taxa_qualificacao: true,
        conversao_mql_cliente: false,
        ciclo_dias: false,
      },
      novos: defaultsAgroComCRM,
    })
    expect(result.taxa_qualificacao).toBeCloseTo(0.25, 6) // preservada
    expect(result.conversao_mql_cliente).toBeCloseTo(0.12, 6) // atualizada
  })

  it('editada MAS valor == default vigente (tolerância) → atualiza mesmo assim', () => {
    // Cenário: lead "editou" mas digitou exatamente o mesmo valor → trata como não editado
    const atual: Premissas = {
      cpl: defaultsAgroSemCRM.cpl.valor, // mesmo valor que o default vigente
      taxa_qualificacao: defaultsAgroSemCRM.taxa_qualificacao.valor,
      conversao_mql_cliente: defaultsAgroSemCRM.conversao_mql_cliente.valor,
      ciclo_dias: defaultsAgroSemCRM.ciclo_dias.valor,
    }
    const result = aplicarNovosDefaults({
      atual,
      defaultRef: premissasFromDefaults(defaultsAgroSemCRM),
      editadas: {
        cpl: true, // flag editada mas valor não mudou
        taxa_qualificacao: false,
        conversao_mql_cliente: false,
        ciclo_dias: false,
      },
      novos: defaultsAgroComCRM,
    })
    // CPL é igual em ambos cenários (canais não mudaram); efectivamente vai pro novo default
    expect(result.cpl).toBe(defaultsAgroComCRM.cpl.valor)
  })

  it('cenário Marina (§11.6): toggle CRM Sim→Não com tudo no default atualiza P2/P3', () => {
    const inicial = premissasFromDefaults(defaultsAgroSemCRM)
    const apósToggle = aplicarNovosDefaults({
      atual: inicial,
      defaultRef: inicial,
      editadas: {
        cpl: false,
        taxa_qualificacao: false,
        conversao_mql_cliente: false,
        ciclo_dias: false,
      },
      novos: defaultsAgroComCRM,
    })
    expect(apósToggle.taxa_qualificacao).toBeCloseTo(0.3, 6) // P2 atualiza
    expect(apósToggle.conversao_mql_cliente).toBeCloseTo(0.12, 6) // P3 atualiza
    expect(apósToggle.cpl).toBe(defaultsAgroComCRM.cpl.valor) // P1 também (canais mantidos, mas tabela aceita)
    expect(apósToggle.ciclo_dias).toBe(defaultsAgroComCRM.ciclo_dias.valor) // P4 — agro sempre 90
  })

  it('tolerância de comparação aceita float drift', () => {
    // Valores marcados como "editados" mas que estão dentro da tolerância do default
    // (drift por arredondamento de UI). Devem ser tratados como "ainda no default" e
    // portanto atualizados ao novo default.
    const ref = premissasFromDefaults(defaultsAgroSemCRM)
    const atual: Premissas = {
      cpl: ref.cpl + 0.4, // dentro da tolerância 1 (R$)
      taxa_qualificacao: ref.taxa_qualificacao + 1e-9, // dentro de 1e-6
      conversao_mql_cliente: ref.conversao_mql_cliente,
      ciclo_dias: ref.ciclo_dias + 0.3, // dentro de 0.5
    }
    const result = aplicarNovosDefaults({
      atual,
      defaultRef: ref,
      editadas: {
        cpl: true,
        taxa_qualificacao: true,
        conversao_mql_cliente: false,
        ciclo_dias: true,
      },
      novos: defaultsAgroComCRM,
    })
    // Todas tratadas como "no default" → atualizam
    expect(result.cpl).toBe(defaultsAgroComCRM.cpl.valor)
    expect(result.taxa_qualificacao).toBeCloseTo(0.3, 6)
    expect(result.ciclo_dias).toBe(defaultsAgroComCRM.ciclo_dias.valor)
  })
})
