/**
 * Adapter RD Station para o Radar de Comitê de Compra (Mapa de ICP).
 *
 * Espelha `rd-calculadora.ts`: usa a API legacy `/api/1.3/conversions`
 * (Public Token). O identificador `mapa_icp_concluido` é o gatilho da
 * automação que cria/atualiza a negociação no CRM.
 *
 * IMPORTANTE: os custom fields `cf_mapa_*` ainda NÃO existem no painel RD.
 * Em modo `mock` só logamos; em `rd-station` a API legacy simplesmente
 * descarta valores de campos inexistentes — falha graciosamente.
 */

import { postRDLegacyConversion } from './rd-legacy-client'
import { normalizeTelefone } from './rd-mappings'

export interface RDMapaIcpPayload {
  email: string
  nome: string
  empresa: string
  cargo?: string
  telefone?: string

  // Respostas estruturadas
  ticket_range: string
  ciclo: string
  modelo: string
  n_decisores: string
  areas_comite: string[]
  veto_owner: string
  objecao_principal: string[]
  maturidade_icp: string

  // Respostas abertas / qualitativas (consolidadas num campo único no RD)
  vende?: string
  transformacao?: string
  melhores_clientes?: string
  motivos_fechamento?: string[]
  cliente_ruim?: string

  // Resultado interno (scoring)
  fit_score: number
  fit_tier: string

  // Metadados
  result_token: string
  url_resultado: string
}

export interface RDMapaIcpSyncResult {
  success: boolean
  mode: 'rd-station' | 'mock' | 'skipped'
  external_id?: string
  error?: string
}

function modoAtual(): 'rd-station' | 'mock' {
  return process.env.CRM_MODE === 'rd-station' ? 'rd-station' : 'mock'
}

/** Consolida as respostas abertas do Radar num único campo de texto. */
function montarRespostasAbertas(p: RDMapaIcpPayload): string | undefined {
  const linhas: string[] = []
  if (p.vende) linhas.push(`O que vende: ${p.vende}`)
  if (p.transformacao) linhas.push(`Transformação: ${p.transformacao}`)
  if (p.melhores_clientes) linhas.push(`Melhores clientes: ${p.melhores_clientes}`)
  if (p.motivos_fechamento && p.motivos_fechamento.length)
    linhas.push(`Por que fecham: ${p.motivos_fechamento.join(', ')}`)
  if (p.cliente_ruim) linhas.push(`Cliente que não vale: ${p.cliente_ruim}`)
  return linhas.length ? linhas.join('\n') : undefined
}

function montarCustomFields(p: RDMapaIcpPayload): Record<string, string | number | undefined> {
  return {
    cf_caminho_do_lead: 'Radar de Comitê',
    cf_mapa_ticket: p.ticket_range,
    cf_mapa_ciclo: p.ciclo,
    cf_mapa_modelo: p.modelo,
    cf_mapa_n_decisores: p.n_decisores,
    cf_mapa_areas_comite: p.areas_comite.join(', '),
    cf_mapa_veto: p.veto_owner,
    cf_mapa_objecao: p.objecao_principal.join(', '),
    cf_mapa_maturidade: p.maturidade_icp,
    cf_mapa_respostas_abertas: montarRespostasAbertas(p),
    cf_mapa_fit_score: Math.round(p.fit_score),
    cf_mapa_fit_tier: p.fit_tier,
    cf_mapa_url_resultado: p.url_resultado,
  }
}

function montarTags(p: RDMapaIcpPayload): string[] {
  const tags = ['origem_mapa_icp', `fit_${p.fit_tier.replace(/^fit_/, '')}`]
  if (p.n_decisores === '4-6' || p.n_decisores === '7+') tags.push('comite_complexo')
  if (p.modelo) tags.push(`modelo_${p.modelo.toLowerCase()}`)
  if (p.maturidade_icp) tags.push(`maturidade_icp_${p.maturidade_icp}`)
  return tags
}

async function syncReal(p: RDMapaIcpPayload): Promise<RDMapaIcpSyncResult> {
  const r = await postRDLegacyConversion({
    identificador: 'mapa_icp_concluido',
    email: p.email,
    nome: p.nome,
    empresa: p.empresa,
    cargo: p.cargo,
    celular: normalizeTelefone(p.telefone),
    tags: montarTags(p),
    customFields: montarCustomFields(p),
  })

  if (!r.success) {
    throw new Error(r.error || `RD legacy status ${r.status}`)
  }
  return { success: true, mode: 'rd-station' }
}

function syncMock(p: RDMapaIcpPayload): RDMapaIcpSyncResult {
  console.log('[RD Mapa ICP MOCK]', {
    email: p.email,
    empresa: p.empresa,
    fit_tier: p.fit_tier,
    fit_score: p.fit_score,
    tags: montarTags(p),
    custom_fields: montarCustomFields(p),
  })
  return { success: true, mode: 'mock', external_id: `mock-${Date.now()}` }
}

export async function syncMapaIcpToRD(p: RDMapaIcpPayload): Promise<RDMapaIcpSyncResult> {
  const mode = modoAtual()
  try {
    if (mode === 'rd-station') return await syncReal(p)
    return syncMock(p)
  } catch (err) {
    console.error('[RD Mapa ICP] erro:', err)
    return {
      success: false,
      mode,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}
