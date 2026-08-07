/**
 * Verificação de telefone via Twilio Lookup API v2 (server-side, Node runtime).
 *
 * Substitui a antiga checagem via Evolution/Baileys (WhatsApp Web não-oficial),
 * que causava banimento do número conectado. A Twilio é um provedor oficial e
 * NÃO envia nada ao cliente — é uma consulta silenciosa que confirma se o número
 * é um celular real e ativo na operadora.
 *
 * Endpoint: GET https://lookups.twilio.com/v2/PhoneNumbers/{E164}?Fields=line_type_intelligence
 *   auth:  Basic base64(TWILIO_ACCOUNT_SID:TWILIO_AUTH_TOKEN)
 *   resp:  { valid: boolean, line_type_intelligence: { type: 'mobile'|'landline'|'voip'|... } }
 *
 * Princípio FAIL-OPEN: se a Twilio não estiver configurada, estiver fora do ar
 * ou demorar, NÃO bloqueamos o lead — apenas pulamos a checagem. Só reprovamos
 * quando a Twilio responde com um sinal CONCLUSIVO de que o número não serve:
 *   - valid=false                              → formato/plano inválido
 *   - line_type_intelligence.error_code=60600  → número não provisionado (não existe
 *     em nenhuma operadora). É assim que a Twilio marca números inventados como
 *     `82900000000`, que passam no check de formato (valid=true) mas não existem.
 *   - line_type_intelligence.type='landline'   → telefone fixo (não tem WhatsApp)
 * Outros error_codes de line type (60601/60604 etc.) são inconclusivos → fail-open.
 *
 * Configuração (env):
 *   TWILIO_ACCOUNT_SID     ex.: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *   TWILIO_AUTH_TOKEN      token do Console da Twilio
 *   PHONE_LOOKUP_ENABLED   'false' desativa a checagem (default: ativa se houver config)
 */

export type PhoneLookupReason = 'invalido' | 'nao_celular'

export interface PhoneLookupResult {
  /** `true` se o número pode ser aceito (válido OU checagem indisponível). */
  ok: boolean
  /** `true` se a Twilio foi efetivamente consultada. */
  checked: boolean
  /** Resposta bruta `valid` da Twilio quando `checked` é `true`. */
  valid?: boolean
  /** Tipo de linha reportado (mobile/landline/voip/...). */
  lineType?: string
  reason?: PhoneLookupReason
}

interface TwilioConfig {
  accountSid: string
  authToken: string
}

function readConfig(): TwilioConfig | null {
  if (process.env.PHONE_LOOKUP_ENABLED === 'false') return null
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim()
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim()
  if (!accountSid || !authToken) return null
  return { accountSid, authToken }
}

interface TwilioLookupResponse {
  valid?: boolean
  line_type_intelligence?: { type?: string | null; error_code?: number | null } | null
}

/** Erro da Twilio para número não provisionado / fora de cobertura (não existe). */
const UNPROVISIONED_ERROR = 60600

// Cache em memória do resultado CONCLUSIVO por número (TTL curto). Evita pagar
// à Twilio de novo pelo mesmo número — o onBlur + o submit consultariam 2x.
// Só resultados `checked:true` entram no cache; fail-open (transitório) nunca.
const LOOKUP_TTL_MS = 30 * 60 * 1000 // 30 min
const lookupCache = new Map<string, { result: PhoneLookupResult; at: number }>()

/**
 * Consulta a Twilio para saber se `e164Digits` (ex.: `5511999999999`, sem '+')
 * é um número válido e é um celular. Sempre fail-open: qualquer erro/indisponibilidade
 * resulta em `{ ok: true, checked: false }`.
 */
export async function verifyPhoneLookup(
  e164Digits: string,
  opts: { timeoutMs?: number } = {},
): Promise<PhoneLookupResult> {
  const cfg = readConfig()
  if (!cfg) return { ok: true, checked: false }

  const e164 = e164Digits.startsWith('+') ? e164Digits : `+${e164Digits}`

  const cached = lookupCache.get(e164)
  if (cached && Date.now() - cached.at < LOOKUP_TTL_MS) return cached.result

  const remember = (result: PhoneLookupResult): PhoneLookupResult => {
    if (result.checked) lookupCache.set(e164, { result, at: Date.now() })
    return result
  }

  const auth = Buffer.from(`${cfg.accountSid}:${cfg.authToken}`).toString('base64')

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 4000)

  try {
    const url = `https://lookups.twilio.com/v2/PhoneNumbers/${encodeURIComponent(
      e164,
    )}?Fields=line_type_intelligence`
    const res = await fetch(url, {
      headers: { Authorization: `Basic ${auth}` },
      signal: controller.signal,
      cache: 'no-store',
    })

    // 404 = número não pôde ser encontrado/validado → conclusivo (inválido).
    if (res.status === 404) {
      return remember({ ok: false, checked: true, valid: false, reason: 'invalido' })
    }
    if (!res.ok) {
      // 401 (auth), 429 (rate limit), 5xx → fail-open.
      return { ok: true, checked: false }
    }

    const data = (await res.json().catch(() => null)) as TwilioLookupResponse | null
    if (!data || typeof data.valid !== 'boolean') {
      return { ok: true, checked: false }
    }

    if (data.valid === false) {
      return remember({ ok: false, checked: true, valid: false, reason: 'invalido' })
    }

    const lti = data.line_type_intelligence
    const lineType = lti?.type ?? undefined

    // Número não provisionado (não existe em nenhuma operadora) — o caso do fake
    // `82900000000`, que passa como valid=true mas não é uma linha real.
    if (lti?.error_code === UNPROVISIONED_ERROR) {
      return remember({ ok: false, checked: true, valid: true, lineType, reason: 'invalido' })
    }

    // Telefone fixo → não tem WhatsApp.
    if (lineType === 'landline') {
      return remember({ ok: false, checked: true, valid: true, lineType, reason: 'nao_celular' })
    }

    return remember({ ok: true, checked: true, valid: true, lineType })
  } catch {
    // Timeout / rede / abort → fail-open.
    return { ok: true, checked: false }
  } finally {
    clearTimeout(timer)
  }
}

/** Mensagem amigável para cada motivo de reprovação de telefone. */
export function phoneLookupReasonMessage(reason: PhoneLookupReason): string {
  switch (reason) {
    case 'nao_celular':
      return 'Informe um celular com WhatsApp — este número parece ser um telefone fixo.'
    case 'invalido':
    default:
      return 'Não encontramos esse número. Confira o DDD e o número do seu WhatsApp.'
  }
}
