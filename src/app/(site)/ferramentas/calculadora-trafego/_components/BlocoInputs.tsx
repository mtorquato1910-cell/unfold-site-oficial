'use client'

/**
 * Bloco B parte 1 — 6 inputs da Etapa 2 (S2.3).
 * Spec §4.2. Microcopy literal — qualquer alteração requer alinhamento estratégico.
 */

import { useEffect, useMemo, useState } from 'react'
import { CANAIS } from '@/lib/calculadora/benchmarks'
import { createDebouncedTracker } from '@/lib/analytics/calculadora-events'
import { parseLooseNumber, formatBRL } from '@/lib/calculadora/parse-number'
import type { Canal, Modelo, Periodo } from '@/lib/calculadora/types'
import type { UseCalculadora } from './useCalculadora'

interface Props {
  hook: UseCalculadora
}

const PERIODOS: { value: Periodo; label: string }[] = [
  { value: 3, label: '3 meses' },
  { value: 6, label: '6 meses' },
  { value: 12, label: '12 meses' },
]

export default function BlocoInputs({ hook }: Props) {
  const { inputs, setInput } = hook
  // Tracker debounced (ADR / validação @architect: 700ms para não floodar).
  const tracker = useMemo(() => createDebouncedTracker(700), [])

  function emitInputAlterado(input: string, valor: unknown) {
    tracker('calculadora_input_alterado', { metadata: { input, valor } })
  }

  return (
    <section aria-labelledby="calc-inputs-titulo" className="space-y-6">
      <header>
        <h2 id="calc-inputs-titulo" className="font-display font-bold text-lg mb-1">
          Sua operação
        </h2>
        <p className="text-xs text-foreground/55">
          Ajuste qualquer campo e veja o impacto no resultado em tempo real.
        </p>
      </header>

      {/* 1. Investimento mensal */}
      <Field
        id="inv-mensal"
        label="Investimento mensal em mídia paga"
        helper="Quanto você pretende investir por mês em mídia paga."
      >
        <CurrencyInput
          id="inv-mensal"
          value={inputs.investimento_mensal}
          min={1000}
          max={500000}
          step={1000}
          onChange={(v) => {
            setInput('investimento_mensal', v)
            emitInputAlterado('investimento_mensal', v)
          }}
        />
        <input
          type="range"
          min={1000}
          max={500000}
          step={1000}
          value={inputs.investimento_mensal}
          onChange={(e) => {
            const v = Number(e.target.value)
            setInput('investimento_mensal', v)
            emitInputAlterado('investimento_mensal', v)
          }}
          className="mt-3 w-full accent-primary"
          aria-label="Slider de investimento mensal"
        />
      </Field>

      {/* 2. Canais multi-select */}
      <Field
        id="canais"
        label="Canais"
        helper="Selecione os canais onde pretende distribuir o investimento. O CPL aplicado é a média dos canais selecionados."
      >
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Canais de mídia paga">
          {CANAIS.map((c) => {
            const ativo = inputs.canais.includes(c.value)
            return (
              <button
                key={c.value}
                type="button"
                role="checkbox"
                aria-checked={ativo}
                onClick={() => {
                  const novos: Canal[] = ativo
                    ? inputs.canais.filter((x) => x !== c.value)
                    : [...inputs.canais, c.value]
                  // mínimo 1 canal
                  const final: Canal[] = novos.length === 0 ? inputs.canais : novos
                  setInput('canais', final)
                  emitInputAlterado('canais', final)
                }}
                className={`rounded-lg border px-3 py-3 text-sm font-medium transition-all ${
                  ativo
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-card hover:border-primary/40 text-foreground/70'
                }`}
              >
                {c.label}
              </button>
            )
          })}
        </div>
        {inputs.canais.length === 0 && (
          <p className="text-destructive text-xs mt-1" role="alert">
            Selecione ao menos 1 canal.
          </p>
        )}
      </Field>

      {/* 3. Ticket médio */}
      <Field
        id="ticket"
        label="Ticket médio do seu negócio"
        helper="Valor médio de um contrato/venda fechada no seu negócio."
      >
        <CurrencyInput
          id="ticket"
          value={inputs.ticket_medio}
          min={1000}
          step={500}
          onChange={(v) => {
            setInput('ticket_medio', v)
            emitInputAlterado('ticket_medio', v)
          }}
        />
      </Field>

      {/* 4. Modelo B2B/B2C */}
      <Field
        id="modelo"
        label="Modelo de negócio"
        helper="O modelo de negócio afeta as taxas de mercado aplicadas."
      >
        <SegmentedToggle<Modelo>
          options={[
            { value: 'b2b', label: 'B2B' },
            { value: 'b2c', label: 'B2C' },
          ]}
          value={inputs.modelo}
          onChange={(v) => {
            setInput('modelo', v)
            emitInputAlterado('modelo', v)
          }}
        />
      </Field>

      {/* 5. Período */}
      <Field
        id="periodo"
        label="Período de projeção"
        helper="Por quanto tempo você quer projetar o resultado."
      >
        <SegmentedToggle<Periodo>
          options={PERIODOS}
          value={inputs.periodo}
          onChange={(v) => {
            setInput('periodo', v)
            emitInputAlterado('periodo', v)
          }}
        />
      </Field>

      {/* 6. CRM funcional */}
      <Field
        id="crm"
        label="Sua operação tem CRM funcional?"
        helper="Operações com CRM funcional convertem leads em clientes com 2x mais eficiência. Sua resposta aqui afeta as taxas aplicadas no cálculo."
      >
        <SegmentedToggle<boolean>
          options={[
            { value: true, label: 'Sim' },
            { value: false, label: 'Não' },
          ]}
          value={inputs.crm_funcional}
          onChange={(v) => {
            setInput('crm_funcional', v)
            emitInputAlterado('crm_funcional', v)
          }}
        />
      </Field>
    </section>
  )
}

// ─── helpers ────────────────────────────────────────────────────────────────

function Field({
  id,
  label,
  helper,
  children,
}: {
  id: string
  label: string
  helper?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-foreground/85 block mb-1">
        {label}
      </label>
      {helper && <p className="text-[11px] text-foreground/50 leading-relaxed mb-2">{helper}</p>}
      {children}
    </div>
  )
}

interface CurrencyInputProps {
  id: string
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (v: number) => void
}

/**
 * Input numérico que mostra máscara R$ ao desfocar e aceita paste/digitação livre.
 *
 * Hotfix 2026-05-15 (Bug 2): mantemos texto local separado do `value` numérico.
 * Sem isso, `value={formatBRL(value)}` reformatava a cada keystroke — quando
 * o usuário digitava "10000" o input passava por "R$ 1.000" e o próximo "0"
 * gerava "R$ 1.0000", interpretado pelo parser como decimal `1.0` e zerando
 * a entrada. Agora o texto livre só vira BRL no blur.
 */
function CurrencyInput({ id, value, min = 0, max, onChange }: CurrencyInputProps) {
  const [focused, setFocused] = useState(false)
  const [text, setText] = useState(() => formatBRL(value))

  // Sincroniza texto exibido quando `value` muda externamente (slider, defaults)
  // e o input não está em foco — evita sobrescrever digitação em andamento.
  useEffect(() => {
    if (!focused) setText(formatBRL(value))
  }, [value, focused])

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      className="input-field font-mono"
      value={text}
      onFocus={() => {
        setFocused(true)
        setText(value > 0 ? String(value) : '')
      }}
      onBlur={(e) => {
        setFocused(false)
        const n = parseLooseNumber(e.target.value)
        const clamped = Math.max(min, max ? Math.min(max, n) : n)
        onChange(clamped)
        setText(formatBRL(clamped))
      }}
      onChange={(e) => {
        const raw = e.target.value
        setText(raw)
        const n = parseLooseNumber(raw)
        if (Number.isFinite(n)) onChange(n)
      }}
      aria-label="Valor em reais"
    />
  )
}

interface SegmentedToggleProps<T> {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}

function SegmentedToggle<T extends string | number | boolean>({
  options,
  value,
  onChange,
}: SegmentedToggleProps<T>) {
  return (
    <div
      role="radiogroup"
      className="grid grid-flow-col auto-cols-fr gap-2 rounded-lg border border-border bg-card/40 p-1"
    >
      {options.map((opt) => {
        const ativo = opt.value === value
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={ativo}
            onClick={() => onChange(opt.value)}
            className={`rounded-md py-2 text-sm font-medium transition-all ${
              ativo
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-foreground/70 hover:text-foreground hover:bg-card'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
