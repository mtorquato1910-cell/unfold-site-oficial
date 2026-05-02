import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { jwtVerify, SignJWT } from 'jose'
import { calcularScore, type Resposta } from '@/lib/scoring/engine'

const SECRET = new TextEncoder().encode(
  process.env.PAYLOAD_SECRET || 'dev-secret-CHANGE-IN-PRODUCTION'
)

export async function POST(req: NextRequest) {
  try {
    const { token, respostas } = await req.json()

    if (!token || !Array.isArray(respostas)) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    // Verificar JWT
    let leadPayload: { leadId: string; email: string; nome: string; empresa: string }
    try {
      const { payload } = await jwtVerify(token, SECRET)
      leadPayload = payload as typeof leadPayload
    } catch {
      return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 401 })
    }

    // Calcular score
    const scoreResult = calcularScore(respostas as Resposta[])

    // Mock do email (console log — Resend key pendente)
    console.log('[EMAIL MOCK] Diagnóstico concluído:', {
      para: leadPayload.email,
      nome: leadPayload.nome,
      score_total: scoreResult.score_total,
      nivel_fit: scoreResult.nivel_fit,
    })

    // Salvar resultado no Payload
    let resultId: string = `mock-${Date.now()}`
    let insightId: string | number | undefined

    try {
      const payloadCMS = await getPayload({ config: configPromise })

      // Buscar insight adequado
      const { docs: insights } = await payloadCMS.find({
        collection: 'insights-variations',
        where: {
          nivel_fit: { equals: scoreResult.nivel_fit },
          ativo: { equals: true },
        },
        limit: 1,
      })
      insightId = insights[0]?.id

      const result = await payloadCMS.create({
        collection: 'diagnostico-results',
        data: {
          lead_email: leadPayload.email,
          score_total: scoreResult.score_total,
          score_diagnosticar: scoreResult.score_diagnosticar,
          score_estruturar: scoreResult.score_estruturar,
          score_operar: scoreResult.score_operar,
          score_evoluir: scoreResult.score_evoluir,
          nivel_fit: scoreResult.nivel_fit,
          respostas_raw: JSON.stringify(respostas),
          insight_id: insightId ? String(insightId) : undefined,
          email_enviado: false,
        },
      })
      resultId = String(result.id)

      // Atualizar lead com referência ao resultado
      if (leadPayload.leadId && !leadPayload.leadId.startsWith('mock-')) {
        try {
          await payloadCMS.update({
            collection: 'leads',
            id: leadPayload.leadId,
            data: { diagnostico_result_id: resultId },
          })
        } catch {
          // silencioso se o lead foi mock
        }
      }
    } catch (err) {
      console.warn('[diagnostico/etapa-2] DB não disponível, usando mock:', err)
    }

    // Gerar token de resultado (inclui scores para exibição sem nova query)
    const resultToken = await new SignJWT({
      resultId,
      ...scoreResult,
      leadEmail: leadPayload.email,
      leadNome: leadPayload.nome,
      insightId: String(insightId ?? ''),
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .setIssuedAt()
      .sign(SECRET)

    return NextResponse.json({ ok: true, result_token: resultToken })
  } catch (err) {
    console.error('[diagnostico/etapa-2]', err)
    return NextResponse.json({ error: 'Erro interno ao calcular diagnóstico' }, { status: 500 })
  }
}
