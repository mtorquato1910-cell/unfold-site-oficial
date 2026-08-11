import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/ui/Reveal'
import { getHomeInsights } from '@/lib/insights'

const GRADIENTS = [
  'from-primary/30 via-secondary/20 to-tertiary/30',
  'from-secondary/30 via-primary/20 to-tertiary/30',
  'from-tertiary/40 via-secondary/20 to-primary/30',
  'from-primary/25 via-tertiary/25 to-secondary/30',
  'from-secondary/25 via-tertiary/30 to-primary/25',
  'from-tertiary/30 via-primary/25 to-secondary/30',
]

function formatDate(iso: string | null): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return ''
  }
}

export async function Insights() {
  const posts = await getHomeInsights()
  if (posts.length === 0) return null

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Reveal className="flex items-end justify-between gap-6 mb-12 flex-wrap">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-5">
              Insights
            </p>
            <h2 className="font-display font-bold tracking-tight text-3xl md:text-4xl lg:text-5xl leading-[1.1]">
              Conteúdo direto da nossa operação.
            </h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-primary font-medium group"
          >
            Ver todos os posts
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((p, i) => (
            <Reveal key={p.id} delay={i * 80}>
              <Link
                href={`/blog/${p.slug}`}
                className="group flex flex-col rounded-xl overflow-hidden border border-border bg-card/40 hover:bg-card transition-colors h-full"
              >
                <div className={`relative aspect-[16/9] bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]}`}>
                  {p.imagemUrl && (
                    <Image
                      src={p.imagemUrl}
                      alt={p.titulo}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-primary mb-3">
                    {p.categoria}
                  </p>
                  <h3 className="font-sans font-semibold text-lg leading-snug mb-3 group-hover:text-primary transition-colors">
                    {p.titulo}
                  </h3>
                  <p className="text-sm text-foreground/85 leading-relaxed flex-1">{p.resumo}</p>
                  <p className="text-xs text-foreground/75 mt-5">
                    Por {p.autor}
                    {p.publicado_em ? ` · ${formatDate(p.publicado_em)}` : ''}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
