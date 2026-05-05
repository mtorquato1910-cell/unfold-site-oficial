import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import QuizClient from '@/components/diagnostico/QuizClient'

export const metadata: Metadata = {
  title: 'Diagnóstico — Etapa 2 | Unfold Growth',
  robots: { index: false },
}

type Props = { params: Promise<{ token: string }> }

async function getPerguntas() {
  try {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'quiz-questions',
      where: { ativo: { equals: true } },
      sort: 'ordem',
      limit: 12,
    })
    return docs
  } catch {
    return []
  }
}

export default async function DiagnosticoEtapa2Page({ params }: Props) {
  const { token } = await params
  const perguntas = await getPerguntas()

  return (
    <main className="min-h-screen pt-20">
      <QuizClient token={token} perguntas={perguntas as unknown as QuizPergunta[]} />
    </main>
  )
}

export type QuizPergunta = {
  id: string
  pergunta: string
  pilar: 'diagnosticar' | 'estruturar' | 'operar'
  peso: number
  ordem: number
  opcoes: Array<{ texto: string; valor: number }>
}
