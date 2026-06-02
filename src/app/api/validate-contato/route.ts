/**
 * POST /api/validate-contato — validação leve de e-mail e/ou WhatsApp para feedback
 * onBlur dos formulários (hotsite Feat.Work + site Unfold).
 *
 * Body: { email?: string, telefone?: string, requirePhone?: boolean, mobileOnly?: boolean }
 * Resp: { email?: {ok, message?}, whatsapp?: {ok, message?, normalized?, e164?} }
 *
 * Node runtime (usa dns para MX). Rate-limited. Best-effort: nunca derruba o form —
 * em erro interno devolve 200 com campos vazios para não travar a digitação.
 */

import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { validateContato } from '@/lib/validation/contato'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' } as const

export async function POST(req: NextRequest) {
  // 30 checagens/min por IP — generoso para onBlur, contém abuso.
  const rl = rateLimit(req, { scope: 'validate-contato', max: 30, windowMs: 60_000 })
  if (!rl.ok) {
    return NextResponse.json({}, { status: 429, headers: NO_STORE })
  }

  let body: { email?: unknown; telefone?: unknown; requirePhone?: unknown; mobileOnly?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({}, { status: 400, headers: NO_STORE })
  }

  try {
    const result = await validateContato({
      email: typeof body.email === 'string' ? body.email : undefined,
      telefone: typeof body.telefone === 'string' ? body.telefone : undefined,
      requirePhone: body.requirePhone === true,
      mobileOnly: body.mobileOnly !== false,
    })
    return NextResponse.json(result, { headers: NO_STORE })
  } catch {
    // Best-effort: não bloqueia a digitação por erro interno.
    return NextResponse.json({}, { headers: NO_STORE })
  }
}
