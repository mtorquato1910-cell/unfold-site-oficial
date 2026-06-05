/**
 * POST /api/guia-eleicoes/lead — cadastro do hotsite "Guia Eleições 2026".
 *
 * Fluxo (RF-19/RF-20/RF-25, RNF-10..15, LOG-01/02):
 *   1. Rate limit 3/IP/60s (reusa src/lib/rate-limit.ts).
 *   2. Origin allowlist (CSRF — RNF-11).
 *   3. Zod server-side (RNF-10) → 400.
 *   4. Turnstile server (reusa src/lib/security/turnstile.ts) → 403.
 *   5. Persiste o lead em Payload (origem 'guia-eleicoes', empresa '(não informado)',
 *      ip anonimizado /24) ANTES da sync.
 *   6. Sync RD legacy fire-and-forget; em sucesso → rd_sync_status 'synced'/'mock',
 *      em falha → 'error' + e-mail de alerta (reusa src/lib/email/adapter.ts).
 *   O usuário é liberado mesmo se o RD falhar (resiliência — RF-25).
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { rateLimit, resolveClientIP } from '@/lib/rate-limit'
import { verifyTurnstile } from '@/lib/security/turnstile'
import { sendEmail } from '@/lib/email/adapter'
import { syncGuiaToRD } from '@/lib/crm/rd-guia-eleicoes'
import { enforceContato } from '@/lib/validation/enforce-contato'
import { guiaLeadSchema } from '@/app/guia-eleicoes-2026/_lib/validation'
import { anonymizeIp } from '@/app/guia-eleicoes-2026/_lib/anonymize-ip'
import {
  UNLOCK_COOKIE_NAME,
  signUnlockValue,
  unlockCookieOptions,
} from '@/app/guia-eleicoes-2026/_lib/unlock-cookie'
import type { PerfilEleitoral } from '@/app/guia-eleicoes-2026/_lib/perfil'

const DEFAULT_ORIGINS = [
  'https://eleicoes.unfoldgrowth.com.br',
  'https://unfoldgrowth.com.br',
]

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true // sem header Origin (navegação direta); Turnstile é a defesa primária
  if (
    process.env.NODE_ENV !== 'production' &&
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
  ) {
    return true
  }
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin)) return true // previews
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
  const ua = req.headers.get('user-agent')?.slice(0, 180) || 'unknown'

  function log(result: string, extra?: Record<string, unknown>) {
    console.log(
      '[guia-lead]',
      JSON.stringify({
        ts: new Date().toISOString(),
        ip: ipAnon,
        ua,
        result,
        duration_ms: Date.now() - startedAt,
        ...extra,
      }),
    )
  }

  // 1. Rate limit (RNF-12)
  const rl = rateLimit(req, { scope: 'guia-lead', max: 3, windowMs: 60_000 })
  if (!rl.ok) {
    log('rate_limited')
    return NextResponse.json(
      { ok: false, error: 'rate_limit', message: 'Muitas tentativas. Tente novamente em instantes.' },
      { status: 429 },
    )
  }

  // 2. Origin allowlist (RNF-11 / CSRF)
  if (!isAllowedOrigin(req.headers.get('origin'))) {
    log('forbidden_origin')
    return NextResponse.json({ ok: false, error: 'forbidden_origin' }, { status: 403 })
  }

  // 3. Parse + Zod (RNF-10)
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    log('invalid_json')
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }
  const parsed = guiaLeadSchema.safeParse(raw)
  if (!parsed.success) {
    log('invalid_payload')
    return NextResponse.json(
      { ok: false, error: 'invalid_payload', details: parsed.error.flatten() },
      { status: 400 },
    )
  }
  const data = parsed.data
  const body = raw as { turnstileToken?: string; origin?: OriginPayload }

  // 4. Turnstile (RNF-13). Em dev, casa o bypass do widget (GuiaTurnstile envia
  // 'dev-bypass'); em produção (NODE_ENV=production) sempre verifica de verdade.
  const isDev = process.env.NODE_ENV !== 'production'
  const ts =
    isDev && body.turnstileToken === 'dev-bypass'
      ? { ok: true as const }
      : await verifyTurnstile(body.turnstileToken, ipReal)
  if (!ts.ok) {
    log('turnstile_failed', { reason: ts.reason })
    return NextResponse.json({ ok: false, error: 'captcha_failed' }, { status: 403 })
  }

  const email = data.email
  const perfil = data.perfil as PerfilEleitoral
  const origin = body.origin || {}
  const dataCadastro = new Date().toISOString()

  // 4.5 Validação reforçada: e-mail (MX/DNS) + WhatsApp (Evolution) + 9º dígito.
  // Telefone obrigatório no hotsite (requirePhone). Fail-open p/ não barrar conversão.
  const contato = await enforceContato({ email, telefone: data.telefone, requirePhone: true })
  if (!contato.ok) {
    log('contato_invalido', { field: contato.field })
    return NextResponse.json(
      { ok: false, error: 'contato_invalido', field: contato.field, message: contato.error },
      { status: 400 },
    )
  }
  const telefoneNorm = contato.telefone || data.telefone

  // 5. Persiste o lead (persistir-primeiro — RF-25)
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
          ...(telefoneNorm ? { telefone: telefoneNorm } : {}),
        } as never,
      })
    } else {
      const created = await payload.create({
        collection: 'leads',
        data: {
          nome: data.nome,
          email,
          empresa: '(não informado)', // DEC-1/GAP-A1 — collection exige empresa
          telefone: telefoneNorm,
          origem: 'guia-eleicoes',
          rd_sync_status: 'pending',
          ip_address: ipAnon, // IP anonimizado /24 (cuidado LGPD do dado político)
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

  // 6. Sync RD (fire-and-forget) + fallback/alerta (RF-25, LOG-03)
  void syncGuiaToRD({
    nome: data.nome,
    email,
    telefone: telefoneNorm,
    perfil,
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
          await payload.update({
            collection: 'leads',
            id: leadId,
            data: { rd_sync_status: status } as never,
          })
        }
      } catch {
        /* update best-effort */
      }
      if (!r.success) {
        log('rd_sync_failed', { error: r.error, lead_id: leadId })
        await notifyFallback({ nome: data.nome, email, perfil, leadId, error: r.error })
      } else {
        log('ok', { lead_id: leadId, rd_mode: r.mode })
      }
    })
    .catch(() => {})

  // Cookie de desbloqueio (gate): autoriza o download do PDF protegido.
  const okRes = NextResponse.json({ ok: true, lead_id: leadId })
  okRes.cookies.set(UNLOCK_COOKIE_NAME, signUnlockValue(Date.now()), unlockCookieOptions())
  return okRes
}

/** E-mail de alerta para reprocesso manual em falha do RD (RF-25). */
async function notifyFallback(p: {
  nome: string
  email: string
  perfil: string
  leadId: string | null
  error?: string
}): Promise<void> {
  const to = process.env.ALERT_EMAIL_TO
  if (!to) return
  const html = `
<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; background:#001E29; color:#E7E7E7; padding:32px;">
  <div style="max-width:560px;margin:0 auto;background:#0a2a35;border-radius:12px;padding:32px;border:1px solid #1a3a45;">
    <p style="font-family:monospace;font-size:11px;color:#6DF9C6;text-transform:uppercase;letter-spacing:2px;">Guia Eleições 2026 — falha de sync RD</p>
    <h1 style="font-size:20px;color:#E7E7E7;">Lead capturado, mas não sincronizado</h1>
    <p style="color:#9db5c0;line-height:1.6;">Reprocessar manualmente no painel RD:</p>
    <ul style="color:#E7E7E7;line-height:1.8;">
      <li>Nome: ${p.nome}</li>
      <li>E-mail: ${p.email}</li>
      <li>Perfil: ${p.perfil}</li>
      <li>Lead ID (Payload): ${p.leadId ?? '—'}</li>
      <li>Erro: ${p.error ?? 'desconhecido'}</li>
    </ul>
  </div>
</body></html>`
  try {
    await sendEmail({ to, subject: '[Guia Eleições] Falha de sync RD — reprocessar lead', html })
  } catch {
    /* alerta best-effort */
  }
}
