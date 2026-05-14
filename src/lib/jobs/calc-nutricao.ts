/**
 * Job: fluxo de nutrição pós-Calculadora (Sprint 5 / S5.5).
 *
 * Estágios (spec §9.4):
 *   D+1  → "Seu resultado ainda está disponível"
 *   D+3  → conteúdo educativo conforme insight exibido
 *   D+7  → convite para o Diagnóstico
 *   D+14 → conteúdo de autoridade
 *   D+21 → última oportunidade
 *   > D+21 → base passiva (sem mais nutrição)
 *
 * Regras de pausa:
 *   - `calc_avancou_para_diagnostico == true` → pausa (estágio 'pausada_avancou')
 *   - `consent.withdrawn == true`            → pausa (estágio 'pausada_consent')
 *
 * Idempotência: campo `nutricao_step_atual` na collection avança o estado.
 * Limite por execução: 100 leads por run (proteção contra cron Vercel 60s no Hobby).
 */

import { getPayload } from 'payload'
import config from '@payload-config'
import { sendEmail } from '@/lib/email/adapter'
import {
  templateD1,
  templateD3,
  templateD7,
  templateD14,
  templateD21,
} from '@/lib/email/templates-calc-v2'
import type { InsightId } from '@/lib/calculadora/types'

const MAX_PER_RUN = 100
const DIA_MS = 24 * 60 * 60 * 1000

type NutricaoStep =
  | 'pending'
  | 'd1_sent'
  | 'd3_sent'
  | 'd7_sent'
  | 'd14_sent'
  | 'd21_sent'
  | 'base_passiva'
  | 'pausada_avancou'
  | 'pausada_consent'

interface CalcDocLite {
  id: string
  nome: string
  email: string
  empresa: string
  createdAt: string
  calc_insight_principal?: InsightId
  calc_url_resultado?: string
  calc_avancou_para_diagnostico?: boolean
  consent?: { withdrawn?: boolean }
  nutricao_step_atual?: NutricaoStep
}

interface Result {
  considered: number
  sent: number
  paused: number
  skipped: number
  errors: number
  by_step: Record<string, number>
}

/**
 * Decide o próximo estágio dado o doc + idade em dias.
 * Retorna null se não há ação para o momento.
 */
function proximoEstagio(diasIdade: number, atual: NutricaoStep): NutricaoStep | null {
  if (atual === 'pending' && diasIdade >= 1) return 'd1_sent'
  if (atual === 'd1_sent' && diasIdade >= 3) return 'd3_sent'
  if (atual === 'd3_sent' && diasIdade >= 7) return 'd7_sent'
  if (atual === 'd7_sent' && diasIdade >= 14) return 'd14_sent'
  if (atual === 'd14_sent' && diasIdade >= 21) return 'd21_sent'
  if (atual === 'd21_sent' && diasIdade >= 28) return 'base_passiva'
  return null
}

function diagnosticoUrlBase(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://unfoldgrowth.com.br'
  return `${base.replace(/\/+$/, '')}/diagnostico`
}

function unsubUrl(token: string, email: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://unfoldgrowth.com.br'
  return `${base.replace(/\/+$/, '')}/api/calculadora/unsubscribe?t=${token}&e=${encodeURIComponent(email)}`
}

function resultadoUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://unfoldgrowth.com.br'
  return `${base.replace(/\/+$/, '')}/ferramentas/calculadora-trafego/r/${token}`
}

export async function processarNutricaoPosCalculadora(): Promise<Result> {
  const out: Result = {
    considered: 0,
    sent: 0,
    paused: 0,
    skipped: 0,
    errors: 0,
    by_step: {},
  }

  let payload
  try {
    payload = await getPayload({ config })
  } catch (err) {
    console.error('[calc-nutricao] payload init falhou:', err)
    return out
  }

  let docs: CalcDocLite[] = []
  try {
    const { docs: found } = await payload.find({
      collection: 'calculadora-results',
      where: {
        and: [
          { calc_insight_principal: { exists: true } },
          {
            nutricao_step_atual: {
              not_in: ['base_passiva', 'pausada_avancou', 'pausada_consent'],
            },
          },
        ],
      },
      limit: MAX_PER_RUN,
      sort: 'createdAt',
    })
    docs = found as unknown as CalcDocLite[]
  } catch (err) {
    console.error('[calc-nutricao] query falhou:', err)
    return out
  }

  const agora = Date.now()
  for (const doc of docs) {
    out.considered++
    const stepAtual = (doc.nutricao_step_atual || 'pending') as NutricaoStep

    // ── Pausas (ADR-9 / LGPD) ───────────────────────────────────────────────
    if (doc.consent?.withdrawn) {
      if (stepAtual !== 'pausada_consent') {
        try {
          await payload.update({
            collection: 'calculadora-results',
            id: doc.id,
            data: { nutricao_step_atual: 'pausada_consent' } as never,
          })
        } catch {}
      }
      out.paused++
      continue
    }
    if (doc.calc_avancou_para_diagnostico) {
      if (stepAtual !== 'pausada_avancou') {
        try {
          await payload.update({
            collection: 'calculadora-results',
            id: doc.id,
            data: { nutricao_step_atual: 'pausada_avancou' } as never,
          })
        } catch {}
      }
      out.paused++
      continue
    }

    const idadeDias = Math.floor((agora - new Date(doc.createdAt).getTime()) / DIA_MS)
    const proximo = proximoEstagio(idadeDias, stepAtual)
    if (!proximo) {
      out.skipped++
      continue
    }

    // base_passiva: não dispara e-mail, só registra
    if (proximo === 'base_passiva') {
      try {
        await payload.update({
          collection: 'calculadora-results',
          id: doc.id,
          data: { nutricao_step_atual: 'base_passiva' } as never,
        })
        out.by_step['base_passiva'] = (out.by_step['base_passiva'] || 0) + 1
      } catch {
        out.errors++
      }
      continue
    }

    const token = doc.calc_url_resultado || ''
    if (!token) {
      out.skipped++
      continue
    }
    const baseProps = {
      recipient_nome: doc.nome,
      url_resultado: resultadoUrl(token),
      unsubscribe_url: unsubUrl(token, doc.email),
    }

    let subject = ''
    let html = ''
    switch (proximo) {
      case 'd1_sent':
        subject = `${doc.nome}, seu resultado da Calculadora ainda está disponível`
        html = templateD1(baseProps)
        break
      case 'd3_sent':
        subject = 'Sobre o seu resultado'
        html = templateD3({
          ...baseProps,
          insight: (doc.calc_insight_principal || 'I-A') as InsightId,
        })
        break
      case 'd7_sent':
        subject = 'O próximo passo é o Diagnóstico de Growth'
        html = templateD7({ ...baseProps, diagnostico_url: diagnosticoUrlBase() })
        break
      case 'd14_sent':
        subject = 'B2B previsível é sistema, não execução'
        html = templateD14(baseProps)
        break
      case 'd21_sent':
        subject = 'Última oportunidade — fazer o Diagnóstico'
        html = templateD21({ ...baseProps, diagnostico_url: diagnosticoUrlBase() })
        break
      default:
        continue
    }

    const sent = await sendEmail({ to: doc.email, subject, html })
    if (!sent.success) {
      out.errors++
      continue
    }
    try {
      await payload.update({
        collection: 'calculadora-results',
        id: doc.id,
        data: { nutricao_step_atual: proximo } as never,
      })
      out.sent++
      out.by_step[proximo] = (out.by_step[proximo] || 0) + 1
    } catch (err) {
      console.error('[calc-nutricao] update falhou:', err)
      out.errors++
    }
  }

  return out
}
