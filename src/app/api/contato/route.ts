/**
 * POST /api/contato — Formulário de contato direto (navbar → /contato).
 * Fluxo: rate-limit → zod → validação de contato (e-mail MX + WhatsApp) →
 * upsert do lead (origem 'contato') → sync RD com tag 'contato' (fire-and-forget).
 *
 * O lead gravado aqui já aparece no painel (/painel/leads, que lê a collection `leads`).
 * O sync com RD é feito explicitamente neste route (não pelo hook afterChange de Leads,
 * que ignora 'contato' via ORIGENS_COM_SYNC_PROPRIA) para garantir a tag mesmo quando o
 * e-mail já existe (o hook só sincroniza em `create`) e evitar dupla conversão.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { z } from 'zod'
import { enforceContato } from '@/lib/validation/enforce-contato'
import { syncContact } from '@/lib/crm/adapter'

const schema = z.object({
  nome: z.string().trim().min(3, 'Informe seu nome completo'),
  email: z.string().trim().email('E-mail inválido'),
  telefone: z.string().trim().min(1, 'Informe seu telefone com DDD'),
})

const rateMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60 * 60 * 1000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const e = rateMap.get(ip)
  if (!e || now > e.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (e.count >= RATE_LIMIT) return false
  e.count++
  return true
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { ok: false, error: 'rate_limit', message: 'Limite atingido. Tente novamente em 1 hora.' },
      { status: 429 },
    )
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'invalid_payload', details: parsed.error.flatten() },
      { status: 400 },
    )
  }
  const { nome, email, telefone } = parsed.data

  // Validação reforçada: e-mail (MX/DNS) + WhatsApp obrigatório (fail-open p/ Evolution offline).
  const contato = await enforceContato({ email, telefone, requirePhone: true })
  if (!contato.ok) {
    return NextResponse.json(
      { ok: false, error: 'contato_invalido', field: contato.field, message: contato.error },
      { status: 400 },
    )
  }
  const telefoneNorm = contato.telefone
  const emailLower = email.toLowerCase().trim()

  let leadId: string | null = null

  try {
    const payload = await getPayload({ config: configPromise })

    // Upsert do lead por e-mail — evita duplicar quem já entrou por outra ferramenta.
    const existing = await payload.find({
      collection: 'leads',
      where: { email: { equals: emailLower } },
      limit: 1,
    })
    if (existing.docs[0]) {
      leadId = String(existing.docs[0].id)
      await payload.update({
        collection: 'leads',
        id: existing.docs[0].id,
        data: {
          nome,
          origem: 'contato',
          ...(telefoneNorm ? { telefone: telefoneNorm } : {}),
        } as never,
      })
    } else {
      const novo = await payload.create({
        collection: 'leads',
        data: {
          nome,
          email: emailLower,
          // `empresa` é required na collection; o formulário de contato não coleta empresa.
          empresa: 'Não informado',
          telefone: telefoneNorm,
          origem: 'contato',
          rd_sync_status: 'pending',
          consentimento_lgpd: true,
          ip_address: ip,
        } as never,
      })
      leadId = String(novo.id)
    }
  } catch (err) {
    console.error('[contato] persistência falhou:', err)
    return NextResponse.json({ ok: false, error: 'persistence_error' }, { status: 500 })
  }

  // ── Sync RD (fire-and-forget) — tag 'contato' + origem_contato (auto). ──────
  void syncContact({
    nome,
    email: emailLower,
    telefone: telefoneNorm,
    origem: 'contato',
    tags: ['contato'],
  })
    .then(async (r) => {
      if (!leadId) return
      const status =
        r.mode === 'rd-station' && r.success
          ? 'synced'
          : r.mode === 'mock'
            ? 'mock'
            : !r.success
              ? 'error'
              : null
      if (!status) return
      try {
        const payload = await getPayload({ config: configPromise })
        await payload.update({
          collection: 'leads',
          id: leadId,
          data: { rd_sync_status: status } as never,
        })
      } catch {}
    })
    .catch(() => {})

  return NextResponse.json({ ok: true })
}
