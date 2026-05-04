import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-rdstation-signature') || ''
    const secret = process.env.RD_STATION_WEBHOOK_SECRET

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
    const eventType: string = event.event_type || 'unknown'
    console.log('[webhook/rd] Evento:', eventType)

    const payload = await getPayload({ config: configPromise })

    switch (eventType) {
      case 'CONVERTED': {
        const contact = event.leads?.[0]
        if (contact?.email) {
          await payload.create({
            collection: 'audit-log',
            data: {
              acao: 'rd.webhook.converted',
              entidade: `rd-contact:${contact.email}`,
              actor_email: contact.email,
              ip: req.headers.get('x-forwarded-for') || 'webhook',
              detalhes: JSON.stringify({ event_type: eventType, contact_name: contact.name }),
              status: 'ok',
            },
          })

          // Atualiza rd_sync_status do lead para 'synced'
          const leads = await payload.find({
            collection: 'leads',
            where: { email: { equals: contact.email } },
            limit: 1,
          })
          if (leads.docs.length > 0) {
            await payload.update({
              collection: 'leads',
              id: leads.docs[0].id,
              data: { rd_sync_status: 'synced', rd_contact_id: contact.uuid || contact.id },
            })
          }
        }
        break
      }

      case 'OPPORTUNITY_CREATED': {
        const opportunity = event.opportunity || {}
        await payload.create({
          collection: 'audit-log',
          data: {
            acao: 'rd.webhook.opportunity_created',
            entidade: `rd-opportunity:${opportunity.id || 'unknown'}`,
            actor_email: opportunity.contact?.email || 'webhook',
            ip: req.headers.get('x-forwarded-for') || 'webhook',
            detalhes: JSON.stringify({ opportunity_name: opportunity.name, stage: opportunity.stage }),
            status: 'ok',
          },
        })
        break
      }

      default:
        console.log('[webhook/rd] Evento não tratado:', eventType, event)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[webhook/rd]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
