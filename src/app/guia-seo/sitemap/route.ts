import { NextResponse } from 'next/server'

/**
 * Sitemap DEDICADO do hotsite Guia Eleições (subdomínio eleicoes.unfoldgrowth.com.br).
 *
 * Por que separado? A regra do protocolo de sitemap diz que um sitemap só pode listar
 * URLs do MESMO host onde é servido. Como o subdomínio é outro host, ele não pode
 * entrar no sitemap do apex (unfoldgrowth.com.br) — o Google ignoraria.
 *
 * O middleware reescreve `eleicoes.unfoldgrowth.com.br/sitemap.xml` → esta rota,
 * então publicamente ele aparece na raiz correta do subdomínio.
 */

const GUIA_ORIGIN = 'https://eleicoes.unfoldgrowth.com.br'
const LASTMOD = '2026-07-01'

export async function GET() {
  const urls = [`${GUIA_ORIGIN}/featwork`]

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (loc) =>
      `  <url><loc>${loc}</loc><lastmod>${LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`,
  )
  .join('\n')}
</urlset>`

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
