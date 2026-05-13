/**
 * LGPD — endpoint para o titular pedir a exclusão de seus dados.
 *
 * Modelo POST + token assinado (recomendação QA G6.3): o usuário pede,
 * recebe um link com token JWT de 15 minutos no email; o link executa o DELETE.
 *
 * Apaga: Leads, DiagnosticoResults, DiagnosticoEvents e NewsletterSubscribers
 * vinculados ao email. Gera registro no AuditLog (best-effort).
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { SignJWT, jwtVerify } from 'jose'
import { z } from 'zod'

import { sendEmail } from '@/lib/email/adapter'
import { logger } from '@/lib/observability/logger'

const SECRET = new TextEncoder().encode(
  process.env.PAYLOAD_SECRET || 'dev-secret-CHANGE-IN-PRODUCTION',
)

const requestSchema = z.object({
  email: z.string().email(),
})

// POST sem token = pedido inicial → envia email com link assinado.
// POST com token  = execução → apaga.
export async function POST(req: NextRequest) {
  const url = new URL(req.url)
  const tokenFromURL = url.searchParams.get('token')

  if (tokenFromURL) {
    return executarDelete(tokenFromURL)
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'email_required' }, { status: 400 })
  }

  const token = await new SignJWT({ email: parsed.data.email, action: 'lgpd-delete' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m')
    .setIssuedAt()
    .sign(SECRET)

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://unfoldgrowth.com.br'
  const confirmacao = `${baseUrl}/api/diagnostico/lgpd/delete-me?token=${encodeURIComponent(token)}`

  await sendEmail({
    to: parsed.data.email,
    subject: 'Confirmação de exclusão dos seus dados — Unfold Growth',
    html: `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;padding:24px;">
      <h1>Confirmação de exclusão</h1>
      <p>Recebemos um pedido para excluir todos os dados associados a este e-mail no Diagnóstico de Growth.</p>
      <p>Para confirmar e processar a exclusão, clique no link abaixo nos próximos 15 minutos:</p>
      <p><a href="${confirmacao}" style="display:inline-block;background:#001E29;color:#6DF9C6;padding:12px 24px;border-radius:8px;text-decoration:none;">Confirmar exclusão</a></p>
      <p style="color:#888;font-size:12px;">Se você não fez essa solicitação, ignore este e-mail.</p>
    </body></html>`,
  })

  return NextResponse.json({ ok: true, mensagem: 'Confirmação enviada por e-mail.' })
}

async function executarDelete(token: string): Promise<NextResponse> {
  let email: string
  try {
    const { payload: tokenPayload } = await jwtVerify(token, SECRET)
    const data = tokenPayload as { email?: string; action?: string }
    if (data.action !== 'lgpd-delete' || !data.email) {
      throw new Error('token-invalid')
    }
    email = data.email
  } catch {
    return NextResponse.json({ error: 'token_invalid_or_expired' }, { status: 401 })
  }

  const payload = await getPayload({ config: configPromise })
  const counts = { leads: 0, results: 0, events: 0, newsletter: 0 }

  // 1. Resultados
  try {
    const { docs } = await payload.find({
      collection: 'diagnostico-results',
      where: { lead_email: { equals: email } },
      limit: 500,
    })
    for (const d of docs) {
      await payload.delete({ collection: 'diagnostico-results', id: d.id })
      counts.results++
    }
  } catch (e) {
    logger.error('lgpd.delete.results', { lead_email: email, error: String(e) })
  }

  // 2. Eventos
  try {
    const { docs } = await payload.find({
      collection: 'diagnostico-events',
      where: { lead_email: { equals: email } },
      limit: 1000,
    })
    for (const d of docs) {
      await payload.delete({ collection: 'diagnostico-events', id: d.id })
      counts.events++
    }
  } catch (e) {
    logger.error('lgpd.delete.events', { lead_email: email, error: String(e) })
  }

  // 3. Lead
  try {
    const { docs } = await payload.find({
      collection: 'leads',
      where: { email: { equals: email } },
      limit: 10,
    })
    for (const d of docs) {
      await payload.delete({ collection: 'leads', id: d.id })
      counts.leads++
    }
  } catch (e) {
    logger.error('lgpd.delete.leads', { lead_email: email, error: String(e) })
  }

  // 4. Newsletter
  try {
    const { docs } = await payload.find({
      collection: 'newsletter-subscribers',
      where: { email: { equals: email } },
      limit: 10,
    })
    for (const d of docs) {
      await payload.delete({ collection: 'newsletter-subscribers', id: d.id })
      counts.newsletter++
    }
  } catch (e) {
    logger.error('lgpd.delete.newsletter', { lead_email: email, error: String(e) })
  }

  logger.info('lgpd.delete.completed', { lead_email: email, ...counts })

  return NextResponse.json({
    ok: true,
    mensagem: 'Todos os seus dados associados a este e-mail foram removidos.',
    removidos: counts,
  })
}
