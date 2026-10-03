/**
 * Guarda anti-bot server-side dos formulários públicos que geram lead no RD
 * (newsletter, contato, calculadora, mapa-icp).
 *
 * Três camadas, na ordem:
 *   1. Honeypot — campo `website` invisível; humano nunca preenche.
 *   2. Tempo mínimo — `elapsedMs` (medido no cliente, imune a clock skew) abaixo
 *      de MIN_ELAPSED_MS indica preenchimento automatizado.
 *   3. Cloudflare Turnstile — verificação real do token (defesa primária contra
 *      quem chama a API direto, sem abrir o formulário).
 *
 * Reprovação nas camadas 1-2 é `silent`: o caller responde 200 fake para não
 * ensinar o bot a contornar. Reprovação no Turnstile responde 403.
 *
 * Contexto: em 2026-10 o RD reportou leads falsos com internal source = 4 (API).
 */

import { verifyTurnstile } from './turnstile'

export const MIN_ELAPSED_MS = 2500

export interface BotGuardFields {
  turnstileToken?: unknown
  website?: unknown
  elapsedMs?: unknown
}

export type BotGuardResult =
  | { ok: true }
  | { ok: false; silent: boolean; reason: string }

/** Extrai os campos do guard de um body arbitrário (JSON ou FormData já convertido). */
export function pickBotGuardFields(raw: unknown): BotGuardFields {
  if (!raw || typeof raw !== 'object') return {}
  const r = raw as Record<string, unknown>
  return { turnstileToken: r.turnstileToken, website: r.website, elapsedMs: r.elapsedMs }
}

export async function checkBotGuard(
  fields: BotGuardFields,
  ip: string,
  scope: string,
): Promise<BotGuardResult> {
  const website = typeof fields.website === 'string' ? fields.website.trim() : ''
  if (website) {
    return logReject(scope, ip, { ok: false, silent: true, reason: 'honeypot' })
  }

  const elapsed = Number(fields.elapsedMs)
  if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < MIN_ELAPSED_MS) {
    return logReject(scope, ip, { ok: false, silent: true, reason: `too-fast:${elapsed}ms` })
  }

  const token = typeof fields.turnstileToken === 'string' ? fields.turnstileToken : undefined
  if (process.env.NODE_ENV === 'production' && !process.env.TURNSTILE_SECRET_KEY) {
    // Sem secret o verifyTurnstile faz bypass — em produção isso deixa o form aberto.
    console.error(`[bot-guard:${scope}] TURNSTILE_SECRET_KEY ausente em produção — Turnstile desativado`)
  }
  const ts = await verifyTurnstile(token, ip === 'unknown' ? undefined : ip)
  if (!ts.ok) {
    return logReject(scope, ip, { ok: false, silent: false, reason: `turnstile:${ts.reason}` })
  }
  return { ok: true }
}

function logReject(scope: string, ip: string, r: BotGuardResult): BotGuardResult {
  if (!r.ok) console.warn(`[bot-guard:${scope}] bloqueado`, JSON.stringify({ ip, reason: r.reason }))
  return r
}
