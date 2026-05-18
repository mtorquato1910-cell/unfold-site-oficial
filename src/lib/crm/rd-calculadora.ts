/**
 * Adapter RD Station para a Calculadora de Performance v2.
 *
 * Migrado para API legacy `/api/1.3/conversions` (Public Token).
 * Identificador `calculadora_concluida` é o gatilho da automação que cria
 * a negociação no CRM.
 */

import type { InsightId, Setor } from '@/lib/calculadora/types'
import { postRDLegacyConversion } from './rd-legacy-client'
import { mapModelo, mapSetor, mapSimNao, normalizeTelefone } from './rd-mappings'

export interface RDCalculadoraPayload {
  email: string
  nome: string
  empresa: string
  cargo?: string
  telefone?: string

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

function montarCustomFields(p: RDCalculadoraPayload): Record<string, string | number | undefined> {
  return {
    cf_caminho_do_lead: 'Calculadora',
    cf_setor_da_empresa: mapSetor(p.setor),
    cf_calc_tem_crm_funcional: mapSimNao(p.crm_funcional),
    cf_calc_investimento_mensal: p.investimento_mensal,
    cf_calc_ticket_medio: p.ticket_medio,
    cf_calc_modelo_de_negocio: mapModelo(p.modelo),
    cf_calc_periodo_projetado_meses: p.periodo,
    cf_calc_roi_no_periodo: Math.round(p.roi_no_periodo),
    cf_calc_roi_total: Math.round(p.roi_total),
    cf_calc_insight_principal: p.insight_principal,
    cf_calc_url_do_resultado: p.url_resultado,
  }
}

async function syncReal(p: RDCalculadoraPayload): Promise<RDCalcSyncResult> {
  const tags = ['origem_calculadora', `calc_${p.insight_principal.toLowerCase()}`]
  if (p.insight_override_ie) tags.push('calc_pipeline_dominante')

  const r = await postRDLegacyConversion({
    identificador: 'calculadora_concluida',
    email: p.email,
    nome: p.nome,
    empresa: p.empresa,
    cargo: p.cargo,
    celular: normalizeTelefone(p.telefone),
    tags,
    customFields: montarCustomFields(p),
  })

  if (!r.success) {
    throw new Error(r.error || `RD legacy status ${r.status}`)
  }
  return { success: true, mode: 'rd-station' }
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
    custom_fields: montarCustomFields(p),
  })
  return { success: true, mode: 'mock', external_id: `mock-${Date.now()}` }
}

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
