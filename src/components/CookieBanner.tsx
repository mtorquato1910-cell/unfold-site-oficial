'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

const CONSENT_KEY = 'unfold_cookie_consent'

export default function CookieBanner({ message }: { message?: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const consent = localStorage.getItem(CONSENT_KEY)
      if (!consent) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  function accept() {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({ accepted: true, ts: Date.now() }))
      // Disparar evento para GA4 consent mode
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'granted',
          ad_storage: 'denied',
        })
      }
      // Avisa o tracker do mapa de calor para começar a coletar nesta sessão (LGPD).
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('unfold-consent-updated'))
        // Sinaliza o consentimento ao GTM — usar como acionador (Custom Event
        // "unfold_consent_granted") para disparar o Pixel do Facebook só após o aceite.
        const w = window as unknown as { dataLayer?: unknown[] }
        w.dataLayer = w.dataLayer || []
        w.dataLayer.push({ event: 'unfold_consent_granted' })
      }
    } catch { /* silencioso */ }
    setVisible(false)
  }

  function decline() {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({ accepted: false, ts: Date.now() }))
    } catch { /* silencioso */ }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Banner de cookies"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 rounded-2xl border border-border bg-card/95 backdrop-blur p-6 shadow-xl"
    >
      <button
        onClick={decline}
        className="absolute top-3 right-3 text-foreground/70 hover:text-foreground transition-colors"
        aria-label="Fechar banner de cookies"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="font-mono text-xs uppercase tracking-widest text-primary mb-2">Cookies</p>
      <p className="text-sm text-foreground/70 leading-relaxed mb-5">
        {message ||
          'Usamos cookies analíticos para melhorar a experiência. Nenhum dado é vendido.'}{' '}
        <Link
          href="/politica-de-privacidade"
          className="text-primary hover:underline underline-offset-2"
        >
          Saiba mais
        </Link>
      </p>
      <div className="flex gap-3">
        <Button onClick={accept} size="sm" className="flex-1">
          Aceitar
        </Button>
        <Button onClick={decline} variant="outline" size="sm" className="flex-1">
          Recusar
        </Button>
      </div>
    </div>
  )
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}
