'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import type { QuizPergunta } from '@/app/(site)/diagnostico/etapa-2/[token]/page'

type Resposta = { question_id: string; pilar: string; peso: number; valor: number; max_valor: number }

const PILAR_LABELS: Record<string, string> = {
  diagnosticar: 'Diagnosticar',
  estruturar: 'Estruturar',
  operar: 'Operar',
  evoluir: 'Evoluir',
}

const PILAR_COLORS: Record<string, string> = {
  diagnosticar: 'border-primary/50 bg-primary/10 text-primary',
  estruturar: 'border-secondary/50 bg-secondary/10 text-secondary',
  operar: 'border-[hsl(250_64%_70%/0.5)] bg-[hsl(250_64%_70%/0.1)] text-[hsl(250_64%_70%)]',
  evoluir: 'border-[hsl(160_60%_55%/0.5)] bg-[hsl(160_60%_55%/0.1)] text-[hsl(160_60%_55%)]',
}

export default function QuizClient({ token, perguntas }: { token: string; perguntas: QuizPergunta[] }) {
  const router = useRouter()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [respostas, setRespostas] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = perguntas.length
  const pergunta = perguntas[currentIdx]

  if (total === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <p className="font-mono text-xs uppercase text-primary mb-4">Diagnóstico indisponível</p>
          <h2 className="font-display font-bold text-2xl mb-4">
            As perguntas ainda não foram configuradas
          </h2>
          <p className="text-foreground/60 text-sm">
            Execute o seed em <code className="font-mono text-xs bg-card px-1 py-0.5 rounded">/api/seed/diagnostico</code> para popular as perguntas de exemplo.
          </p>
        </div>
      </div>
    )
  }

  const progresso = Math.round(((currentIdx) / total) * 100)
  const selecionado = respostas[pergunta?.id] ?? null

  function selecionarOpcao(valor: number) {
    if (!pergunta) return
    setRespostas((prev) => ({ ...prev, [pergunta.id]: valor }))
  }

  function avancar() {
    if (selecionado === null) return
    if (currentIdx < total - 1) {
      setCurrentIdx((i) => i + 1)
    } else {
      enviarRespostas()
    }
  }

  function voltar() {
    if (currentIdx > 0) setCurrentIdx((i) => i - 1)
  }

  async function enviarRespostas() {
    setSubmitting(true)
    setError(null)
    try {
      const payload: Resposta[] = perguntas.map((p) => ({
        question_id: p.id,
        pilar: p.pilar,
        peso: p.peso,
        valor: respostas[p.id] ?? 0,
        max_valor: 4,
      }))

      const res = await fetch('/api/diagnostico/etapa-2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, respostas: payload }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao calcular resultado')
      router.push(`/diagnostico/resultado/${json.result_token}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
      setSubmitting(false)
    }
  }

  if (!pergunta) return null

  const pilarColor = PILAR_COLORS[pergunta.pilar] || 'border-border bg-card/50 text-foreground'

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-xs text-foreground/40 uppercase tracking-widest">
            Pergunta {currentIdx + 1} de {total}
          </span>
          <span className={`font-mono text-xs px-2 py-0.5 rounded-full border ${pilarColor}`}>
            {PILAR_LABELS[pergunta.pilar]}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progresso}%` }}
          />
        </div>
      </div>

      {/* Pergunta */}
      <div className="mb-8">
        <h2 className="font-display font-bold text-xl md:text-2xl leading-snug">
          {pergunta.pergunta}
        </h2>
      </div>

      {/* Opções */}
      <div className="space-y-3 mb-8">
        {pergunta.opcoes?.map((opcao) => (
          <button
            key={opcao.valor}
            onClick={() => selecionarOpcao(opcao.valor)}
            className={`w-full text-left rounded-xl border px-5 py-4 text-sm transition-all duration-200 ${
              selecionado === opcao.valor
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border bg-card hover:border-primary/40 hover:bg-card/80 text-foreground/80'
            }`}
          >
            <span className={`font-mono text-xs mr-3 ${selecionado === opcao.valor ? 'text-primary' : 'text-foreground/30'}`}>
              {String.fromCharCode(65 + (opcao.valor || 0))}
            </span>
            {opcao.texto}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-destructive text-sm bg-destructive/10 rounded-lg px-4 py-3 mb-4">{error}</p>
      )}

      {/* Navegação */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={voltar}
          disabled={currentIdx === 0 || submitting}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Anterior
        </Button>

        <Button
          onClick={avancar}
          disabled={selecionado === null || submitting}
          className="gap-2"
        >
          {submitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Calculando...</>
          ) : currentIdx === total - 1 ? (
            <>Ver meu diagnóstico <ArrowRight className="h-4 w-4" /></>
          ) : (
            <>Próxima <ArrowRight className="h-4 w-4" /></>
          )}
        </Button>
      </div>
    </div>
  )
}
