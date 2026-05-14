'use client'

/**
 * Bloco B parte 2 — 4 premissas editáveis (S2.4).
 * Spec §5. Bloco colapsável fechado por default.
 *
 * Lógica §5.3: atualização dinâmica dos defaults quando inputs base mudam
 * está implementada no hook (useCalculadora). Aqui só renderiza.
 */

import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronUp, Info, RotateCcw } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { createDebouncedTracker } from '@/lib/analytics/calculadora-events'
import type { Confianca, Premissas } from '@/lib/calculadora/types'
import type { UseCalculadora } from './useCalculadora'

interface Props {
  hook: UseCalculadora
}

export interface BlocoPremissasHandle {
  abrirEFocar: () => void
}

type PremissaKey = keyof Premissas

const META: Record<
  PremissaKey,
  {
    label: string
    helper: string
    formatar: (v: number) => string
    parsear: (s: string) => number
    min: number
    max: number
    step: number
    sufixo?: string
  }
> = {
  cpl: {
    label: 'CPL médio (R$ por lead)',
    helper:
      'Custo médio para gerar um lead — calculado pela média dos canais selecionados.',
    formatar: (v) => v.toFixed(0),
    parsear: (s) => parseFloat(s.replace(',', '.')),
    min: 30,
    max: 800,
    step: 1,
    sufixo: 'R$',
  },
  taxa_qualificacao: {
    label: 'Taxa de qualificação (lead → MQL)',
    helper:
      'Quantos % dos leads brutos viram MQLs após qualificação pelo time de marketing/SDR.',
    formatar: (v) => (v * 100).toFixed(1),
    parsear: (s) => parseFloat(s.replace(',', '.')) / 100,
    min: 0.05,
    max: 0.8,
    step: 0.01,
    sufixo: '%',
  },
  conversao_mql_cliente: {
    label: 'Conversão MQL → Cliente',
    helper: 'Quantos % dos MQLs viram clientes pagantes ao final do ciclo de venda.',
    formatar: (v) => (v * 100).toFixed(1),
    parsear: (s) => parseFloat(s.replace(',', '.')) / 100,
    min: 0.01,
    max: 0.5,
    step: 0.01,
    sufixo: '%',
  },
  ciclo_dias: {
    label: 'Ciclo médio de venda',
    helper: 'Tempo médio em dias entre primeiro contato e fechamento.',
    formatar: (v) => v.toFixed(0),
    parsear: (s) => parseFloat(s.replace(',', '.')),
    min: 7,
    max: 365,
    step: 1,
    sufixo: 'dias',
  },
}

const CONFIANCA_COR: Record<Confianca, string> = {
  alta: 'text-emerald-500',
  media: 'text-amber-500',
  baixa: 'text-orange-500',
}
const CONFIANCA_LABEL: Record<Confianca, string> = {
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
}

const BlocoPremissas = forwardRef<BlocoPremissasHandle, Props>(function BlocoPremissas(
  { hook },
  ref,
) {
  const [aberto, setAberto] = useState(false)
  const containerRef = useRef<HTMLElement | null>(null)
  const { premissas, premissasEditadas, defaults, setPremissa, resetPremissas } = hook
  const algumaEditada = Object.values(premissasEditadas).some(Boolean)

  const tracker = useMemo(() => createDebouncedTracker(700), [])

  useImperativeHandle(
    ref,
    () => ({
      abrirEFocar: () => {
        setAberto(true)
        // espera o reflow para que scrollIntoView pegue o bloco já expandido
        requestAnimationFrame(() => {
          containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
      },
    }),
    [],
  )

  function emitPremissaAlterada(key: PremissaKey, valor: number) {
    tracker('premissa_alterada', { metadata: { premissa: key, valor } })
  }

  return (
    <section ref={containerRef} className="border-t border-border/60 pt-5">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-controls="bloco-premissas"
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <h2 className="font-display font-medium text-sm">
            Ajustar premissas do mercado{' '}
            {algumaEditada && (
              <span className="ml-2 inline-flex h-1.5 w-1.5 rounded-full bg-primary align-middle" aria-label="Premissas editadas" />
            )}
          </h2>
          <p className="text-[11px] text-foreground/50">
            Os defaults vêm da nossa base de benchmarks. Edite com dados próprios se preferir.
          </p>
        </div>
        {aberto ? (
          <ChevronUp className="h-4 w-4 text-foreground/60" />
        ) : (
          <ChevronDown className="h-4 w-4 text-foreground/60" />
        )}
      </button>

      {aberto && (
        <div id="bloco-premissas" className="mt-5 space-y-4">
          <TooltipProvider delayDuration={200}>
            {(Object.keys(META) as PremissaKey[]).map((key) => {
              const meta = META[key]
              const confianca = defaults[key].confianca
              const valor = premissas[key]
              const editada = premissasEditadas[key]
              return (
                <div key={key} className="grid grid-cols-[1fr_auto] items-end gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <label
                        htmlFor={`prem-${key}`}
                        className="text-[12px] font-medium text-foreground/80"
                      >
                        {meta.label}
                      </label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            aria-label={`Nível de confiança: ${CONFIANCA_LABEL[confianca]}`}
                            className={`inline-flex items-center justify-center ${CONFIANCA_COR[confianca]}`}
                          >
                            <Info className="h-3 w-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[260px] text-xs">
                          <p className="font-medium mb-1">
                            Confiança: {CONFIANCA_LABEL[confianca]}
                          </p>
                          <p className="text-foreground/70">{meta.helper}</p>
                          <p className="text-foreground/50 mt-1.5 italic">
                            Edite o valor se sua operação tem dados próprios.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                      {editada && (
                        <span className="text-[10px] uppercase tracking-wider text-primary/80 font-mono ml-auto">
                          editado
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-foreground/45 leading-snug mb-1.5">
                      {meta.helper}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      id={`prem-${key}`}
                      type="text"
                      inputMode="decimal"
                      className="input-field !py-1.5 !px-2 !w-20 text-right font-mono text-sm"
                      value={meta.formatar(valor)}
                      onChange={(e) => {
                        const v = meta.parsear(e.target.value)
                        if (Number.isFinite(v)) {
                          const clamped = Math.max(meta.min, Math.min(meta.max, v))
                          setPremissa(key, clamped)
                          emitPremissaAlterada(key, clamped)
                        }
                      }}
                    />
                    {meta.sufixo && (
                      <span className="text-[11px] text-foreground/55 font-mono w-9">
                        {meta.sufixo}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </TooltipProvider>

          {algumaEditada && (
            <button
              type="button"
              onClick={resetPremissas}
              className="inline-flex items-center gap-1.5 text-[11px] text-foreground/60 hover:text-primary transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Resetar premissas para defaults do setor
            </button>
          )}
        </div>
      )}
    </section>
  )
})

export default BlocoPremissas
