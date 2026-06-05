/**
 * POST /api/guia-eleicoes/consultoria — solicitação de consultoria (#contato do hotsite).
 *
 * Espelha o fluxo de /api/guia-eleicoes/lead, sem Turnstile/perfil: rate limit →
 * origin allowlist → Zod → validação reforçada (e-mail MX + WhatsApp) → persiste o
 * lead em Payload (origem 'guia-eleicoes', empresa = organização) ANTES da sync →
 * sync RD legacy (tag consultoria-2026) fire-and-forget. O usuário é liberado mesmo
 * se o RD falhar (resiliência).
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { rateLimit, resolveClientIP } from '@/lib/rate-limit'
import { enforceContato } from '@/lib/validation/enforce-contato'
import { syncConsultoriaToRD } from '@/lib/crm/rd-consultoria'
import { consultoriaSchema } from '@/app/guia-eleicoes-2026/_lib/validation'
import { anonymizeIp } from '@/app/guia-eleicoes-2026/_lib/anonymize-ip'

const DEFAULT_ORIGINS = ['https://eleicoes.unfoldgrowth.com.br', 'https://unfoldgrowth.com.br']

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true
  if (
    process.env.NODE_ENV !== 'production' &&
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
  ) {
    return true
  }
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin)) return true
  const allowed =
    process.env.GUIA_ALLOWED_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean) ||
    DEFAULT_ORIGINS
  return allowed.includes(origin)
}

interface OriginPayload {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  referrer?: string
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now()
  const ipReal = resolveClientIP(req)
  const ipAnon = anonymizeIp(ipReal)

  function log(result: string, extra?: Record<string, unknown>) {
    console.log(
      '[guia-consultoria]',
      JSON.stringify({ ts: new Date().toISOString(), ip: ipAnon, result, duration_ms: Date.now() - startedAt, ...extra }),
    )
  }

  // 1. Rate limit
  const rl = rateLimit(req, { scope: 'guia-consultoria', max: 3, windowMs: 60_000 })
  if (!rl.ok) {
    log('rate_limited')
    return NextResponse.json(
      { ok: false, error: 'rate_limit', message: 'Muitas tentativas. Tente novamente em instantes.' },
      { status: 429 },
    )
  }

  // 2. Origin allowlist (CSRF)
  if (!isAllowedOrigin(req.headers.get('origin'))) {
    log('forbidden_origin')
    return NextResponse.json({ ok: false, error: 'forbidden_origin' }, { status: 403 })
  }

  // 3. Parse + Zod
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    log('invalid_json')
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }
  const parsed = consultoriaSchema.safeParse(raw)
  if (!parsed.success) {
    log('invalid_payload')
    return NextResponse.json(
      { ok: false, error: 'invalid_payload', details: parsed.error.flatten() },
      { status: 400 },
    )
  }
  const data = parsed.data
  const body = raw as { origin?: OriginPayload }
  const origin = body.origin || {}
  const email = data.email
  const organizacao = data.organizacao?.trim() || undefined
  const dataCadastro = new Date().toISOString()

  // 4. Validação reforçada: e-mail (MX/DNS) + WhatsApp (Evolution). Fail-open.
  const contato = await enforceContato({ email, telefone: data.telefone, requirePhone: true })
  if (!contato.ok) {
    log('contato_invalido', { field: contato.field })
    return NextResponse.json(
      { ok: false, error: 'contato_invalido', field: contato.field, message: contato.error },
      { status: 400 },
    )
  }
  const telefoneNorm = contato.telefone || data.telefone

  // 5. Persiste o lead (persistir-primeiro)
  let leadId: string | null = null
  try {
    const payload = await getPayload({ config: configPromise })
    const existing = await payload.find({
      collection: 'leads',
      where: { email: { equals: email } },
      limit: 1,
    })
    if (existing.docs[0]) {
      leadId = String(existing.docs[0].id)
      await payload.update({
        collection: 'leads',
        id: existing.docs[0].id,
        data: {
          nome: data.nome,
          ...(organizacao ? { empresa: organizacao } : {}),
          ...(telefoneNorm ? { telefone: telefoneNorm } : {}),
        } as never,
      })
    } else {
      const created = await payload.create({
        collection: 'leads',
        data: {
          nome: data.nome,
          email,
          empresa: organizacao || '(não informado)',
          telefone: telefoneNorm,
          origem: 'guia-eleicoes',
          rd_sync_status: 'pending',
          ip_address: ipAnon,
          utm_source: origin.utm_source,
          utm_medium: origin.utm_medium,
          utm_campaign: origin.utm_campaign,
        } as never,
      })
      leadId = String(created.id)
    }
  } catch (err) {
    log('persistence_error', { error: err instanceof Error ? err.message : String(err) })
    return NextResponse.json({ ok: false, error: 'persistence_error' }, { status: 500 })
  }

  // 6. Sync RD (fire-and-forget)
  void syncConsultoriaToRD({
    nome: data.nome,
    email,
    telefone: telefoneNorm,
    organizacao,
    mensagem: data.mensagem || undefined,
    utm_source: origin.utm_source,
    utm_medium: origin.utm_medium,
    utm_campaign: origin.utm_campaign,
    utm_content: origin.utm_content,
    utm_term: origin.utm_term,
    referrer: origin.referrer,
    data_cadastro: dataCadastro,
  })
    .then(async (r) => {
      const status = r.success ? (r.mode === 'mock' ? 'mock' : 'synced') : 'error'
      try {
        const payload = await getPayload({ config: configPromise })
        if (leadId) {
          await payload.update({ collection: 'leads', id: leadId, data: { rd_sync_status: status } as never })
        }
      } catch {
        /* update best-effort */
      }
      log(r.success ? 'ok' : 'rd_sync_failed', { lead_id: leadId, rd_mode: r.mode, error: r.error })
    })
    .catch(() => {})

  return NextResponse.json({ ok: true, lead_id: leadId })
}
