/**
 * Adapter CRM genérico — usado pela Newsletter e pelo hook de Leads (afterChange).
 *
 * 2 modos controlados por `CRM_MODE`:
 *  - `mock`       → grava log no console, retorna sucesso fake
 *  - `rd-station` → POST na API legacy `/api/1.3/conversions` com Public Token
 *
 * Para Newsletter usa identificador `newsletter_inscrito` (gatilho da automação).
 * Para outros contatos genéricos usa `lead_capturado` (sem gatilho específico).
 */

import { postRDLegacyConversion } from './rd-legacy-client'
import { mapSetor, normalizeTelefone, type CaminhoDoLead } from './rd-mappings'

export type CRMMode = 'mock' | 'rd-station'

export interface CRMContact {
  nome?: string
  email: string
  empresa?: string
  cargo?: string
  telefone?: string
  origem?: string
  /** Mapeia direto para o campo `cf_caminho_do_lead` no RD. */
  caminho_do_lead?: CaminhoDoLead
  /** Identificador da conversão no RD (gatilho de automação). */
  identificador?: string
  /** Tags livres adicionais. */
  tags?: string[]
  custom?: Record<string, unknown>
}

export interface CRMResult {
  success: boolean
  mode: CRMMode
  external_id?: string
  error?: string
}

function getMode(): CRMMode {
  return process.env.CRM_MODE === 'rd-station' ? 'rd-station' : 'mock'
}

function inferIdentificador(c: CRMContact): string {
  if (c.identificador) return c.identificador
  if (c.caminho_do_lead === 'Newsletter') return 'newsletter_inscrito'
  if (c.caminho_do_lead === 'Diagnóstico') return 'diagnostico_concluido'
  if (c.caminho_do_lead === 'Calculadora') return 'calculadora_concluida'
  return 'lead_capturado'
}

function montarCustomFields(c: CRMContact): Record<string, string | number | undefined> {
  const cf: Record<string, string | number | undefined> = {}
  if (c.caminho_do_lead) cf.cf_caminho_do_lead = c.caminho_do_lead
  // Setor — só envia se vier em c.custom.setor (Leads usa esse campo)
  const setorRaw = c.custom?.setor as string | undefined
  const setorLabel = mapSetor(setorRaw)
  if (setorLabel) cf.cf_setor_da_empresa = setorLabel
  return cf
}

async function syncToRDStation(contact: CRMContact): Promise<CRMResult> {
  const baseTags = contact.origem ? [`origem_${contact.origem.replace(/[^a-z0-9_]/gi, '_')}`] : []
  const tags = [...baseTags, ...(contact.tags || [])].filter(Boolean)

  const r = await postRDLegacyConversion({
    identificador: inferIdentificador(contact),
    email: contact.email,
    nome: contact.nome,
    empresa: contact.empresa,
    cargo: contact.cargo,
    celular: normalizeTelefone(contact.telefone),
    tags,
    customFields: montarCustomFields(contact),
  })

  if (!r.success) {
    throw new Error(r.error || `RD legacy status ${r.status}`)
  }
  return { success: true, mode: 'rd-station' }
}

function mockSync(contact: CRMContact): CRMResult {
  console.log('[CRM MOCK] Contato sincronizado:', {
    email: contact.email,
    nome: contact.nome,
    empresa: contact.empresa,
    origem: contact.origem,
    caminho_do_lead: contact.caminho_do_lead,
    identificador: inferIdentificador(contact),
    custom_fields: montarCustomFields(contact),
  })
  return { success: true, mode: 'mock', external_id: `mock-${Date.now()}` }
}

export async function syncContact(contact: CRMContact): Promise<CRMResult> {
  const mode = getMode()
  try {
    if (mode === 'rd-station') return await syncToRDStation(contact)
    return mockSync(contact)
  } catch (err) {
    console.error('[CRM Adapter] Erro ao sincronizar:', err)
    return { success: false, mode, error: err instanceof Error ? err.message : String(err) }
  }
}
