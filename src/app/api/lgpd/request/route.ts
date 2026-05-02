import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  tipo: z.enum(['access', 'correction', 'deletion', 'portability', 'revocation', 'opposition']),
  detalhes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 })
    }

    const { email, tipo, detalhes } = parsed.data

    // Registrar no audit log
    try {
      const payload = await getPayload({ config: configPromise })
      await payload.create({
        collection: 'audit-log',
        data: {
          acao: 'lgpd.consent',
          entidade: `lgpd-request:${email}`,
          actor_email: email,
          ip: req.headers.get('x-forwarded-for') || 'unknown',
          detalhes: { tipo, detalhes, timestamp: new Date().toISOString() },
          status: 'ok',
        },
      })
    } catch {
      // DB indisponível — logar no console
      console.log('[LGPD Request]', { email, tipo, detalhes })
    }

    // TODO: Notificar DPO por email quando EMAIL_MODE=resend

    return NextResponse.json({
      ok: true,
      message: 'Solicitação recebida. Responderemos em até 15 dias úteis.',
    })
  } catch (err) {
    console.error('[lgpd/request]', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
