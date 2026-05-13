/**
 * Logger estruturado (JSON) com `result_hash` por padrão.
 * Sprint 6 — gate G6.4 do QA.
 *
 * Em produção, a saída JSON pode ser consumida pelo Vercel/Supabase logs e enviada ao Sentry.
 * Localmente, fica legível porque é uma linha por log.
 *
 * LGPD (Débito 4 do QA): emails são mascarados e IPs são hasheados antes do log.
 */

import { createHash } from 'crypto'

export type LogLevel = 'info' | 'warn' | 'error'

export interface LogContext {
  result_hash?: string
  lead_email?: string
  session_id?: string
  request_id?: string
  // Campos livres.
  [key: string]: unknown
}

interface LogEntry {
  level: LogLevel
  evento: string
  ts: string
  result_hash?: string
  lead_email?: string
  session_id?: string
  request_id?: string
  meta?: Record<string, unknown>
}

// Heurística simples para detectar IPv4/IPv6.
const IP_LIKE = /^(\d{1,3}\.){3}\d{1,3}$|^[0-9a-fA-F:]{2,39}$/

function emit(level: LogLevel, evento: string, ctx: LogContext = {}): void {
  const { result_hash, lead_email, session_id, request_id, ...meta } = ctx
  const entry: LogEntry = {
    level,
    evento,
    ts: new Date().toISOString(),
    ...(result_hash ? { result_hash } : {}),
    ...(lead_email ? { lead_email: redactEmail(lead_email) } : {}),
    ...(session_id ? { session_id } : {}),
    ...(request_id ? { request_id: hashIfIP(request_id) } : {}),
    ...(Object.keys(meta).length > 0 ? { meta } : {}),
  }
  const line = JSON.stringify(entry)
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.log(line)
}

/**
 * Hash determinístico (SHA256 truncado em 12 chars) para IPs.
 * Preserva agregação por usuário em logs sem persistir o IP cru (PII sob LGPD).
 */
function hashIfIP(value: string): string {
  if (!IP_LIKE.test(value)) return value
  const salt = process.env.PAYLOAD_SECRET || 'log-salt'
  return 'ip:' + createHash('sha256').update(salt + value).digest('hex').slice(0, 12)
}

export const logger = {
  info: (evento: string, ctx?: LogContext) => emit('info', evento, ctx),
  warn: (evento: string, ctx?: LogContext) => emit('warn', evento, ctx),
  error: (evento: string, ctx?: LogContext) => emit('error', evento, ctx),
}

// Mascara metade local do email em logs (LGPD).
function redactEmail(email: string): string {
  const at = email.indexOf('@')
  if (at <= 1) return email
  const local = email.slice(0, at)
  const dom = email.slice(at)
  const mask = local.length <= 2 ? '**' : `${local[0]}***${local[local.length - 1]}`
  return `${mask}${dom}`
}
