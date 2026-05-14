/**
 * Motor de cálculo da Calculadora de Performance v2.
 *
 * Implementa as 5 fórmulas do spec §6.1 com valores exatos internamente.
 * Arredondamento aplicado apenas em `formatarExibicao()` conforme §6.2.
 *
 * Módulo puro (ADR-1) — sem imports externos além de ./types.
 */

import type { CalculadoraInputs, Premissas, Resultado, ResultadoExibicao } from './types'

/**
 * Roda os 5 passos do spec §6.1 e devolve o resultado bruto (não arredondado).
 *
 * Caso de borda: investimento_total = 0 ⇒ ROI seria divisão por zero.
 * Política: retorna ROI = 0 (e leads_gerados = 0 se CPL = 0 também).
 */
export function calcular(inputs: CalculadoraInputs, premissas: Premissas): Resultado {
  const investimento_total = inputs.investimento_mensal * inputs.periodo
  const leads_gerados = premissas.cpl > 0 ? investimento_total / premissas.cpl : 0
  const mqls = leads_gerados * premissas.taxa_qualificacao
  const clientes_fechados = mqls * premissas.conversao_mql_cliente

  const periodo_dias = inputs.periodo * 30
  const fator_temporal = Math.max(0, (periodo_dias - premissas.ciclo_dias) / periodo_dias)

  const clientes_no_periodo = clientes_fechados * fator_temporal
  const clientes_em_pipeline = clientes_fechados * (1 - fator_temporal)

  const receita_no_periodo = clientes_no_periodo * inputs.ticket_medio
  const receita_em_pipeline = clientes_em_pipeline * inputs.ticket_medio

  const roi_no_periodo =
    investimento_total > 0
      ? ((receita_no_periodo - investimento_total) / investimento_total) * 100
      : 0

  const roi_total =
    investimento_total > 0
      ? ((receita_no_periodo + receita_em_pipeline - investimento_total) / investimento_total) * 100
      : 0

  return {
    investimento_total,
    leads_gerados,
    mqls,
    clientes_fechados,
    fator_temporal,
    clientes_no_periodo,
    clientes_em_pipeline,
    receita_no_periodo,
    receita_em_pipeline,
    roi_no_periodo,
    roi_total,
  }
}

const fmtBRL = (n: number): string =>
  n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })

/**
 * Sinaliza inteiros aproximados com prefixo "~" quando vêm de um decimal
 * com parte fracionária ≥ 0,01 (regra §6.2 do spec).
 */
function inteiroArredondado(n: number): string {
  const arr = Math.round(n)
  const fracionario = Math.abs(n - arr) >= 0.005 && Math.abs(n - Math.trunc(n)) >= 0.005
  return fracionario ? `~${arr.toLocaleString('pt-BR')}` : arr.toLocaleString('pt-BR')
}

/**
 * Versão "limpa" — sem o prefixo "~" — para leads/MQLs (spec sempre arredonda inteiro).
 */
function inteiroSimples(n: number): string {
  return Math.round(n).toLocaleString('pt-BR')
}

function roiFmt(n: number): string {
  const sinal = n >= 0 ? '+' : ''
  return `${sinal}${Math.round(n)}%`
}

/**
 * Aplica as regras de exibição §6.2 do spec sobre o resultado bruto.
 */
export function formatarExibicao(r: Resultado): ResultadoExibicao {
  return {
    investimento_total: fmtBRL(r.investimento_total),
    leads_gerados: inteiroSimples(r.leads_gerados),
    mqls: inteiroSimples(r.mqls),
    clientes_fechados: inteiroArredondado(r.clientes_fechados),
    clientes_no_periodo: inteiroArredondado(r.clientes_no_periodo),
    clientes_em_pipeline: inteiroArredondado(r.clientes_em_pipeline),
    receita_no_periodo: fmtBRL(r.receita_no_periodo),
    receita_em_pipeline: fmtBRL(r.receita_em_pipeline),
    roi_no_periodo: roiFmt(r.roi_no_periodo),
    roi_total: roiFmt(r.roi_total),
    fator_temporal_pct: `${Math.round(r.fator_temporal * 100)}%`,
  }
}
