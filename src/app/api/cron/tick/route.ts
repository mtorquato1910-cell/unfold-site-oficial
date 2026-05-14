import { NextRequest, NextResponse } from 'next/server'
import { syncPendingLeadsToRD } from '@/lib/jobs/sync-leads-rd'
import { notifyHighScoreLeads } from '@/lib/jobs/notify-high-score-leads'
import { purgeExpiredCalculadora } from '@/lib/jobs/retention-purge'
import { processarNutricaoPosCalculadora } from '@/lib/jobs/calc-nutricao'

/**
 * Cron multiplexador — Vercel Cron chama 1x/dia.
 * Executa todos os jobs registrados em sequência.
 *
 * Headers de segurança: aceita apenas chamadas com:
 * - Vercel Cron header: x-vercel-cron-signature (auto)
 * - OU CRON_SECRET via ?secret=XXX
 */
export async function GET(req: NextRequest) {
  const isVercelCron = req.headers.get('x-vercel-cron-signature')
  const url = new URL(req.url)
  const secret = url.searchParams.get('secret')
  const expectedSecret = process.env.CRON_SECRET

  // Em prod: aceita apenas Vercel Cron OU secret válido
  if (process.env.NODE_ENV === 'production' && !isVercelCron) {
    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
  }

  const started = Date.now()
  const results: Record<string, unknown> = {}

  // Job 1: sync leads pendentes para RD Station
  try {
    results.syncLeadsRD = await syncPendingLeadsToRD()
  } catch (err: any) {
    results.syncLeadsRD = { error: err?.message || 'unknown' }
  }

  // Job 2: notificar Slack de leads high-score
  try {
    results.notifyHighScore = await notifyHighScoreLeads()
  } catch (err: any) {
    results.notifyHighScore = { error: err?.message || 'unknown' }
  }

  // Job 3: retenção LGPD (anonimização)
  try {
    results.retentionPurge = await purgeExpiredCalculadora()
  } catch (err: any) {
    results.retentionPurge = { error: err?.message || 'unknown' }
  }

  // Job 4: nutrição pós-Calculadora (Sprint 5 / S5.5)
  try {
    results.calcNutricao = await processarNutricaoPosCalculadora()
  } catch (err: any) {
    results.calcNutricao = { error: err?.message || 'unknown' }
  }

  const durationMs = Date.now() - started

  return NextResponse.json({
    ok: true,
    durationMs,
    timestamp: new Date().toISOString(),
    results,
  })
}
