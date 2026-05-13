/**
 * Webhook RD Station — recebe eventos do RD (ex: lead avançou de estágio, contato sincronizado).
 *
 * Validação HMAC SHA256. Sem assinatura ou assinatura inválida → 401.
 * Em dev, define `RD_WEBHOOK_SECRET` no `.env.local` ou aceite mode `verify-disabled`.
 */

import { NextRequest, NextResponse } from 'next/server'

import { validateRDSignature } from '@/lib/crm/rd-station'

export async function POST(req: NextRequest) {
  const secret = process.env.RD_STATION_WEBHOOK_SECRET || process.env.RD_WEBHOOK_SECRET || ''
  const signature = req.headers.get('x-rd-signature')
  const rawBody = await req.text()

  if (secret && !validateRDSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: unknown
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // TODO Sprint 5: persistir como DiagnosticoEvents.event_name='rd_webhook'.
  console.log('[webhook/rd-station] evento recebido:', payload)

  return NextResponse.json({ ok: true })
}
