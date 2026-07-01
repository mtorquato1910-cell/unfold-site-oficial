import { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://unfoldgrowth.com.br'

// lastmod das páginas estáticas = quando o CONTEÚDO delas mudou (não a data do build).
// Bump manual ao editar essas páginas — usar `new Date()` faria o Google reprocessar
// tudo a cada deploy (desperdício de crawl budget).
// NOTA: o hotsite `eleicoes.unfoldgrowth.com.br` é OUTRO host → tem sitemap PRÓPRIO
// em `app/guia-seo/sitemap` (servido via middleware). Regra do protocolo de sitemap:
// um sitemap só pode listar URLs do mesmo host onde ele é servido.
const STATIC_LASTMOD = new Date('2026-07-01T00:00:00Z')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: STATIC_LASTMOD, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/sobre`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/metodo`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/atuacao`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/cases`, lastModified: STATIC_LASTMOD, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: STATIC_LASTMOD, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/diagnostico`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/ferramentas/calculadora-trafego`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.7 },
  ]

  // Cases dinâmicos
  let casesRoutes: MetadataRoute.Sitemap = []
  let postsRoutes: MetadataRoute.Sitemap = []

  try {
    const payload = await getPayload({ config: configPromise })

    const { docs: cases } = await payload.find({
      collection: 'cases',
      where: { status: { equals: 'publicado' } },
      select: { slug: true, updatedAt: true },
      limit: 100,
    })
    casesRoutes = cases.map((c) => ({
      url: `${BASE_URL}/cases/${c.slug}`,
      lastModified: new Date(c.updatedAt as string),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

    const { docs: posts } = await payload.find({
      collection: 'posts',
      where: { status: { equals: 'published' } },
      select: { slug: true, updatedAt: true },
      limit: 200,
    })
    postsRoutes = posts.map((p) => ({
      url: `${BASE_URL}/blog/${p.slug}`,
      lastModified: new Date(p.updatedAt as string),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch {
    // DB indisponível
  }

  return [...staticRoutes, ...casesRoutes, ...postsRoutes]
}
