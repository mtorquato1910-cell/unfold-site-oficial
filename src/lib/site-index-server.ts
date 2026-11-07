import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { authorIndexable } from './authors'
import type { SiteIndex } from './site-index'

/**
 * Lê do CMS tudo o que é indexável (fonte única do sitemap.xml e do /llms.txt —
 * Tarefa 7 do relatório de SEO de 06/11/2026). Mesmos filtros para os dois:
 * posts `published`, cases `publicado`, autores ativos com bio. Lança em caso de
 * erro — quem chama decide o fallback.
 */
export async function getSiteIndex(): Promise<SiteIndex> {
  const payload = await getPayload({ config: configPromise })
  const [posts, cases, authors, categories] = await Promise.all([
    payload.find({
      collection: 'posts',
      where: { status: { equals: 'published' } },
      sort: '-publicado_em',
      select: {
        slug: true, titulo: true, resumo: true, meta_description: true, categoria: true,
        llms_optional: true, content_updated_at: true, publicado_em: true, autores: true,
      },
      limit: 1000,
      depth: 0,
    }),
    payload.find({
      collection: 'cases',
      where: { status: { equals: 'publicado' } },
      select: {
        slug: true, title: true, excerpt: true, meta_description: true, tagline: true,
        content_updated_at: true, published_at: true, updatedAt: true,
      },
      limit: 500,
      depth: 0,
    }),
    payload.find({
      collection: 'authors',
      where: { ativo: { not_equals: false } },
      select: { slug: true, nome: true, bio_curta: true, bio_completa: true },
      limit: 200,
      depth: 0,
    }),
    payload.find({ collection: 'categories', sort: 'ordem', limit: 200, depth: 0 }),
  ])
  const id = (v: any) => (v == null || v === '' ? null : String(typeof v === 'object' ? v.id : v))
  return {
    posts: (posts.docs as any[]).map((p) => ({
      slug: p.slug,
      titulo: p.titulo,
      descricao: p.meta_description || p.resumo,
      categoriaId: id(p.categoria),
      llmsOptional: !!p.llms_optional,
      date: p.content_updated_at || p.publicado_em || null,
      autorIds: (Array.isArray(p.autores) ? p.autores : []).map(id).filter(Boolean) as string[],
    })),
    cases: (cases.docs as any[]).map((c) => ({
      slug: c.slug,
      titulo: c.title,
      descricao: c.meta_description || c.excerpt || c.tagline,
      date: c.content_updated_at || c.published_at || c.updatedAt || null,
    })),
    authors: (authors.docs as any[])
      .filter((a) => authorIndexable(a))
      .map((a) => ({ id: String(a.id), slug: a.slug, nome: a.nome, descricao: a.bio_curta || null })),
    categories: (categories.docs as any[])
      .map((c) => ({ id: String(c.id), slug: c.slug, nome: c.nome, intro: c.intro || null, ordem: Number(c.ordem) || 0 }))
      .sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, 'pt-BR'))
      .map(({ ordem: _o, ...c }) => c),
  }
}
