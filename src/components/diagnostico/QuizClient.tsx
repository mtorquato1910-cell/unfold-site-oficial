'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import type { QuizPergunta } from '@/app/(site)/diagnostico/etapa-2/[token]/page'
import TelaProcessamento from '@/components/diagnostico/TelaProcessamento'
import { trackEvent } from '@/lib/analytics/diagnostico-events'

type Pilar = 'diagnosticar' | 'estruturar' | 'operar' | 'evoluir'
type Letra = 'A' | 'B' | 'C' | 'D' | 'E'

const PILAR_LABELS: Record<Pilar, string> = {
  diagnosticar: 'Diagnosticar',
  estruturar: 'Estruturar',
  operar: 'Operar',
  evoluir: 'Evoluir',
}

const PILAR_COLORS: Record<Pilar, string> = {
  diagnosticar: 'border-primary/50 bg-primary/10 text-primary',
  estruturar: 'border-secondary/50 bg-secondary/10 text-secondary',
  operar: 'border-[hsl(250_64%_70%/0.5)] bg-[hsl(250_64%_70%/0.1)] text-[hsl(250_64%_70%)]',
  evoluir: 'border-[hsl(160_60%_55%/0.5)] bg-[hsl(160_60%_55%/0.1)] text-[hsl(160_60%_55%)]',
}

// Microcopy de transição — spec §4.2
const INTERLUDE_TEXTS: Partial<Record<Pilar, string>> = {
  diagnosticar: 'Vamos começar entendendo como sua operação enxerga o próprio crescimento.',
  estruturar: 'Agora vamos olhar a fundação da sua operação.',
  operar: 'Falta pouco. Agora sobre como sua operação executa no dia a dia.',
  evoluir: 'Última parte. Vamos falar sobre como sua operação evolui.',
}

const LETRAS: Letra[] = ['A', 'B', 'C', 'D', 'E']

export default function QuizClient({ token, perguntas }: { token: string; perguntas: QuizPergunta[] }) {
  const router = useRouter()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [respostas, setRespostas] = useState<Record<number, Letra>>({})
  const [submitting, setSubmitting] = useState(false)
  const [processando, setProcessando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [interludeShown, setInterludeShown] = useState<Record<Pilar, boolean>>({
    diagnosticar: false,
    estruturar: false,
    operar: false,
    evoluir: false,
  })
  // data_inicio do quiz (Etapa 2). data_inicio da sessão completa veio do JWT (Etapa 1).
  const [dataInicioQuiz] = useState(() => Date.now())

  const total = perguntas.length
  const pergunta = perguntas[currentIdx]

  // Calcula se devemos mostrar a microcopy de transição antes da pergunta atual.
  const mostrarInterlude = useMemo(() => {
    if (!pergunta) return false
    const pilarAtual = pergunta.pilar as Pilar
    if (interludeShown[pilarAtual]) return false
    // Mostra na primeira pergunta do quiz OU sempre que mudar de pilar.
    if (currentIdx === 0) return true
    const pilarAnterior = perguntas[currentIdx - 1]?.pilar as Pilar | undefined
    return pilarAnterior !== pilarAtual
  }, [pergunta, currentIdx, perguntas, interludeShown])

  if (total === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <p className="font-mono text-xs uppercase text-primary mb-4">Diagnóstico indisponível</p>
          <h2 className="font-display font-bold text-2xl mb-4">
            As perguntas ainda não foram configuradas
          </h2>
          <p className="text-foreground/60 text-sm">
            Execute o seed em <code className="font-mono text-xs bg-card px-1 py-0.5 rounded">/api/seed/diagnostico</code> para popular as 12 perguntas oficiais.
          </p>
        </div>
      </div>
    )
  }

  // Progresso baseado em perguntas respondidas (não índice atual) — mais honesto visualmente.
  const respondidas = Object.keys(respostas).length
  const progresso = Math.round((respondidas / total) * 100)
  const selecionado: Letra | null = pergunta ? (respostas[pergunta.ordem] ?? null) : null

  function selecionarOpcao(letra: Letra) {
    if (!pergunta) return
    setRespostas((prev) => ({ ...prev, [pergunta.ordem]: letra }))
  }

  function dispensarInterlude() {
    if (!pergunta) return
    setInterludeShown((s) => ({ ...s, [pergunta.pilar as Pilar]: true }))
  }

  function avancar() {
    if (selecionado === null) return
    // Evento spec §10.3: pergunta respondida.
    if (pergunta) {
      trackEvent({
        event_name: 'etapa_2_pergunta',
        metadata: { ordem: pergunta.ordem, pilar: pergunta.pilar, letra: selecionado },
      })
    }
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
      // Constrói o payload `{q1: 'B', q2: 'A', ..., q12: 'A'}` baseado na ordem.
      const quiz: Record<string, Letra> = {}
      for (const p of perguntas) {
        const letra = respostas[p.ordem]
        if (!letra) {
          throw new Error(`Pergunta Q${p.ordem} não respondida`)
        }
        quiz[`q${p.ordem}`] = letra
      }
      const tempo_total_segundos = Math.round((Date.now() - dataInicioQuiz) / 1000)

      const res = await fetch('/api/diagnostico/etapa-2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, quiz, tempo_quiz_segundos: tempo_total_segundos }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao calcular resultado')
      const target = json.result_hash
        ? `/diagnostico/r/${json.result_hash}`
        : `/diagnostico/resultado/${json.result_token}`

      // Tela de processamento 3.3s entre cálculo e exibição do resultado (spec §2).
      setProcessando(true)
      setSubmitting(false)
      setTimeout(() => router.push(target), 3300)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
      setSubmitting(false)
    }
  }

  if (processando) {
    return <TelaProcessamento />
  }

  if (!pergunta) return null

  const pilarAtual = pergunta.pilar as Pilar
  const pilarColor = PILAR_COLORS[pilarAtual] || 'border-border bg-card/50 text-foreground'

  // Tela de microcopy de transição entre pilares (spec §4.2).
  if (mostrarInterlude) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center">
          <span className={`inline-block font-mono text-xs px-3 py-1 rounded-full border mb-8 ${pilarColor}`}>
            Pilar {PILAR_LABELS[pilarAtual]}
          </span>
          <h2 className="font-display font-bold text-2xl md:text-3xl leading-snug mb-8">
            {INTERLUDE_TEXTS[pilarAtual]}
          </h2>
          <Button onClick={dispensarInterlude} size="lg" className="gap-2">
            Continuar <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Progresso X/12 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-xs text-foreground/40 uppercase tracking-widest">
            Pergunta {currentIdx + 1} de {total}
          </span>
          <span className={`font-mono text-xs px-2 py-0.5 rounded-full border ${pilarColor}`}>
            {PILAR_LABELS[pilarAtual]}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progresso}%` }}
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="font-display font-bold text-xl md:text-2xl leading-snug">
          {pergunta.pergunta}
        </h2>
      </div>

      <div className="space-y-3 mb-8">
        {pergunta.opcoes?.map((opcao, idx) => {
          const letra = LETRAS[idx]
          if (!letra) return null
          const ativo = selecionado === letra
          return (
            <button
              key={letra}
              onClick={() => selecionarOpcao(letra)}
              className={`w-full text-left rounded-xl border px-5 py-4 text-sm transition-all duration-200 ${
                ativo
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-card hover:border-primary/40 hover:bg-card/80 text-foreground/80'
              }`}
            >
              <span className={`font-mono text-xs mr-3 ${ativo ? 'text-primary' : 'text-foreground/30'}`}>
                {letra}
              </span>
              {opcao.texto}
            </button>
          )
        })}
      </div>

      {error && (
        <p className="text-destructive text-sm bg-destructive/10 rounded-lg px-4 py-3 mb-4">{error}</p>
      )}

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
