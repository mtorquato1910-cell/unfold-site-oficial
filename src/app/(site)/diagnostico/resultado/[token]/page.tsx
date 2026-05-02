import type { Metadata } from 'next'
import { jwtVerify } from 'jose'
import { notFound } from 'next/navigation'
import DiagnosticoResultadoClient from '@/components/diagnostico/DiagnosticoResultadoClient'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const metadata: Metadata = {
  title: 'Seu Diagnóstico | Unfold Growth',
  robots: { index: false },
}

type Props = { params: Promise<{ token: string }> }

const SECRET = new TextEncoder().encode(
  process.env.PAYLOAD_SECRET || 'dev-secret-CHANGE-IN-PRODUCTION'
)

export default async function DiagnosticoResultadoPage({ params }: Props) {
  const { token } = await params

  let resultData: Record<string, unknown> | null = null
  try {
    const { payload } = await jwtVerify(token, SECRET)
    resultData = payload as Record<string, unknown>
  } catch {
    notFound()
  }

  // Buscar insight personalizado do DB (opcional, fallback para dados do JWT)
  let insight: { headline: string; corpo: string; cta_texto: string } | null = null
  if (resultData.insightId && String(resultData.insightId).length > 0) {
    try {
      const payloadCMS = await getPayload({ config: configPromise })
      const found = await payloadCMS.findByID({
        collection: 'insights-variations',
        id: String(resultData.insightId),
      })
      if (found) {
        insight = {
          headline: found.headline as string,
          corpo: found.corpo as string,
          cta_texto: (found.cta_texto as string) || 'Agendar conversa estratégica',
        }
      }
    } catch {
      // DB não disponível — usará fallback
    }
  }

  const nivelFit = String(resultData.nivel_fit || 'medio') as 'alto' | 'medio' | 'baixo'

  // Fallback de insight se DB não disponível
  if (!insight) {
    const fallbacks: Record<string, { headline: string; corpo: string; cta_texto: string }> = {
      alto: {
        headline: 'Sua operação comercial está madura para escalar',
        corpo: 'Você demonstra maturidade nos três pilares do método UGS. O próximo passo é implementar ciclos de otimização contínua e escalar o que já funciona com consistência.',
        cta_texto: 'Agendar conversa estratégica',
      },
      medio: {
        headline: 'Você tem boas bases, mas existem gaps críticos',
        corpo: 'Sua operação comercial já tem alguns processos definidos, mas ainda existem lacunas que limitam sua previsibilidade e crescimento. O método UGS pode ajudar a identificar e estruturar esses pontos de alavanca.',
        cta_texto: 'Quero entender meus gaps',
      },
      baixo: {
        headline: 'Sua operação comercial precisa de uma reformulação',
        corpo: 'Os resultados mostram que sua operação ainda é muito reativa e informal. Com a estrutura certa, os resultados aparecem rapidamente.',
        cta_texto: 'Iniciar diagnóstico completo',
      },
    }
    insight = fallbacks[nivelFit] || fallbacks.medio
  }

  return (
    <main className="min-h-screen pt-20">
      <DiagnosticoResultadoClient
        nome={String(resultData.leadNome || '')}
        score_total={Number(resultData.score_total || 0)}
        score_diagnosticar={Number(resultData.score_diagnosticar || 0)}
        score_estruturar={Number(resultData.score_estruturar || 0)}
        score_operar={Number(resultData.score_operar || 0)}
        nivel_fit={nivelFit}
        pilar_mais_fraco={String(resultData.pilar_mais_fraco || 'operar') as 'diagnosticar' | 'estruturar' | 'operar'}
        insight={insight}
      />
    </main>
  )
}
