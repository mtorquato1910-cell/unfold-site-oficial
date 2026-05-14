/**
 * Lógica §5.3 do spec — Atualização dinâmica de defaults.
 *
 * Quando inputs base mudam (CRM, modelo, setor, canais), as premissas precisam
 * receber novos defaults SE o lead ainda não editou aquela premissa
 * manualmente. Se editou, o valor do lead é preservado.
 *
 * Extraído do hook `useCalculadora` para Fix 6 (auditoria @qa) — permite
 * teste isolado sem montar React + sessionStorage.
 *
 * Módulo puro (ADR-1).
 */

import type { DefaultsPremissas, Premissas } from './types'

export interface PremissasEditadasFlags {
  cpl: boolean
  taxa_qualificacao: boolean
  conversao_mql_cliente: boolean
  ciclo_dias: boolean
}

const TOLERANCIA = {
  cpl: 1,
  taxa_qualificacao: 1e-6,
  conversao_mql_cliente: 1e-6,
  ciclo_dias: 0.5,
} as const

/**
 * Aplica novos defaults a P2/P3/P4 (e P1 quando canais mudam):
 * - se premissa NÃO foi marcada como editada, ou o valor atual == default vigente, atualiza.
 * - se editada e diferente do default vigente, mantém o valor do lead.
 */
export function aplicarNovosDefaults(args: {
  atual: Premissas
  defaultRef: Premissas
  editadas: PremissasEditadasFlags
  novos: DefaultsPremissas
}): Premissas {
  const { atual, defaultRef, editadas, novos } = args
  const aplicar = <K extends keyof Premissas>(k: K, valorNovo: number): number => {
    if (!editadas[k]) return valorNovo
    if (Math.abs(atual[k] - defaultRef[k]) <= TOLERANCIA[k]) return valorNovo
    return atual[k]
  }
  return {
    cpl: aplicar('cpl', novos.cpl.valor),
    taxa_qualificacao: aplicar('taxa_qualificacao', novos.taxa_qualificacao.valor),
    conversao_mql_cliente: aplicar(
      'conversao_mql_cliente',
      novos.conversao_mql_cliente.valor,
    ),
    ciclo_dias: aplicar('ciclo_dias', novos.ciclo_dias.valor),
  }
}

/** Retorna `Premissas` a partir de `DefaultsPremissas` (drop confiança). */
export function premissasFromDefaults(d: DefaultsPremissas): Premissas {
  return {
    cpl: d.cpl.valor,
    taxa_qualificacao: d.taxa_qualificacao.valor,
    conversao_mql_cliente: d.conversao_mql_cliente.valor,
    ciclo_dias: d.ciclo_dias.valor,
  }
}
