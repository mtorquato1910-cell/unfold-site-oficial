/**
 * webhookDispatcher — envio HTTP com retry+backoff exponencial e log.
 * Retry: 3 tentativas, delays 1s/3s/9s.
 * Falha total NÃO lança exceção (caller decide se quer await).
 */

export type WebhookPayload = {
  url: string
  method?: 'POST' | 'PUT' | 'PATCH'
  body: unknown
  headers?: Record<string, string>
  /** Idempotency key (será enviado como X-Idempotency-Key) */
  idempotencyKey?: string
  /** Tag para log (slack/rd/zapier/etc) */
  tag?: string
  maxRetries?: number
}

export type WebhookResult = {
  ok: boolean
  status?: number
  attempts: number
  bodyText?: string
  error?: string
}

const DEFAULT_DELAYS_MS = [1000, 3000, 9000]

export async function dispatchWebhook(p: WebhookPayload): Promise<WebhookResult> {
  const max = p.maxRetries ?? 3
  let attempts = 0
  let lastError: string | undefined
  let lastStatus: number | undefined
  let lastBody: string | undefined

  for (let i = 0; i < max; i++) {
    attempts++
    try {
      const res = await fetch(p.url, {
        method: p.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(p.idempotencyKey ? { 'X-Idempotency-Key': p.idempotencyKey } : {}),
          ...(p.headers || {}),
        },
        body: typeof p.body === 'string' ? p.body : JSON.stringify(p.body),
      })

      lastStatus = res.status
      lastBody = await res.text().catch(() => '')

      if (res.ok) return { ok: true, status: res.status, attempts, bodyText: lastBody }

      // 4xx (exceto 429) não retenta — erro do caller
      if (res.status >= 400 && res.status < 500 && res.status !== 429) {
        return { ok: false, status: res.status, attempts, bodyText: lastBody, error: `HTTP ${res.status}` }
      }
    } catch (err: any) {
      lastError = err?.message || String(err)
    }

    if (i < max - 1) {
      await new Promise((r) => setTimeout(r, DEFAULT_DELAYS_MS[i] || 9000))
    }
  }

  return {
    ok: false,
    status: lastStatus,
    attempts,
    bodyText: lastBody,
    error: lastError || `HTTP ${lastStatus}`,
  }
}

/** Helper para Slack incoming webhook */
export async function dispatchSlack(webhookUrl: string, text: string, opts?: { blocks?: any[] }) {
  return dispatchWebhook({
    url: webhookUrl,
    body: { text, ...(opts?.blocks ? { blocks: opts.blocks } : {}) },
    tag: 'slack',
  })
}
