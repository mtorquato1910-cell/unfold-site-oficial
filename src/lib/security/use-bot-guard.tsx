'use client'

/**
 * Hook anti-bot dos formulários públicos — par client do `bot-guard.ts`.
 *
 * Renderiza (via `element`) um honeypot invisível + o widget Cloudflare Turnstile em
 * modo `interaction-only` (invisível para a maioria; só aparece se a Cloudflare
 * desconfiar). `collect()` devolve os campos a mesclar no body do POST:
 * `{ turnstileToken, website, elapsedMs }`.
 *
 * Tokens Turnstile são de uso único: `collect()` consome o token atual e reseta o
 * widget, então um reenvio (retry) aguarda um token novo automaticamente.
 *
 * Sem NEXT_PUBLIC_TURNSTILE_SITE_KEY (dev) devolve token mock — o server faz bypass
 * quando TURNSTILE_SECRET_KEY também está ausente.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
const TOKEN_WAIT_MS = 10_000

interface TurnstileApi {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string
  reset: (widgetId: string) => void
  remove: (widgetId: string) => void
}

export interface BotGuardPayload {
  turnstileToken: string
  website: string
  elapsedMs: number
}

let scriptPromise: Promise<TurnstileApi> | null = null

function loadTurnstile(): Promise<TurnstileApi> {
  const w = window as unknown as { turnstile?: TurnstileApi }
  if (w.turnstile) return Promise.resolve(w.turnstile)
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src^="https://challenges.cloudflare.com/turnstile"]')
    const script = existing ?? document.createElement('script')
    let failed = false
    const poll = () => {
      if (failed) return
      if (w.turnstile) return resolve(w.turnstile)
      setTimeout(poll, 50)
    }
    script.addEventListener('error', () => {
      failed = true
      scriptPromise = null
      reject(new Error('turnstile-script-failed'))
    })
    if (!existing) {
      script.src = SCRIPT_SRC
      script.async = true
      document.head.appendChild(script)
    }
    poll()
  })
  return scriptPromise
}

export function useBotGuard() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  // Callback ref (state): o container pode montar depois do hook (ex.: render pós-hidratação).
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const honeypotRef = useRef<HTMLInputElement>(null)
  const startedAtRef = useRef<number>(Date.now())
  const widgetIdRef = useRef<string | null>(null)
  const apiRef = useRef<TurnstileApi | null>(null)
  const tokenRef = useRef<string>('')
  const waitersRef = useRef<Array<(t: string) => void>>([])

  useEffect(() => {
    startedAtRef.current = Date.now()
  }, [])

  useEffect(() => {
    if (!siteKey || !container) return
    let cancelled = false
    loadTurnstile()
      .then((api) => {
        if (cancelled) return
        apiRef.current = api
        widgetIdRef.current = api.render(container, {
          sitekey: siteKey,
          appearance: 'interaction-only',
          'refresh-expired': 'auto',
          callback: (t: string) => {
            tokenRef.current = t
            const waiters = waitersRef.current
            waitersRef.current = []
            waiters.forEach((fn) => fn(t))
          },
          'expired-callback': () => {
            tokenRef.current = ''
          },
          'error-callback': () => {
            tokenRef.current = ''
          },
        })
      })
      .catch((err) => console.warn('[bot-guard] Turnstile indisponível:', err))
    return () => {
      cancelled = true
      if (apiRef.current && widgetIdRef.current) {
        try {
          apiRef.current.remove(widgetIdRef.current)
        } catch {}
      }
      widgetIdRef.current = null
    }
  }, [siteKey, container])

  const waitToken = useCallback((waitMs: number): Promise<string> => {
    if (tokenRef.current) return Promise.resolve(tokenRef.current)
    if (waitMs <= 0) return Promise.resolve('')
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        waitersRef.current = waitersRef.current.filter((fn) => fn !== done)
        resolve('')
      }, waitMs)
      const done = (t: string) => {
        clearTimeout(timer)
        resolve(t)
      }
      waitersRef.current.push(done)
    })
  }, [])

  /**
   * Coleta os campos anti-bot para o POST. Consome o token Turnstile (uso único).
   * `waitMs` = quanto esperar por um token se ainda não houver (0 = não espera;
   * útil quando o server dispensa o Turnstile, ex.: reenvio já verificado).
   */
  const collect = useCallback(async (waitMs: number = TOKEN_WAIT_MS): Promise<BotGuardPayload> => {
    const base = {
      website: honeypotRef.current?.value ?? '',
      elapsedMs: Date.now() - startedAtRef.current,
    }
    if (!siteKey) return { ...base, turnstileToken: 'mock-turnstile-valid' }
    const token = await waitToken(waitMs)
    tokenRef.current = ''
    if (apiRef.current && widgetIdRef.current) {
      try {
        apiRef.current.reset(widgetIdRef.current)
      } catch {}
    }
    return { ...base, turnstileToken: token }
  }, [siteKey, waitToken])

  const element = (
    <>
      <div
        aria-hidden="true"
        style={{ position: 'absolute', left: '-10000px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }}
      >
        <label>
          Não preencha este campo
          <input ref={honeypotRef} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      {siteKey ? <div ref={setContainer} className="mt-2 empty:hidden" /> : null}
    </>
  )

  return { element, collect }
}
