import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Button } from '@/components/ui/button'

const VERTICAL_LABELS: Record<string, string> = {
  construcao: 'Construção Civil',
  agro: 'Agronegócio',
  'b2b-saas': 'B2B / SaaS',
  industria: 'Indústria',
  varejo: 'Varejo',
  servicos: 'Serviços Profissionais',
}

const PILAR_COLORS: Record<string, string> = {
  diagnosticar: 'text-primary border-primary/30 bg-primary/5',
  estruturar: 'text-secondary border-secondary/30 bg-secondary/5',
  operar: 'text-[hsl(250_64%_70%)] border-[hsl(250_64%_70%/0.3)] bg-[hsl(250_64%_70%/0.05)]',
}

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'cases',
      where: { status: { equals: 'publicado' } },
      select: { slug: true },
    })
    return docs.map((c) => ({ slug: c.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'cases',
      where: { slug: { equals: slug } },
    })
    const c = docs[0]
    if (!c) return { title: 'Case não encontrado | Unfold Growth' }
    return {
      title: `${c.title} | Cases | Unfold Growth`,
      description: c.tagline || c.title,
    }
  } catch {
    return { title: 'Cases | Unfold Growth' }
  }
}

export default async function CaseDetailPage({ params }: Props) {
  const { slug } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let c: any = null
  try {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'cases',
      where: { slug: { equals: slug }, status: { equals: 'publicado' } },
    })
    c = docs[0] ?? null
  } catch {
    // tabela ainda não migrada
  }
  if (!c) notFound()

  const highlights = (c.highlights ?? []) as Array<{ label: string; value: string }>
  const pillars = (c.pillars ?? []) as Array<{
    pilar: string
    descricao?: string
    acoes?: Array<{ acao: string }>
  }>
  const results = (c.results ?? []) as Array<{
    metrica: string
    valor: string
    contexto?: string
  }>

  return (
    <main>
      {/* Hero */}
      <section className="relative isolate overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,hsl(158_92%_70%/0.06),transparent_55%)]" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Back */}
          <Link
            href="/cases"
            className="inline-flex items-center gap-2 text-sm text-foreground/50 hover:text-primary transition-colors mb-10"
          >
            <ArrowLeft className="h-4 w-4" />
            Todos os cases
          </Link>

          <div className="flex flex-wrap gap-3 mb-6">
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-primary/80 px-3 py-1 rounded-full border border-primary/20 bg-primary/5">
              {VERTICAL_LABELS[c.vertical] ?? c.vertical}
            </span>
          </div>

          <p className="font-mono text-xs text-foreground/40 uppercase tracking-widest mb-3">
            {c.client}
          </p>
          <h1 className="font-display font-bold tracking-tight text-4xl md:text-5xl lg:text-6xl leading-[1.05] max-w-4xl">
            {c.tagline || c.title}
          </h1>

          {/* Highlights */}
          {highlights.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 max-w-2xl">
              {highlights.map((h) => (
                <div key={h.label} className="rounded-xl border border-border bg-card p-4">
                  <p className="font-mono text-[10px] uppercase text-foreground/45">{h.label}</p>
                  <p className="font-mono text-xl font-semibold text-primary mt-1">{h.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Desafio + Solução */}
      {(c.challenge || c.solution) && (
        <section className="py-16 md:py-20 border-t border-border">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
              {c.challenge && (
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-4">
                    O desafio
                  </p>
                  <p className="text-foreground/70 leading-relaxed text-base md:text-lg">
                    {c.challenge}
                  </p>
                </div>
              )}
              {c.solution && (
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-secondary mb-4">
                    A solução
                  </p>
                  <p className="text-foreground/70 leading-relaxed text-base md:text-lg">
                    {c.solution}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Pilares UGS */}
      {pillars.length > 0 && (
        <section className="py-16 md:py-20 border-t border-border bg-card/30">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-4">
              Método UGS aplicado
            </p>
            <h2 className="font-display font-bold text-2xl md:text-3xl mb-10">
              Pilares do sistema
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {pillars.map((p, i) => (
                <div
                  key={i}
                  className={`rounded-2xl border p-7 ${PILAR_COLORS[p.pilar] ?? 'border-border bg-card'}`}
                >
                  <p
                    className={`font-mono text-xs uppercase tracking-widest mb-3 ${PILAR_COLORS[p.pilar]?.split(' ')[0]}`}
                  >
                    {p.pilar}
                  </p>
                  {p.descricao && (
                    <p className="font-display font-semibold text-base mb-4">{p.descricao}</p>
                  )}
                  {p.acoes && p.acoes.length > 0 && (
                    <ul className="space-y-2">
                      {p.acoes.map((a, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-foreground/65">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-current shrink-0" />
                          {a.acao}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Resultados */}
      {results.length > 0 && (
        <section className="py-16 md:py-20 border-t border-border">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-4">
              Resultados
            </p>
            <h2 className="font-display font-bold text-2xl md:text-3xl mb-10">
              O que foi alcançado
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {results.map((r, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-6">
                  <p className="font-mono text-xs text-foreground/45 uppercase mb-2">{r.metrica}</p>
                  <p className="font-display font-bold text-2xl text-primary mb-1">{r.valor}</p>
                  {r.contexto && (
                    <p className="text-foreground/50 text-xs leading-relaxed">{r.contexto}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 md:py-32 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-6">
            Próximo passo
          </p>
          <h2 className="font-display font-bold tracking-tight text-4xl md:text-5xl leading-tight max-w-2xl mx-auto">
            Quer resultados como esses na sua operação?
          </h2>
          <p className="mt-5 text-foreground/65 text-lg max-w-xl mx-auto">
            O Diagnóstico UGS identifica os gargalos do seu sistema e entrega um plano de ação
            personalizado em menos de 20 minutos.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="h-12 px-8 text-base group">
              <Link href="/diagnostico">
                Solicitar Diagnóstico gratuito
                <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 px-8 text-base bg-transparent border-foreground/20 text-foreground hover:bg-foreground/5"
            >
              <Link href="/cases">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Ver mais cases
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
