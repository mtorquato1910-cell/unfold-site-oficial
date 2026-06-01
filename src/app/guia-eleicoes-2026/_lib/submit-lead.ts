/**
 * Ponto único de integração do cadastro do guia → POST /api/guia-eleicoes/lead
 * (RD legacy + fallback + captura de UTM). Anexa a origem capturada (RF-40) e
 * calcula o hash do e-mail para a sessão local (RF-33/RF-35).
 */
import type { PerfilEleitoral } from './perfil'
import { getStoredOrigin } from './origin'
import { sha256Truncate8 } from './hash'

export interface SubmitLeadPayload {
  nome: string
  email: string
  telefone: string // só dígitos
  perfil: PerfilEleitoral
  turnstileToken: string
}

export interface SubmitLeadResult {
  ok: boolean
  leadId?: string
  emailHash?: string
  error?: string
}

export async function submitGuiaLead(payload: SubmitLeadPayload): Promise<SubmitLeadResult> {
  const origin = getStoredOrigin() || {}
  try {
    const res = await fetch('/api/guia-eleicoes/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: payload.nome,
        email: payload.email,
        telefone: payload.telefone,
        perfil: payload.perfil,
        turnstileToken: payload.turnstileToken,
        origin: {
          utm_source: origin.utm_source,
          utm_medium: origin.utm_medium,
          utm_campaign: origin.utm_campaign,
          utm_content: origin.utm_content,
          utm_term: origin.utm_term,
          referrer: origin.referrer,
        },
      }),
    })
    if (!res.ok) {
      return { ok: false, error: `status ${res.status}` }
    }
    const json = (await res.json()) as { ok: boolean; lead_id?: string }
    const emailHash = await sha256Truncate8(payload.email)
    return { ok: json.ok, leadId: json.lead_id, emailHash }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}
