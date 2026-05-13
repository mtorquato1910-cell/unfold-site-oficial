/**
 * Rate limit in-memory simples (token bucket fixo por janela).
 *
 * Limitação: serverless cold-start zera o estado. Aceitável para v1 — Sprint 7+ pode
 * migrar para Upstash Redis se o tráfego crescer.
 *
 * G6.7 do QA: leitura correta de `X-Forwarded-For` atrás de CDN (Cloudflare/Vercel).
 */

import { NextRequest } from 'next/server'

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()
const MAX_BUCKETS = 5000

function cleanup(): void {
  if (buckets.size < MAX_BUCKETS) return
  const now = Date.now()
  for (const [key, b] of buckets) {
    if (b.resetAt < now) buckets.delete(key)
    if (buckets.size < MAX_BUCKETS * 0.8) break
  }
}

/**
 * Resolve o IP correto considerando CDN/proxy. Usa o PRIMEIRO IP do `x-forwarded-for`,
 * que pelo padrão de proxy é o IP original do cliente.
 */
export function resolveClientIP(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) {
    const first = xff.split(',')[0]?.trim()
    if (first) return first
  }
  const real = req.headers.get('x-real-ip')
  if (real) return real
  // NextRequest.ip pode existir em Edge Runtime.
  const r = req as unknown as { ip?: string }
  if (r.ip) return r.ip
  return 'unknown'
}

export interface RateLimitOptions {
  /** Identificador do bucket (ex: 'etapa1', 'opt-in'). */
  scope: string
  /** Máximo de requests por janela. */
  max: number
  /** Janela em milissegundos. */
  windowMs: number
}

export interface RateLimitResult {
  ok: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(req: NextRequest, opts: RateLimitOptions): RateLimitResult {
  cleanup()
  const ip = resolveClientIP(req)
  const key = `${opts.scope}:${ip}`
  const now = Date.now()
  const existing = buckets.get(key)
  if (!existing || existing.resetAt < now) {
    const resetAt = now + opts.windowMs
    buckets.set(key, { count: 1, resetAt })
    return { ok: true, remaining: opts.max - 1, resetAt }
  }
  if (existing.count >= opts.max) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt }
  }
  existing.count++
  return { ok: true, remaining: opts.max - existing.count, resetAt: existing.resetAt }
}
