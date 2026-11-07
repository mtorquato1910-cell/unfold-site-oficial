import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { postCategoryId } from './blog-categories'

export type BlogCategory = {
  id: string
  nome: string
  slug: string
  intro: string | null
  meta_description: string | null
  /** Posts publicados na categoria. */
  count: number
}

/**
 * Categorias com a contagem de posts publicados, na ordem do painel (`ordem`, nome).
 * Usado nos filtros do blog, no sitemap e no llms.txt (só as com artigos aparecem).
 */
export async function getBlogCategories(): Promise<BlogCategory[]> {
  const payload = await getPayload({ config: configPromise })
  const [cats, posts] = await Promise.all([
    payload.find({ collection: 'categories', sort: 'ordem', limit: 100, depth: 0 }),
    payload.find({
      collection: 'posts',
      where: { status: { equals: 'published' } },
      select: { categoria: true },
      limit: 1000,
      depth: 0,
    }),
  ])
  const counts = new Map<string, number>()
  for (const p of posts.docs as any[]) {
    const id = postCategoryId(p)
    if (id) counts.set(id, (counts.get(id) || 0) + 1)
  }
  return (cats.docs as any[])
    .map((c) => ({
      id: String(c.id),
      nome: String(c.nome),
      slug: String(c.slug),
      intro: (c.intro as string) || null,
      meta_description: (c.meta_description as string) || null,
      count: counts.get(String(c.id)) || 0,
      ordem: Number(c.ordem) || 0,
    }))
    .sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, 'pt-BR'))
    .map(({ ordem: _o, ...c }) => c)
}
