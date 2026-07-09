/**
 * Orquestrador de validação de contato (e-mail + WhatsApp) — server-side.
 *
 * Combina:
 *  - verifyEmailDeliverable (sintaxe + MX/DNS, fail-open)
 *  - normalizePhoneBR (DDD + regra do 9º dígito)
 *  - verifyWhatsappExists (Evolution API, fail-open)
 *
 * Usado tanto pelo endpoint onBlur (/api/validate-contato) quanto pelos endpoints
 * de submissão (newsletter, diagnóstico, calculadora, guia-eleições) — fonte única.
 */

import {
  verifyEmailDeliverable,
  emailReasonMessage,
  type EmailCheckResult,
} from './email-mx'
import {
  verifyWhatsappExists,
  whatsappReasonMessage,
  type WhatsappCheckResult,
} from './whatsapp'
import { normalizePhoneBR } from '@/lib/format/phone-mask'

export interface FieldResult {
  ok: boolean
  message?: string
}

export interface ContatoValidation {
  email?: FieldResult
  whatsapp?: FieldResult & {
    /** Número nacional normalizado (com 9), pronto para gravar no RD. */
    normalized?: string
    /** Formato E.164 sem '+' (ex.: 5511999999999). */
    e164?: string
  }
}

export interface ValidateContatoInput {
  email?: string
  telefone?: string
  /** Quando `true`, telefone vazio é reprovado (form do hotsite exige WhatsApp). */
  requirePhone?: boolean
  /** Quando `true`, o campo de telefone deve ser celular (WhatsApp). Default `true`. */
  mobileOnly?: boolean
}

/**
 * Valida e-mail e/ou WhatsApp. Campos ausentes não são avaliados (retornam undefined),
 * exceto telefone quando `requirePhone` é `true`.
 */
export async function validateContato(
  input: ValidateContatoInput,
): Promise<ContatoValidation> {
  const out: ContatoValidation = {}
  const mobileOnly = input.mobileOnly ?? true

  const tasks: Promise<void>[] = []

  // --- E-mail ---
  if (input.email != null && input.email.trim() !== '') {
    tasks.push(
      verifyEmailDeliverable(input.email).then((r: EmailCheckResult) => {
        out.email = r.ok
          ? { ok: true }
          : { ok: false, message: r.reason ? emailReasonMessage(r.reason) : 'E-mail inválido.' }
      }),
    )
  }

  // --- WhatsApp / telefone ---
  const telRaw = input.telefone?.trim() ?? ''
  if (telRaw === '') {
    if (input.requirePhone) {
      out.whatsapp = { ok: false, message: 'Informe seu WhatsApp com DDD.' }
    }
  } else {
    const norm = normalizePhoneBR(telRaw)
    if (!norm.ok) {
      out.whatsapp = {
        ok: false,
        message:
          norm.reason === 'ddd'
            ? 'DDD inválido — confira os dois primeiros dígitos.'
            : norm.reason === 'suspeito'
              ? 'Informe um número de WhatsApp real (não use números repetidos ou sequenciais).'
              : 'Número inválido — informe DDD + número.',
      }
    } else if (mobileOnly && !norm.isMobile) {
      out.whatsapp = {
        ok: false,
        message: 'Informe um celular com WhatsApp (não um telefone fixo).',
      }
    } else {
      // Formato válido — checa existência no WhatsApp (fail-open).
      tasks.push(
        verifyWhatsappExists(norm.e164).then((r: WhatsappCheckResult) => {
          out.whatsapp = r.ok
            ? { ok: true, normalized: norm.national, e164: norm.e164 }
            : {
                ok: false,
                normalized: norm.national,
                e164: norm.e164,
                message: r.reason ? whatsappReasonMessage(r.reason) : 'WhatsApp inválido.',
              }
        }),
      )
    }
  }

  await Promise.all(tasks)
  return out
}

/** `true` se todos os campos avaliados passaram. */
export function isContatoOk(v: ContatoValidation): boolean {
  if (v.email && !v.email.ok) return false
  if (v.whatsapp && !v.whatsapp.ok) return false
  return true
}
