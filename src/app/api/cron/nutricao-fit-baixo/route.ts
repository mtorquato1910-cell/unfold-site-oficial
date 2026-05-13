/**
 * Cron de nutrição para leads Fit Baixo / Desfit que NÃO agendaram em 24h após conclusão.
 * Automação 4 da spec §10.2.
 *
 * Estratégia simples (Sprint 4): dispara 1 email de início de nutrição.
 * Sprint 5+ pode evoluir para sequência multi-email.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { sendEmail } from '@/lib/email/adapter'

const VINTE_E_QUATRO_HORAS = 24 * 60 * 60 * 1000
const SETE_DIAS = 7 * 24 * 60 * 60 * 1000

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get('authorization')
  const vercelCron = req.headers.get('x-vercel-cron')
  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && !vercelCron) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const agora = Date.now()
  const limiteSuperior = new Date(agora - VINTE_E_QUATRO_HORAS).toISOString()
  const limiteInferior = new Date(agora - SETE_DIAS).toISOString()

  let candidatos: Array<{ id: number | string; email: string; hash?: string }> = []
  try {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'diagnostico-results',
      where: {
        and: [
          { faixa_fit: { in: ['fit-baixo', 'desfit'] } },
          { agendou: { not_equals: true } },
          { data_conclusao: { less_than: limiteSuperior, greater_than: limiteInferior } },
          { nutricao_enviada_at: { exists: false } },
        ],
      },
      limit: 100,
    })
    candidatos = docs.map((d) => ({
      id: d.id,
      email: d.lead_email as string,
      hash: (d as { url_resultado_hash?: string }).url_resultado_hash,
    }))
  } catch (err) {
    console.warn('[cron/nutricao-fit-baixo] DB não disponível:', err)
    return NextResponse.json({ ok: true, mode: 'db-unavailable', processados: 0 })
  }

  let enviados = 0
  // Marca ANTES do envio (Débito 5 — race condition). Se o update falha, não envia.
  // Em caso de email falhar após o update, perdemos UM envio (degradação aceita).
  let payloadCMS: Awaited<ReturnType<typeof getPayload>> | null = null
  try {
    payloadCMS = await getPayload({ config: configPromise })
  } catch {
    /* sem DB, ainda pode enviar emails mock */
  }

  for (const cand of candidatos) {
    if (payloadCMS) {
      try {
        await payloadCMS.update({
          collection: 'diagnostico-results',
          id: cand.id,
          data: { nutricao_enviada_at: new Date().toISOString() } as never,
        })
      } catch (e) {
        console.warn('[cron/nutricao-fit-baixo] update flag:', e)
        continue
      }
    }
    try {
      const r = await sendEmail({
        to: cand.email,
        subject: 'Como operações com vendas complexas se estruturam',
        html: templateNutricao(cand.hash),
      })
      if (r.success) enviados++
    } catch (err) {
      console.error('[cron/nutricao-fit-baixo] email:', err)
    }
  }

  return NextResponse.json({ ok: true, candidatos: candidatos.length, enviados })
}

function templateNutricao(hash?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://unfoldgrowth.com.br'
  const link = hash ? `${baseUrl}/diagnostico/r/${hash}` : `${baseUrl}/insights`
  return `<!DOCTYPE html>
<html lang="pt-BR">
<body style="font-family:-apple-system,Arial,sans-serif;background:#001E29;color:#E7E7E7;padding:32px;">
  <div style="max-width:560px;margin:0 auto;background:#0a2a36;border-radius:12px;padding:32px;">
    <p style="font-size:11px;color:#6DF9C6;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 16px;">Unfold Growth</p>
    <h1 style="font-size:22px;line-height:1.3;margin:0 0 16px;">Operação que cresce não nasce pronta.</h1>
    <p style="font-size:14px;line-height:1.6;color:rgba(255,255,255,0.75);">
      Você fez o diagnóstico — agora vale a pena olhar como outras operações com vendas complexas
      destravaram crescimento previsível. Esses são os primeiros conteúdos que selecionamos pra você.
    </p>
    <p style="margin-top:24px;">
      <a href="${link}" style="display:inline-block;background:#6DF9C6;color:#001E29;padding:12px 24px;border-radius:10px;font-weight:600;text-decoration:none;">
        Ver seu diagnóstico
      </a>
    </p>
  </div>
</body>
</html>`
}
