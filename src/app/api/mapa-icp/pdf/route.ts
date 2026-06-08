/**
 * GET /api/mapa-icp/pdf?token={token}
 *
 * Gera o PDF do mapa salvo a partir do `ai_result` persistido em
 * `mapa-icp-results` (NÃO recomputa a IA — usa o JSON salvo).
 *
 * - Token = url_resultado_hash (randomBytes(8) → 16 hex).
 * - Dynamic import de @react-pdf/renderer + template (fora do client bundle).
 * - Headers: application/pdf + Content-Disposition attachment + noindex.
 * - Rate limit dedicado 10/min/IP.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { MapaIcpAIResult } from '@/lib/mapa-icp/types'

const TOKEN_RE = /^[a-f0-9]{16}$/

// Mini rate limit dedicado à rota de PDF (10/min/IP) — independente do POST.
const rateMap = new Map<string, { count: number; resetAt: number }>()
function rateLimit(ip: string): boolean {
  const now = Date.now()
  const e = rateMap.get(ip)
  if (!e || now > e.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (e.count >= 10) return false
  e.count++
  return true
}

interface MapaIcpDoc {
  nome?: string
  empresa?: string
  ai_result?: MapaIcpAIResult
  createdAt: string
}

function publicResultUrl(req: NextRequest, token: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    `${req.nextUrl.protocol}//${req.headers.get('host')}`
  return `${base}/ferramentas/mapa-icp/r/${token}`
}

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  if (!rateLimit(ip)) {
    return NextResponse.json({ ok: false, error: 'rate_limit' }, { status: 429 })
  }

  const url = new URL(req.url)
  const token = url.searchParams.get('token') || ''
  if (!TOKEN_RE.test(token)) {
    return NextResponse.json({ ok: false, error: 'invalid_token' }, { status: 400 })
  }

  let doc: MapaIcpDoc | undefined
  try {
    const payload = await getPayload({ config: configPromise })
    const found = await payload.find({
      collection: 'mapa-icp-results',
      where: { url_resultado_hash: { equals: token } },
      limit: 1,
    })
    doc = found.docs[0] as unknown as MapaIcpDoc | undefined
  } catch (err) {
    console.error('[mapa-icp/pdf] payload erro:', err)
    return NextResponse.json({ ok: false, error: 'db_error' }, { status: 500 })
  }
  if (!doc || !doc.ai_result) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
  }

  // Imports dinâmicos: @react-pdf/renderer é pesado, manter fora do client bundle.
  const [{ renderToBuffer }, { MapaIcpPDF }, React] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/lib/mapa-icp-pdf/template'),
    import('react'),
  ])

  const publicUrl = publicResultUrl(req, token)
  const geradoEm = new Date(doc.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const element = MapaIcpPDF({
    nome: doc.nome || '',
    empresa: doc.empresa || '',
    result: doc.ai_result,
    geradoEm,
    url: publicUrl,
  })
  void React
  const buffer = (await renderToBuffer(element)) as Buffer

  const fileSafe = (doc.empresa || 'mapa')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40)

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="mapa-icp-${fileSafe}-${token.slice(0, 8)}.pdf"`,
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      'X-Robots-Tag': 'noindex',
    },
  })
}
