/**
 * Base de Benchmarks v1.0 — Calculadora de Performance.
 *
 * Fonte canônica: docs/calculadora-v2/_benchmarks_raw.txt (extraído de
 * base_benchmarks_calculadora_performance.md.docx).
 * Janela das fontes: 2023-2026.
 *
 * Módulo puro (ADR-1) — sem imports de payload/next/react/fetch.
 * Atualização anual recomendada (próxima revisão: janeiro/2027).
 */

import type {
  Canal,
  Confianca,
  DefaultsPremissas,
  Modelo,
  PremissaComConfianca,
  Setor,
} from './types'

export const BENCHMARKS_VERSAO = 'v1.0'
export const BENCHMARKS_ATUALIZADO_EM = '2026-05'

interface CplPorCanal {
  google: PremissaComConfianca
  meta: PremissaComConfianca
  linkedin: PremissaComConfianca
}

/**
 * CPL R$ por setor × canal (Base de Benchmarks §7.1).
 * Valores são pontos médios da pesquisa.
 */
export const CPL_POR_SETOR_CANAL: Record<Setor, CplPorCanal> = {
  construcao: {
    google: { valor: 250, confianca: 'media' },
    meta: { valor: 175, confianca: 'media' },
    linkedin: { valor: 375, confianca: 'media' },
  },
  agro: {
    google: { valor: 290, confianca: 'baixa' },
    meta: { valor: 200, confianca: 'baixa' },
    linkedin: { valor: 415, confianca: 'baixa' },
  },
  saas: {
    google: { valor: 170, confianca: 'alta' },
    meta: { valor: 140, confianca: 'alta' },
    linkedin: { valor: 350, confianca: 'alta' },
  },
  automotivo: {
    google: { valor: 135, confianca: 'media' },
    meta: { valor: 100, confianca: 'media' },
    linkedin: { valor: 300, confianca: 'media' },
  },
  industria: {
    google: { valor: 140, confianca: 'alta' },
    meta: { valor: 120, confianca: 'alta' },
    linkedin: { valor: 335, confianca: 'alta' },
  },
  servicos_b2b: {
    google: { valor: 110, confianca: 'alta' },
    meta: { valor: 90, confianca: 'alta' },
    linkedin: { valor: 300, confianca: 'alta' },
  },
  outro: {
    google: { valor: 200, confianca: 'media' },
    meta: { valor: 150, confianca: 'media' },
    linkedin: { valor: 350, confianca: 'media' },
  },
}

/**
 * Taxa de qualificação (lead → MQL) por modelo × CRM funcional (Base §7.2).
 * Confiança alta — múltiplas fontes BR + cross-reference internacional.
 */
const TAXAS_QUALIFICACAO_TABLE: Record<Modelo, Record<'sim' | 'nao', PremissaComConfianca>> = {
  b2b: {
    sim: { valor: 0.3, confianca: 'alta' },
    nao: { valor: 0.18, confianca: 'alta' },
  },
  b2c: {
    sim: { valor: 0.5, confianca: 'alta' },
    nao: { valor: 0.35, confianca: 'alta' },
  },
}

/**
 * Conversão MQL → Cliente por modelo × CRM funcional (Base §7.3).
 * Confiança média — fontes divergem mas faixa central é consistente.
 */
const CONVERSOES_MQL_CLIENTE_TABLE: Record<Modelo, Record<'sim' | 'nao', PremissaComConfianca>> = {
  b2b: {
    sim: { valor: 0.12, confianca: 'media' },
    nao: { valor: 0.06, confianca: 'media' },
  },
  b2c: {
    // B2C: 25% independente de CRM segundo spec §5.2 P3.
    sim: { valor: 0.25, confianca: 'alta' },
    nao: { valor: 0.25, confianca: 'alta' },
  },
}

/** Ciclo médio de venda em dias por setor (Base §7.4). */
export const CICLO_POR_SETOR: Record<Setor, PremissaComConfianca> = {
  construcao: { valor: 120, confianca: 'media' },
  agro: { valor: 90, confianca: 'baixa' },
  saas: { valor: 75, confianca: 'alta' },
  automotivo: { valor: 45, confianca: 'media' },
  industria: { valor: 90, confianca: 'alta' },
  servicos_b2b: { valor: 60, confianca: 'alta' },
  outro: { valor: 60, confianca: 'media' },
}

/** B2C usa 14 dias para qualquer setor (Base §7.4). */
const CICLO_B2C: PremissaComConfianca = { valor: 14, confianca: 'alta' }

interface SetorOption {
  value: Setor
  label: string
}

export const SETORES: readonly SetorOption[] = [
  { value: 'construcao', label: 'Construção Civil / Incorporação' },
  { value: 'agro', label: 'Agronegócio / Agroindústria' },
  { value: 'saas', label: 'Tecnologia / SaaS B2B' },
  { value: 'automotivo', label: 'Automotivo / Concessionárias' },
  { value: 'industria', label: 'Indústria' },
  { value: 'servicos_b2b', label: 'Serviços B2B' },
  { value: 'outro', label: 'Outro' },
] as const

interface CanalOption {
  value: Canal
  label: string
}

export const CANAIS: readonly CanalOption[] = [
  { value: 'linkedin', label: 'LinkedIn Ads' },
  { value: 'google', label: 'Google Ads' },
  { value: 'meta', label: 'Meta Ads' },
] as const

/** Ordem de severidade para reduzir a menor confiança numa lista. */
const SEVERIDADE: Record<Confianca, number> = { alta: 3, media: 2, baixa: 1 }

function menorConfianca(items: readonly Confianca[]): Confianca {
  if (items.length === 0) return 'media'
  return items.reduce<Confianca>((acc, c) => (SEVERIDADE[c] < SEVERIDADE[acc] ? c : acc), items[0])
}

/**
 * CPL ponderado: média aritmética dos CPLs dos canais selecionados
 * para o setor (spec §5.2 P1). Confiança = menor confiança entre os canais usados.
 *
 * Retorna `{ valor: 0, confianca: 'baixa' }` se `canais` vazio.
 */
export function cplPonderado(setor: Setor, canais: readonly Canal[]): PremissaComConfianca {
  if (canais.length === 0) return { valor: 0, confianca: 'baixa' }
  const setorRow = CPL_POR_SETOR_CANAL[setor]
  const valores = canais.map((c) => setorRow[c].valor)
  const confiancas = canais.map((c) => setorRow[c].confianca)
  const media = valores.reduce((a, b) => a + b, 0) / valores.length
  return { valor: media, confianca: menorConfianca(confiancas) }
}

/**
 * Defaults completos das 4 premissas para um cenário (setor + modelo + crm + canais).
 *
 * Usado em duas situações:
 * 1. Inicialização do bloco de premissas (Sprint 2).
 * 2. Atualização dinâmica quando CRM muda (§5.3 do spec) — comparar com
 *    o valor atual e só sobrescrever P2/P3 se não foram editadas.
 */
export function calcularDefaults(args: {
  setor: Setor
  modelo: Modelo
  crm_funcional: boolean
  canais: readonly Canal[]
}): DefaultsPremissas {
  const { setor, modelo, crm_funcional, canais } = args
  const crmKey = crm_funcional ? 'sim' : 'nao'
  const ciclo = modelo === 'b2c' ? CICLO_B2C : CICLO_POR_SETOR[setor]
  return {
    cpl: cplPonderado(setor, canais),
    taxa_qualificacao: TAXAS_QUALIFICACAO_TABLE[modelo][crmKey],
    conversao_mql_cliente: CONVERSOES_MQL_CLIENTE_TABLE[modelo][crmKey],
    ciclo_dias: ciclo,
  }
}
