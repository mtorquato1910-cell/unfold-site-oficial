/**
 * Adapter CRM com 2 modos:
 * - mock: grava no Payload com rd_sync_status='mock', loga no console
 * - rd-station: integração real via API RD Station CRM Pro (quando credenciais chegarem)
 *
 * Controlado por CRM_MODE env var (default: mock)
 */

export type CRMMode = 'mock' | 'rd-station'

export interface CRMContact {
  nome: string
  email: string
  empresa?: string
  cargo?: string
  telefone?: string
  origem?: string
  custom?: Record<string, unknown>
}

export interface CRMResult {
  success: boolean
  mode: CRMMode
  external_id?: string
  error?: string
}

function getMode(): CRMMode {
  return (process.env.CRM_MODE as CRMMode) === 'rd-station' ? 'rd-station' : 'mock'
}

async function syncToRDStation(contact: CRMContact): Promise<CRMResult> {
  const apiKey = process.env.RD_STATION_API_KEY
  if (!apiKey) throw new Error('RD_STATION_API_KEY não configurada')

  const res = await fetch('https://api.rd.services/platform/contacts', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: contact.email,
      name: contact.nome,
      job_title: contact.cargo,
      company: contact.empresa,
      tags: [contact.origem || 'site'].filter(Boolean),
      custom_fields: contact.custom,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`RD Station error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return { success: true, mode: 'rd-station', external_id: data.uuid }
}

function mockSync(contact: CRMContact): CRMResult {
  console.log('[CRM MOCK] Contato sincronizado:', {
    email: contact.email,
    nome: contact.nome,
    empresa: contact.empresa,
    origem: contact.origem,
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
