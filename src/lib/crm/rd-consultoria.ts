/**
 * Adapter RD Station para o formulário de Consultoria do hotsite "Guia Eleições 2026".
 *
 * Reaproveita a API legacy `/api/1.3/conversions` (mesma do guia/diagnóstico/calculadora).
 * Usa o mesmo identificador de conversão do guia (entra na automação que cria a
 * negociação no CRM), porém com a tag `consultoria-2026` para diferenciar a origem
 * "solicitou consultoria" das capturas de download do PDF.
 */

import { postRDLegacyConversion } from './rd-legacy-client'
import { normalizeTelefone } from './rd-mappings'

const CONVERSION_ID =
  process.env.RD_CONSULTORIA_CONVERSION_ID ||
  process.env.RD_GUIA_CONVERSION_ID ||
  'guia-eleicoes-2026'

export interface RDConsultoriaPayload {
  nome: string
  email: string
  telefone?: string
  organizacao?: string
  mensagem?: string
  // Origem / UTM
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  referrer?: string
  data_cadastro: string // ISO
}

export interface RDConsultoriaSyncResult {
  success: boolean
  mode: 'rd-station' | 'mock'
  error?: string
}

function modoAtual(): 'rd-station' | 'mock' {
  return process.env.CRM_MODE === 'rd-station' ? 'rd-station' : 'mock'
}

function montarCustomFields(p: RDConsultoriaPayload): Record<string, string | undefined> {
  return {
    cf_caminho_do_lead: 'Consultoria — Guia Eleições 2026',
    cf_origem_hotsite: 'guia-eleicoes-2026',
    cf_mensagem_consultoria: p.mensagem,
    cf_utm_source: p.utm_source,
    cf_utm_medium: p.utm_medium,
    cf_utm_campaign: p.utm_campaign,
    cf_utm_content: p.utm_content,
    cf_utm_term: p.utm_term,
    cf_lead_referrer: p.referrer,
    cf_lead_data_cadastro: p.data_cadastro,
  }
}

const TAGS = ['guia-eleicoes-2026', 'consultoria-2026']

async function syncReal(p: RDConsultoriaPayload): Promise<RDConsultoriaSyncResult> {
  const r = await postRDLegacyConversion({
    identificador: CONVERSION_ID,
    email: p.email,
    nome: p.nome,
    empresa: p.organizacao,
    celular: normalizeTelefone(p.telefone),
    tags: TAGS,
    customFields: montarCustomFields(p),
  })
  if (!r.success) throw new Error(r.error || `RD legacy status ${r.status}`)
  return { success: true, mode: 'rd-station' }
}

function syncMock(p: RDConsultoriaPayload): RDConsultoriaSyncResult {
  console.log('[RD Consultoria MOCK]', {
    identificador: CONVERSION_ID,
    email: p.email,
    tags: TAGS,
    custom_fields: montarCustomFields(p),
  })
  return { success: true, mode: 'mock' }
}

export async function syncConsultoriaToRD(
  p: RDConsultoriaPayload,
): Promise<RDConsultoriaSyncResult> {
  const mode = modoAtual()
  try {
    if (mode === 'rd-station') return await syncReal(p)
    return syncMock(p)
  } catch (err) {
    console.error('[RD Consultoria] erro:', err)
    return { success: false, mode, error: err instanceof Error ? err.message : String(err) }
  }
}
