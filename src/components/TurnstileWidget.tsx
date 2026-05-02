'use client'

import { useEffect, useRef } from 'react'

type Props = {
  onVerify: (token: string) => void
  className?: string
}

/**
 * Componente Turnstile (Cloudflare anti-spam).
 * Em desenvolvimento (sem NEXT_PUBLIC_TURNSTILE_SITE_KEY): sempre retorna 'mock-valid' automaticamente.
 * Em produção: carrega o widget real do Cloudflare.
 */
export default function TurnstileWidget({ onVerify, className }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!siteKey) {
      // Mock: retorna token válido imediatamente (dev only)
      onVerify('mock-turnstile-valid')
      return
    }

    // Carregar script Turnstile
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    script.onload = () => {
      if (containerRef.current && window.turnstile) {
        window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: onVerify,
        })
      }
    }

    return () => {
      document.head.removeChild(script)
    }
  }, [siteKey, onVerify])

  if (!siteKey) return null

  return <div ref={containerRef} className={className} />
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: { sitekey: string; callback: (token: string) => void }) => string
    }
  }
}
