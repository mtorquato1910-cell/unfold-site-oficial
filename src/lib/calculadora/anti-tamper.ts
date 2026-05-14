/**
 * Detecção de adulteração de payload (ADR-7).
 *
 * Compara o resultado enviado pelo cliente com o resultado recalculado pelo server.
 * Se qualquer dimensão crítica diverge > 1% → marca como adulterado.
 *
 * Política da API: server sempre vence (persiste o resultado do server independente
 * do flag). O flag serve para logging + evento `payload_tampered`.
 *
 * Módulo puro (ADR-1).
 */

import type { Resultado } from './types'

export const DIVERGENCE_THRESHOLD = 0.01

interface Diff {
  campo: keyof Resultado
  client: number
  server: number
  /** Diferença relativa (0..∞). */
  delta: number
}

/**
 * Retorna a lista de campos com divergência acima do threshold (vazia se OK).
 *
 * `Math.max(1, |server|)` evita explosão quando o valor de referência é ~0
 * (ex.: ROI 0% vs 0,001% não deve disparar).
 */
export function detectarDivergencias(
  client: Resultado,
  server: Resultado,
): Diff[] {
  const criticos: Array<keyof Resultado> = [
    'roi_no_periodo',
    'roi_total',
    'receita_no_periodo',
    'receita_em_pipeline',
    'leads_gerados',
    'clientes_fechados',
  ]
  const out: Diff[] = []
  for (const campo of criticos) {
    const a = client[campo]
    const b = server[campo]
    const base = Math.max(1, Math.abs(b))
    const delta = Math.abs(a - b) / base
    if (delta > DIVERGENCE_THRESHOLD) {
      out.push({ campo, client: a, server: b, delta })
    }
  }
  return out
}

export function detectarAdulteracao(client: Resultado, server: Resultado): boolean {
  return detectarDivergencias(client, server).length > 0
}
