/**
 * Tracker de navegação do site (mapa de calor / jornada de leads) — CLIENT.
 *
 * - Gera `session_id` anônimo por sessão de aba (sessionStorage).
 * - Captura pageviews e cliques (com coordenadas + descrição do elemento).
 * - Envia em lote para /api/track (sendBeacon/fetch keepalive).
 * - `identifyLead(email)`: quando o visitante vira lead, guarda o HASH do e-mail
 *   (nunca o e-mail em claro) e cruza com o pixel (posthog.identify + dataLayer).
 *
 * Privacidade: nenhum PII é persistido — só `session_id` e `lead_hash`.
 */

const SESSION_KEY = 'unfold_sid'
const LEAD_KEY = 'unfold_lead_hash'
const CONSENT_KEY = 'unfold_cookie_consent'
const CONSENT_EVENT = 'unfold-consent-updated'
const ENDPOINT = '/api/track'
const FLUSH_MS = 5000
const MAX_BATCH = 40

/** LGPD: só coleta com consentimento explícito de cookies analíticos. */
function hasConsent(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY)
    if (!raw) return false
    return JSON.parse(raw)?.accepted === true
  } catch {
    return false
  }
}

export type TrackEventType = 'pageview' | 'click'

export interface TrackEvent {
  event_type: TrackEventType
  path: string
  referrer?: string
  element?: string
  x?: number
  y?: number
  viewport_w?: number
  session_id: string
  lead_hash?: string
  metadata?: Record<string, unknown>
}

let queue: TrackEvent[] = []
let flushTimer: ReturnType<typeof setInterval> | null = null
let started = false

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY)
    if (!id) {
      id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `s${Date.now()}${Math.random().toString(36).slice(2, 10)}`
      window.sessionStorage.setItem(SESSION_KEY, id)
    }
    return id
  } catch {
    return 'anon'
  }
}

function getLeadHash(): string | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    return window.localStorage.getItem(LEAD_KEY) || undefined
  } catch {
    return undefined
  }
}

/** SHA-256 (primeiros 12 hex) do e-mail normalizado. Fallback djb2 se sem SubtleCrypto. */
export async function hashEmail(email: string): Promise<string> {
  const norm = email.trim().toLowerCase()
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(norm))
      return Array.from(new Uint8Array(buf))
        .slice(0, 6)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
    }
  } catch {
    /* fallback abaixo */
  }
  let h = 5381
  for (let i = 0; i < norm.length; i++) h = ((h << 5) + h + norm.charCodeAt(i)) >>> 0
  return h.toString(16).padStart(8, '0')
}

/** Identifica o lead (chamado no submit de formulários). Cruza com o pixel. */
export async function identifyLead(email: string): Promise<void> {
  if (typeof window === 'undefined' || !email || !email.includes('@')) return
  if (!hasConsent()) return
  const hash = await hashEmail(email)
  try {
    window.localStorage.setItem(LEAD_KEY, hash)
  } catch {
    /* silencioso */
  }
  // Vínculo com o pixel — PostHog
  const w = window as unknown as {
    posthog?: { identify?: (id: string) => void }
    dataLayer?: unknown[]
  }
  try {
    w.posthog?.identify?.(hash)
  } catch {
    /* silencioso */
  }
  // Vínculo com o pixel — GTM/GA4 dataLayer
  try {
    if (Array.isArray(w.dataLayer)) w.dataLayer.push({ event: 'lead_identified', lead_hash: hash })
  } catch {
    /* silencioso */
  }
}

function enqueue(e: TrackEvent) {
  if (!hasConsent()) return // LGPD: sem consentimento, nada é coletado.
  queue.push(e)
  if (queue.length >= MAX_BATCH) flush()
}

function flush() {
  if (typeof window === 'undefined' || queue.length === 0) return
  const batch = queue.slice(0, MAX_BATCH)
  queue = queue.slice(MAX_BATCH)
  const body = JSON.stringify({ events: batch })
  try {
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }))
    } else {
      void fetch(ENDPOINT, {
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

/** Registra um pageview da rota atual. */
export function trackPageview() {
  if (typeof window === 'undefined') return
  enqueue({
    event_type: 'pageview',
    path: window.location.pathname,
    referrer: document.referrer || undefined,
    session_id: getSessionId(),
    lead_hash: getLeadHash(),
    viewport_w: window.innerWidth,
    metadata: { title: document.title },
  })
  // Não flushamos por pageview (M4): o intervalo + pagehide enviam o lote,
  // economizando conexões do pool serverless (max:3) e invocações na Vercel.
}

function describeElement(target: EventTarget | null): string {
  const el = target as Element | null
  if (!el || !el.closest) return ''
  const t = (el.closest('a,button,[role="button"],input,select,textarea,label') || el) as HTMLElement
  const tag = t.tagName?.toLowerCase() || 'el'
  const id = t.id ? `#${t.id}` : ''
  const raw =
    t.getAttribute?.('aria-label') ||
    (t as HTMLInputElement).name ||
    t.innerText ||
    ''
  const label = raw.replace(/\s+/g, ' ').trim().slice(0, 60)
  return `${tag}${id}${label ? ` · ${label}` : ''}`
}

/**
 * Inicializa listeners globais (cliques, submit de formulários, flush).
 * Idempotente. Retorna cleanup.
 */
export function initSiteTracker(): () => void {
  if (typeof window === 'undefined' || started) return () => {}
  started = true

  const onClick = (e: MouseEvent) => {
    try {
      enqueue({
        event_type: 'click',
        path: window.location.pathname,
        element: describeElement(e.target),
        x: Math.round(e.clientX),
        y: Math.round(e.clientY),
        viewport_w: window.innerWidth,
        session_id: getSessionId(),
        lead_hash: getLeadHash(),
      })
    } catch {
      /* silencioso */
    }
  }

  // Auto-identifica leads no submit de formulários com campo de e-mail.
  const onSubmit = (e: Event) => {
    try {
      // Nunca em áreas administrativas (M1) — evita hashear e-mails de login.
      const p = window.location.pathname
      if (p.startsWith('/admin') || p.startsWith('/painel')) return
      const form = e.target as HTMLFormElement | null
      if (!form || form.tagName !== 'FORM') return
      const input = form.querySelector(
        'input[type="email"], input[name*="email" i], input[id*="email" i]',
      ) as HTMLInputElement | null
      const email = input?.value?.trim()
      if (email && email.includes('@')) void identifyLead(email)
    } catch {
      /* silencioso */
    }
  }

  const onHide = () => flush()
  const onVisibility = () => {
    if (document.visibilityState === 'hidden') flush()
  }
  // Quando o usuário aceita cookies, captura o pageview da página atual (LGPD).
  const onConsent = () => trackPageview()

  document.addEventListener('click', onClick, true)
  document.addEventListener('submit', onSubmit, true)
  window.addEventListener('pagehide', onHide)
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener(CONSENT_EVENT, onConsent)
  flushTimer = setInterval(flush, FLUSH_MS)

  return () => {
    document.removeEventListener('click', onClick, true)
    document.removeEventListener('submit', onSubmit, true)
    window.removeEventListener('pagehide', onHide)
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener(CONSENT_EVENT, onConsent)
    if (flushTimer) clearInterval(flushTimer)
    started = false
  }
}
