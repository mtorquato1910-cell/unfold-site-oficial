'use client'

import { useEffect, useRef } from 'react'

interface TurnstileGlobal {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string
      callback?: (token: string) => void
      'error-callback'?: () => void
      theme?: 'light' | 'dark' | 'auto'
    },
  ) => string
  reset: (widgetId?: string) => void
}

interface WindowWithTurnstile {
  turnstile?: TurnstileGlobal
}

interface Props {
  onToken: (token: string) => void
}

/**
 * Cloudflare Turnstile widget — carrega script global e renderiza no div.
 * Em ausência da site key, renderiza nada (modo dev, validação faz bypass).
 */
export default function TurnstileWidget({ onToken }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    if (!siteKey || !containerRef.current) return

    const renderWidget = () => {
      const w = (window as unknown as WindowWithTurnstile).turnstile
      if (!w || !containerRef.current) return
      widgetIdRef.current = w.render(containerRef.current, {
        sitekey: siteKey,
        theme: 'dark',
        callback: (token) => onToken(token),
        'error-callback': () => onToken(''),
      })
    }

    // Carrega o script uma vez.
    if (!document.querySelector('script[data-turnstile]')) {
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__turnstileOnLoad'
      script.async = true
      script.defer = true
      script.setAttribute('data-turnstile', '1')
      ;(window as unknown as Record<string, unknown>)['__turnstileOnLoad'] = renderWidget
      document.head.appendChild(script)
    } else {
      renderWidget()
    }
  }, [siteKey, onToken])

  if (!siteKey) return null

  return <div ref={containerRef} className="cf-turnstile mt-2" />
}
