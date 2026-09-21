import { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://unfoldgrowth.com.br'

// CRÍTICO (fix 2026-09-21): sem esta linha o Next prerenderiza o sitemap no BUILD
// (prerender-manifest: initialRevalidateSeconds=false) e ele só muda em deploy.
// Como os posts são publicados pelo painel — sem deploy — artigos novos ficavam
// fora do sitemap por dias, e o Google só os descobria por rastreio orgânico
// (daí a necessidade de "Solicitar indexação" manual em todo artigo).
// 1h de ISR + revalidatePath('/sitemap.xml') nas actions de publicação.
export const revalidate = 3600

// lastmod das páginas estáticas = quando o CONTEÚDO delas mudou (não a data do build).
// Bump manual ao editar essas páginas — usar `new Date()` faria o Google reprocessar
// tudo a cada deploy (desperdício de crawl budget).
// NOTA: o hotsite `eleicoes.unfoldgrowth.com.br` é OUTRO host → tem sitemap PRÓPRIO
// em `app/guia-seo/sitemap` (servido via middleware). Regra do protocolo de sitemap:
// um sitemap só pode listar URLs do mesmo host onde ele é servido.
const STATIC_LASTMOD = new Date('2026-07-01T00:00:00Z')

/** Data mais recente de uma lista de docs — usada como lastmod dos índices. */
function latest(dates: Date[], fallback: Date): Date {
  const valid = dates.filter((d) => !Number.isNaN(d.getTime()))
  if (valid.length === 0) return fallback
  return new Date(Math.max(...valid.map((d) => d.getTime())))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Cases e posts dinâmicos
  let casesRoutes: MetadataRoute.Sitemap = []
  let postsRoutes: MetadataRoute.Sitemap = []
  let blogLastmod = STATIC_LASTMOD
  let casesLastmod = STATIC_LASTMOD

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
    casesLastmod = latest(
      cases.map((c) => new Date(c.updatedAt as string)),
      STATIC_LASTMOD,
    )

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
    // O lastmod do índice /blog precisa acompanhar o post mais recente. Fixo em
    // STATIC_LASTMOD, o Google não via motivo para re-rastrear a listagem e não
    // chegava aos artigos novos por lá.
    blogLastmod = latest(
      posts.map((p) => new Date(p.updatedAt as string)),
      STATIC_LASTMOD,
    )
  } catch {
    // DB indisponível
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: STATIC_LASTMOD, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/sobre`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/metodo`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/atuacao`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/cases`, lastModified: casesLastmod, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: blogLastmod, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/diagnostico`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/contato`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/ferramentas`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/ferramentas/calculadora-trafego`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/ferramentas/mapa-icp`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.7 },
  ]

  return [...staticRoutes, ...casesRoutes, ...postsRoutes]
}
