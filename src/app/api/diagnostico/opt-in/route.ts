/**
 * Endpoint de opt-in para nutrição (Bloco 7 do resultado v2).
 * Registra o email em `newsletter-subscribers` ou cria/atualiza um Lead com `consentimento_nutricao=true`.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { z } from 'zod'

import { trackEventServer } from '@/lib/analytics/diagnostico-events-server'

const schema = z.object({
  email: z.string().email(),
  hash: z.string().optional(), // hash do resultado de onde veio o opt-in (tracking)
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    // Suporta tanto `application/json` quanto form-data (form HTML do Bloco 7).
    const ct = req.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      body = await req.json()
    } else {
      const fd = await req.formData()
      body = Object.fromEntries(fd.entries())
    }
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Email inválido' },
      { status: 400 },
    )
  }

  try {
    const payload = await getPayload({ config: configPromise })
    const { docs: existentes } = await payload.find({
      collection: 'newsletter-subscribers',
      where: { email: { equals: parsed.data.email } },
      limit: 1,
    })
    if (existentes.length === 0) {
      await payload.create({
        collection: 'newsletter-subscribers',
        data: {
          email: parsed.data.email,
          origem: 'diagnostico-optin',
          ativo: true,
        } as never,
      })
    }
  } catch (err) {
    console.warn('[opt-in] DB não disponível:', err)
  }

  // Evento spec §10.3: opt-in nutrição.
  void trackEventServer({
    event_name: 'opt_in_nutricao',
    lead_email: parsed.data.email,
    result_hash: parsed.data.hash,
  })

  // Se foi submit via form HTML, redireciona de volta para o resultado.
  const accept = req.headers.get('accept') || ''
  if (accept.includes('text/html') && parsed.data.hash) {
    return NextResponse.redirect(
      new URL(`/diagnostico/r/${parsed.data.hash}?optin=ok`, req.url),
      { status: 303 },
    )
  }

  return NextResponse.json({ ok: true })
}
