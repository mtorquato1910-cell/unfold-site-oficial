/**
 * Captura de origem do tráfego (RF-39/RF-40). Lê UTMs/referrer/landing no client
 * (vê o host público `/featwork` após o rewrite de subdomínio — GAP-M5) e guarda em
 * sessionStorage para sobreviver à navegação/abertura do modal durante a sessão.
 */

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export interface OriginData {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  referrer?: string
  landing_page?: string
  device_type?: DeviceType
  user_agent?: string
}

const STORAGE_KEY = 'guia_origin'

export function detectDeviceType(): DeviceType {
  if (typeof window === 'undefined') return 'desktop'
  const w = window.innerWidth
  if (w < 768) return 'mobile'
  if (w < 1024) return 'tablet'
  return 'desktop'
}

/** Captura no 1º acesso da sessão; não sobrescreve se já existir (preserva a 1ª origem). */
export function captureOrigin(): OriginData {
  if (typeof window === 'undefined') return {}
  const existing = getStoredOrigin()
  if (existing) return existing

  const params = new URLSearchParams(window.location.search)
  const utm = (k: string) => params.get(k) || undefined

  const data: OriginData = {
    utm_source: utm('utm_source'),
    utm_medium: utm('utm_medium'),
    utm_campaign: utm('utm_campaign'),
    utm_content: utm('utm_content'),
    utm_term: utm('utm_term'),
    referrer: document.referrer || undefined,
    landing_page: window.location.origin + window.location.pathname,
    device_type: detectDeviceType(),
    user_agent: navigator.userAgent.slice(0, 180),
  }

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* sessionStorage indisponível — devolve em memória mesmo assim */
  }
  return data
}

export function getStoredOrigin(): OriginData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as OriginData) : null
  } catch {
    return null
  }
}
