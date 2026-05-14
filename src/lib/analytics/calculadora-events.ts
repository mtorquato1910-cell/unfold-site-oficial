/**
 * Analytics da Calculadora de Performance v2 — versão CLIENT.
 *
 * Espelha o pattern do Diagnóstico (src/lib/analytics/diagnostico-events.ts).
 * Endpoint `/api/calculadora/events` é criado na Sprint 4 — Sprint 2/3 já emitem;
 * em dev a request falha silenciosamente (fire-and-forget).
 *
 * Não vai em `src/lib/calculadora/*` para não violar ADR-1 (módulo puro).
 */

export type CalcEventName =
  | 'calculadora_iniciada'
  | 'etapa_1_concluida'
  | 'calculadora_input_alterado'
  | 'premissa_alterada'
  | 'resultado_visualizado'
  | 'insight_exibido'
  | 'pdf_baixado'
  | 'resultado_compartilhado'
  | 'calculadora_para_diagnostico'
  | 'payload_tampered'

export interface CalcEventPayload {
  event_name: CalcEventName
  result_token?: string
  lead_email?: string
  metadata?: Record<string, unknown>
  session_id?: string
}

/** Eventos que devem deduplicar por sessão para não floodar (cada um dispara 1× por sessão). */
const SINGLETON_EVENTS: ReadonlySet<CalcEventName> = new Set([
  'calculadora_iniciada',
  'resultado_visualizado',
  'pdf_baixado',
  'calculadora_para_diagnostico',
])

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = window.sessionStorage.getItem('calc_session_id')
  if (!id) {
    id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `s${Date.now()}${Math.random().toString(36).slice(2, 10)}`
    window.sessionStorage.setItem('calc_session_id', id)
  }
  return id
}

function isDuplicate(event: CalcEventName, sessionId: string): boolean {
  if (typeof window === 'undefined') return false
  if (!SINGLETON_EVENTS.has(event)) return false
  const key = `calc_evt:${event}:${sessionId}`
  if (window.sessionStorage.getItem(key)) return true
  window.sessionStorage.setItem(key, '1')
  return false
}

interface GtagWindow {
  gtag?: (...args: unknown[]) => void
}

function pushGA4(p: CalcEventPayload): void {
  if (typeof window === 'undefined') return
  const w = window as unknown as GtagWindow
  if (typeof w.gtag !== 'function') return
  try {
    w.gtag('event', p.event_name, {
      result_token: p.result_token,
      ...(p.metadata || {}),
    })
  } catch {
    /* silencioso */
  }
}

/** Dispara um evento client-side fire-and-forget. No-op em SSR. */
export function trackCalcEvent(p: Omit<CalcEventPayload, 'session_id'>): void {
  if (typeof window === 'undefined') return
  const session_id = getSessionId()
  if (isDuplicate(p.event_name, session_id)) return

  const payload: CalcEventPayload = { ...p, session_id }
  pushGA4(payload)

  try {
    const body = JSON.stringify(payload)
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      navigator.sendBeacon('/api/calculadora/events', body)
    } else {
      void fetch('/api/calculadora/events', {
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
 * Cria um debouncer simples para eventos frequentes (input/premissa alterados).
 * Spec recomenda 600-800ms para não floodar (ADR / validação @architect).
 */
export function createDebouncedTracker(delayMs = 700) {
  const timers = new Map<string, ReturnType<typeof setTimeout>>()
  return function debounced(event: CalcEventName, payload: Omit<CalcEventPayload, 'event_name' | 'session_id'>) {
    if (typeof window === 'undefined') return
    const key = `${event}:${JSON.stringify(payload.metadata || {})}`
    const existing = timers.get(key)
    if (existing) clearTimeout(existing)
    const t = setTimeout(() => {
      trackCalcEvent({ event_name: event, ...payload })
      timers.delete(key)
    }, delayMs)
    timers.set(key, t)
  }
}
