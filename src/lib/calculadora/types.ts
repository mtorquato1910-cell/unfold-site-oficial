/**
 * Tipos compartilhados da Calculadora de Performance v2.
 *
 * Referência: docs/calculadora-v2/SPEC.md §3, §4, §5.
 * Módulo puro (ADR-1): não importa payload, next, react ou fetch.
 */

export type Setor =
  | 'construcao'
  | 'agro'
  | 'saas'
  | 'automotivo'
  | 'industria'
  | 'servicos_b2b'
  | 'outro'

export type Canal = 'google' | 'meta' | 'linkedin'

export type Modelo = 'b2b' | 'b2c'

export type Periodo = 3 | 6 | 12

export type Confianca = 'alta' | 'media' | 'baixa'

export type InsightId = 'I-A' | 'I-B' | 'I-C' | 'I-D'

/** Etapa 1 — qualificação. */
export interface Etapa1 {
  nome: string
  email: string
  empresa: string
  setor: Setor
}

/** Etapa 2 — 6 inputs do lead. */
export interface CalculadoraInputs {
  investimento_mensal: number
  canais: Canal[]
  ticket_medio: number
  modelo: Modelo
  periodo: Periodo
  crm_funcional: boolean
}

/** 4 premissas editáveis (com valor + nível de confiança original). */
export interface PremissaComConfianca {
  valor: number
  confianca: Confianca
}

export interface Premissas {
  cpl: number
  taxa_qualificacao: number // 0..1
  conversao_mql_cliente: number // 0..1
  ciclo_dias: number
}

export interface DefaultsPremissas {
  cpl: PremissaComConfianca
  taxa_qualificacao: PremissaComConfianca
  conversao_mql_cliente: PremissaComConfianca
  ciclo_dias: PremissaComConfianca
}

/** Resultado bruto do motor de cálculo (valores exatos, sem arredondamento). */
export interface Resultado {
  investimento_total: number
  leads_gerados: number
  mqls: number
  clientes_fechados: number
  fator_temporal: number
  clientes_no_periodo: number
  clientes_em_pipeline: number
  receita_no_periodo: number
  receita_em_pipeline: number
  roi_no_periodo: number // percentual (-100 a +∞)
  roi_total: number
}

/** Resultado formatado para exibição (regras §6.2 do spec). */
export interface ResultadoExibicao {
  investimento_total: string
  leads_gerados: string
  mqls: string
  clientes_fechados: string
  clientes_no_periodo: string
  clientes_em_pipeline: string
  receita_no_periodo: string
  receita_em_pipeline: string
  roi_no_periodo: string
  roi_total: string
  fator_temporal_pct: string
}

export interface SelecaoInsight {
  principal: InsightId
  override_ie: boolean
}
