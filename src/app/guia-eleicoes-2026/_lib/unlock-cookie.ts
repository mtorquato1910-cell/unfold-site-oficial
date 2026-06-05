/**
 * Cookie httpOnly assinado que comprova que o visitante passou pelo cadastro do gate.
 *
 * É emitido pelos endpoints de lead/consultoria (Set-Cookie) e exigido pelo endpoint
 * que serve o PDF (/api/guia-eleicoes/pdf) — assim o documento deixa de ser baixável
 * por uma URL pública previsível. A assinatura HMAC (PAYLOAD_SECRET) impede forja;
 * o cookie carrega só uma expiração, não dado pessoal.
 *
 * SERVER-ONLY: usa node:crypto e PAYLOAD_SECRET (nunca importar em client component).
 */
import { createHmac, timingSafeEqual } from 'crypto'

export const UNLOCK_COOKIE_NAME = 'guia_unlock'
export const UNLOCK_MAX_AGE_S = 60 * 60 * 24 * 90 // 90 dias

function secret(): string {
  return process.env.PAYLOAD_SECRET || 'dev-secret-guia-unlock'
}

function sign(expStr: string): string {
  return createHmac('sha256', secret()).update(expStr).digest('base64url')
}

/** Gera o valor do cookie: `exp.assinatura`. */
export function signUnlockValue(nowMs: number): string {
  const exp = Math.floor(nowMs / 1000) + UNLOCK_MAX_AGE_S
  const expStr = String(exp)
  return `${expStr}.${sign(expStr)}`
}

/** Valida formato, assinatura (timing-safe) e expiração do valor do cookie. */
export function isValidUnlockValue(value: string | undefined | null, nowMs: number): boolean {
  if (!value) return false
  const dot = value.indexOf('.')
  if (dot <= 0) return false
  const expStr = value.slice(0, dot)
  const sig = value.slice(dot + 1)
  const exp = Number(expStr)
  if (!Number.isFinite(exp) || exp * 1000 < nowMs) return false
  const expected = sign(expStr)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/** Opções padronizadas do cookie (httpOnly, secure em prod, lax). */
export function unlockCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: UNLOCK_MAX_AGE_S,
    path: '/',
  }
}
