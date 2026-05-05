import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const metadata: Metadata = {
  title: 'Blog | Unfold Growth',
  description: 'Conteúdo técnico sobre geração de demanda B2B, vendas complexas e o método UGS.',
}

const PILAR_CONFIG: Record<string, { label: string; color: string }> = {
  diagnosticar: { label: 'Diagnosticar', color: 'text-primary border-primary/20 bg-primary/5' },
  estruturar: { label: 'Estruturar', color: 'text-secondary border-secondary/20 bg-secondary/5' },
  operar: { label: 'Operar', color: 'text-[hsl(250_64%_70%)] border-[hsl(250_64%_70%/0.2)] bg-[hsl(250_64%_70%/0.05)]' },
  geral: { label: 'Geral', color: 'text-foreground/60 border-border bg-card/50' },
}

async function getPosts(): Promise<any[]> {
  try {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'posts',
      where: { status: { equals: 'published' } },
      sort: '-publicado_em',
      limit: 30,
    })
    return docs
  } catch {
    return []
  }
}

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <main>
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
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-6">Blog</p>
            <h1 className="font-display font-bold tracking-tight text-5xl md:text-6xl leading-[1.05]">
              Conteúdo técnico sobre{' '}
              <span className="text-secondary">crescimento estruturado.</span>
            </h1>
            <p className="mt-6 text-lg text-foreground/70 max-w-xl leading-relaxed">
              Diagnóstico, estrutura e operação — os três pilares do método UGS em forma de
              conhecimento aplicado.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-mono text-sm text-foreground/40">Posts em breve.</p>
              <p className="text-xs text-foreground/30 mt-2">
                Execute <code className="font-mono bg-card px-1 rounded">/api/seed/blog</code> para popular os posts de exemplo.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => {
                const pilarCfg = PILAR_CONFIG[post.pilar as string] || PILAR_CONFIG.geral
                return (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/40 transition-all duration-300 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className={`font-mono text-xs uppercase tracking-[0.15em] px-2.5 py-1 rounded-full border ${pilarCfg.color}`}>
                        {pilarCfg.label}
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-foreground/20 group-hover:text-primary transition-colors" />
                    </div>
                    <h2 className="font-display font-bold text-lg leading-snug mb-3 group-hover:text-primary transition-colors flex-1">
                      {post.titulo as string}
                    </h2>
                    <p className="text-sm text-foreground/60 leading-relaxed line-clamp-3 mb-4">
                      {post.resumo as string}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-foreground/30 mt-auto pt-4 border-t border-border/50">
                      <span>{post.autor as string}</span>
                      {post.tempo_leitura && <span>· {post.tempo_leitura as number} min</span>}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
