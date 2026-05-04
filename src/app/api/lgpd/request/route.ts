import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { z } from 'zod'
import { sendEmail } from '../../../../lib/email/adapter'

const schema = z.object({
  email: z.string().email(),
  tipo: z.enum(['access', 'correction', 'deletion', 'portability', 'revocation', 'opposition']),
  detalhes: z.string().optional(),
})

const tipoLabels: Record<string, string> = {
  access: 'Acesso aos dados',
  correction: 'Correção de dados',
  deletion: 'Exclusão de dados',
  portability: 'Portabilidade',
  revocation: 'Revogação de consentimento',
  opposition: 'Oposição ao tratamento',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 })
    }

    const { email, tipo, detalhes } = parsed.data
    const ip = req.headers.get('x-forwarded-for') || 'unknown'

    // Registrar no audit log
    try {
      const payload = await getPayload({ config: configPromise })
      await payload.create({
        collection: 'audit-log',
        data: {
          acao: 'lgpd.request',
          entidade: `lgpd-request:${email}`,
          actor_email: email,
          ip,
          detalhes: JSON.stringify({ tipo, detalhes, timestamp: new Date().toISOString() }),
          status: 'ok',
        },
      })
    } catch {
      console.log('[LGPD Request]', { email, tipo, detalhes })
    }

    // Notificar DPO
    const dpEmail = process.env.DPO_EMAIL || process.env.RESEND_FROM_EMAIL
    if (dpEmail) {
      await sendEmail({
        to: dpEmail,
        subject: `[LGPD] Solicitação de ${tipoLabels[tipo] || tipo} — ${email}`,
        html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; padding: 32px; border: 1px solid #e0e0e0;">
    <h2 style="color: #001E29;">Solicitação LGPD recebida</h2>
    <p><strong>Email do solicitante:</strong> ${email}</p>
    <p><strong>Tipo de solicitação:</strong> ${tipoLabels[tipo] || tipo}</p>
    <p><strong>Detalhes:</strong> ${detalhes || '(sem detalhes adicionais)'}</p>
    <p><strong>IP:</strong> ${ip}</p>
    <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
    <hr style="margin: 24px 0; border: none; border-top: 1px solid #e0e0e0;">
    <p style="color: #666; font-size: 12px;">Prazo legal para resposta: 15 dias úteis (Art. 18, LGPD)</p>
  </div>
</body>
</html>`,
      })
    }

    return NextResponse.json({
      ok: true,
      message: 'Solicitação recebida. Responderemos em até 15 dias úteis.',
    })
  } catch (err) {
    console.error('[lgpd/request]', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
