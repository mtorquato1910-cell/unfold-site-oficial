/**
 * Helper compartilhado para construir URLs públicas dos resultados da Calculadora.
 *
 * Fix de host header injection (auditoria @architect): usa
 * `process.env.NEXT_PUBLIC_SITE_URL` como source-of-truth quando disponível.
 * Sem essa env var (dev local), cai no host do request — comportamento aceitável
 * porque em dev não há atacante forjando Host.
 *
 * Em produção a env deve estar setada (NEXT_PUBLIC_SITE_URL=https://unfoldgrowth.com.br).
 */

import type { NextRequest } from 'next/server'

const HOST_ALLOWLIST_PROD = new Set<string>([
  'unfoldgrowth.com.br',
  'www.unfoldgrowth.com.br',
])

function baseUrlFromRequest(req: NextRequest): string {
  const proto = req.headers.get('x-forwarded-proto') || 'https'
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000'
  return `${proto}://${host}`
}

/** Retorna a base URL canônica para links públicos (sem trailing slash). */
export function siteBaseUrl(req: NextRequest): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL
  if (fromEnv) return fromEnv.replace(/\/+$/, '')

  const fromReq = baseUrlFromRequest(req)
  // Em prod sem NEXT_PUBLIC_SITE_URL, valida contra allowlist para evitar
  // host header injection. Se não bater, força o domínio canônico.
  if (process.env.NODE_ENV === 'production') {
    try {
      const u = new URL(fromReq)
      if (!HOST_ALLOWLIST_PROD.has(u.host)) {
        return 'https://unfoldgrowth.com.br'
      }
    } catch {
      return 'https://unfoldgrowth.com.br'
    }
  }
  return fromReq
}

/** URL pública de um resultado salvo da Calculadora pelo token. */
export function publicResultUrl(req: NextRequest, token: string): string {
  return `${siteBaseUrl(req)}/ferramentas/calculadora-trafego/r/${token}`
}
