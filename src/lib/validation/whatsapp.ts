/**
 * Verificação de existência de WhatsApp via Evolution API (self-host).
 *
 * Endpoint: POST {EVOLUTION_API_URL}/chat/whatsappNumbers/{instance}
 *   headers: { apikey: EVOLUTION_API_KEY, 'Content-Type': 'application/json' }
 *   body:    { numbers: ["5511999999999"] }   // E.164 sem '+'
 *   resp:    [{ exists: boolean, jid: string, number: string }]
 *
 * Princípio FAIL-OPEN: se a Evolution não estiver configurada, estiver fora do ar
 * ou demorar, NÃO bloqueamos o lead — apenas pulamos a checagem de existência.
 * Só reprovamos quando a Evolution responde explicitamente `exists: false`.
 *
 * Configuração (env):
 *   EVOLUTION_API_URL       ex.: https://evolution.seudominio.com
 *   EVOLUTION_INSTANCE      nome da instância conectada (QR escaneado)
 *   EVOLUTION_API_KEY       apikey global ou da instância
 *   WHATSAPP_VALIDATION_ENABLED  'false' desativa a checagem (default: ativa se houver config)
 */

export type WhatsappCheckReason = 'nao_existe'

export interface WhatsappCheckResult {
  /** `true` se o número pode ser aceito (existe OU checagem indisponível). */
  ok: boolean
  /** `true` se a Evolution foi efetivamente consultada. */
  checked: boolean
  /** Resultado bruto da Evolution quando `checked` é `true`. */
  exists?: boolean
  reason?: WhatsappCheckReason
}

interface EvolutionConfig {
  url: string
  instance: string
  apiKey: string
}

function readConfig(): EvolutionConfig | null {
  if (process.env.WHATSAPP_VALIDATION_ENABLED === 'false') return null
  const url = process.env.EVOLUTION_API_URL?.trim().replace(/\/+$/, '')
  const instance = process.env.EVOLUTION_INSTANCE?.trim()
  const apiKey = process.env.EVOLUTION_API_KEY?.trim()
  if (!url || !instance || !apiKey) return null
  return { url, instance, apiKey }
}

interface EvolutionNumberStatus {
  exists?: boolean
  jid?: string
  number?: string
}

/**
 * Consulta a Evolution para saber se `e164Digits` (ex.: `5511999999999`) tem WhatsApp.
 * Sempre fail-open: qualquer erro/indisponibilidade resulta em `{ ok: true, checked: false }`.
 */
export async function verifyWhatsappExists(
  e164Digits: string,
  opts: { timeoutMs?: number } = {},
): Promise<WhatsappCheckResult> {
  const cfg = readConfig()
  if (!cfg) return { ok: true, checked: false }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 4000)

  try {
    const res = await fetch(`${cfg.url}/chat/whatsappNumbers/${encodeURIComponent(cfg.instance)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: cfg.apiKey,
      },
      body: JSON.stringify({ numbers: [e164Digits] }),
      signal: controller.signal,
      cache: 'no-store',
    })

    if (!res.ok) {
      // Erro da Evolution (auth, instância desconectada, etc.) → fail-open.
      return { ok: true, checked: false }
    }

    const data = (await res.json().catch(() => null)) as EvolutionNumberStatus[] | null
    if (!Array.isArray(data) || data.length === 0) {
      return { ok: true, checked: false }
    }

    // Casa pelo número retornado; cai no primeiro item se não houver match.
    const entry =
      data.find((d) => (d.number || '').replace(/\D/g, '').endsWith(e164Digits.slice(-8))) ?? data[0]

    if (typeof entry.exists !== 'boolean') {
      return { ok: true, checked: false }
    }

    return entry.exists
      ? { ok: true, checked: true, exists: true }
      : { ok: false, checked: true, exists: false, reason: 'nao_existe' }
  } catch {
    // Timeout / rede / abort → fail-open.
    return { ok: true, checked: false }
  } finally {
    clearTimeout(timer)
  }
}

/** Mensagem amigável quando o WhatsApp não existe. */
export function whatsappReasonMessage(_reason: WhatsappCheckReason): string {
  return 'Não encontramos um WhatsApp ativo nesse número. Confira o DDD e o número.'
}
