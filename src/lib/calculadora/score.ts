/**
 * Lead score v2 — versão "Calculadora" (sprint planner / Sprint 4 / S4.1).
 *
 * Spec v2 não tem o conceito de "cargo", então o score é função dos inputs da
 * calculadora + resultado:
 *   base 30
 *   + investimento_mensal ≥ 50k → +30 / ≥ 10k → +20 / ≥ 3k → +10
 *   + ticket_medio ≥ 50k → +25 / ≥ 10k → +15 / ≥ 3k → +8
 *   + CRM funcional Sim → +10
 *   + ROI total > 100% → +10 (sinal forte de fit)
 *   cap 100
 *
 * Módulo puro (ADR-1).
 */

export interface LeadScoreInputs {
  investimento_mensal: number
  ticket_medio: number
  crm_funcional: boolean
  roi_total: number
}

export function calcLeadScore(args: LeadScoreInputs): number {
  let score = 30
  if (args.investimento_mensal >= 50000) score += 30
  else if (args.investimento_mensal >= 10000) score += 20
  else if (args.investimento_mensal >= 3000) score += 10
  if (args.ticket_medio >= 50000) score += 25
  else if (args.ticket_medio >= 10000) score += 15
  else if (args.ticket_medio >= 3000) score += 8
  if (args.crm_funcional) score += 10
  if (args.roi_total > 100) score += 10
  return Math.min(100, Math.max(0, score))
}
