import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'sb-access-token'
const PUBLIC_ADMIN_PATHS = ['/admin/login', '/painel/login']

// Fix pré-prod (auditoria @architect / ADR-3): rate limit nas rotas públicas
// de resultado por token (Diagnóstico e Calculadora). 10 hits/min/IP.
// Aceita-se débito de in-memory (não sobrevive a múltiplas instâncias) — mesma
// política do POST /api/calculadora (ADR-8).
const SHARE_RATE_LIMIT = 10
const SHARE_RATE_WINDOW_MS = 60 * 1000
const shareRateMap = new Map<string, { count: number; resetAt: number }>()

function ipFromRequest(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

function checkShareRateLimit(ip: string): boolean {
  const now = Date.now()
  const e = shareRateMap.get(ip)
  if (!e || now > e.resetAt) {
    shareRateMap.set(ip, { count: 1, resetAt: now + SHARE_RATE_WINDOW_MS })
    return true
  }
  if (e.count >= SHARE_RATE_LIMIT) return false
  e.count++
  return true
}

function noindexHeaders(res: NextResponse) {
  res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet')
  res.headers.set('Referrer-Policy', 'no-referrer')
  return res
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Rotas públicas de resultado por token (Diagnóstico + Calculadora) ──
  const isSharePath =
    pathname.startsWith('/diagnostico/r/') ||
    pathname.startsWith('/ferramentas/calculadora-trafego/r/')

  if (isSharePath) {
    const ip = ipFromRequest(request)
    if (!checkShareRateLimit(ip)) {
      return new NextResponse('Too many requests', {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-Robots-Tag': 'noindex',
        },
      })
    }
    return noindexHeaders(NextResponse.next())
  }

  // ── Painel administrativo — auth via cookie ─────────────────────────
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/painel')) {
    return NextResponse.next()
  }

  if (PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/painel/:path*',
    '/diagnostico/r/:path*',
    '/ferramentas/calculadora-trafego/r/:path*',
  ],
}
