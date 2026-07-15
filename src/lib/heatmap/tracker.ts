/**
 * Tracker do MAPA DE CALOR VISUAL (overlay tipo Clarity) — CLIENT.
 *
 * Diferente do site-tracker (que alimenta o relatório agregado e continua
 * intacto), este captura o que o OVERLAY precisa e que o outro não guarda:
 *  - coordenadas de DOCUMENTO (pageX/pageY) + dimensões do doc → posição em
 *    página inteira, independente do scroll;
 *  - x_rel / y_abs / y_rel (normalizados) para reprojetar em qualquer largura;
 *  - seletor CSS estável + offsets dentro do elemento → reancoragem no DOM;
 *  - device (desktop/tablet/mobile), scroll depth máximo, e os eventos
 *    derivados rage / dead / error / move.
 *
 * Envia em lote para /api/heatmap/ingest via sendBeacon. Reaproveita o
 * session_id e o lead_hash do site-tracker (mesmas chaves de storage).
 *
 * Privacidade (LGPD): só coleta com consentimento; respeita navigator.doNotTrack;
 * NUNCA captura texto de inputs/textareas/[data-private] — apenas a posição.
 */

import { stableSelector } from './selector'

const SESSION_KEY = 'unfold_sid'
const LEAD_KEY = 'unfold_lead_hash'
const CONSENT_KEY = 'unfold_cookie_consent'
const CONSENT_EVENT = 'unfold-consent-updated'
const ENDPOINT = '/api/heatmap/ingest'

const FLUSH_MS = 5000
const MAX_BATCH = 20
const MOVE_THROTTLE_MS = 150
const MOVE_CAP_PER_PAGE = 300 // teto de amostras de movimento por página/sessão
const SCROLL_THROTTLE_MS = 250
const RAGE_WINDOW_MS = 1000
const RAGE_MIN = 3
const DEAD_MS = 1000
const ERROR_MS = 500

type HeatEventType = 'click' | 'rage_click' | 'dead_click' | 'error_click' | 'move' | 'scroll'
type Device = 'desktop' | 'tablet' | 'mobile'

interface HeatEvent {
  session_id: string
  lead_hash?: string
  page_path: string
  event_type: HeatEventType
  device: Device
  viewport_w: number
  viewport_h: number
  doc_w: number
  doc_h: number
  x_rel?: number
  y_abs?: number
  y_rel?: number
  selector?: string
  el_tag?: string
  el_text?: string
  off_x_pct?: number
  off_y_pct?: number
  scroll_depth_pct?: number
}

let queue: HeatEvent[] = []
let flushTimer: ReturnType<typeof setInterval> | null = null
let started = false

// ── consentimento / DNT ────────────────────────────────────────────────────
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

function doNotTrack(): boolean {
  if (typeof navigator === 'undefined') return false
  const dnt =
    navigator.doNotTrack ||
    (window as unknown as { doNotTrack?: string }).doNotTrack ||
    (navigator as unknown as { msDoNotTrack?: string }).msDoNotTrack
  return dnt === '1' || dnt === 'yes'
}

// ── identidade (reaproveita o site-tracker) ─────────────────────────────────
function getSessionId(): string {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) || 'anon'
  } catch {
    return 'anon'
  }
}
function getLeadHash(): string | undefined {
  try {
    return window.localStorage.getItem(LEAD_KEY) || undefined
  } catch {
    return undefined
  }
}

// ── contexto de layout ──────────────────────────────────────────────────────
function device(): Device {
  const w = window.innerWidth
  if (w >= 1024) return 'desktop'
  if (w >= 768) return 'tablet'
  return 'mobile'
}
function docWidth(): number {
  return Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth || 0, 1)
}
function docHeight(): number {
  return Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0, 1)
}
function pagePath(): string {
  return window.location.pathname
}

/** Texto do elemento — respeitando privacidade (nunca de inputs/[data-private]). */
function safeElText(el: Element): string {
  const tag = el.tagName.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return ''
  if (el.closest('[data-private]')) return ''
  const raw =
    el.getAttribute('aria-label') ||
    (el as HTMLElement).innerText ||
    el.textContent ||
    ''
  return raw.replace(/\s+/g, ' ').trim().slice(0, 80)
}

function baseFromPoint(pageX: number, pageY: number): HeatEvent {
  const dw = docWidth()
  const dh = docHeight()
  return {
    session_id: getSessionId(),
    lead_hash: getLeadHash(),
    page_path: pagePath(),
    event_type: 'click',
    device: device(),
    viewport_w: window.innerWidth,
    viewport_h: window.innerHeight,
    doc_w: dw,
    doc_h: dh,
    x_rel: clamp01(pageX / dw),
    y_abs: Math.round(pageY),
    y_rel: clamp01(pageY / dh),
  }
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0
  return n < 0 ? 0 : n > 1 ? 1 : n
}

function enqueue(e: HeatEvent) {
  if (!hasConsent()) return
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

// ── classificação de cliques (rage / dead / error) ──────────────────────────
interface PendingClick {
  base: HeatEvent
  ts: number
  effect: boolean
  errored: boolean
  resolved: boolean
}

const clickHistory: { selector: string; ts: number }[] = []
let lastPending: PendingClick | null = null

function isRage(selector: string, now: number): boolean {
  clickHistory.push({ selector, ts: now })
  // Mantém só a janela recente.
  while (clickHistory.length && now - clickHistory[0].ts > RAGE_WINDOW_MS) clickHistory.shift()
  const sameCount = clickHistory.filter((c) => c.selector === selector).length
  return sameCount >= RAGE_MIN
}

function resolvePending(p: PendingClick) {
  if (p.resolved) return
  p.resolved = true
  let type = p.base.event_type
  if (type === 'click') {
    if (p.errored) type = 'error_click'
    else if (!p.effect) type = 'dead_click'
  }
  enqueue({ ...p.base, event_type: type })
  if (lastPending === p) lastPending = null
}

// ── scroll depth (máximo por página/sessão) ─────────────────────────────────
let maxScrollPct = 0
let scrollDirty = false
let moveCount = 0 // amostras de movimento na página atual (reinicia por rota)

// Profundidade REAL de rolagem: 0 no topo, 1 quando chega ao fim do que dá para
// rolar. Se a página cabe inteira na tela (nada a rolar), o usuário viu tudo → 1.
function currentScrollPct(): number {
  const scrollable = docHeight() - window.innerHeight
  if (scrollable <= 0) return 1
  return clamp01(window.scrollY / scrollable)
}

function flushScroll() {
  // Emite mesmo com profundidade 0 — assim TODA sessão da página entra no
  // denominador da curva de retenção (senão quem não rola some e enviesa a dobra).
  if (!scrollDirty) return
  scrollDirty = false
  const dw = docWidth()
  const dh = docHeight()
  enqueue({
    session_id: getSessionId(),
    lead_hash: getLeadHash(),
    page_path: pagePath(),
    event_type: 'scroll',
    device: device(),
    viewport_w: window.innerWidth,
    viewport_h: window.innerHeight,
    doc_w: dw,
    doc_h: dh,
    scroll_depth_pct: maxScrollPct,
  })
}

// ── inicialização ───────────────────────────────────────────────────────────
export function initHeatmapTracker(): () => void {
  if (typeof window === 'undefined' || started) return () => {}
  if (doNotTrack()) return () => {}
  started = true

  let lastMoveTs = 0
  let lastScrollTs = 0
  moveCount = 0

  const onClick = (e: MouseEvent) => {
    try {
      const now = Date.now()
      const el = (e.target as Element | null) ?? null
      const base = baseFromPoint(e.pageX, e.pageY)
      if (el && el.getBoundingClientRect) {
        const rect = el.getBoundingClientRect()
        const selector = stableSelector(el)
        base.selector = selector
        base.el_tag = el.tagName?.toLowerCase()
        base.el_text = safeElText(el)
        if (rect.width > 0 && rect.height > 0) {
          base.off_x_pct = clamp01((e.clientX - rect.left) / rect.width)
          base.off_y_pct = clamp01((e.clientY - rect.top) / rect.height)
        }
        if (selector && isRage(selector, now)) base.event_type = 'rage_click'
      }
      const pending: PendingClick = { base, ts: now, effect: false, errored: false, resolved: false }
      lastPending = pending
      window.setTimeout(() => resolvePending(pending), DEAD_MS)
    } catch {
      /* silencioso */
    }
  }

  const onMove = (e: MouseEvent) => {
    const now = Date.now()
    if (now - lastMoveTs < MOVE_THROTTLE_MS) return
    if (moveCount >= MOVE_CAP_PER_PAGE) return
    lastMoveTs = now
    moveCount++
    try {
      const evt = baseFromPoint(e.pageX, e.pageY)
      evt.event_type = 'move'
      enqueue(evt)
    } catch {
      /* silencioso */
    }
  }

  const onScroll = () => {
    const now = Date.now()
    const pct = currentScrollPct()
    if (pct > maxScrollPct) {
      maxScrollPct = pct
      scrollDirty = true
    }
    if (now - lastScrollTs < SCROLL_THROTTLE_MS) return
    lastScrollTs = now
  }

  // Sinais de "efeito" (para dead click): mutação do DOM.
  const mo = new MutationObserver(() => {
    if (lastPending && !lastPending.resolved) lastPending.effect = true
  })
  try {
    mo.observe(document.body, { childList: true, subtree: true })
  } catch {
    /* body pode não existir ainda; ignorado */
  }

  const onError = () => {
    const now = Date.now()
    if (lastPending && !lastPending.resolved && now - lastPending.ts < ERROR_MS) {
      lastPending.errored = true
    }
  }

  const onHide = () => {
    flushScroll()
    flush()
  }
  const onVisibility = () => {
    if (document.visibilityState === 'hidden') onHide()
  }

  document.addEventListener('click', onClick, true)
  document.addEventListener('mousemove', onMove, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('error', onError, true)
  window.addEventListener('pagehide', onHide)
  document.addEventListener('visibilitychange', onVisibility)
  flushTimer = setInterval(() => {
    flushScroll()
    flush()
  }, FLUSH_MS)

  // Registro inicial de rolagem (0 no topo) — garante que esta página/sessão
  // entre no denominador da curva de retenção mesmo se o usuário nunca rolar.
  maxScrollPct = currentScrollPct()
  scrollDirty = true

  return () => {
    document.removeEventListener('click', onClick, true)
    document.removeEventListener('mousemove', onMove)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('error', onError, true)
    window.removeEventListener('pagehide', onHide)
    document.removeEventListener('visibilitychange', onVisibility)
    mo.disconnect()
    if (flushTimer) clearInterval(flushTimer)
    started = false
  }
}

/** Chamado pelo SiteTracker a cada mudança de rota para reiniciar o scroll. */
export function heatmapRouteChanged() {
  if (typeof window === 'undefined' || !started) return
  flushScroll()
  moveCount = 0
  // Nova página: registra a profundidade inicial (0) para entrar no denominador.
  maxScrollPct = currentScrollPct()
  scrollDirty = true
}
