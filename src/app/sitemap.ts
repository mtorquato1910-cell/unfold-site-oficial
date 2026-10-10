import { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { toBrtIso } from '@/lib/content-date'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://unfoldgrowth.com.br'

// CRÍTICO (fix 2026-09-21): sem esta linha o Next prerenderiza o sitemap no BUILD
// (prerender-manifest: initialRevalidateSeconds=false) e ele só muda em deploy.
// Como os posts são publicados pelo painel — sem deploy — artigos novos ficavam
// fora do sitemap por dias, e o Google só os descobria por rastreio orgânico
// (daí a necessidade de "Solicitar indexação" manual em todo artigo).
// 1h de ISR + revalidatePath('/sitemap.xml') nas actions de publicação.
export const revalidate = 3600

// lastmod (S01 seo-tecnico-2026-10):
//  - posts → `content_updated_at` (data EDITORIAL: só muda com título/corpo). Antes era
//    `updatedAt`, que qualquer script altera — em 07/08/2026 um script "atualizou" 25
//    posts de uma vez e o Google deixou de confiar no lastmod.
//  - /blog → o content_updated_at mais recente entre os posts publicados.
//  - páginas institucionais → SEM lastmod (decisão do cliente: data fixa e falsa é pior
//    que nenhuma; o Google ignora changefreq/priority, mas lê lastmod quando confiável).
//  - formato ISO 8601 com fuso de Brasília (`2026-10-01T00:00:00-03:00`).
// NOTA: o hotsite `eleicoes.unfoldgrowth.com.br` é OUTRO host → tem sitemap PRÓPRIO
// em `app/guia-seo/sitemap` (servido via middleware). Regra do protocolo de sitemap:
// um sitemap só pode listar URLs do mesmo host onde ele é servido.

/** Data mais recente de uma lista (ISO/Date) — usada como lastmod dos índices. */
function latest(dates: (string | Date | null | undefined)[]): string | undefined {
  const times = dates
    .map((d) => (d == null || d === '' ? NaN : new Date(d).getTime()))
    .filter((t) => !Number.isNaN(t))
  if (times.length === 0) return undefined
  return toBrtIso(new Date(Math.max(...times)))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Cases e posts dinâmicos
  let casesRoutes: MetadataRoute.Sitemap = []
  let postsRoutes: MetadataRoute.Sitemap = []
  let authorRoutes: MetadataRoute.Sitemap = []
  let blogLastmod: string | undefined
  let casesLastmod: string | undefined

  try {
    const payload = await getPayload({ config: configPromise })

    const { docs: cases } = await payload.find({
      collection: 'cases',
      where: { status: { equals: 'publicado' } },
      select: { slug: true, updatedAt: true, content_updated_at: true, published_at: true },
      limit: 100,
      depth: 0,
    })
    // S10: cases usam a data editorial (content_updated_at), como os posts.
    const caseDate = (c: any) => (c.content_updated_at || c.published_at || c.updatedAt) as string | undefined
    casesRoutes = cases.map((c) => ({
      url: `${BASE_URL}/cases/${c.slug}`,
      lastModified: toBrtIso(caseDate(c)),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))
    casesLastmod = latest(cases.map(caseDate))

    const { docs: posts } = await payload.find({
      collection: 'posts',
      where: { status: { equals: 'published' } },
      select: { slug: true, content_updated_at: true, publicado_em: true, autores: true },
      limit: 200,
      depth: 0,
    })
    const postDate = (p: any) => (p.content_updated_at || p.publicado_em) as string | undefined
    postsRoutes = posts.map((p) => ({
      url: `${BASE_URL}/blog/${p.slug}`,
      lastModified: toBrtIso(postDate(p)),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
    // O lastmod do índice /blog precisa acompanhar o post mais recente. Com data
    // fixa, o Google não via motivo para re-rastrear a listagem e não chegava aos
    // artigos novos por lá.
    blogLastmod = latest(posts.map(postDate))

    // Páginas de autor (S07): só as indexáveis (com bio completa). lastmod = artigo
    // mais recente do autor.
    const { docs: authors } = await payload.find({
      collection: 'authors',
      where: { and: [{ ativo: { not_equals: false } }, { bio_completa: { exists: true } }] },
      select: { slug: true, bio_completa: true },
      limit: 100,
      depth: 0,
    })
    authorRoutes = (authors as any[])
      .filter((a) => String(a.bio_completa || '').trim())
      .map((a) => ({
        url: `${BASE_URL}/autor/${a.slug}`,
        lastModified: latest(
          (posts as any[])
            .filter((p) => Array.isArray(p.autores) && p.autores.some((x: any) => (x?.id ?? x) === a.id))
            .map(postDate),
        ),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      }))
  } catch {
    // DB indisponível
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/sobre`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/metodo`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/atuacao`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/cases`, lastModified: casesLastmod, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: blogLastmod, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/diagnostico`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/contato`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/ferramentas`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/ferramentas/calculadora-trafego`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/ferramentas/mapa-icp`, changeFrequency: 'monthly', priority: 0.7 },
  ]

  return [...staticRoutes, ...casesRoutes, ...postsRoutes, ...authorRoutes]
}
