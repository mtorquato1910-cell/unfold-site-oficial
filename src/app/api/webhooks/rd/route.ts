import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * Webhook RD Station — esqueleto pronto para integração.
 * Valida assinatura HMAC antes de processar.
 * Quando credenciais chegarem: configurar RD_STATION_WEBHOOK_SECRET.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-rdstation-signature') || ''
    const secret = process.env.RD_STATION_WEBHOOK_SECRET

    // Validar assinatura se secret configurado
    if (secret && signature) {
      const expected = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex')

      if (`sha256=${expected}` !== signature) {
        console.warn('[webhook/rd] Assinatura inválida')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const event = JSON.parse(body)
    console.log('[webhook/rd] Evento recebido:', event.event_type || 'unknown', event)

    // TODO: Processar eventos (lead convertido, oportunidade criada, etc.)
    // switch (event.event_type) {
    //   case 'CONVERTED': ...
    //   case 'OPPORTUNITY_CREATED': ...
    // }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[webhook/rd]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
