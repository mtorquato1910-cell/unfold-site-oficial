import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { syncContact } from '@/lib/crm/adapter'

// Rate limit simples por IP (memória, suficiente para form de newsletter)
const submissions = new Map<string, number[]>()
const WINDOW_MS = 60 * 60 * 1000 // 1h
const MAX_PER_HOUR = 5

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const arr = submissions.get(ip) || []
  const recent = arr.filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX_PER_HOUR) return false
  recent.push(now)
  submissions.set(ip, recent)
  return true
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: Request) {
  try {
    // Aceita JSON ou form-urlencoded (o <form action="..."> do Footer manda form-urlencoded)
    const ct = req.headers.get('content-type') || ''
    let email = ''
    if (ct.includes('application/json')) {
      const body = await req.json().catch(() => ({}))
      email = String(body.email || '').trim().toLowerCase()
    } else {
      const fd = await req.formData()
      email = String(fd.get('email') || '').trim().toLowerCase()
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ ok: false, error: 'Email inválido' }, { status: 400 })
    }

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { ok: false, error: 'Muitas tentativas. Tente novamente em 1h.' },
        { status: 429 },
      )
    }

    const payload = await getPayload({ config })

    // Idempotência: se já está inscrito, retorna ok sem duplicar
    const existing = await payload.find({
      collection: 'newsletter-subscribers',
      where: { email: { equals: email } },
      limit: 1,
      depth: 0,
    })

    let subscriberId: string | number
    if (existing.docs.length > 0) {
      const doc: any = existing.docs[0]
      subscriberId = doc.id
      // Se estava cancelado, reinscrever
      if (doc.status !== 'subscribed') {
        await payload.update({
          collection: 'newsletter-subscribers',
          id: subscriberId,
          data: { status: 'subscribed', unsubscribedAt: null } as any,
        })
      }
    } else {
      const created = await payload.create({
        collection: 'newsletter-subscribers',
        data: {
          email,
          status: 'subscribed',
          source: 'site-footer',
          rdSyncStatus: 'pending',
        } as any,
      })
      subscriberId = created.id
    }

    // Sync com RD Station (não bloqueia o sucesso pro usuário)
    try {
      const result = await syncContact({
        email,
        nome: email.split('@')[0],
        origem: 'newsletter-site',
      })
      await payload.update({
        collection: 'newsletter-subscribers',
        id: subscriberId,
        data: {
          rdSyncStatus: result.success ? (result.mode === 'mock' ? 'mock' : 'synced') : 'error',
          rdContactId: result.external_id,
          rdSyncedAt: new Date().toISOString(),
          rdSyncError: result.error || undefined,
        } as any,
      })
    } catch (err) {
      console.error('[newsletter] RD sync error:', err)
      await payload
        .update({
          collection: 'newsletter-subscribers',
          id: subscriberId,
          data: {
            rdSyncStatus: 'error',
            rdSyncError: err instanceof Error ? err.message : String(err),
          } as any,
        })
        .catch(() => {})
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[newsletter] error:', err)
    return NextResponse.json(
      { ok: false, error: 'Falha ao processar inscrição. Tente novamente.' },
      { status: 500 },
    )
  }
}
