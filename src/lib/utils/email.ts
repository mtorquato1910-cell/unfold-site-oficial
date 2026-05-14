/**
 * Helpers de normalização de e-mail.
 *
 * Usado pelo painel da Calculadora ao cruzar `calculadora-events.lead_email`
 * com `diagnostico-events.lead_email` (Sprint 5 / S5.1). Mantém uma única
 * regra de normalização para evitar mismatches por case/whitespace.
 */

export function normalizeEmail(raw: string | null | undefined): string {
  if (!raw) return ''
  return raw.toLowerCase().trim()
}

export function isValidEmail(raw: string): boolean {
  // RFC simplificado — suficiente para comparação e tag exibição.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)
}
