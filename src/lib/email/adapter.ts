/**
 * Adapter de Email com 2 modos:
 * - mock-console: loga no console + grava em audit-log (dev sem key Resend)
 * - resend: envio real via Resend (quando key chegar)
 *
 * Controlado por EMAIL_MODE env var (default: mock-console)
 */

export type EmailMode = 'mock-console' | 'resend'

export interface EmailPayload {
  to: string
  subject: string
  html: string
  from?: string
  replyTo?: string
}

export interface EmailResult {
  success: boolean
  mode: EmailMode
  message_id?: string
  error?: string
}

function getMode(): EmailMode {
  return (process.env.EMAIL_MODE as EmailMode) === 'resend' ? 'resend' : 'mock-console'
}

async function sendViaResend(email: EmailPayload): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY não configurada')

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: email.from || 'Unfold Growth <noreply@unfoldgrowth.com.br>',
      to: [email.to],
      subject: email.subject,
      html: email.html,
      reply_to: email.replyTo,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Resend error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return { success: true, mode: 'resend', message_id: data.id }
}

function mockEmail(email: EmailPayload): EmailResult {
  console.log('[EMAIL MOCK] Email que seria enviado:', {
    para: email.to,
    assunto: email.subject,
    html_preview: email.html.substring(0, 200) + '...',
  })
  return { success: true, mode: 'mock-console', message_id: `mock-${Date.now()}` }
}

export async function sendEmail(email: EmailPayload): Promise<EmailResult> {
  const mode = getMode()
  try {
    if (mode === 'resend') return await sendViaResend(email)
    return mockEmail(email)
  } catch (err) {
    console.error('[Email Adapter] Erro ao enviar:', err)
    return { success: false, mode, error: err instanceof Error ? err.message : String(err) }
  }
}

// Templates de email HTML

export function templateConfirmacaoEtapa1(nome: string, empresa: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Diagnóstico Iniciado</title></head>
<body style="font-family: Arial, sans-serif; background: #001E29; color: #E7E7E7; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #0a2a35; border-radius: 12px; padding: 40px; border: 1px solid #1a3a45;">
    <p style="font-family: monospace; font-size: 11px; color: #4CAFBF; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 20px;">Unfold Growth</p>
    <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 16px; color: #E7E7E7;">Seu diagnóstico foi iniciado, ${nome}!</h1>
    <p style="color: #9db5c0; line-height: 1.7; margin-bottom: 24px;">
      Recebemos os dados da <strong style="color: #E7E7E7;">${empresa}</strong>. Agora é só responder as 12 perguntas do diagnóstico para receber seu resultado personalizado.
    </p>
    <p style="color: #6a8a94; font-size: 13px; margin-top: 40px; border-top: 1px solid #1a3a45; padding-top: 20px;">
      © ${new Date().getFullYear()} Unfold Growth — Método UGS
    </p>
  </div>
</body>
</html>`
}

export function templateResultadoDiagnostico(
  nome: string,
  scoreTotal: number,
  nivelFit: string,
  headline: string,
): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Seu Diagnóstico UGS</title></head>
<body style="font-family: Arial, sans-serif; background: #001E29; color: #E7E7E7; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #0a2a35; border-radius: 12px; padding: 40px; border: 1px solid #1a3a45;">
    <p style="font-family: monospace; font-size: 11px; color: #4CAFBF; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 20px;">Seu resultado</p>
    <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">${nome}, seu score é <span style="color: #4CAFBF;">${scoreTotal}/100</span></h1>
    <p style="color: #4CAFBF; font-family: monospace; text-transform: uppercase; font-size: 11px; margin-bottom: 24px;">Fit: ${nivelFit}</p>
    <p style="color: #E7E7E7; font-size: 18px; font-weight: 600; margin-bottom: 16px;">${headline}</p>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://unfoldgrowth.com.br'}/diagnostico"
       style="display: inline-block; background: #4CAFBF; color: #001E29; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
      Ver resultado completo
    </a>
    <p style="color: #6a8a94; font-size: 13px; margin-top: 40px; border-top: 1px solid #1a3a45; padding-top: 20px;">
      © ${new Date().getFullYear()} Unfold Growth
    </p>
  </div>
</body>
</html>`
}

export function templateResultadoCalculadora(nome: string, receita: string, roi: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Sua Projeção de Tráfego</title></head>
<body style="font-family: Arial, sans-serif; background: #001E29; color: #E7E7E7; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #0a2a35; border-radius: 12px; padding: 40px; border: 1px solid #1a3a45;">
    <p style="font-family: monospace; font-size: 11px; color: #4CAFBF; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 20px;">Calculadora de Tráfego</p>
    <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">${nome}, sua projeção está pronta!</h1>
    <div style="background: #001E29; border-radius: 8px; padding: 20px; margin: 24px 0; display: flex; gap: 20px;">
      <div><p style="font-family: monospace; font-size: 10px; color: #6a8a94; text-transform: uppercase;">Receita projetada/mês</p><p style="font-size: 22px; font-weight: 700; color: #3DDC84;">R$ ${receita}</p></div>
      <div><p style="font-family: monospace; font-size: 10px; color: #6a8a94; text-transform: uppercase;">ROI estimado</p><p style="font-size: 22px; font-weight: 700; color: #3DDC84;">${roi}</p></div>
    </div>
    <p style="color: #6a8a94; font-size: 13px; margin-top: 40px; border-top: 1px solid #1a3a45; padding-top: 20px;">
      © ${new Date().getFullYear()} Unfold Growth
    </p>
  </div>
</body>
</html>`
}
