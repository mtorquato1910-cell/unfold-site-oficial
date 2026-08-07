/**
 * Verificação de e-mail "ativo" por sintaxe + MX/DNS (server-side, Node runtime).
 *
 * Estratégia em camadas, sem custo nem chave de API:
 *  1. Sintaxe estrita (RFC prático).
 *  2. Bloqueio de domínios descartáveis (temp-mail e afins).
 *  3. Lookup de registros MX do domínio — confirma que ele realmente recebe e-mails.
 *     Pega typos (`gmail.con`), TLDs inválidos e domínios inexistentes.
 *
 * Princípio FAIL-OPEN: se o DNS falhar por timeout/erro de rede (não por
 * "domínio não existe"), o e-mail é considerado válido para NÃO bloquear a
 * conversão por instabilidade de infraestrutura. Só reprovamos quando há
 * certeza de que o domínio não recebe e-mail (NXDOMAIN / zero registros).
 */

import { promises as dns } from 'node:dns'

export type EmailCheckReason =
  | 'sintaxe'
  | 'descartavel'
  | 'exemplo'
  | 'dominio_inexistente'
  | 'sem_mx'

export interface EmailCheckResult {
  ok: boolean
  /** E-mail normalizado (trim + lowercase). */
  email: string
  reason?: EmailCheckReason
  /** `true` quando passou sem conseguir confirmar o MX (fail-open). */
  assumed?: boolean
}

// Sintaxe pragmática: um `@`, parte local sem espaços, domínio com ao menos um ponto.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Domínios de e-mail temporário/descartável mais comuns. */
const DISPOSABLE_DOMAINS = new Set<string>([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.info', 'sharklasers.com',
  '10minutemail.com', '10minutemail.net', 'temp-mail.org', 'tempmail.com',
  'tempmailo.com', 'throwawaymail.com', 'yopmail.com', 'getnada.com',
  'maildrop.cc', 'trashmail.com', 'dispostable.com', 'fakeinbox.com',
  'mailnesia.com', 'mohmal.com', 'emailondeck.com', 'mintemail.com',
  'spamgourmet.com', 'tempr.email', 'mytemp.email', 'moakt.com',
])

/**
 * Domínios de "exemplo/teste" que têm DNS/MX real (logo passariam no lookup),
 * mas nunca são um contato de verdade. Ex.: `giulia@teste.com.br`.
 */
const PLACEHOLDER_DOMAINS = new Set<string>([
  'teste.com', 'teste.com.br', 'testes.com', 'testes.com.br', 'test.com', 'test.com.br',
  'exemplo.com', 'exemplo.com.br', 'example.com', 'example.org', 'example.net',
  'asdf.com', 'aaaa.com', 'abc.com',
])

/** TLDs reservados por RFC 2606 — jamais existem na internet pública. */
const RESERVED_TLDS = ['.test', '.example', '.invalid', '.localhost']

/** `true` se o domínio é claramente de exemplo/teste (não um contato real). */
function isPlaceholderDomain(domain: string): boolean {
  if (PLACEHOLDER_DOMAINS.has(domain)) return true
  return RESERVED_TLDS.some((tld) => domain === tld.slice(1) || domain.endsWith(tld))
}

// Cache em memória do resultado do MX por domínio (TTL curto).
const MX_TTL_MS = 10 * 60 * 1000 // 10 min
const mxCache = new Map<string, { hasMx: boolean; at: number }>()

function isSyntaxValid(email: string): boolean {
  if (!EMAIL_RE.test(email)) return false
  if (email.length > 254) return false
  return true
}

/**
 * Resolve MX (ou A como fallback) do domínio com timeout.
 * @returns `true`/`false` quando há resposta conclusiva; `null` em erro de rede (fail-open).
 */
async function domainHasMx(domain: string, timeoutMs: number): Promise<boolean | null> {
  const cached = mxCache.get(domain)
  if (cached && Date.now() - cached.at < MX_TTL_MS) return cached.hasMx

  const withTimeout = <T>(p: Promise<T>): Promise<T> =>
    Promise.race([
      p,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('dns_timeout')), timeoutMs),
      ),
    ])

  try {
    const records = await withTimeout(dns.resolveMx(domain))
    const hasMx = Array.isArray(records) && records.length > 0
    mxCache.set(domain, { hasMx, at: Date.now() })
    return hasMx
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code
    // Domínio não existe ou sem registro MX → conclusivo (sem MX).
    if (code === 'ENOTFOUND' || code === 'ENODATA' || code === 'NXDOMAIN') {
      // Fallback: alguns domínios recebem e-mail via registro A (sem MX).
      try {
        await withTimeout(dns.resolve(domain))
        mxCache.set(domain, { hasMx: true, at: Date.now() })
        return true
      } catch {
        mxCache.set(domain, { hasMx: false, at: Date.now() })
        return false
      }
    }
    // Timeout / SERVFAIL / erro de rede → inconclusivo (fail-open).
    return null
  }
}

/**
 * Verifica se o e-mail tem sintaxe válida, não é descartável e o domínio recebe e-mails.
 */
export async function verifyEmailDeliverable(
  rawEmail: string,
  opts: { timeoutMs?: number } = {},
): Promise<EmailCheckResult> {
  const email = String(rawEmail || '').trim().toLowerCase()

  if (!isSyntaxValid(email)) {
    return { ok: false, email, reason: 'sintaxe' }
  }

  const domain = email.slice(email.lastIndexOf('@') + 1)

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { ok: false, email, reason: 'descartavel' }
  }

  if (isPlaceholderDomain(domain)) {
    return { ok: false, email, reason: 'exemplo' }
  }

  const hasMx = await domainHasMx(domain, opts.timeoutMs ?? 3000)

  if (hasMx === false) {
    return { ok: false, email, reason: 'sem_mx' }
  }
  if (hasMx === null) {
    // Inconclusivo → fail-open.
    return { ok: true, email, assumed: true }
  }
  return { ok: true, email }
}

/** Mensagem amigável para cada motivo de reprovação de e-mail. */
export function emailReasonMessage(reason: EmailCheckReason): string {
  switch (reason) {
    case 'sintaxe':
      return 'E-mail inválido — verifique o formato.'
    case 'descartavel':
      return 'Use um e-mail permanente — endereços temporários não são aceitos.'
    case 'exemplo':
      return 'Use um e-mail real — endereços de teste/exemplo não são aceitos.'
    case 'dominio_inexistente':
    case 'sem_mx':
      return 'O domínio do e-mail não existe ou não recebe mensagens. Confira se digitou corretamente.'
    default:
      return 'E-mail inválido.'
  }
}
