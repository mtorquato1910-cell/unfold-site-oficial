import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import RichTextRenderer from '@/components/RichTextRenderer'

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
  try {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'posts',
      where: { slug: { equals: slug }, status: { equals: 'published' } },
    })
    post = docs[0] || null
  } catch {
    // DB indisponível
  }

  if (!post) notFound()

  const imgUrl = mediaUrl(post.imagem_destaque)

  return (
    <main className="min-h-screen">
      <article className="max-w-3xl mx-auto px-6 lg:px-8 pt-32 pb-24 md:pt-40">
        {/* Back */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-foreground/50 hover:text-primary transition-colors mb-12"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao blog
        </Link>

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
          <div className="flex items-center gap-4 text-sm text-foreground/40 border-t border-border pt-6">
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

        {/* Conteúdo — RichText do Payload renderizado como HTML */}
        <div className="prose prose-invert prose-lg max-w-none">
          {(post as any).conteudo ? (
            <RichTextRenderer data={(post as any).conteudo} />
          ) : (
            <p className="text-foreground/70 leading-relaxed">{post.resumo as string}</p>
          )}
        </div>

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
    </main>
  )
}
