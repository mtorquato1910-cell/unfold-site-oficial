import type { Metadata } from 'next'
import CalculadoraShell from './_components/CalculadoraShell'

export const metadata: Metadata = {
  title: 'Calculadora de Performance | Unfold Growth',
  description:
    'Descubra quanto seu investimento em mídia paga pode realmente retornar — com premissas honestas para vendas complexas B2B.',
}

export default function CalculadoraTráfegoPage() {
  return (
    <main className="min-h-screen">
      <section className="relative isolate overflow-hidden pt-28 pb-10 md:pt-32 md:pb-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,hsl(218_94%_78%/0.06),transparent_55%)]" />
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-4">
            Ferramenta gratuita
          </p>
          <h1 className="font-display font-bold tracking-tight text-3xl md:text-5xl leading-[1.05] max-w-3xl">
            Calculadora de Performance
          </h1>
          <p className="mt-4 text-base md:text-lg text-foreground/70 leading-relaxed max-w-2xl">
            Descubra quanto seu investimento em mídia paga pode realmente retornar — com premissas
            honestas para vendas complexas B2B.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <CalculadoraShell />
        </div>
      </section>
    </main>
  )
}
