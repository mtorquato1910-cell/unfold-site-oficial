/**
 * Notificação interna do time comercial (Gabriel).
 * Disparada quando um lead com Fit Alto ou Médio conclui o Diagnóstico (Automação 3 da spec §10.2).
 *
 * Canais:
 *   - email (sempre, via adapter)
 *   - Slack webhook (se `SLACK_WEBHOOK_GABRIEL` configurado)
 *
 * Idempotência: o consumer (afterChange do DiagnosticoResults) só dispara se `notificado_at` estiver vazio.
 */

import { sendEmail } from '@/lib/email/adapter'
import { LABEL_FAIXA_FIT } from '@/lib/scoring/textos'
import type { FaixaFit } from '@/lib/scoring/types'

export interface NotificacaoGabriel {
  nome_lead: string
  email_lead: string
  empresa?: string
  setor?: string
  faixa_fit: FaixaFit
  score_consolidado: number
  score_fit: number
  padroes_exibidos: string[]
  url_resultado: string
}

function templateEmail(n: NotificacaoGabriel): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://unfoldgrowth.com.br'
  return `<!DOCTYPE html>
<html lang="pt-BR">
<body style="font-family:Arial,sans-serif;background:#001E29;color:#E7E7E7;padding:32px;">
  <div style="max-width:600px;margin:0 auto;background:#0a2a36;border-radius:12px;padding:32px;">
    <p style="font-size:11px;color:#6DF9C6;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 16px;">
      Novo lead — ${LABEL_FAIXA_FIT[n.faixa_fit]}
    </p>
    <h1 style="font-size:22px;margin:0 0 16px;">${escapeHtml(n.nome_lead)} · ${escapeHtml(n.empresa || '—')}</h1>
    <table style="width:100%;border-spacing:0;font-size:14px;color:rgba(255,255,255,0.85);">
      <tr><td style="padding:6px 0;color:rgba(255,255,255,0.5);">Setor</td><td>${escapeHtml(n.setor || '—')}</td></tr>
      <tr><td style="padding:6px 0;color:rgba(255,255,255,0.5);">Score consolidado</td><td><strong>${n.score_consolidado}/100</strong></td></tr>
      <tr><td style="padding:6px 0;color:rgba(255,255,255,0.5);">Score Fit</td><td><strong>${n.score_fit.toFixed(1)}</strong> (${LABEL_FAIXA_FIT[n.faixa_fit]})</td></tr>
      <tr><td style="padding:6px 0;color:rgba(255,255,255,0.5);">Padrões</td><td>${n.padroes_exibidos.join(' · ')}</td></tr>
      <tr><td style="padding:6px 0;color:rgba(255,255,255,0.5);">Email do lead</td><td><a href="mailto:${encodeURIComponent(n.email_lead)}" style="color:#93BAFB;">${escapeHtml(n.email_lead)}</a></td></tr>
    </table>
    <p style="margin-top:24px;">
      <a href="${baseUrl}${n.url_resultado}"
         style="display:inline-block;background:#6DF9C6;color:#001E29;padding:12px 24px;border-radius:10px;font-weight:600;text-decoration:none;">
        Ver diagnóstico completo
      </a>
    </p>
  </div>
</body>
</html>`
}

async function postSlack(webhook: string, n: NotificacaoGabriel): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://unfoldgrowth.com.br'
  const payload = {
    text: `*Novo lead — ${LABEL_FAIXA_FIT[n.faixa_fit]}*`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Novo lead — ${LABEL_FAIXA_FIT[n.faixa_fit]}*\n*${n.nome_lead}* · ${n.empresa || '—'}\nScore: *${n.score_consolidado}/100* · Fit: *${n.score_fit.toFixed(1)}*\nPadrões: ${n.padroes_exibidos.join(' · ')}`,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Ver diagnóstico' },
            url: `${baseUrl}${n.url_resultado}`,
          },
        ],
      },
    ],
  }
  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.error('[notifyGabriel] Slack:', err)
  }
}

/**
 * Notifica o time interno sobre um lead Fit Alto/Médio.
 * Lê email do destinatário do `SiteSettings.email_notificacoes` (com fallback no env).
 */
export async function notifyGabriel(n: NotificacaoGabriel): Promise<{ success: boolean; canais: string[] }> {
  const canais: string[] = []

  // Resolve destinatário a partir do SiteSettings global.
  let to: string | undefined = process.env.GABRIEL_NOTIFY_EMAIL
  try {
    const { getPayload } = await import('payload')
    const configPromise = await import('@payload-config')
    const payload = await getPayload({ config: configPromise.default })
    const settings = (await payload.findGlobal({ slug: 'site-settings' })) as {
      email_notificacoes?: string
    }
    if (settings.email_notificacoes) to = settings.email_notificacoes
  } catch {
    /* usa fallback env */
  }

  if (to) {
    const r = await sendEmail({
      to,
      subject: `[Diagnóstico] Novo lead — ${LABEL_FAIXA_FIT[n.faixa_fit]} · ${n.nome_lead}`,
      html: templateEmail(n),
      replyTo: n.email_lead,
    })
    if (r.success) canais.push(`email(${r.mode})`)
  }

  const slack = process.env.SLACK_WEBHOOK_GABRIEL
  if (slack) {
    await postSlack(slack, n)
    canais.push('slack')
  }

  return { success: canais.length > 0, canais }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
