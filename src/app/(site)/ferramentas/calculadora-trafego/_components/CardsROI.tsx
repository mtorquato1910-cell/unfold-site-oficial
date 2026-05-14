'use client'

/**
 * Bloco C — 2 cards de ROI (S3.1).
 *
 * Peso visual idêntico (não há "ROI principal e ROI secundário").
 * Cor: ROI ≥ 0 → fundo mint sutil; ROI < 0 → tom de alerta discreto (purple, não vermelho).
 *
 * Animação número-a-número respeitando prefers-reduced-motion.
 * aria-live polite no card (debounce do useDeferredValue absorve digitação rápida).
 */

import { useAnimatedNumber } from './useAnimatedNumber'
import type { Resultado } from '@/lib/calculadora/types'

interface Props {
  resultado: Resultado
}

function fmtBRL(n: number): string {
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  })
}

function fmtROI(n: number): string {
  const sinal = n >= 0 ? '+' : ''
  return `${sinal}${Math.round(n)}%`
}

export default function CardsROI({ resultado }: Props) {
  const roiPeriodo = useAnimatedNumber(resultado.roi_no_periodo)
  const roiTotal = useAnimatedNumber(resultado.roi_total)
  const receita = useAnimatedNumber(resultado.receita_no_periodo)
  const pipeline = useAnimatedNumber(resultado.receita_em_pipeline)

  return (
    <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Resultados de ROI">
      <ROICard
        label="ROI no período"
        roi={roiPeriodo}
        roiTarget={resultado.roi_no_periodo}
        subLabel="Receita"
        subValue={fmtBRL(receita)}
      />
      <ROICard
        label="ROI total (com pipeline)"
        roi={roiTotal}
        roiTarget={resultado.roi_total}
        subLabel="Pipeline"
        subValue={fmtBRL(pipeline)}
      />
    </div>
  )
}

interface ROICardProps {
  label: string
  roi: number
  roiTarget: number
  subLabel: string
  subValue: string
}

function ROICard({ label, roi, roiTarget, subLabel, subValue }: ROICardProps) {
  const positivo = roiTarget >= 0
  const cor = positivo
    ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/25'
    : 'bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/25'
  const numCor = positivo ? 'text-emerald-500' : 'text-purple-300'
  return (
    <div
      className={`rounded-2xl border ${cor} p-5 md:p-6 transition-colors duration-300`}
      aria-live="polite"
      aria-atomic="true"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/55 mb-2">
        {label}
      </p>
      <p className={`font-display font-bold text-4xl md:text-5xl tabular-nums ${numCor}`}>
        {fmtROI(roi)}
      </p>
      <p className="mt-3 text-xs text-foreground/55">
        <span className="text-foreground/40">{subLabel}:</span>{' '}
        <span className="text-foreground/80 font-medium">{subValue}</span>
      </p>
    </div>
  )
}
