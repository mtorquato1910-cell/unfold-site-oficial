import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'sb-access-token'
const PUBLIC_ADMIN_PATHS = ['/admin/login', '/painel/login']

// ── Hotsite "Guia Eleições" — subdomínio (S6.1) ──────────────────────────────
// O conteúdo vive na rota interna /guia-eleicoes-2026; o subdomínio público
// `eleicoes.unfoldgrowth.com.br/featwork` é mapeado aqui. A guarda é por HOST no
// corpo (o matcher do Next filtra path, não host — restringir por host no matcher
// é impossível), por isso o apex passa intacto.
const GUIA_HOST = process.env.GUIA_SUBDOMAIN_HOST || 'eleicoes.unfoldgrowth.com.br'
const PROD_APEX = 'unfoldgrowth.com.br'
const GUIA_INTERNAL = '/guia-eleicoes-2026'

function handleGuiaSubdomain(request: NextRequest): NextResponse | null {
  const host = request.headers.get('host') || ''
  const { pathname } = request.nextUrl
  const isGuiaSubdomain = host === GUIA_HOST

  if (isGuiaSubdomain) {
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/featwork', request.url), 308)
    }
    if (pathname === '/featwork' || pathname.startsWith('/featwork/')) {
      const rest = pathname.replace(/^\/featwork/, '')
      return NextResponse.rewrite(new URL(`${GUIA_INTERNAL}${rest}`, request.url))
    }
  }

  // Canonical: apex de produção /guia-eleicoes-2026 → subdomínio (evita duplicado).
  // Previews (*.vercel.app) NÃO redirecionam — a rota interna fica acessível para teste.
  if (!isGuiaSubdomain && pathname === GUIA_INTERNAL && host.endsWith(PROD_APEX)) {
    return NextResponse.redirect(`https://${GUIA_HOST}/featwork`, 301)
  }

  return null
}

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

  // ── Subdomínio do Guia Eleições (rewrite/redirect por host) ─────────────
  const guiaResponse = handleGuiaSubdomain(request)
  if (guiaResponse) return guiaResponse

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
    // Subdomínio do Guia (S6.1): raiz (redirect no subdomínio), /featwork (rewrite)
    // e a rota interna (canonical apex→subdomínio). A guarda de host garante que o
    // apex passe intacto. NÃO incluir /api/* (preserva same-origin do endpoint).
    '/',
    '/featwork',
    '/featwork/:path*',
    '/guia-eleicoes-2026',
  ],
}
