/**
 * Validação boot-time de variáveis de ambiente via Zod.
 *
 * Comportamento por NODE_ENV:
 * - production : valida estrito. Vars críticas ausentes → throw que derruba o boot.
 * - test       : silencioso, valores reais sobrescrevem defaults vazios.
 * - development: warn no console, mantém o flow para não atrapalhar `npm run dev`.
 *
 * Sprint hotfix 2026-05-15 (Bug 1). Padrão a ser propagado para calculadora,
 * webhooks e demais endpoints em sprints seguintes.
 */

import { z } from 'zod'

const isProd = process.env.NODE_ENV === 'production'
const isTest = process.env.NODE_ENV === 'test'

// Fonte única de verdade — usada tanto pelo schema Zod quanto pelo helper
// `missingProductionEnv()` para evitar divergência silenciosa.
export const PAYLOAD_SECRET_MIN_LENGTH = 32

const required = (label: string) =>
  isProd ? z.string().min(1, `${label} é obrigatória em produção`) : z.string().optional()

const requiredSecret = (label: string, minLen: number) =>
  isProd
    ? z.string().min(minLen, `${label} deve ter pelo menos ${minLen} caracteres em produção`)
    : z.string().optional()

const requiredUrl = (label: string) =>
  isProd
    ? z
        .string()
        .url(`${label} deve ser uma URL válida`)
        .refine((v) => v.startsWith('https://'), `${label} deve usar https em produção`)
    : z.string().optional()

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Críticas em prod
  DATABASE_URL: required('DATABASE_URL'),
  PAYLOAD_SECRET: requiredSecret('PAYLOAD_SECRET', PAYLOAD_SECRET_MIN_LENGTH),
  NEXT_PUBLIC_SITE_URL: requiredUrl('NEXT_PUBLIC_SITE_URL'),

  // Anti-spam (obrigatório em prod para impedir bypass-dev)
  TURNSTILE_SECRET_KEY: required('TURNSTILE_SECRET_KEY'),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),

  // Opcionais — integrações best-effort
  PAYLOAD_PUBLIC_SERVER_URL: z.string().optional(),
  RD_STATION_API_KEY: z.string().optional(),
  RD_STATION_WEBHOOK_SECRET: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  CRM_MODE: z.enum(['mock', 'real']).default('mock'),
})

export type ServerEnv = z.infer<typeof schema>

let cached: ServerEnv | null = null

function parseEnv(): ServerEnv {
  if (cached) return cached
  const result = schema.safeParse(process.env)
  if (!result.success) {
    const flat = result.error.flatten().fieldErrors
    const msg = '[env] Variáveis de ambiente inválidas: ' + JSON.stringify(flat)
    if (isProd) {
      // Em prod, derruba o boot — preferível falhar cedo a servir 500 silencioso.
      throw new Error(msg)
    }
    if (!isTest) {
      // Em dev, apenas avisa.
      console.warn(msg)
    }
    cached = process.env as unknown as ServerEnv
    return cached
  }
  cached = result.data
  return cached
}

export const serverEnv: ServerEnv = new Proxy({} as ServerEnv, {
  get(_target, prop: string) {
    return parseEnv()[prop as keyof ServerEnv]
  },
})

/**
 * Retorna a lista de envs obrigatórias ausentes. Útil para pre-flight checks
 * em handlers críticos (Diagnóstico, webhooks) que precisam responder 503
 * estruturado em vez de 500 silencioso quando o ambiente não estiver pronto.
 */
export function missingProductionEnv(): string[] {
  if (!isProd) return []
  const out: string[] = []
  if (!process.env.DATABASE_URL) out.push('DATABASE_URL')
  if (!process.env.PAYLOAD_SECRET || process.env.PAYLOAD_SECRET.length < PAYLOAD_SECRET_MIN_LENGTH) {
    out.push('PAYLOAD_SECRET')
  }
  if (!process.env.TURNSTILE_SECRET_KEY) out.push('TURNSTILE_SECRET_KEY')
  if (!process.env.NEXT_PUBLIC_SITE_URL) out.push('NEXT_PUBLIC_SITE_URL')
  return out
}
