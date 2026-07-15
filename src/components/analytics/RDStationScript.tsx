'use client'

/**
 * RD Station — loader de rastreamento (client-side).
 *
 * Carrega o `<loader>.js` do RD Station, que identifica e acompanha a jornada
 * de visitantes/Leads/clientes e habilita botões, banners e pop-ups do RD em
 * todas as páginas públicas do site (site principal + hotsite Guia Eleições).
 *
 * LGPD: assim como o SiteTracker, o loader NÃO dispara antes do visitante
 * aceitar cookies. Ele só é injetado quando `unfold_cookie_consent.accepted`
 * é `true` — ou logo após o evento `unfold-consent-updated` (clique em Aceitar).
 *
 * O ID do loader é controlado pela env NEXT_PUBLIC_RD_STATION_LOADER_ID
 * (com fallback para o loader atual da Unfold), então basta configurar no
 * Vercel para trocar de conta/loader sem tocar no código.
 *
 * NÃO é injetado no painel (/painel) nem no admin do Payload (/admin) — esses
 * route groups têm layout próprio, sem este componente.
 */

import Script from 'next/script'
import { useEffect, useState } from 'react'

const CONSENT_KEY = 'unfold_cookie_consent'
const CONSENT_EVENT = 'unfold-consent-updated'

// UUID do loader fornecido pelo RD Station (RD Marketing → Configurações → Script).
const RD_LOADER_ID =
  process.env.NEXT_PUBLIC_RD_STATION_LOADER_ID ||
  'b8319393-1920-4b94-8b94-7715be209eb7'

const RD_LOADER_SRC = `https://d335luupugsy2.cloudfront.net/js/loader-scripts/${RD_LOADER_ID}-loader.js`

/** LGPD: só carrega com consentimento explícito de cookies analíticos. */
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

export default function RDStationScript() {
  const [consented, setConsented] = useState(false)

  useEffect(() => {
    if (!RD_LOADER_ID) return

    if (hasConsent()) {
      setConsented(true)
      return
    }

    // Ainda sem consentimento: espera o clique em "Aceitar" no banner de cookies.
    const onConsent = () => {
      if (hasConsent()) setConsented(true)
    }
    window.addEventListener(CONSENT_EVENT, onConsent)
    return () => window.removeEventListener(CONSENT_EVENT, onConsent)
  }, [])

  if (!RD_LOADER_ID || !consented) return null

  return <Script id="rd-station-loader" src={RD_LOADER_SRC} strategy="afterInteractive" />
}
