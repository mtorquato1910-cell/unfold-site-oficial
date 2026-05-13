/**
 * Cron de reengajamento — Automação 5 (spec §10.2).
 * Dispara 1× ao dia (06:30 BRT). Em produção, encontra leads que iniciaram a Etapa 1
 * há >1h mas nunca tiveram um DiagnosticoResults gerado, e envia email de retomada.
 *
 * Modo mock: enquanto Resend API key estiver vazia, apenas loga o que enviaria.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { sendEmail } from '@/lib/email/adapter'

const UMA_HORA_EM_MS = 60 * 60 * 1000
const SETE_DIAS_EM_MS = 7 * 24 * 60 * 60 * 1000

export async function GET(req: NextRequest) {
  // Vercel cron usa header próprio. Em chamadas externas, aceita um shared secret.
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get('authorization')
  const vercelCron = req.headers.get('x-vercel-cron')
  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && !vercelCron) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const agora = Date.now()
  const limiteSuperior = new Date(agora - UMA_HORA_EM_MS).toISOString()
  const limiteInferior = new Date(agora - SETE_DIAS_EM_MS).toISOString()

  let candidatos: Array<{ id: number | string; email: string; nome: string }> = []
  try {
    const payload = await getPayload({ config: configPromise })

    // Leads de diagnóstico criados na janela de 1h–7d que NÃO têm resultado vinculado.
    const { docs } = await payload.find({
      collection: 'leads',
      where: {
        origem: { equals: 'diagnostico' },
        createdAt: { less_than: limiteSuperior, greater_than: limiteInferior },
        diagnostico_result_id: { exists: false },
      },
      limit: 200,
    })

    candidatos = docs.map((d) => ({
      id: d.id,
      email: d.email,
      nome: d.nome,
    }))
  } catch (err) {
    console.warn('[cron/reengajamento-drop-off] DB não disponível:', err)
    return NextResponse.json({ ok: true, mode: 'db-unavailable', processados: 0 })
  }

  let enviados = 0
  for (const lead of candidatos) {
    try {
      const result = await sendEmail({
        to: lead.email,
        subject: 'Faltam 5 minutos do seu diagnóstico de growth',
        html: templateRetomada(lead.nome),
      })
      if (result.success) enviados++
    } catch (err) {
      console.error('[cron/reengajamento-drop-off] Falha ao enviar:', err)
    }
  }

  return NextResponse.json({
    ok: true,
    candidatos: candidatos.length,
    enviados,
    janela: { de: limiteInferior, ate: limiteSuperior },
  })
}

function templateRetomada(nome: string): string {
  const primeiroNome = nome.split(' ')[0] || nome
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://unfoldgrowth.com.br'
  return `<!DOCTYPE html>
<html lang="pt-BR">
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background:#001E29; color:#ffffff; padding:32px;">
  <div style="max-width:560px; margin:0 auto; background:#0a2a36; border-radius:16px; padding:32px;">
    <p style="font-size:11px; color:#6DF9C6; letter-spacing:0.15em; text-transform:uppercase; margin:0 0 16px;">Diagnóstico de Growth</p>
    <h1 style="font-size:22px; line-height:1.3; margin:0 0 16px;">${escapeHtml(primeiroNome)}, faltam só 5 minutos.</h1>
    <p style="font-size:14px; line-height:1.6; color:rgba(255,255,255,0.75);">
      Você começou seu diagnóstico mas ainda não respondeu as 12 perguntas. O resultado revela exatamente quais
      gargalos estão limitando seu crescimento — com base no método UGS aplicado à sua operação.
    </p>
    <p style="margin-top:24px;">
      <a href="${baseUrl}/diagnostico"
         style="display:inline-block; background:#6DF9C6; color:#001E29; padding:12px 24px; border-radius:10px; font-weight:600; text-decoration:none;">
        Retomar diagnóstico
      </a>
    </p>
    <p style="font-size:12px; color:rgba(255,255,255,0.45); margin-top:32px;">
      Se você não iniciou um diagnóstico, pode ignorar este email.
    </p>
  </div>
</body>
</html>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
