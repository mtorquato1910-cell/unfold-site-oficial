/**
 * Adapter Calendly — Sprint 4.
 *
 * Modo placeholder (default): retorna `null` para URLs vazias → CTAAgendamento exibe placeholder.
 * Modo real: URLs vêm do SiteSettings (Payload global). Webhook valida HMAC SHA256.
 */

import { createHmac, timingSafeEqual } from 'crypto'

import type { FaixaFit } from '@/lib/scoring/types'

export interface CalendlyURLs {
  fit_alto?: string
  fit_medio?: string
  fit_baixo_desfit?: string
}

/**
 * Resolve a URL Calendly correta para uma faixa de Fit.
 *
 * Precedência:
 *   1. URL específica da faixa configurada no SiteSettings.
 *   2. Fallback global via `NEXT_PUBLIC_CALENDLY_URL` (URL única).
 *   3. `undefined` (CTAAgendamento mostra placeholder).
 *
 * O fallback permite o site funcionar com uma única URL enquanto o Gabriel não
 * cria slots específicos por faixa no Calendly.
 */
export function resolveCalendlyURL(urls: CalendlyURLs, faixa: FaixaFit): string | undefined {
  const fallback = process.env.NEXT_PUBLIC_CALENDLY_URL || undefined
  if (faixa === 'fit-alto') return urls.fit_alto || fallback
  if (faixa === 'fit-medio') return urls.fit_medio || fallback
  return urls.fit_baixo_desfit || fallback
}

/**
 * Lê as 3 URLs do SiteSettings global do Payload.
 * Retorna objeto vazio se não conseguir ler.
 */
export async function getCalendlyURLsFromSettings(): Promise<CalendlyURLs> {
  try {
    const { getPayload } = await import('payload')
    const configPromise = await import('@payload-config')
    const payload = await getPayload({ config: configPromise.default })
    const settings = await payload.findGlobal({ slug: 'site-settings' })
    const s = settings as unknown as {
      calendly_url_fit_alto?: string
      calendly_url_fit_medio?: string
      calendly_url_fit_baixo_desfit?: string
    }
    return {
      fit_alto: s.calendly_url_fit_alto,
      fit_medio: s.calendly_url_fit_medio,
      fit_baixo_desfit: s.calendly_url_fit_baixo_desfit,
    }
  } catch {
    return {}
  }
}

/**
 * Valida assinatura HMAC de webhook Calendly.
 * Calendly envia header `Calendly-Webhook-Signature: t=<timestamp>,v1=<sig>`.
 * Spec: https://developer.calendly.com/api-docs/ZG9jOjE2MDYwMDQy-webhook-signatures
 */
export function validateCalendlySignature(
  rawBody: string,
  signatureHeader: string | null,
  signingKey: string,
): boolean {
  if (!signatureHeader || !signingKey) return false
  const parts = signatureHeader.split(',').reduce((acc, p) => {
    const [k, v] = p.split('=')
    if (k && v) acc[k.trim()] = v.trim()
    return acc
  }, {} as Record<string, string>)

  const timestamp = parts.t
  const sig = parts.v1
  if (!timestamp || !sig) return false

  // Reject signatures older than 3 minutes to prevent replay.
  const agora = Math.floor(Date.now() / 1000)
  if (Math.abs(agora - Number(timestamp)) > 180) return false

  const payload = `${timestamp}.${rawBody}`
  const expected = createHmac('sha256', signingKey).update(payload).digest('hex')
  try {
    return timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}
