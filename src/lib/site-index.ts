import type { MetadataRoute } from 'next'
import { toBrtIso } from './content-date'

/**
 * Fonte ÚNICA das URLs indexáveis do site (relatório técnico de SEO de 06/11/2026 —
 * Tarefa 7). O sitemap.xml e o /llms.txt são gerados destes mesmos dados, então
 * não podem divergir (antes o llms.txt tinha 60 das 63 URLs do sitemap).
 * Só entra o que é indexável e responde 200: nada de rascunho, noindex, página
 * legal, resultado de ferramenta ou origem de redirect.
 * Funções puras — a leitura do CMS fica em site-index-server.ts.
 */

export type IndexPost = {
  slug: string
  titulo: string
  descricao?: string | null
  /** Id da categoria (string) ou null. */
  categoriaId: string | null
  llmsOptional: boolean
  /** Data editorial (content_updated_at → publicado_em). */
  date?: string | null
  autorIds: string[]
}
export type IndexCase = { slug: string; titulo: string; descricao?: string | null; date?: string | null }
export type IndexAuthor = { id: string; slug: string; nome: string; descricao?: string | null }
export type IndexCategory = { id: string; slug: string; nome: string; intro?: string | null }

export type SiteIndex = {
  posts: IndexPost[]
  cases: IndexCase[]
  /** Só autores indexáveis. */
  authors: IndexAuthor[]
  /** Todas as categorias, na ordem do painel; só as com post entram nas saídas. */
  categories: IndexCategory[]
}

type StaticPage = {
  path: string
  name: string
  desc: string
  section: 'empresa' | 'ferramentas'
  changeFrequency: 'daily' | 'weekly' | 'monthly'
  priority: number
}

export const STATIC_PAGES: StaticPage[] = [
  { path: '/', name: 'Home', desc: 'visão geral da Unfold Growth e do que ela faz para empresas B2B com venda complexa', section: 'empresa', changeFrequency: 'weekly', priority: 1.0 },
  { path: '/sobre', name: 'Sobre', desc: 'quem é a Unfold, posicionamento e forma de trabalho', section: 'empresa', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/metodo', name: 'Método UGS', desc: 'o Unfold Growth System e seus quatro pilares: Diagnosticar, Estruturar, Operar e Evoluir', section: 'empresa', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/atuacao', name: 'Atuação', desc: 'setores atendidos e modelos de engajamento (estrutura, assessoria contínua, projetos)', section: 'empresa', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/cases', name: 'Cases', desc: 'resultados de clientes em operações de venda complexa', section: 'empresa', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/blog', name: 'Blog', desc: 'conteúdo técnico sobre demanda B2B e vendas complexas', section: 'empresa', changeFrequency: 'daily', priority: 0.9 },
  { path: '/contato', name: 'Contato', desc: 'canais de atendimento: e-mail, telefone e WhatsApp', section: 'empresa', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/ferramentas', name: 'Ferramentas', desc: 'ferramentas gratuitas para diagnosticar a operação de crescimento', section: 'ferramentas', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/diagnostico', name: 'Diagnóstico de Growth', desc: 'avaliação gratuita da maturidade da operação comercial, em cerca de 5 minutos', section: 'ferramentas', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/ferramentas/calculadora-trafego', name: 'Calculadora de Performance', desc: 'quanto o investimento em mídia paga precisa retornar em receita, com premissas para vendas complexas', section: 'ferramentas', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/ferramentas/mapa-icp', name: 'Radar de Comitê de Compra', desc: 'monta o ICP e o mapa de quem decide no comitê de compra', section: 'ferramentas', changeFrequency: 'monthly', priority: 0.7 },
]

export const postPath = (slug: string) => `/blog/${slug}`
export const casePath = (slug: string) => `/cases/${slug}`
export const authorPagePath = (slug: string) => `/autor/${slug}`
export const categoryPagePath = (slug: string) => `/blog/categoria/${slug}`

/** Categorias que têm ao menos um post publicado (as demais respondem 404). */
export function categoriesWithPosts(index: SiteIndex): IndexCategory[] {
  const used = new Set(index.posts.map((p) => p.categoriaId).filter(Boolean))
  return index.categories.filter((c) => used.has(c.id))
}

/** Data mais recente de uma lista (ISO/Date) — lastmod dos índices. */
function latest(dates: (string | null | undefined)[]): string | undefined {
  const times = dates
    .map((d) => (d == null || d === '' ? NaN : new Date(d).getTime()))
    .filter((t) => !Number.isNaN(t))
  if (times.length === 0) return undefined
  return toBrtIso(new Date(Math.max(...times)))
}

// lastmod (S01 seo-tecnico-2026-10): posts/cases → data EDITORIAL; índices (/blog,
// /cases, categoria, autor) → o item mais recente; institucionais → SEM lastmod
// (data fixa e falsa é pior que nenhuma). Formato ISO com fuso de Brasília.
export function buildSitemapEntries(index: SiteIndex, baseUrl: string): MetadataRoute.Sitemap {
  const base = baseUrl.replace(/\/+$/, '')
  const abs = (p: string) => (p === '/' ? base : `${base}${p}`)
  const lastmodFor: Record<string, string | undefined> = {
    '/blog': latest(index.posts.map((p) => p.date)),
    '/cases': latest(index.cases.map((c) => c.date)),
  }
  return [
    ...STATIC_PAGES.map((p) => ({
      url: abs(p.path),
      ...(lastmodFor[p.path] ? { lastModified: lastmodFor[p.path] } : {}),
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    })),
    ...categoriesWithPosts(index).map((c) => ({
      url: abs(categoryPagePath(c.slug)),
      lastModified: latest(index.posts.filter((p) => p.categoriaId === c.id).map((p) => p.date)),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...index.cases.map((c) => ({
      url: abs(casePath(c.slug)),
      lastModified: toBrtIso(c.date ?? undefined),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...index.posts.map((p) => ({
      url: abs(postPath(p.slug)),
      lastModified: toBrtIso(p.date ?? undefined),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...index.authors.map((a) => ({
      url: abs(authorPagePath(a.slug)),
      lastModified: latest(index.posts.filter((p) => p.autorIds.includes(a.id)).map((p) => p.date)),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ]
}
