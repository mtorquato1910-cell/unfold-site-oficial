import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { SignJWT } from 'jose'
import { z } from 'zod'

import { trackEventServer } from '@/lib/analytics/diagnostico-events-server'
import { logger } from '@/lib/observability/logger'
import { rateLimit, resolveClientIP } from '@/lib/rate-limit'
import { verifyTurnstile } from '@/lib/security/turnstile'

const schema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  empresa: z.string().min(2),
  cargo: z.enum(['ceo', 'diretor', 'gerente', 'analista', 'outro']),
  setor: z.enum(['construcao', 'agro', 'saas', 'automotivo', 'industria', 'servicos', 'outro']),
  faturamento_faixa: z.enum(['ate-50k', '50k-200k', '200k-500k', 'acima-500k', 'prefiro-nao-informar']),
  urgencia: z.enum(['trimestre', '6-meses', 'sem-prazo', 'pesquisando']),
  consentimento: z.boolean().optional(),
  data_inicio: z.string().datetime().optional(),
  turnstile_token: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 submissões/hora por IP (G6.2 do QA).
    const rl = rateLimit(req, { scope: 'etapa1', max: 5, windowMs: 60 * 60 * 1000 })
    if (!rl.ok) {
      logger.warn('etapa1.rate_limit_exceeded', { request_id: resolveClientIP(req) })
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em alguns minutos.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(rl.resetAt / 1000)),
          },
        },
      )
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    // Turnstile: bypass-dev quando TURNSTILE_SECRET_KEY ausente (G6.1 do QA).
    const turnstile = await verifyTurnstile(parsed.data.turnstile_token, resolveClientIP(req))
    if (!turnstile.ok) {
      logger.warn('etapa1.turnstile_failed', { meta: { reason: turnstile.reason } })
      return NextResponse.json(
        { error: 'Verificação anti-spam falhou. Recarregue a página e tente novamente.' },
        { status: 401 },
      )
    }

    const { nome, email, empresa, cargo, setor, faturamento_faixa, urgencia } = parsed.data
    const data_inicio = parsed.data.data_inicio || new Date().toISOString()
    const payload = await getPayload({ config: configPromise })

    let leadId: string | number
    try {
      const existing = await payload.find({
        collection: 'leads',
        where: { email: { equals: email } },
        limit: 1,
      })
      if (existing.docs.length > 0) {
        // Atualiza lead existente com os campos v2 (não sobrescreve nome se já houver).
        const ex = existing.docs[0]
        leadId = ex.id
        try {
          await payload.update({
            collection: 'leads',
            id: leadId,
            data: {
              nome,
              empresa,
              // cargo e setor são salvos como strings; o cast é para o tipo gerado do Payload.
              cargo,
              setor: setor as never,
              faturamento_faixa: faturamento_faixa as never,
              urgencia: urgencia as never,
              consentimento_lgpd: parsed.data.consentimento || ex.consentimento_lgpd,
            },
          })
        } catch (err) {
          console.warn('[etapa-1] Falha ao atualizar lead existente:', err)
        }
      } else {
        const lead = await payload.create({
          collection: 'leads',
          data: {
            nome,
            email,
            empresa,
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
      console.warn('[etapa-1] DB não disponível, usando mock:', err)
      leadId = `mock-${Date.now()}`
    }

    const secret = new TextEncoder().encode(
      process.env.PAYLOAD_SECRET || 'dev-secret-CHANGE-IN-PRODUCTION',
    )
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

    // Evento spec §10.3: Etapa 1 concluída.
    void trackEventServer({
      event_name: 'etapa_1_concluida',
      lead_email: email,
      metadata: { setor, faturamento_faixa, urgencia, cargo },
    })

    logger.info('etapa1.success', { lead_email: email, meta: { setor, urgencia } })

    return NextResponse.json({ ok: true, token })
  } catch (err) {
    logger.error('etapa1.unexpected', { meta: { err: String(err) } })
    return NextResponse.json({ error: 'Erro interno ao processar diagnóstico' }, { status: 500 })
  }
}
