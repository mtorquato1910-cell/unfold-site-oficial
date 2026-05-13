/**
 * Analytics do Diagnóstico de Growth v2 — versão CLIENT.
 *
 * Este arquivo contém APENAS o tracker client-side (`trackEvent`) + tipos.
 * Para tracker server-side, use `diagnostico-events-server.ts` (não importável de client
 * components — ele puxa Payload/pg).
 *
 * Separação obrigatória: webpack do Next.js falha em bundle client quando algum import
 * transitivo pesca Node-only modules (`fs`, `net`, `pg`).
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
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `s${Date.now()}${Math.random().toString(36).slice(2, 10)}`
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
