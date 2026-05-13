/**
 * Ações administrativas no detalhe de um Diagnóstico.
 *   - reenviar-email: dispara novamente o email V2 do resultado
 *   - sync-rd: força sincronização com RD Station (mesmo se rd_sync_status já estiver synced)
 *   - forcar-nutricao: zera `nutricao_enviada_at` para o cron pegar de novo
 *
 * Apenas para usuários autenticados no painel.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { getSession } from '@/lib/painel-auth'
import { sendEmail } from '@/lib/email/adapter'
import { syncDiagnosticoToRD } from '@/lib/crm/rd-station'
import { templateResultadoDiagnosticoV2 } from '@/lib/email/templates/resultado-diagnostico-v2'
import type {
  CodigoCaminho,
  CodigoInsight,
  FaixaFit,
  FaixaMaturidade,
} from '@/lib/scoring/types'

type Action = 'reenviar-email' | 'sync-rd' | 'forcar-nutricao'

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  let body: { action?: Action }
  try {
    body = (await req.json()) as { action?: Action }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.action) {
    return NextResponse.json({ error: 'action required' }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })
  const doc = await payload.findByID({ collection: 'diagnostico-results', id }).catch(() => null)
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const d = doc as unknown as {
    lead_email: string
    score_total?: number
    score_fit?: number
    faixa_consolidada?: FaixaMaturidade
    faixa_fit?: FaixaFit
    padroes_acionados?: unknown
    padroes_exibidos?: unknown
    caminhos_exibidos?: unknown
    url_resultado_hash?: string
  }

  if (body.action === 'reenviar-email') {
    if (!d.url_resultado_hash || !d.faixa_consolidada || !d.faixa_fit) {
      return NextResponse.json({ error: 'Resultado incompleto' }, { status: 400 })
    }
    const primeiroNome = d.lead_email.split('@')[0]
    const r = await sendEmail({
      to: d.lead_email,
      subject: `Seu diagnóstico de growth — Score ${d.score_total ?? 0}/100`,
      html: templateResultadoDiagnosticoV2({
        primeiroNome,
        score_consolidado: d.score_total ?? 0,
        faixa_consolidada: d.faixa_consolidada,
        faixa_fit: d.faixa_fit,
        url_resultado_hash: d.url_resultado_hash,
      }),
    })
    return NextResponse.json({ ok: r.success, mode: r.mode, message_id: r.message_id })
  }

  if (body.action === 'sync-rd') {
    if (!d.url_resultado_hash || !d.faixa_consolidada || !d.faixa_fit) {
      return NextResponse.json({ error: 'Resultado incompleto' }, { status: 400 })
    }
    const r = await syncDiagnosticoToRD({
      email: d.lead_email,
      nome: d.lead_email.split('@')[0],
      score_consolidado: d.score_total ?? 0,
      faixa_consolidada: d.faixa_consolidada,
      score_fit: d.score_fit ?? 0,
      faixa_fit: d.faixa_fit,
      padroes_acionados: readArray(d.padroes_acionados),
      padroes_exibidos: readArray<CodigoInsight>(d.padroes_exibidos),
      caminhos_exibidos: readArray<CodigoCaminho>(d.caminhos_exibidos),
      url_resultado: `/diagnostico/r/${d.url_resultado_hash}`,
      concluido_em: new Date().toISOString(),
    })
    return NextResponse.json({ ok: r.success, mode: r.mode, external_id: r.external_id, error: r.error })
  }

  if (body.action === 'forcar-nutricao') {
    try {
      await payload.update({
        collection: 'diagnostico-results',
        id,
        data: { nutricao_enviada_at: null } as never,
      })
      return NextResponse.json({ ok: true, mensagem: 'Flag de nutrição resetada; cron irá processar na próxima execução.' })
    } catch (err) {
      return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'unknown_action' }, { status: 400 })
}

function readArray<T = string>(v: unknown): T[] {
  if (Array.isArray(v)) return v as T[]
  if (typeof v === 'string') {
    try {
      const parsed = JSON.parse(v)
      return Array.isArray(parsed) ? (parsed as T[]) : []
    } catch {
      return []
    }
  }
  return []
}
