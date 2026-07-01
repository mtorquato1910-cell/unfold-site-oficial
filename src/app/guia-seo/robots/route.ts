import { NextResponse } from 'next/server'

/**
 * robots.txt DEDICADO do subdomínio eleicoes.unfoldgrowth.com.br.
 * Aponta o sitemap próprio do subdomínio (não o do apex).
 * Middleware reescreve `eleicoes.unfoldgrowth.com.br/robots.txt` → esta rota.
 */

const GUIA_ORIGIN = 'https://eleicoes.unfoldgrowth.com.br'

export async function GET() {
  const body = `User-agent: *
Allow: /

Sitemap: ${GUIA_ORIGIN}/sitemap.xml
Host: ${GUIA_ORIGIN}
`

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
