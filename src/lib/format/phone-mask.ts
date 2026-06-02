/**
 * Máscara e normalização de telefone brasileiro: `(11) 99999-9999`.
 *
 * - Aceita 10 (fixo) ou 11 (celular) dígitos.
 * - Em entrada parcial, formata progressivamente para feedback visual.
 * - `extractDigits` retorna apenas dígitos (formato esperado pela API RD).
 * - `normalizePhoneBR` valida DDD e aplica a regra do 9º dígito (o usuário pode
 *   digitar o celular com ou sem o `9` inicial; o sistema corrige).
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

/**
 * DDDs válidos no Brasil (Plano Nacional de Numeração — ANATEL).
 * Usado para descartar números com DDD inexistente (ex.: 00, 10, 20).
 */
export const DDDS_VALIDOS = new Set<string>([
  // Região 1 (SP/RJ/ES)
  '11', '12', '13', '14', '15', '16', '17', '18', '19',
  '21', '22', '24', '27', '28',
  // Região 3/4 (MG/PR/SC/RS)
  '31', '32', '33', '34', '35', '37', '38',
  '41', '42', '43', '44', '45', '46', '47', '48', '49',
  // Região 5 (RS/MS/MT/GO/TO/DF)
  '51', '53', '54', '55',
  '61', '62', '63', '64', '65', '66', '67', '68', '69',
  // Região 7/8 (Nordeste)
  '71', '73', '74', '75', '77', '79',
  '81', '82', '83', '84', '85', '86', '87', '88', '89',
  // Região 9 (Norte)
  '91', '92', '93', '94', '95', '96', '97', '98', '99',
])

export interface NormalizedPhoneBR {
  /** `true` se o número é um telefone brasileiro válido. */
  ok: boolean
  /** Número nacional só-dígitos no formato canônico (11 p/ celular c/ 9, 10 p/ fixo). */
  national: string
  /** Formato internacional E.164 sem `+` (ex.: `5511999999999`). */
  e164: string
  /** DDD de 2 dígitos. */
  ddd: string
  /** `true` se for celular (após normalização do 9º dígito). */
  isMobile: boolean
  /** Código da razão da falha quando `ok` é `false`. */
  reason?: 'vazio' | 'comprimento' | 'ddd' | 'numero'
}

const INVALID_PHONE: NormalizedPhoneBR = {
  ok: false,
  national: '',
  e164: '',
  ddd: '',
  isMobile: false,
  reason: 'comprimento',
}

/**
 * Normaliza um telefone brasileiro aplicando a regra do 9º dígito.
 *
 * Aceita:
 * - 10 dígitos: fixo (`2xxx`–`5xxx`) ou celular antigo sem o `9` (`6`–`9`).
 *   No segundo caso, insere o `9` → 11 dígitos.
 * - 11 dígitos: celular com o `9` inicial (terceiro dígito deve ser `9`).
 * - 12/13 dígitos com prefixo de país `55`: remove o `55` antes de processar.
 *
 * @example normalizePhoneBR('11988887777') → national '11988887777', e164 '5511988887777'
 * @example normalizePhoneBR('1188887777')  → national '11988887777' (insere o 9)
 */
export function normalizePhoneBR(raw: string | undefined | null): NormalizedPhoneBR {
  if (!raw) return { ...INVALID_PHONE, reason: 'vazio' }

  let d = String(raw).replace(/\D/g, '')

  // Remove o prefixo de país 55 (formato internacional).
  if ((d.length === 12 || d.length === 13) && d.startsWith('55')) {
    d = d.slice(2)
  }

  if (d.length !== 10 && d.length !== 11) {
    return { ...INVALID_PHONE, reason: 'comprimento' }
  }

  const ddd = d.slice(0, 2)
  if (!DDDS_VALIDOS.has(ddd)) {
    return { ...INVALID_PHONE, ddd, reason: 'ddd' }
  }

  let resto = d.slice(2)

  if (resto.length === 8) {
    const first = resto[0]
    if (first >= '2' && first <= '5') {
      // Telefone fixo — mantém 10 dígitos.
      const national = ddd + resto
      return { ok: true, national, e164: '55' + national, ddd, isMobile: false }
    }
    // Celular sem o 9 inicial → insere o 9.
    resto = '9' + resto
  } else {
    // 9 dígitos: celular precisa começar com 9.
    if (resto[0] !== '9') {
      return { ...INVALID_PHONE, ddd, reason: 'numero' }
    }
  }

  const national = ddd + resto
  return { ok: true, national, e164: '55' + national, ddd, isMobile: true }
}

/** Valida número brasileiro (fixo ou celular) com DDD e regra do 9º dígito. */
export function isValidPhoneBR(raw: string): boolean {
  return normalizePhoneBR(raw).ok
}

/** Valida que o número é um CELULAR brasileiro válido (exigido para WhatsApp). */
export function isValidMobileBR(raw: string): boolean {
  const n = normalizePhoneBR(raw)
  return n.ok && n.isMobile
}
