/**
 * Contrato cross-product Calculadora → Diagnóstico (ADR-4).
 *
 * Tipo versionado consumido pelos dois produtos:
 * - Calculadora gera o payload no clique do CTA (Sprint 3 / S3.4) e o passa via
 *   query param + sessionStorage com a key `calc-v2:para-diagnostico`.
 * - Diagnóstico (sprint paralela / S3.0) lê o payload e pré-preenche a Etapa 1.
 *
 * Bump `v` ao mudar o shape — leitor do Diagnóstico deve ignorar versões desconhecidas.
 */

import { z } from 'zod'
import { setorSchema } from '../calculadora/schema'

export const CALC_TO_DIAG_VERSION = 1
export const CALC_TO_DIAG_STORAGE_KEY = 'calc-v2:para-diagnostico'
export const CALC_TO_DIAG_QUERY_PARAM = 'origem'
export const CALC_TO_DIAG_TOKEN_PARAM = 'token'

export const calcToDiagSchema = z.object({
  v: z.literal(CALC_TO_DIAG_VERSION),
  origem: z.literal('calculadora'),
  token: z.string().regex(/^[a-f0-9]{32}$/),
  // Etapa 1 da Calculadora pré-preenche Etapa 1 do Diagnóstico:
  nome: z.string().min(1),
  email: z.string().email(),
  empresa: z.string().min(1),
  setor: setorSchema,
  // Contexto opcional para o time comercial (não vira campo visível do Diagnóstico):
  crm_funcional: z.boolean().optional(),
  ticket_medio: z.number().optional(),
  investimento_mensal: z.number().optional(),
})

export type CalcToDiagPayload = z.infer<typeof calcToDiagSchema>

/**
 * Garante o shape antes de gravar no sessionStorage / passar para URL.
 * Lança ZodError se inválido — caller decide UX (não silenciar).
 */
export function encodeCalcToDiag(p: Omit<CalcToDiagPayload, 'v' | 'origem'>): CalcToDiagPayload {
  return calcToDiagSchema.parse({
    v: CALC_TO_DIAG_VERSION,
    origem: 'calculadora',
    ...p,
  })
}

/**
 * Tenta decodificar payload do sessionStorage. Aceita JSON inválido / versão
 * desconhecida retornando `null` (Diagnóstico segue fluxo normal).
 */
export function decodeCalcToDiag(raw: unknown): CalcToDiagPayload | null {
  if (typeof raw !== 'string' || raw.length === 0) return null
  try {
    const parsed = JSON.parse(raw)
    if (parsed?.v !== CALC_TO_DIAG_VERSION) return null
    const result = calcToDiagSchema.safeParse(parsed)
    return result.success ? result.data : null
  } catch {
    return null
  }
}
