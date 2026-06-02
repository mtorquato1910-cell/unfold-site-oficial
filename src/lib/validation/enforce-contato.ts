/**
 * Helper server-side para os endpoints de submissão: roda validateContato e,
 * em caso de reprovação, devolve a primeira mensagem de erro. Em caso de sucesso,
 * entrega o telefone já normalizado (com 9) para gravar no RD.
 *
 * Fail-open por construção: e-mail com MX inconclusivo e WhatsApp não-checado
 * (Evolution offline/desligada) passam — só reprova o comprovadamente inválido.
 */

import { validateContato, isContatoOk, type ValidateContatoInput } from './contato'

export interface EnforceContatoResult {
  ok: boolean
  /** Mensagem do primeiro campo reprovado (e-mail tem prioridade). */
  error?: string
  /** Qual campo falhou. */
  field?: 'email' | 'whatsapp'
  /** Telefone nacional normalizado (com 9) quando válido; senão o original. */
  telefone?: string
  /** E.164 sem '+' quando válido. */
  e164?: string
}

export async function enforceContato(
  input: ValidateContatoInput,
): Promise<EnforceContatoResult> {
  const v = await validateContato(input)
  if (!isContatoOk(v)) {
    if (v.email && !v.email.ok) {
      return { ok: false, field: 'email', error: v.email.message }
    }
    return { ok: false, field: 'whatsapp', error: v.whatsapp?.message }
  }
  return {
    ok: true,
    telefone: v.whatsapp?.normalized ?? input.telefone,
    e164: v.whatsapp?.e164,
  }
}
