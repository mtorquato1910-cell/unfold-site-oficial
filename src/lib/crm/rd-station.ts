/**
 * Adapter RD Station — sincroniza o resultado completo do Diagnóstico.
 *
 * Migrado para a API legacy `/api/1.3/conversions` (Public Token), única acessível
 * no plano Basic do cliente. Identificador `diagnostico_concluido` serve de gatilho
 * para a automação que cria a negociação no CRM.
 *
 * Modo: lê `CRM_MODE`. Se `mock` ou vazio → loga e retorna sucesso fake.
 */

import { createHmac, timingSafeEqual } from 'crypto'

import type { CodigoCaminho, CodigoInsight, FaixaFit, FaixaMaturidade } from '@/lib/scoring/types'
import { postRDLegacyConversion } from './rd-legacy-client'
import {
  mapFaixaFit,
  mapFaixaMaturidade,
  mapFaturamento,
  mapSetor,
  mapUrgencia,
  normalizeTelefone,
} from './rd-mappings'

export interface RDDiagnosticoPayload {
  email: string
  nome: string
  empresa?: string
  cargo?: string
  telefone?: string

  // Etapa 1
  setor?: string
  faturamento_faixa?: string
  urgencia?: string

  // Scores
  score_consolidado: number
  faixa_consolidada: FaixaMaturidade
  score_fit: number
  faixa_fit: FaixaFit

  // Camada 3
  padroes_acionados: string[]
  padroes_exibidos: CodigoInsight[]
  caminhos_exibidos: CodigoCaminho[]

  // Respostas completas consolidadas (Etapa 1 + Q1–Q12) — campo único no RD.
  respostas_consolidadas?: string

  // Metadados
  url_resultado: string
  concluido_em: string // ISO timestamp
}

export interface RDSyncResult {
  success: boolean
  mode: 'rd-station' | 'mock'
  external_id?: string
  error?: string
}

const TAG_POR_FAIXA: Record<FaixaFit, string> = {
  'fit-alto': 'fit_alto',
  'fit-medio': 'fit_medio',
  'fit-baixo': 'fit_baixo',
  desfit: 'desfit',
}

function modoAtual(): 'rd-station' | 'mock' {
  return process.env.CRM_MODE === 'rd-station' ? 'rd-station' : 'mock'
}

function montarCustomFields(p: RDDiagnosticoPayload): Record<string, string | number | undefined> {
  const setorLabel = mapSetor(p.setor)
  const faturamentoLabel = mapFaturamento(p.faturamento_faixa)
  const urgenciaLabel = mapUrgencia(p.urgencia)
  const fitLabel = mapFaixaFit(p.faixa_fit)
  const maturidadeLabel = mapFaixaMaturidade(p.faixa_consolidada)

  return {
    cf_caminho_do_lead: 'Diagnóstico',
    cf_setor_da_empresa: setorLabel,
    cf_faturamento_mensal: faturamentoLabel,
    cf_urgencia: urgenciaLabel,
    cf_score_de_maturidade: p.score_consolidado,
    cf_faixa_de_maturidade: maturidadeLabel,
    cf_score_de_fit: p.score_fit,
    cf_faixa_de_fit: fitLabel,
    cf_padroes_acionados: p.padroes_acionados.join(', '),
    cf_respostas_diagnostico: p.respostas_consolidadas || undefined,
    cf_url_do_resultado_diagnostico: p.url_resultado,
    cf_diagnostico_concluido_em: p.concluido_em,
  }
}

async function syncReal(p: RDDiagnosticoPayload): Promise<RDSyncResult> {
  const tag = TAG_POR_FAIXA[p.faixa_fit]

  const r = await postRDLegacyConversion({
    identificador: 'diagnostico_concluido',
    email: p.email,
    nome: p.nome,
    empresa: p.empresa,
    cargo: p.cargo,
    celular: normalizeTelefone(p.telefone),
    tags: [tag, 'diagnostico_concluido'],
    customFields: montarCustomFields(p),
  })

  if (!r.success) {
    throw new Error(r.error || `RD legacy status ${r.status}`)
  }
  return { success: true, mode: 'rd-station' }
}

function syncMock(p: RDDiagnosticoPayload): RDSyncResult {
  console.log('[RD Diagnóstico MOCK]', {
    email: p.email,
    faixa_fit: p.faixa_fit,
    score: p.score_consolidado,
    tags: [TAG_POR_FAIXA[p.faixa_fit], 'diagnostico_concluido'],
    custom_fields: montarCustomFields(p),
  })
  return { success: true, mode: 'mock', external_id: `mock-${Date.now()}` }
}

export async function syncDiagnosticoToRD(p: RDDiagnosticoPayload): Promise<RDSyncResult> {
  const mode = modoAtual()
  try {
    if (mode === 'rd-station') return await syncReal(p)
    return syncMock(p)
  } catch (err) {
    console.error('[RD Diagnóstico] erro:', err)
    return {
      success: false,
      mode,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

/**
 * Valida HMAC SHA256 do webhook RD Station.
 * RD envia header `X-RD-Signature` (formato hex).
 */
export function validateRDSignature(
  rawBody: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature || !secret) return false
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  try {
    return timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}
