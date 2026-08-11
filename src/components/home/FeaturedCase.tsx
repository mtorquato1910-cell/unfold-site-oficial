import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Reveal } from '@/components/ui/Reveal'

async function getFeaturedCase() {
  try {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'cases',
      where: { destacar_na_home: { equals: true }, status: { equals: 'publicado' } },
      sort: '-published_at',
      limit: 1,
    })
    return docs[0] ?? null
  } catch {
    return null
  }
}

export async function FeaturedCase() {
  const c = await getFeaturedCase()

  if (!c) return null

  const highlights = (c.highlights ?? []) as Array<{ label: string; value: string }>

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Visual — métricas em grade */}
          <Reveal className="relative rounded-2xl border border-border bg-card overflow-hidden aspect-[4/3] order-last lg:order-first" as="div">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(158_92%_70%/0.18),transparent_50%),radial-gradient(circle_at_80%_80%,hsl(218_94%_78%/0.15),transparent_55%)]" />
            <div className="relative h-full p-8 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                </div>
                <span className="font-mono text-[10px] text-foreground/70 uppercase tracking-widest">
                  DASHBOARD · RESULTADOS
                </span>
              </div>

              {highlights.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {highlights.slice(0, 3).map((h) => (
                    <div key={h.label} className="rounded-lg border border-border bg-background/40 p-3">
                      <p className="font-mono text-[10px] uppercase text-foreground/75">{h.label}</p>
                      <p className="font-mono text-xl font-semibold text-primary mt-1">{h.value}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex-1 rounded-lg border border-border bg-background/40 p-4 flex items-end gap-1.5">
                {[18, 28, 22, 38, 32, 48, 42, 58, 55, 70, 65, 82].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className="flex-1 rounded-sm bg-gradient-to-t from-primary/30 to-primary/80"
                  />
                ))}
              </div>
            </div>
          </Reveal>

          {/* Content */}
          <Reveal delay={120}>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-4">
              Case de sucesso
            </p>
            <p className="font-display font-bold text-xl tracking-tight text-foreground/80 mb-3 uppercase">
              {c.client}
            </p>
            <h3 className="font-display font-bold tracking-tight text-3xl md:text-4xl lg:text-5xl leading-[1.1]">
              {c.tagline || c.title}
            </h3>
            {c.challenge && (
              <p className="mt-6 text-base md:text-lg text-foreground/70 leading-relaxed line-clamp-3">
                {c.challenge}
              </p>
            )}
            <div className="mt-8 flex flex-col sm:flex-row gap-6">
              <Link
                href={`/cases/${c.slug}`}
                className="inline-flex items-center gap-2 text-primary font-medium group"
              >
                Conheça o case completo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/cases"
                className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground font-medium"
              >
                Ver todos os cases →
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
