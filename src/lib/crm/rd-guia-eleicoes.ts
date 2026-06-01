/**
 * Adapter RD Station para o hotsite "Guia Eleições 2026".
 *
 * Usa a API legacy `/api/1.3/conversions` (Public Token) — mesma do Diagnóstico e
 * Calculadora (plano Basic). O identificador `guia-eleicoes-2026` é o gatilho da
 * automação que cria a negociação no CRM (RF-21/RF-23 — Nota A do plano: legacy no
 * lugar do fluxo OAuth+Deals do PRD, decisão fechada).
 */

import { postRDLegacyConversion } from './rd-legacy-client'
import { mapPerfilEleitoral, normalizeTelefone } from './rd-mappings'
import type { PerfilEleitoral } from '@/app/guia-eleicoes-2026/_lib/perfil'

/** Tag derivada do perfil (RF-22). */
const TAG_POR_PERFIL: Record<PerfilEleitoral, string> = {
  candidato: 'perfil-candidato',
  'equipe-campanha': 'perfil-equipe-campanha',
  setor: 'perfil-setor',
  outro: 'perfil-outro',
}

/** Identificador canônico (DEC-2). Configurável p/ alinhar com o painel sem deploy. */
const CONVERSION_ID = process.env.RD_GUIA_CONVERSION_ID || 'guia-eleicoes-2026'

export interface RDGuiaPayload {
  nome: string
  email: string
  telefone?: string
  perfil: PerfilEleitoral

  // Origem / UTM (RF-21/RF-40)
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  referrer?: string
  data_cadastro: string // ISO
}

export interface RDGuiaSyncResult {
  success: boolean
  mode: 'rd-station' | 'mock'
  error?: string
}

function modoAtual(): 'rd-station' | 'mock' {
  return process.env.CRM_MODE === 'rd-station' ? 'rd-station' : 'mock'
}

function montarCustomFields(p: RDGuiaPayload): Record<string, string | number | undefined> {
  return {
    cf_caminho_do_lead: 'Guia Eleições 2026',
    cf_perfil_eleitoral_2026: mapPerfilEleitoral(p.perfil),
    cf_origem_hotsite: 'guia-eleicoes-2026',
    cf_utm_source: p.utm_source,
    cf_utm_medium: p.utm_medium,
    cf_utm_campaign: p.utm_campaign,
    cf_utm_content: p.utm_content,
    cf_utm_term: p.utm_term,
    cf_lead_referrer: p.referrer,
    cf_lead_data_cadastro: p.data_cadastro,
  }
}

function montarTags(p: RDGuiaPayload): string[] {
  return ['guia-eleicoes-2026', TAG_POR_PERFIL[p.perfil]]
}

async function syncReal(p: RDGuiaPayload): Promise<RDGuiaSyncResult> {
  const r = await postRDLegacyConversion({
    identificador: CONVERSION_ID,
    email: p.email,
    nome: p.nome,
    celular: normalizeTelefone(p.telefone),
    tags: montarTags(p),
    customFields: montarCustomFields(p),
  })
  if (!r.success) {
    throw new Error(r.error || `RD legacy status ${r.status}`)
  }
  return { success: true, mode: 'rd-station' }
}

function syncMock(p: RDGuiaPayload): RDGuiaSyncResult {
  console.log('[RD Guia MOCK]', {
    identificador: CONVERSION_ID,
    email: p.email,
    perfil: p.perfil,
    tags: montarTags(p),
    custom_fields: montarCustomFields(p),
  })
  return { success: true, mode: 'mock' }
}

export async function syncGuiaToRD(p: RDGuiaPayload): Promise<RDGuiaSyncResult> {
  const mode = modoAtual()
  try {
    if (mode === 'rd-station') return await syncReal(p)
    return syncMock(p)
  } catch (err) {
    console.error('[RD Guia] erro:', err)
    return {
      success: false,
      mode,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}
