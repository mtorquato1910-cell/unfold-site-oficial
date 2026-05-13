'use client'

import { useState } from 'react'
import { ExternalLink, Loader2, Mail, RefreshCw, Send } from 'lucide-react'

type Action = 'reenviar-email' | 'sync-rd' | 'forcar-nutricao'

const LABELS: Record<Action, { label: string; icon: typeof Mail }> = {
  'reenviar-email': { label: 'Reenviar email', icon: Mail },
  'sync-rd': { label: 'Sincronizar RD agora', icon: RefreshCw },
  'forcar-nutricao': { label: 'Forçar nutrição', icon: Send },
}

export default function DiagnosticoDetailActions({ id, hash }: { id: string; hash?: string }) {
  const [running, setRunning] = useState<Action | null>(null)
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  async function executar(action: Action) {
    if (running) return
    setRunning(action)
    setFeedback(null)
    try {
      const res = await fetch(`/api/painel/diagnostico/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const json = await res.json()
      if (!res.ok || json.ok === false) {
        throw new Error(json.error || json.mensagem || 'Falha desconhecida')
      }
      const detalhe = json.mode
        ? `(${json.mode})`
        : json.mensagem
          ? `· ${json.mensagem}`
          : ''
      setFeedback({ ok: true, msg: `${LABELS[action].label} executado ${detalhe}` })
    } catch (err) {
      setFeedback({
        ok: false,
        msg: err instanceof Error ? err.message : 'Erro inesperado',
      })
    } finally {
      setRunning(null)
    }
  }

  return (
    <div className="rounded-xl border border-[hsl(0_0%_100%_/_0.08)] bg-[hsl(0_0%_100%_/_0.02)] p-4">
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(LABELS) as Action[]).map((a) => {
          const Icon = LABELS[a].icon
          const isRunning = running === a
          return (
            <button
              key={a}
              onClick={() => executar(a)}
              disabled={Boolean(running)}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-[12px] font-medium border border-[hsl(0_0%_100%_/_0.12)] text-[hsl(0_0%_91%_/_0.85)] bg-[hsl(0_0%_100%_/_0.02)] hover:bg-[hsl(0_0%_100%_/_0.06)] transition-colors disabled:opacity-40"
            >
              {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
              {LABELS[a].label}
            </button>
          )
        })}

        {hash && (
          <a
            href={`/diagnostico/r/${hash}`}
            target="_blank"
            rel="noreferrer"
            className="ml-auto inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-[12px] font-medium text-[hsl(158_92%_70%)] hover:opacity-80"
          >
            Abrir página pública <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      {feedback && (
        <p
          className={`mt-3 text-[12px] ${
            feedback.ok ? 'text-[hsl(158_92%_70%)]' : 'text-[hsl(0_75%_65%)]'
          }`}
        >
          {feedback.msg}
        </p>
      )}
    </div>
  )
}
