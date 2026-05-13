/**
 * Cloudflare Turnstile — verificação server-side.
 * https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 *
 * Quando `TURNSTILE_SECRET_KEY` está vazio, a verificação retorna `true` (modo dev).
 */

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export interface TurnstileVerifyResult {
  ok: boolean
  /** `bypass-dev` se a key estiver vazia, `disabled` se token vazio mas secret existir. */
  reason?: string
}

export async function verifyTurnstile(token: string | undefined | null, remoteIP?: string): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    return { ok: true, reason: 'bypass-dev' }
  }
  if (!token) {
    return { ok: false, reason: 'token-missing' }
  }

  try {
    const body = new URLSearchParams()
    body.append('secret', secret)
    body.append('response', token)
    if (remoteIP) body.append('remoteip', remoteIP)

    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      body,
    })
    const data = (await res.json()) as { success?: boolean; 'error-codes'?: string[] }
    if (!data.success) {
      return { ok: false, reason: (data['error-codes'] || ['verify-failed']).join(',') }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : 'verify-error' }
  }
}
