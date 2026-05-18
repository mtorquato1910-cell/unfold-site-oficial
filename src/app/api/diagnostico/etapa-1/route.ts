import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { SignJWT } from 'jose'
import { z } from 'zod'

import { trackEventServer } from '@/lib/analytics/diagnostico-events-server'
import { missingProductionEnv } from '@/lib/env'
import { logger } from '@/lib/observability/logger'
import { rateLimit, resolveClientIP } from '@/lib/rate-limit'
import { verifyTurnstile } from '@/lib/security/turnstile'

// Sprint hotfix 2026-05-15 (Bug 1): force-dynamic + no-store evita que
// Vercel CDN cacheie respostas 5xx ou que Next 15 estatifique este POST.
export const dynamic = 'force-dynamic'
export const revalidate = 0

const schema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  empresa: z.string().min(2),
  telefone: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || /^\D*(\d\D*){10,11}$/.test(v),
      'Telefone deve ter 10 ou 11 dígitos',
    ),
  cargo: z.enum(['ceo', 'diretor', 'gerente', 'analista', 'outro']),
  setor: z.enum(['construcao', 'agro', 'saas', 'automotivo', 'industria', 'servicos', 'outro']),
  faturamento_faixa: z.enum(['ate-50k', '50k-200k', '200k-500k', 'acima-500k', 'prefiro-nao-informar']),
  urgencia: z.enum(['trimestre', '6-meses', 'sem-prazo', 'pesquisando']),
  consentimento: z.boolean().optional(),
  data_inicio: z.string().datetime().optional(),
  turnstile_token: z.string().optional(),
})

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
} as const

function resolveTraceId(req: NextRequest): string {
  const incoming = req.headers.get('x-request-id') || req.headers.get('x-diag-trace-id')
  if (incoming && /^[\w-]{8,64}$/.test(incoming)) return incoming
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID()
  return `diag-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function jsonResponse(traceId: string, body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { ...NO_STORE_HEADERS, 'X-Diag-Trace-Id': traceId },
  })
}

export async function POST(req: NextRequest) {
  const traceId = resolveTraceId(req)
  const isProd = process.env.NODE_ENV === 'production'

  try {
    // Pre-flight: env vars críticas ausentes em produção → 503 estruturado.
    const missing = missingProductionEnv()
    if (missing.length > 0) {
      logger.error('etapa1.env_missing', { request_id: traceId, meta: { missing } })
      return jsonResponse(
        traceId,
        { error: 'Serviço temporariamente indisponível', code: 'ENV_NOT_CONFIGURED', missing },
        503,
      )
    }

    // Rate limit: 5 submissões/hora por IP (G6.2 do QA).
    const rl = rateLimit(req, { scope: 'etapa1', max: 5, windowMs: 60 * 60 * 1000 })
    if (!rl.ok) {
      logger.warn('etapa1.rate_limit_exceeded', { request_id: traceId })
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em alguns minutos.' },
        {
          status: 429,
          headers: {
            ...NO_STORE_HEADERS,
            'X-Diag-Trace-Id': traceId,
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(rl.resetAt / 1000)),
          },
        },
      )
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return jsonResponse(
        traceId,
        { error: 'Dados inválidos', code: 'VALIDATION_FAILED', details: parsed.error.flatten() },
        400,
      )
    }

    // Bug 1 fix: em produção, ausência de TURNSTILE_SECRET_KEY é erro de
    // configuração — não devemos cair em bypass-dev silenciosamente.
    if (isProd && !process.env.TURNSTILE_SECRET_KEY) {
      logger.error('etapa1.turnstile_misconfigured', { request_id: traceId })
      return jsonResponse(
        traceId,
        { error: 'Serviço temporariamente indisponível', code: 'CAPTCHA_NOT_CONFIGURED' },
        503,
      )
    }

    const turnstile = await verifyTurnstile(parsed.data.turnstile_token, resolveClientIP(req))
    if (!turnstile.ok) {
      logger.warn('etapa1.turnstile_failed', {
        request_id: traceId,
        meta: { reason: turnstile.reason },
      })
      return jsonResponse(
        traceId,
        { error: 'Verificação anti-spam falhou. Recarregue a página e tente novamente.', code: 'CAPTCHA_FAILED' },
        400,
      )
    }

    const { nome, email, empresa, telefone, cargo, setor, faturamento_faixa, urgencia } = parsed.data
    const data_inicio = parsed.data.data_inicio || new Date().toISOString()

    let payloadInstance: Awaited<ReturnType<typeof getPayload>>
    try {
      payloadInstance = await getPayload({ config: configPromise })
    } catch (err) {
      logger.error('etapa1.payload_init_failed', {
        request_id: traceId,
        meta: { err: String(err), stack: err instanceof Error ? err.stack : undefined },
      })
      return jsonResponse(
        traceId,
        { error: 'Banco de dados indisponível', code: 'DB_NOT_CONFIGURED' },
        503,
      )
    }

    let leadId: string | number
    try {
      const existing = await payloadInstance.find({
        collection: 'leads',
        where: { email: { equals: email } },
        limit: 1,
      })
      if (existing.docs.length > 0) {
        const ex = existing.docs[0]
        leadId = ex.id
        try {
          await payloadInstance.update({
            collection: 'leads',
            id: leadId,
            data: {
              nome,
              empresa,
              cargo,
              setor: setor as never,
              faturamento_faixa: faturamento_faixa as never,
              urgencia: urgencia as never,
              ...(telefone ? { telefone } : {}),
              consentimento_lgpd: parsed.data.consentimento || ex.consentimento_lgpd,
            },
          })
        } catch (err) {
          logger.error('etapa1.payload_update_failed', {
            request_id: traceId,
            lead_email: email,
            meta: { err: String(err), stack: err instanceof Error ? err.stack : undefined },
          })
          return jsonResponse(
            traceId,
            { error: 'Falha ao atualizar lead', code: 'PAYLOAD_UPDATE_FAILED' },
            500,
          )
        }
      } else {
        const lead = await payloadInstance.create({
          collection: 'leads',
          data: {
            nome,
            email,
            empresa,
            telefone,
            cargo,
            setor: setor as never,
            faturamento_faixa: faturamento_faixa as never,
            urgencia: urgencia as never,
            origem: 'diagnostico',
            rd_sync_status: 'pending',
            consentimento_lgpd: parsed.data.consentimento || false,
            ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          },
        })
        leadId = lead.id
      }
    } catch (err) {
      logger.error('etapa1.payload_find_failed', {
        request_id: traceId,
        lead_email: email,
        meta: { err: String(err), stack: err instanceof Error ? err.stack : undefined },
      })
      return jsonResponse(
        traceId,
        { error: 'Falha ao consultar lead', code: 'PAYLOAD_FIND_FAILED' },
        500,
      )
    }

    const secret = new TextEncoder().encode(process.env.PAYLOAD_SECRET || '')
    if (secret.length === 0) {
      logger.error('etapa1.jwt_secret_missing', { request_id: traceId })
      return jsonResponse(
        traceId,
        { error: 'Serviço temporariamente indisponível', code: 'JWT_SECRET_MISSING' },
        503,
      )
    }
    const token = await new SignJWT({
      leadId: String(leadId),
      email,
      nome,
      empresa,
      cargo,
      setor,
      faturamento_faixa,
      urgencia,
      data_inicio,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .setIssuedAt()
      .sign(secret)

    void trackEventServer({
      event_name: 'etapa_1_concluida',
      lead_email: email,
      metadata: { setor, faturamento_faixa, urgencia, cargo, trace_id: traceId },
    })

    logger.info('etapa1.success', {
      request_id: traceId,
      lead_email: email,
      meta: { setor, urgencia, lead_id: String(leadId) },
    })

    return jsonResponse(traceId, { ok: true, token, leadId: String(leadId) }, 200)
  } catch (err) {
    logger.error('etapa1.unexpected', {
      request_id: traceId,
      meta: { err: String(err), stack: err instanceof Error ? err.stack : undefined },
    })
    return jsonResponse(
      traceId,
      { error: 'Erro interno ao processar diagnóstico', code: 'UNEXPECTED' },
      500,
    )
  }
}
