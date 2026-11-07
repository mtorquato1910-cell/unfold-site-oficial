import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Breadcrumbs from '@/components/site/Breadcrumbs'
import PostCard from '@/components/site/PostCard'
import CategoryNav from '@/components/site/CategoryNav'
import { CollectionPageSchema } from '@/components/SchemaOrg'
import { withSeo } from '@/lib/seo/canonical'
import { categoryDescription, categoryPath } from '@/lib/blog-categories'
import { getBlogCategories, type BlogCategory } from '@/lib/blog-data'

/**
 * Página de categoria do blog (relatório técnico de SEO de 06/11/2026 — Tarefa 3).
 * Renderizada no servidor: H1, intro (editável no painel), lista de artigos e
 * BreadcrumbList. Categoria sem artigo publicado responde 404 e fica fora do sitemap
 * (página rala não ajuda) — passa a existir assim que receber o primeiro artigo.
 */
export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

async function getData(slug: string): Promise<{ category: BlogCategory; categories: BlogCategory[]; posts: any[] } | null> {
  try {
    const categories = await getBlogCategories()
    const category = categories.find((c) => c.slug === slug)
    if (!category || category.count === 0) return null
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'posts',
      where: { and: [{ status: { equals: 'published' } }, { categoria: { equals: category.id } }] },
      sort: '-publicado_em',
      limit: 200,
      depth: 1,
    })
    return { category, categories, posts: docs as any[] }
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getData(slug)
  if (!data) return { title: 'Categoria não encontrada' }
  const { category } = data
  return withSeo(categoryPath(category.slug), {
    title: `${category.nome} | Blog`,
    description: categoryDescription(category),
  })
}

export default async function BlogCategoryPage({ params }: Props) {
  const { slug } = await params
  const data = await getData(slug)
  if (!data) notFound()
  const { category, categories, posts } = data
  const path = categoryPath(category.slug)
  const description = categoryDescription(category)

  return (
    <main>
      <CollectionPageSchema
        name={`${category.nome} — Blog da Unfold Growth`}
        description={description}
        url={path}
        items={posts.map((p) => ({ name: p.titulo as string, url: `/blog/${p.slug}` }))}
      />
      <section className="pt-32 pb-12 md:pt-40 md:pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Breadcrumbs
            className="mb-10"
            items={[
              { name: 'Início', url: '/' },
              { name: 'Blog', url: '/blog' },
              { name: category.nome, url: path },
            ]}
          />
          <div className="max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-6">Categoria</p>
            <h1 className="font-display font-bold tracking-tight text-4xl md:text-5xl leading-[1.05]">
              {category.nome}
            </h1>
            {category.intro?.trim() && (
              <div className="mt-6 space-y-4 text-lg text-foreground/75 leading-relaxed">
                {category.intro
                  .split(/\n{2,}/)
                  .map((p) => p.trim())
                  .filter(Boolean)
                  .map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="pb-20 md:pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <CategoryNav categories={categories} current={category.slug} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} showCategory={false} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
