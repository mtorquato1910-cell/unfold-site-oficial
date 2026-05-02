import type { Metadata } from 'next'
import CalculadoraClient from '@/components/calculadora/CalculadoraClient'

export const metadata: Metadata = {
  title: 'Calculadora de Tráfego Pago | Unfold Growth',
  description:
    'Descubra o potencial de retorno do seu investimento em tráfego pago. Projeção personalizada para operações B2B com vendas complexas.',
}

export default function CalculadoraTráfegoPage() {
  return (
    <main className="min-h-screen">
      <section className="relative isolate overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,hsl(218_94%_78%/0.06),transparent_55%)]" />
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-6">
            Ferramenta gratuita
          </p>
          <h1 className="font-display font-bold tracking-tight text-4xl md:text-5xl leading-[1.05]">
            Quanto seu tráfego pago{' '}
            <span className="text-secondary">realmente deveria gerar?</span>
          </h1>
          <p className="mt-6 text-lg text-foreground/70 leading-relaxed max-w-2xl mx-auto">
            Insira os dados da sua operação e receba uma projeção técnica de leads, oportunidades e
            receita — com análise personalizada do potencial de crescimento.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-2xl mx-auto px-6 lg:px-8">
          <CalculadoraClient />
        </div>
      </section>
    </main>
  )
}
