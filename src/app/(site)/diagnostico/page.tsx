import type { Metadata } from 'next'
import DiagnosticoEtapa1Form from '@/components/diagnostico/DiagnosticoEtapa1Form'

export const metadata: Metadata = {
  title: 'Diagnóstico Gratuito | Unfold Growth',
  description:
    'Descubra o nível de maturidade da sua operação comercial e receba um diagnóstico personalizado baseado no método UGS.',
}

export default function DiagnosticoPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative isolate overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,hsl(218_94%_78%/0.08),transparent_55%)]" />
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-6">
            Diagnóstico gratuito
          </p>
          <h1 className="font-display font-bold tracking-tight text-4xl md:text-5xl lg:text-6xl leading-[1.05]">
            Descubra o nível de maturidade da sua{' '}
            <span className="text-secondary">operação comercial</span>
          </h1>
          <p className="mt-6 text-lg text-foreground/70 leading-relaxed">
            Responda 12 perguntas sobre como sua empresa diagnostica, estrutura e opera suas vendas.
            Em menos de 5 minutos, você recebe um relatório personalizado baseado no método UGS.
          </p>
        </div>
      </section>

      {/* Formulário Etapa 1 */}
      <section className="pb-24">
        <div className="max-w-2xl mx-auto px-6 lg:px-8">
          <DiagnosticoEtapa1Form />
        </div>
      </section>
    </main>
  )
}
