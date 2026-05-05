/**
 * Job: notifica Slack quando há lead novo com score alto da Calculadora.
 * Marca como notificado para não repetir.
 */

import { getPayload } from 'payload'
import config from '@payload-config'
import { dispatchSlack } from '@/lib/webhooks/dispatcher'

const HIGH_SCORE = 70

export async function notifyHighScoreLeads(): Promise<{ checked: number; notified: number }> {
  let checked = 0
  let notified = 0

  const slackUrl = process.env.SLACK_WEBHOOK_URL
  if (!slackUrl) return { checked: 0, notified: 0 }

  try {
    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'calculadora-results',
      where: {
        and: [{ score: { greater_than_equal: HIGH_SCORE } }, { notified_slack: { equals: false } }],
      },
      limit: 10,
      sort: '-createdAt',
    })

    for (const r of result.docs as any[]) {
      checked++
      const text = `🔥 Lead alto fit (Calculadora): *${r.nome}* (${r.empresa}) — score ${r.score}/100\n${r.email}${r.cargo ? ` · ${r.cargo}` : ''}`
      const sent = await dispatchSlack(slackUrl, text)
      if (sent.ok) {
        await payload.update({
          collection: 'calculadora-results',
          id: r.id,
          data: { notified_slack: true } as any,
        })
        notified++
      }
    }
  } catch (err) {
    console.error('[notify-high-score-leads] erro:', err)
  }

  return { checked, notified }
}
