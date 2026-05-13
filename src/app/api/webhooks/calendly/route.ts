/**
 * Webhook Calendly — atualiza `agendou` e `slot_agendado` no DiagnosticoResults
 * quando o lead confirma agendamento. Em cancelamento, dispara Automação 6 (reengajamento leve).
 *
 * Validação HMAC SHA256 conforme docs Calendly.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { validateCalendlySignature } from '@/lib/calendar/calendly'
import { sendEmail } from '@/lib/email/adapter'
import { trackEventServer } from '@/lib/analytics/diagnostico-events'
import { logger } from '@/lib/observability/logger'

interface CalendlyInviteePayload {
  event: 'invitee.created' | 'invitee.canceled' | string
  payload: {
    email?: string
    name?: string
    uri?: string // URI única do invitee — usada para dedup de redelivery (G4.7).
    event?: {
      start_time?: string
      end_time?: string
      uri?: string
    }
    scheduled_event?: {
      start_time?: string
      end_time?: string
      uri?: string
    }
  }
}

/**
 * Retorna o identificador único do evento Calendly para dedup.
 * Prefere payload.uri (invitee), depois scheduled_event.uri, depois event.uri.
 */
function extractEventUri(data: CalendlyInviteePayload): string | undefined {
  return (
    data.payload?.uri ||
    data.payload?.scheduled_event?.uri ||
    data.payload?.event?.uri
  )
}

export async function POST(req: NextRequest) {
  const signingKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY || ''
  const signature = req.headers.get('calendly-webhook-signature')
  const rawBody = await req.text()

  if (signingKey && !validateCalendlySignature(rawBody, signature, signingKey)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let data: CalendlyInviteePayload
  try {
    data = JSON.parse(rawBody) as CalendlyInviteePayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const email = data.payload?.email
  if (!email) {
    return NextResponse.json({ ok: true, mode: 'no-email-skipped' })
  }

  const eventUri = extractEventUri(data)
  const startTime =
    data.payload?.scheduled_event?.start_time || data.payload?.event?.start_time

  // ── Dedup por event_uri (G4.7 do QA) ─────────────────────────────────
  // Calendly faz redelivery em 5xx; sem dedup, dispara emails duplicados.
  if (eventUri) {
    try {
      const payload = await getPayload({ config: configPromise })
      const dup = await payload.find({
        collection: 'diagnostico-events',
        where: {
          event_name: { equals: 'agendamento_concluido' },
          // Filtra pelo URI no campo metadata (JSON). Em SQLite/Postgres o operador `like` no JSON
          // funciona em ambos quando há `index: true` na coluna — DiagnosticoEvents não tem,
          // então usamos uma busca por email + JSON contém.
          lead_email: { equals: email },
        },
        limit: 50,
      })
      const already = dup.docs.some((d) => {
        const md = (d as { metadata?: unknown }).metadata
        if (md && typeof md === 'object' && 'calendly_event_uri' in md) {
          return (md as { calendly_event_uri?: string }).calendly_event_uri === eventUri
        }
        if (typeof md === 'string') {
          try {
            const parsed = JSON.parse(md) as { calendly_event_uri?: string }
            return parsed?.calendly_event_uri === eventUri
          } catch {
            return false
          }
        }
        return false
      })
      if (already) {
        logger.info('webhook.calendly.duplicate_skipped', {
          lead_email: email,
          meta: { event: data.event, uri: eventUri },
        })
        return NextResponse.json({ ok: true, mode: 'duplicate-skipped' })
      }
    } catch {
      /* falha aqui não impede o processamento — apenas não ganha dedup */
    }
  }

  try {
    const payload = await getPayload({ config: configPromise })

    // Encontra o resultado mais recente do lead pelo email.
    const { docs } = await payload.find({
      collection: 'diagnostico-results',
      where: { lead_email: { equals: email } },
      sort: '-createdAt',
      limit: 1,
    })

    if (docs.length > 0) {
      const id = docs[0].id
      const agendou = data.event === 'invitee.created'
      const hash = (docs[0] as { url_resultado_hash?: string }).url_resultado_hash
      await payload.update({
        collection: 'diagnostico-results',
        id,
        data: {
          agendou,
          slot_agendado: startTime ?? null,
        },
      })

      // Evento spec §10.3: agendamento concluído (criado) ou cancelado.
      // metadata.calendly_event_uri é a chave de dedup para redelivery (G4.7).
      void trackEventServer({
        event_name: 'agendamento_concluido',
        lead_email: email,
        result_hash: hash,
        metadata: {
          event: data.event,
          start_time: startTime,
          calendly_event_uri: eventUri,
        },
      })
    }
  } catch (err) {
    console.error('[webhook/calendly] erro persistindo:', err)
  }

  // Automação 6 — cancelamento: dispara reengajamento leve.
  if (data.event === 'invitee.canceled' && email) {
    const nome = data.payload?.name || 'visitante'
    await sendEmail({
      to: email,
      subject: 'Tudo bem em remarcar?',
      html: `<p>Olá ${escapeHtml(nome.split(' ')[0] || nome)},</p>
<p>Vimos que o agendamento foi cancelado. Se preferir, podemos remarcar ou enviar materiais antes da conversa — qual faz mais sentido pra você agora?</p>
<p>— Time Unfold Growth</p>`,
    }).catch((e) => console.error('[webhook/calendly] email cancel:', e))
  }

  return NextResponse.json({ ok: true })
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
