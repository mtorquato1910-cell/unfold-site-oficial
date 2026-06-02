'use client'

/**
 * Helper client para validar e-mail/WhatsApp via /api/validate-contato (onBlur).
 *
 * Uso típico nos formulários:
 *   const r = await checkContato({ email })          // valida só e-mail
 *   const r = await checkContato({ telefone, requirePhone: true })
 *
 * Best-effort: qualquer erro de rede resolve `{}` (não bloqueia o usuário).
 */

export interface ContatoFieldResult {
  ok: boolean
  message?: string
  normalized?: string
  e164?: string
}

export interface ContatoCheckResponse {
  email?: ContatoFieldResult
  whatsapp?: ContatoFieldResult
}

export interface CheckContatoInput {
  email?: string
  telefone?: string
  requirePhone?: boolean
  mobileOnly?: boolean
  signal?: AbortSignal
}

export async function checkContato(input: CheckContatoInput): Promise<ContatoCheckResponse> {
  try {
    const res = await fetch('/api/validate-contato', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: input.email,
        telefone: input.telefone,
        requirePhone: input.requirePhone,
        mobileOnly: input.mobileOnly,
      }),
      signal: input.signal,
    })
    if (!res.ok) return {}
    return (await res.json()) as ContatoCheckResponse
  } catch {
    return {}
  }
}
