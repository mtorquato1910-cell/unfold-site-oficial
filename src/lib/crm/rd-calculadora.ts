/**
 * Adapter RD Station para a Calculadora de Performance v2.
 *
 * Espelha o pattern de `rd-station.ts` (Diagnóstico).
 *
 * Feature flag `RD_CALC_CUSTOM_FIELDS_READY` (ADR / validação @architect):
 *   - false (default) → não tenta sincronizar custom fields, marca rd_sync_status='skipped'.
 *   - true            → envia custom fields. Antes disso, Matheus precisa criar os 7
 *                       custom fields no RD (ver docs/calculadora-v2/setup-pendente-calculadora.md).
 */

import type { InsightId, Setor } from '@/lib/calculadora/types'

export interface RDCalculadoraPayload {
  email: string
  nome: string
  empresa: string
  cargo?: string

  // Etapa 1
  setor: Setor

  // Etapa 2 / contexto
  crm_funcional: boolean
  investimento_mensal: number
  ticket_medio: number
  modelo: 'b2b' | 'b2c'
  periodo: 3 | 6 | 12

  // Resultado
  roi_no_periodo: number
  roi_total: number
  insight_principal: InsightId
  insight_override_ie: boolean

  // Metadados
  result_token: string
  url_resultado: string
}

export interface RDCalcSyncResult {
  success: boolean
  mode: 'rd-station' | 'mock' | 'skipped'
  external_id?: string
  error?: string
}

function modoAtual(): 'rd-station' | 'mock' {
  return process.env.CRM_MODE === 'rd-station' ? 'rd-station' : 'mock'
}

function customFieldsHabilitados(): boolean {
  return process.env.RD_CALC_CUSTOM_FIELDS_READY === 'true'
}

/**
 * Mapping spec §10.1 (Calculadora) → custom fields RD.
 * Identificadores `cf_calc_*` precisam ser criados no painel RD antes do go-live (S4.0).
 */
function montarCustomFields(p: RDCalculadoraPayload): Record<string, unknown> {
  return {
    cf_calc_setor: p.setor,
    cf_calc_crm_funcional: p.crm_funcional ? 'sim' : 'nao',
    cf_calc_investimento_mensal: p.investimento_mensal,
    cf_calc_ticket_medio: p.ticket_medio,
    cf_calc_modelo: p.modelo,
    cf_calc_periodo_meses: p.periodo,
    cf_calc_roi_periodo: Math.round(p.roi_no_periodo),
    cf_calc_roi_total: Math.round(p.roi_total),
    cf_calc_insight: p.insight_principal,
    cf_calc_url_resultado: p.url_resultado,
  }
}

async function syncReal(p: RDCalculadoraPayload): Promise<RDCalcSyncResult> {
  const apiKey = process.env.RD_STATION_API_KEY
  if (!apiKey) {
    throw new Error('RD_STATION_API_KEY ausente — habilite CRM_MODE=mock ou configure a key')
  }
  const enviarCustomFields = customFieldsHabilitados()
  const tags = ['origem_calculadora', `calc_${p.insight_principal.toLowerCase()}`]
  if (p.insight_override_ie) tags.push('calc_pipeline_dominante')

  const body: Record<string, unknown> = {
    email: p.email,
    name: p.nome,
    job_title: p.cargo,
    company: p.empresa,
    tags,
  }
  if (enviarCustomFields) body.custom_fields = montarCustomFields(p)

  const res = await fetch('https://api.rd.services/platform/contacts', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`RD Station ${res.status}: ${txt.slice(0, 200)}`)
  }
  const data = (await res.json().catch(() => ({}))) as { uuid?: string }
  return { success: true, mode: 'rd-station', external_id: data.uuid }
}

function syncMock(p: RDCalculadoraPayload): RDCalcSyncResult {
  console.log('[RD Calculadora MOCK]', {
    email: p.email,
    setor: p.setor,
    insight: p.insight_principal,
    roi_periodo: p.roi_no_periodo,
    tags: [
      'origem_calculadora',
      `calc_${p.insight_principal.toLowerCase()}`,
      ...(p.insight_override_ie ? ['calc_pipeline_dominante'] : []),
    ],
    custom_fields: customFieldsHabilitados() ? montarCustomFields(p) : '(skipped)',
  })
  return { success: true, mode: 'mock', external_id: `mock-${Date.now()}` }
}

/**
 * Sincroniza o resultado da Calculadora no RD.
 * Best-effort — falha não propaga (não bloqueia API POST /api/calculadora).
 */
export async function syncCalculadoraToRD(p: RDCalculadoraPayload): Promise<RDCalcSyncResult> {
  const mode = modoAtual()
  try {
    if (mode === 'rd-station') return await syncReal(p)
    return syncMock(p)
  } catch (err) {
    console.error('[RD Calculadora] erro:', err)
    return {
      success: false,
      mode,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}
