/**
 * Cliente HTTP unificado para a API legacy do RD Marketing
 * (`POST https://www.rdstation.com.br/api/1.3/conversions`).
 *
 * Por que legacy: o plano Basic do cliente não libera OAuth/`/platform/contacts`,
 * mas o token público desta API funciona perfeitamente para conversões + custom fields.
 *
 * Cada chamada cria/atualiza um contato e dispara um evento de conversão
 * (identificado por `identificador`) que serve de gatilho para automações
 * no painel RD → criação automática de negociação no CRM.
 */

const LEGACY_ENDPOINT = 'https://www.rdstation.com.br/api/1.3/conversions'

export interface RDLegacyConversionInput {
  /** Identificador único do evento de conversão (gatilho de automação). */
  identificador: string
  email: string
  nome?: string
  empresa?: string
  cargo?: string
  /** Celular (somente dígitos). */
  celular?: string
  telefone?: string
  /** Tags livres aplicadas ao contato. */
  tags?: string[]
  /** Campos personalizados pré-cadastrados no painel (chaves `cf_*`). */
  customFields?: Record<string, string | number | undefined>
}

export interface RDLegacyConversionResult {
  success: boolean
  status: number
  error?: string
  /** Body bruto retornado (útil pra debug). */
  raw?: string
}

/**
 * Envia uma conversão para o RD Marketing pela API legacy.
 *
 * Requer `RD_STATION_PUBLIC_TOKEN` configurado. Falha silenciosa (retorna
 * `success: false`) — o caller decide se loga ou propaga.
 */
export async function postRDLegacyConversion(
  input: RDLegacyConversionInput,
): Promise<RDLegacyConversionResult> {
  const token = process.env.RD_STATION_PUBLIC_TOKEN
  if (!token) {
    return { success: false, status: 0, error: 'RD_STATION_PUBLIC_TOKEN ausente' }
  }

  // Remove chaves com valor undefined/null dos custom fields antes de serializar
  const cfClean: Record<string, string | number> = {}
  if (input.customFields) {
    for (const [k, v] of Object.entries(input.customFields)) {
      if (v !== undefined && v !== null && v !== '') {
        cfClean[k] = v
      }
    }
  }

  const body: Record<string, unknown> = {
    token_rdstation: token,
    identificador: input.identificador,
    email: input.email,
    ...(input.nome ? { nome: input.nome } : {}),
    ...(input.empresa ? { empresa: input.empresa } : {}),
    ...(input.cargo ? { cargo: input.cargo } : {}),
    ...(input.celular ? { celular: input.celular } : {}),
    ...(input.telefone ? { telefone: input.telefone } : {}),
    ...(input.tags && input.tags.length > 0 ? { tags: input.tags } : {}),
    ...cfClean,
  }

  try {
    const res = await fetch(LEGACY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const raw = await res.text().catch(() => '')
    if (!res.ok) {
      return {
        success: false,
        status: res.status,
        error: `RD legacy ${res.status}: ${raw.slice(0, 200)}`,
        raw,
      }
    }
    return { success: true, status: res.status, raw }
  } catch (err) {
    return {
      success: false,
      status: 0,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}
