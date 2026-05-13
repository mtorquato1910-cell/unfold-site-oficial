import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { jwtVerify, SignJWT } from 'jose'
import { z } from 'zod'

import { calcularDiagnostico } from '@/lib/scoring'
import type { InputDiagnostico, RespostasEtapa1, RespostasQuiz } from '@/lib/scoring/types'
import { trackEventServer } from '@/lib/analytics/diagnostico-events'

const SECRET = new TextEncoder().encode(
  process.env.PAYLOAD_SECRET || 'dev-secret-CHANGE-IN-PRODUCTION',
)

// Mantém compat com formato legado por enquanto, mas QuizClient v2 sempre envia `quiz`.
const letraQ4 = z.enum(['A', 'B', 'C', 'D', 'E'])
const letraQuiz = z.enum(['A', 'B', 'C', 'D'])

const quizSchema = z.object({
  q1: letraQuiz,
  q2: letraQuiz,
  q3: letraQuiz,
  q4: letraQ4,
  q5: letraQuiz,
  q6: letraQuiz,
  q7: letraQuiz,
  q8: letraQuiz,
  q9: letraQuiz,
  q10: letraQuiz,
  q11: letraQuiz,
  q12: letraQuiz,
})

const requestSchema = z.object({
  token: z.string(),
  quiz: quizSchema,
  tempo_quiz_segundos: z.number().optional(),
})

interface LeadJWTPayload {
  leadId: string
  email: string
  nome: string
  empresa: string
  cargo?: RespostasEtapa1['cargo']
  setor?: RespostasEtapa1['setor']
  faturamento_faixa?: RespostasEtapa1['faturamento_faixa']
  urgencia?: RespostasEtapa1['urgencia']
  data_inicio?: string
}

// Mapeia nivel_fit legado a partir da nova faixa_fit (Sprint 4 remove).
function legacyNivelFit(faixa: string): 'alto' | 'medio' | 'baixo' {
  if (faixa === 'fit-alto') return 'alto'
  if (faixa === 'fit-medio') return 'medio'
  return 'baixo'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    let leadPayload: LeadJWTPayload
    try {
      const { payload } = await jwtVerify(parsed.data.token, SECRET)
      leadPayload = payload as unknown as LeadJWTPayload
    } catch {
      return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 401 })
    }

    // Validação defensiva: os campos da Etapa 1 são obrigatórios para a engine v2.
    if (
      !leadPayload.cargo ||
      !leadPayload.setor ||
      !leadPayload.faturamento_faixa ||
      !leadPayload.urgencia
    ) {
      return NextResponse.json(
        { error: 'Sessão inválida — Etapa 1 incompleta. Reinicie o diagnóstico.' },
        { status: 400 },
      )
    }

    const input: InputDiagnostico = {
      etapa1: {
        cargo: leadPayload.cargo,
        setor: leadPayload.setor,
        faturamento_faixa: leadPayload.faturamento_faixa,
        urgencia: leadPayload.urgencia,
      },
      quiz: parsed.data.quiz as RespostasQuiz,
    }

    const diag = calcularDiagnostico(input)

    // Cálculo de tempo total (Etapa 1 + Quiz) com base no data_inicio do JWT.
    let tempo_total_segundos: number | undefined
    if (leadPayload.data_inicio) {
      const inicio = new Date(leadPayload.data_inicio).getTime()
      if (Number.isFinite(inicio)) {
        tempo_total_segundos = Math.round((Date.now() - inicio) / 1000)
      }
    }

    // Persistência — modo defensivo: se DB falhar, ainda retorna o resultado ao usuário.
    let resultId: string = `mock-${Date.now()}`
    let resultHash: string | undefined

    try {
      const payloadCMS = await getPayload({ config: configPromise })

      const created = await payloadCMS.create({
        collection: 'diagnostico-results',
        data: {
          lead_email: leadPayload.email,
          // Camada 1
          score_total: diag.score_consolidado, // legado v0 — mantido por compat
          score_diagnosticar: diag.score_diagnosticar,
          score_estruturar: diag.score_estruturar,
          score_operar: diag.score_operar,
          score_evoluir: diag.score_evoluir,
          score_gestao: diag.score_gestao,
          faixa_consolidada: diag.faixa_consolidada,
          // Camada 2
          fit_estrutural: diag.fit_estrutural,
          fit_dor: diag.fit_dor,
          fit_cabeca: diag.fit_cabeca,
          fit_urgencia: diag.fit_urgencia,
          score_fit: diag.score_fit,
          faixa_fit: diag.faixa_fit,
          // Camada 3
          padroes_acionados: diag.padroes_acionados,
          padroes_exibidos: diag.padroes_exibidos,
          caminhos_exibidos: diag.caminhos_exibidos,
          // Metadados
          nivel_fit: legacyNivelFit(diag.faixa_fit),
          respostas_raw: JSON.stringify(parsed.data.quiz),
          respostas_etapa1_raw: {
            ...input.etapa1,
            q4_raw: parsed.data.quiz.q4, // preserva letra original (E vs A)
            tempo_quiz_segundos: parsed.data.tempo_quiz_segundos,
            tempo_total_segundos,
          },
          data_inicio: leadPayload.data_inicio,
          data_conclusao: new Date().toISOString(),
          tempo_total_segundos,
          email_enviado: false,
        },
      })
      resultId = String(created.id)
      resultHash = (created as { url_resultado_hash?: string }).url_resultado_hash

      // Vincula o resultado ao lead (se não-mock).
      if (leadPayload.leadId && !leadPayload.leadId.startsWith('mock-')) {
        try {
          await payloadCMS.update({
            collection: 'leads',
            id: leadPayload.leadId,
            data: { diagnostico_result_id: resultId as unknown as number },
          })
        } catch {
          /* silencioso */
        }
      }
    } catch (err) {
      console.warn('[diagnostico/etapa-2] DB não disponível, usando mock:', err)
    }

    // Token legado para a rota /resultado/[token] enquanto Sprint 3 não troca por /r/[hash].
    const legacyToken = await new SignJWT({
      resultId,
      score_total: diag.score_consolidado,
      score_diagnosticar: diag.score_diagnosticar,
      score_estruturar: diag.score_estruturar,
      score_operar: diag.score_operar,
      score_evoluir: diag.score_evoluir,
      nivel_fit: legacyNivelFit(diag.faixa_fit),
      pilar_mais_fraco: pilarMaisFraco(diag),
      leadEmail: leadPayload.email,
      leadNome: leadPayload.nome,
      insightId: '',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .setIssuedAt()
      .sign(SECRET)

    // Evento spec §10.3: diagnóstico concluído.
    void trackEventServer({
      event_name: 'diagnostico_concluido',
      lead_email: leadPayload.email,
      result_hash: resultHash,
      metadata: {
        score_consolidado: diag.score_consolidado,
        faixa_fit: diag.faixa_fit,
      },
    })

    return NextResponse.json({
      ok: true,
      result_token: legacyToken,
      result_hash: resultHash,
    })
  } catch (err) {
    console.error('[diagnostico/etapa-2]', err)
    return NextResponse.json({ error: 'Erro interno ao calcular diagnóstico' }, { status: 500 })
  }
}

function pilarMaisFraco(d: ReturnType<typeof calcularDiagnostico>) {
  const scores: Record<'diagnosticar' | 'estruturar' | 'operar' | 'evoluir', number> = {
    diagnosticar: d.score_diagnosticar,
    estruturar: d.score_estruturar,
    operar: d.score_operar,
    evoluir: d.score_evoluir,
  }
  return Object.entries(scores).sort(([, a], [, b]) => a - b)[0][0]
}
