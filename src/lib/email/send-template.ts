/**
 * sendEmailTemplate — wrapper sobre o adapter que:
 * - Renderiza o HTML do template
 * - Sanitiza variáveis (escape)
 * - Loga em EmailLogs
 * - Suporta retry leve (1 retry imediato)
 * - Fire-and-forget: caller não precisa await se não quiser
 */

import { sendEmail, type EmailResult } from './adapter'

/** Escapa HTML simples para evitar XSS em variáveis injetadas */
export function escapeHtml(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Substitui {{var}} por escapeHtml(vars[var]) */
export function renderTemplate(html: string, vars: Record<string, unknown>): string {
  return html.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
    const value = key.split('.').reduce((acc: any, k: string) => acc?.[k], vars)
    return escapeHtml(value)
  })
}

export type SendTemplateOptions = {
  to: string
  subject: string
  html: string
  templateSlug?: string
  variables?: Record<string, unknown>
  from?: string
  replyTo?: string
  /** Se true, não loga em EmailLogs (uso em testes) */
  skipLog?: boolean
}

async function logToPayload(
  opts: SendTemplateOptions,
  result: EmailResult,
  attempt: number,
): Promise<void> {
  try {
    const { getPayload } = await import('payload')
    const config = (await import('../../../payload.config')).default
    const payload = await getPayload({ config })
    await payload.create({
      collection: 'email-logs',
      data: {
        to: opts.to,
        from: opts.from,
        subject: opts.subject,
        templateSlug: opts.templateSlug,
        status: result.success ? 'sent' : 'failed',
        providerMessageId: result.message_id,
        mode: result.mode,
        errorMessage: result.error,
        variables: opts.variables ?? {},
        attempts: attempt,
        sentAt: result.success ? new Date().toISOString() : undefined,
      },
    })
  } catch (err) {
    console.error('[send-template] Falha ao gravar EmailLog:', err)
  }
}

/**
 * Envia email com template + log + retry (1x).
 * Falhas NÃO lançam exceção (caller pode fazer fire-and-forget).
 */
export async function sendEmailTemplate(opts: SendTemplateOptions): Promise<EmailResult> {
  const html = opts.variables ? renderTemplate(opts.html, opts.variables) : opts.html

  let attempt = 1
  let result = await sendEmail({
    to: opts.to,
    from: opts.from,
    replyTo: opts.replyTo,
    subject: opts.subject,
    html,
  })

  if (!result.success) {
    attempt = 2
    await new Promise((r) => setTimeout(r, 1000))
    result = await sendEmail({
      to: opts.to,
      from: opts.from,
      replyTo: opts.replyTo,
      subject: opts.subject,
      html,
    })
  }

  if (!opts.skipLog) {
    await logToPayload(opts, result, attempt)
  }

  return result
}
