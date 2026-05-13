import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'sb-access-token'
const PUBLIC_ADMIN_PATHS = ['/admin/login', '/painel/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Diagnóstico v2 — rota pública por hash (G3.5 do QA) ─────────────
  // Injeta X-Robots-Tag no HEADER HTTP (não só meta tag), garantindo que crawlers
  // agressivos respeitem mesmo ignorando o HTML.
  if (pathname.startsWith('/diagnostico/r/')) {
    const res = NextResponse.next()
    res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet')
    res.headers.set('Referrer-Policy', 'no-referrer')
    return res
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
  matcher: ['/admin/:path*', '/painel/:path*', '/diagnostico/r/:path*'],
}
