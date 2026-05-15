/**
 * Helpers de parsing/formatação de valores em BRL para a Calculadora v2.
 *
 * Extraídos de `_components/BlocoInputs.tsx` em 2026-05-15 (Sprint hotfix Bug 2)
 * para virarem módulo testável e documentado.
 *
 * Contrato esperado:
 *   - "10000"            → 10000
 *   - "10.000"           → 10000   (ponto como separador de milhar BR)
 *   - "10.000,00"        → 10000
 *   - "R$ 10.000,00"     → 10000
 *   - "100.000"          → 100000
 *   - "1.000.000"        → 1000000
 *   - "1,5"              → 1.5     (vírgula = decimal)
 *   - ""                 → 0
 *   - "abc"              → 0
 */

export function parseLooseNumber(raw: string): number {
  if (!raw) return 0
  const cleaned = raw
    .replace(/[^\d,.-]/g, '')
    // Remove ponto seguido de exatamente 3 dígitos + (não-dígito OU fim) — separador de milhar BR.
    .replace(/\.(?=\d{3}(\D|$))/g, '')
    // Converte vírgula decimal BR para ponto decimal JS.
    .replace(',', '.')
  const n = parseFloat(cleaned)
  return Number.isFinite(n) ? n : 0
}

export function formatBRL(n: number): string {
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  })
}
