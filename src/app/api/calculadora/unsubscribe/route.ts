/**
 * GET /api/calculadora/unsubscribe?t={token}&e={email}
 *
 * Endpoint público de unsubscribe (LGPD/ADR-9). Marca `consent.withdrawn = true`
 * no `calculadora-results` correspondente, o que pausa o fluxo de nutrição
 * (cron S5.5 verifica essa flag).
 *
 * Retorna página HTML simples confirmando.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { normalizeEmail } from '@/lib/utils/email'

const TOKEN_RE = /^[a-f0-9]{32}$/

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const token = url.searchParams.get('t') || ''
  const email = normalizeEmail(url.searchParams.get('e') || '')
  if (!TOKEN_RE.test(token) || !email) {
    return new NextResponse(htmlPage('Link inválido.', false), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  try {
    const payload = await getPayload({ config: configPromise })
    const found = await payload.find({
      collection: 'calculadora-results',
      where: { calc_url_resultado: { equals: token } },
      limit: 1,
    })
    const doc = found.docs[0] as unknown as
      | { id: string | number; email?: string; consent?: { given?: boolean } }
      | undefined
    if (!doc) {
      return new NextResponse(htmlPage('Inscrição não encontrada.', false), {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }
    await payload.update({
      collection: 'calculadora-results',
      id: doc.id,
      data: {
        consent: {
          ...(doc as { consent?: object }).consent,
          withdrawn: true,
          withdrawnAt: new Date().toISOString(),
        },
        nutricao_step_atual: 'pausada_consent',
      } as never,
    })
  } catch (err) {
    console.error('[calculadora/unsubscribe] erro:', err)
    return new NextResponse(htmlPage('Erro temporário. Tente novamente em alguns minutos.', false), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  return new NextResponse(htmlPage('Inscrição cancelada com sucesso.', true), {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex',
    },
  })
}

function htmlPage(message: string, sucesso: boolean): string {
  const cor = sucesso ? '#16a34a' : '#dc2626'
  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>Cancelamento de inscrição · Unfold</title>
<meta name="robots" content="noindex,nofollow"></head>
<body style="font-family:system-ui,Arial,sans-serif;background:#001E29;color:#E7E7E7;padding:60px 20px;margin:0;">
  <div style="max-width:520px;margin:0 auto;background:#0a2a35;border:1px solid #1a3a45;border-radius:12px;padding:32px;text-align:center;">
    <p style="color:${cor};font-family:monospace;text-transform:uppercase;font-size:11px;letter-spacing:3px;margin:0 0 16px;">Calculadora · Unfold</p>
    <h1 style="font-size:22px;margin:0 0 12px;">${message}</h1>
    <p style="color:#9db5c0;font-size:14px;">Você não receberá mais e-mails da Calculadora de Performance.</p>
    <a href="/" style="display:inline-block;margin-top:24px;color:#4CAFBF;text-decoration:underline;font-size:13px;">Voltar para o site</a>
  </div>
</body></html>`
}
