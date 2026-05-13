/**
 * Adapter RD Station v2 — sincroniza o resultado completo do Diagnóstico.
 *
 * Diferente do adapter genérico em `lib/crm/adapter.ts` (que sincroniza só dados básicos do lead
 * no afterChange de Leads), este adapter envia os 10 custom fields da spec §10.1 + tag de faixa
 * + estágio do funil "Diagnóstico Concluído".
 *
 * Modo: lê `CRM_MODE`. Se `mock` ou vazio → loga e retorna sucesso fake.
 */

import { createHmac, timingSafeEqual } from 'crypto'

import type { CodigoCaminho, CodigoInsight, FaixaFit, FaixaMaturidade } from '@/lib/scoring/types'

export interface RDDiagnosticoPayload {
  email: string
  nome: string
  empresa?: string
  cargo?: string

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

/**
 * Mapping spec §10.1 → custom fields RD Station.
 * Identificadores `cf_*` precisam ser criados no painel do RD antes do go-live (Sprint 6).
 */
function montarCustomFields(p: RDDiagnosticoPayload): Record<string, unknown> {
  return {
    cf_setor: p.setor,
    cf_faturamento_faixa: p.faturamento_faixa,
    cf_urgencia: p.urgencia,
    cf_score_consolidado: p.score_consolidado,
    cf_faixa_maturidade: p.faixa_consolidada,
    cf_score_fit: p.score_fit,
    cf_fit_faixa: p.faixa_fit,
    cf_padroes_acionados: p.padroes_acionados.join(','),
    cf_url_resultado: p.url_resultado,
    cf_diagnostico_concluido_em: p.concluido_em,
  }
}

async function syncReal(p: RDDiagnosticoPayload): Promise<RDSyncResult> {
  const apiKey = process.env.RD_STATION_API_KEY
  if (!apiKey) {
    throw new Error('RD_STATION_API_KEY ausente — habilite CRM_MODE=mock ou configure a key')
  }

  const customFields = montarCustomFields(p)
  const tag = TAG_POR_FAIXA[p.faixa_fit]

  const res = await fetch('https://api.rd.services/platform/contacts', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: p.email,
      name: p.nome,
      job_title: p.cargo,
      company: p.empresa,
      tags: [tag, 'diagnostico_concluido'],
      custom_fields: customFields,
    }),
  })

  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`RD Station ${res.status}: ${txt.slice(0, 200)}`)
  }

  const data = (await res.json().catch(() => ({}))) as { uuid?: string }
  return { success: true, mode: 'rd-station', external_id: data.uuid }
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

/**
 * Sincroniza o resultado do diagnóstico no RD Station.
 * Com retry exponencial implícito via consumer (não-bloqueante).
 */
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
