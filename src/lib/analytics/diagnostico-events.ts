/**
 * Analytics do Diagnóstico de Growth v2 — 9 eventos (spec §10.3) + 1 técnico (rd_webhook).
 *
 * Dois canais por evento:
 *   1. GA4 (gtag) — se `window.gtag` existir (carregado pelo NEXT_PUBLIC_GA4_ID).
 *   2. Endpoint interno `/api/analytics/event` — persiste em `diagnostico-events`.
 *
 * Anti-flood: client mantém `session_id` em sessionStorage; eventos não-idempotentes
 * (`diagnostico_iniciado` etc) usam dedup key `${event_name}:${session_id}` em sessionStorage.
 */

export type EventName =
  | 'diagnostico_iniciado'
  | 'etapa_1_concluida'
  | 'etapa_2_pergunta'
  | 'diagnostico_concluido'
  | 'pdf_baixado'
  | 'resultado_compartilhado'
  | 'opt_in_nutricao'
  | 'agendamento_iniciado'
  | 'agendamento_concluido'
  | 'rd_webhook'

export interface EventPayload {
  event_name: EventName
  result_hash?: string
  lead_email?: string
  metadata?: Record<string, unknown>
  session_id?: string
}

// Eventos que devem deduplicar por sessão (evita 50× ao recarregar página).
const SINGLETON_EVENTS: ReadonlySet<EventName> = new Set([
  'diagnostico_iniciado',
  'diagnostico_concluido',
  'pdf_baixado',
  'opt_in_nutricao',
  'agendamento_iniciado',
])

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = window.sessionStorage.getItem('diag_session_id')
  if (!id) {
    id =
      (typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `s${Date.now()}${Math.random().toString(36).slice(2, 10)}`)
    window.sessionStorage.setItem('diag_session_id', id)
  }
  return id
}

function isDuplicate(event: EventName, sessionId: string): boolean {
  if (typeof window === 'undefined') return false
  if (!SINGLETON_EVENTS.has(event)) return false
  const key = `diag_evt:${event}:${sessionId}`
  if (window.sessionStorage.getItem(key)) return true
  window.sessionStorage.setItem(key, '1')
  return false
}

interface GtagWindow {
  gtag?: (...args: unknown[]) => void
}

function pushGA4(p: EventPayload): void {
  if (typeof window === 'undefined') return
  const w = window as unknown as GtagWindow
  if (typeof w.gtag !== 'function') return
  try {
    w.gtag('event', p.event_name, {
      result_hash: p.result_hash,
      ...(p.metadata || {}),
    })
  } catch {
    /* silencioso */
  }
}

/**
 * Dispara um evento client-side com fire-and-forget.
 * No-op em SSR.
 */
export function trackEvent(p: Omit<EventPayload, 'session_id'>): void {
  if (typeof window === 'undefined') return
  const session_id = getSessionId()
  if (isDuplicate(p.event_name, session_id)) return

  const payload: EventPayload = { ...p, session_id }
  pushGA4(payload)

  // Fire-and-forget — não bloqueia a UI.
  try {
    const body = JSON.stringify(payload)
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      navigator.sendBeacon('/api/analytics/event', body)
    } else {
      void fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {})
    }
  } catch {
    /* silencioso */
  }
}

/**
 * Versão server-side — chamada de route handlers, hooks, crons.
 * Persiste direto via Payload sem GA4.
 */
export async function trackEventServer(p: EventPayload): Promise<void> {
  try {
    const { getPayload } = await import('payload')
    const configPromise = await import('@payload-config')
    const payload = await getPayload({ config: configPromise.default })
    await payload.create({
      collection: 'diagnostico-events',
      data: {
        event_name: p.event_name,
        session_id: p.session_id,
        result_hash: p.result_hash,
        lead_email: p.lead_email,
        metadata: p.metadata,
      } as never,
    })
  } catch (err) {
    console.error('[analytics/server] erro:', err)
  }
}
