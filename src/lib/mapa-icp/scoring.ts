/**
 * Scoring de fit determinístico (PRD da ferramenta §5).
 * Calculado SEMPRE no servidor. Não exibido ao usuário; vai para o CRM.
 * A IA NÃO vê nem produz fit_score/fit_tier (separação obrigatória).
 */
import type { MapaIcpAnswers, FitResult, FitTier } from './types'

const MODELO_PTS: Record<string, number> = { B2B: 25, Hibrido: 15, B2C: 0 }
const TICKET_PTS: Record<string, number> = { '200k+': 20, '50-200k': 18, '20-50k': 15, '5-20k': 10, '<5k': 2 }
const CICLO_PTS: Record<string, number> = { '120d+': 20, '60-120d': 18, '30-60d': 10, '<30d': 3 }
const NDEC_PTS: Record<string, number> = { '7+': 20, '4-6': 18, '2-3': 10, '1': 3 }
const MATUR_PTS: Record<string, number> = { documentado: 15, informal: 10, nao: 5 }

export function scoreFit(a: Pick<MapaIcpAnswers, 'A3' | 'A4' | 'A5' | 'C1' | 'D2'>): FitResult {
  const breakdown = {
    modelo: MODELO_PTS[a.A5] ?? 0,
    ticket: TICKET_PTS[a.A3] ?? 0,
    ciclo: CICLO_PTS[a.A4] ?? 0,
    n_decisores: NDEC_PTS[a.C1] ?? 0,
    maturidade: MATUR_PTS[a.D2] ?? 0,
  }
  const fit_score = Object.values(breakdown).reduce((s, n) => s + n, 0)
  const fit_tier: FitTier = fit_score >= 75 ? 'fit_alto' : fit_score >= 50 ? 'fit_medio' : 'fit_baixo'
  return { fit_score, fit_tier, breakdown }
}
