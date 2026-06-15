import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import RichTextRenderer from '@/components/RichTextRenderer'
import RichContent from '@/components/RichContent'
import TableOfContents from '@/components/site/TableOfContents'
import ToolBanner, { type BannerData } from '@/components/site/ToolBanner'
import { addHeadingIds } from '@/lib/article-toc'

export const revalidate = 60

// Extrai a URL da mídia (campo upload populado com depth>=1).
function mediaUrl(field: any): string | null {
  if (field && typeof field === 'object') return field.url || field.sizes?.og?.url || null
  return null
}

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'posts',
      where: { status: { equals: 'published' } },
      select: { slug: true },
    })
    return docs.map((p) => ({ slug: p.slug as string }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({ collection: 'posts', where: { slug: { equals: slug } } })
    const post = docs[0]
    if (!post) return { title: 'Post não encontrado | Unfold Growth' }
    const og = mediaUrl(post.imagem_destaque)
    return {
      title: `${post.titulo as string} | Blog | Unfold Growth`,
      description: post.resumo as string,
      openGraph: og
        ? { title: post.titulo as string, description: post.resumo as string, images: [{ url: og }] }
        : undefined,
    }
  } catch {
    return { title: 'Blog | Unfold Growth' }
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  let post: any = null
  let banners: BannerData[] = []
  try {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'posts',
      where: { slug: { equals: slug }, status: { equals: 'published' } },
    })
    post = docs[0] || null

    // Banners internos ativos (ferramentas/diagnóstico/cases).
    try {
      const res = await payload.find({
        collection: 'banners',
        where: { ativo: { equals: true } },
        sort: 'ordem',
        limit: 4,
        depth: 1,
      })
      banners = (res.docs as any[]) || []
    } catch {
      // collection ainda não migrada — segue sem banners
    }
  } catch {
    // DB indisponível
  }

  if (!post) notFound()

  const imgUrl = mediaUrl(post.imagem_destaque)

  // Processa o HTML do editor: injeta ids nos títulos e extrai o índice.
  const { html: contentHtml, toc } = post.conteudo_html
    ? addHeadingIds(post.conteudo_html as string)
    : { html: '', toc: [] }

  const sidebarBanner = banners[0]
  const mobileBanners = banners.slice(0, 2)

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-32 pb-24 md:pt-40">
        {/* Back */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-foreground/50 hover:text-primary transition-colors mb-12"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao blog
        </Link>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
          {/* ───── Coluna principal ───── */}
          <article className="min-w-0 max-w-3xl">
            {/* Header */}
            <header className="mb-10">
              {post.pilar && (
                <span className="font-mono text-xs uppercase tracking-widest text-primary">
                  {post.pilar}
                </span>
              )}
              <h1 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl leading-[1.1] mt-3 mb-5">
                {post.titulo as string}
              </h1>
              <p className="text-lg text-foreground/60 leading-relaxed mb-6">{post.resumo as string}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground/40 border-t border-border pt-6">
                <span>{post.autor as string}</span>
                {post.tempo_leitura && <span>· {post.tempo_leitura as number} min de leitura</span>}
                {post.publicado_em && (
                  <span>
                    ·{' '}
                    {new Date(post.publicado_em as string).toLocaleDateString('pt-BR', {
                      day: '2-digit', month: 'long', year: 'numeric',
                    })}
                  </span>
                )}
              </div>
            </header>

            {/* Imagem de destaque */}
            {imgUrl && (
              <figure className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-border mb-12 bg-card">
                <Image
                  src={imgUrl}
                  alt={post.titulo as string}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              </figure>
            )}

            {/* Índice — versão mobile (no topo do conteúdo, em telas menores) */}
            {toc.length >= 2 && (
              <div className="lg:hidden mb-10 rounded-2xl border border-border bg-card/50 p-5">
                <TableOfContents items={toc} />
              </div>
            )}

            {/* Conteúdo — HTML do editor rico (novo) ou Lexical (posts antigos). */}
            {post.conteudo_html ? (
              <RichContent html={contentHtml} className="prose prose-invert prose-lg max-w-none" />
            ) : (
              <div className="prose prose-invert prose-lg max-w-none">
                {post.conteudo ? (
                  <RichTextRenderer data={post.conteudo} />
                ) : (
                  <p className="text-foreground/70 leading-relaxed">{post.resumo as string}</p>
                )}
              </div>
            )}

            {/* Banners — versão mobile (após o conteúdo, em telas menores) */}
            {mobileBanners.length > 0 && (
              <div className="lg:hidden mt-12 space-y-5">
                {mobileBanners.map((b) => (
                  <ToolBanner key={b.id} banner={b} />
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
              <p className="font-mono text-xs uppercase tracking-widest text-primary mb-3">
                Próximo passo
              </p>
              <h2 className="font-display font-bold text-xl mb-4">
                Aplique esse conhecimento na sua operação
              </h2>
              <Link
                href="/diagnostico"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Fazer diagnóstico gratuito
              </Link>
            </div>
          </article>

          {/* ───── Sidebar (índice + banner) — desktop ───── */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-8">
              {toc.length >= 2 && <TableOfContents items={toc} />}
              {sidebarBanner && <ToolBanner banner={sidebarBanner} />}
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
