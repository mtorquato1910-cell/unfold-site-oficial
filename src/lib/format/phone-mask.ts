/**
 * Máscara brasileira de telefone celular: `(11) 99999-9999`.
 *
 * - Aceita 10 ou 11 dígitos (fixo ou celular).
 * - Em entrada parcial, formata progressivamente para feedback visual.
 * - `extractDigits` retorna apenas dígitos (formato esperado pela API RD).
 */

export function extractDigits(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 11)
}

export function formatPhoneBR(raw: string): string {
  const d = extractDigits(raw)
  if (d.length === 0) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

/** Valida número brasileiro (10 ou 11 dígitos). */
export function isValidPhoneBR(raw: string): boolean {
  const d = extractDigits(raw)
  return d.length === 10 || d.length === 11
}
