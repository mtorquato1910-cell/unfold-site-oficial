import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Cases | Unfold Growth',
  description:
    'Conheça os resultados que a Unfold Growth já entregou — cases reais de crescimento estruturado em vendas complexas.',
}

const VERTICAL_LABELS: Record<string, string> = {
  construcao: 'Construção Civil',
  agro: 'Agronegócio',
  'b2b-saas': 'B2B / SaaS',
  industria: 'Indústria',
  varejo: 'Varejo',
  servicos: 'Serviços Profissionais',
}

export default async function CasesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cases: any[] = []
  try {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'cases',
      where: { status: { equals: 'publicado' } },
      sort: '-published_at',
      limit: 20,
    })
    cases = docs
  } catch {
    // tabela ainda não migrada — retorna lista vazia
  }

  return (
    <main>
      {/* Hero */}
      <section className="relative isolate overflow-hidden pt-32 pb-20 md:pt-40 md:pb-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,hsl(218_94%_78%/0.08),transparent_55%)]" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-6">
            Resultados comprovados
          </p>
          <h1 className="font-display font-bold tracking-tight text-5xl md:text-6xl lg:text-7xl leading-[1.05] max-w-4xl">
            Cases de crescimento{' '}
            <span className="text-secondary">estruturado.</span>
          </h1>
          <p className="mt-7 text-lg md:text-xl text-foreground/75 max-w-2xl leading-relaxed">
            Cada case é a prova do método UGS aplicado a uma operação real — com diagnóstico,
            estrutura e resultado mensurável.
          </p>
        </div>
      </section>

      {/* Grid de cases */}
      <section className="py-16 md:py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {cases.length === 0 ? (
            <div className="text-center py-20 text-foreground/50">
              <p className="font-mono text-sm">Cases em breve.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {cases.map((c) => (
                <Link
                  key={c.id}
                  href={`/cases/${c.slug}`}
                  className="group rounded-2xl border border-border bg-card p-8 hover:border-primary/40 transition-all duration-300 hover:bg-card/80"
                >
                  {/* Vertical badge */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-xs uppercase tracking-[0.15em] text-primary/80 px-3 py-1 rounded-full border border-primary/20 bg-primary/5">
                      {VERTICAL_LABELS[c.vertical] ?? c.vertical}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-foreground/30 group-hover:text-primary transition-colors" />
                  </div>

                  {/* Client name */}
                  <p className="font-mono text-xs text-foreground/40 uppercase tracking-widest mb-2">
                    {c.client}
                  </p>

                  {/* Title */}
                  <h2 className="font-display font-bold text-xl md:text-2xl leading-snug mb-4 group-hover:text-primary transition-colors">
                    {c.tagline || c.title}
                  </h2>

                  {/* Highlights */}
                  {c.highlights && c.highlights.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                      {(c.highlights as Array<{ label: string; value: string }>)
                        .slice(0, 4)
                        .map((h) => (
                          <div
                            key={h.label}
                            className="rounded-lg border border-border bg-background/40 p-3"
                          >
                            <p className="font-mono text-[10px] uppercase text-foreground/45 leading-tight">
                              {h.label}
                            </p>
                            <p className="font-mono text-base font-semibold text-primary mt-1">
                              {h.value}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* CTA inline */}
                  <div className="mt-6 flex items-center gap-2 text-sm font-medium text-foreground/50 group-hover:text-primary transition-colors">
                    Ver case completo
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-4">
            Seu case pode ser o próximo
          </p>
          <h2 className="font-display font-bold tracking-tight text-3xl md:text-4xl max-w-2xl mx-auto leading-tight">
            Pronto para estruturar o crescimento da sua operação?
          </h2>
          <div className="mt-8">
            <Button asChild size="lg" className="h-12 px-8 text-base group">
              <Link href="/diagnostico">
                Solicitar Diagnóstico gratuito
                <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
