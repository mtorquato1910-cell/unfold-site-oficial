import type { Metadata } from 'next'
import { withSeo } from '@/lib/seo/canonical'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getSiteTexts } from '@/lib/site-texts'
import { renderHighlight } from '@/lib/render-highlight'
import PostCard from '@/components/site/PostCard'
import CategoryNav from '@/components/site/CategoryNav'
import { getBlogCategories, type BlogCategory } from '@/lib/blog-data'
import { CollectionPageSchema } from '@/components/SchemaOrg'

export const metadata: Metadata = withSeo('/blog', {
  title: 'Blog',
  description: 'Conteúdo técnico sobre geração de demanda B2B, vendas complexas e o método UGS.',
})

// Rede de segurança: além do revalidatePath disparado ao publicar, a página
// se reconstrói a cada 60s para refletir novos posts sem depender só do purge.
export const revalidate = 60

async function getPosts(): Promise<any[]> {
  try {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'posts',
      where: { status: { equals: 'published' } },
      sort: '-publicado_em',
      // 30 deixava os posts mais antigos sem NENHUM link interno (órfãos p/ o
      // Googlebot). Hoje são 36 artigos; 100 cobre o crescimento previsto.
      limit: 100,
    })
    return docs
  } catch {
    return []
  }
}

export default async function BlogPage() {
  const [posts, categories, { blog }] = await Promise.all([
    getPosts(),
    getBlogCategories().catch((): BlogCategory[] => []),
    getSiteTexts(),
  ])

  return (
    <main>
      {/* Índice do blog como CollectionPage + lista dos artigos exibidos (S08). */}
      <CollectionPageSchema
        name="Blog da Unfold Growth"
        description="Conteúdo técnico sobre geração de demanda B2B, vendas complexas e o método UGS."
        url="/blog"
        items={posts.map((p) => ({ name: p.titulo as string, url: `/blog/${p.slug}` }))}
      />
      <section className="relative isolate overflow-hidden pt-32 pb-24 md:pt-40 md:pb-28">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/videos/blog-poster.jpg"
          className="absolute inset-0 h-full w-full object-cover -z-20"
        >
          <source src="/videos/blog.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background/95 via-background/85 to-background/55" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,hsl(158_92%_70%/0.10),transparent_55%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 -z-10 bg-gradient-to-b from-transparent to-background pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-6">{blog.eyebrow}</p>
            <h1 className="font-display font-bold tracking-tight text-5xl md:text-6xl leading-[1.05]">
              {renderHighlight(blog.title)}
            </h1>
            <p className="mt-6 text-lg text-foreground/70 max-w-xl leading-relaxed">
              {blog.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/blog/contribuir"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-primary/30 bg-primary/5 text-primary font-medium hover:bg-primary/10 transition text-sm"
              >
                Contribuir com um artigo →
              </Link>
              <span className="text-xs text-foreground/75 font-mono">
                Revisado pela liderança Unfold antes de publicar
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-mono text-sm text-foreground/70">Posts em breve.</p>
              <p className="text-xs text-foreground/30 mt-2">
                Execute <code className="font-mono bg-card px-1 rounded">/api/seed/blog</code> para popular os posts de exemplo.
              </p>
            </div>
          ) : (
            <>
              <CategoryNav categories={categories} />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
