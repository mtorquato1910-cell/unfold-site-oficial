import type { Metadata } from 'next'
import ContatoForm from '@/components/contato/ContatoForm'

export const metadata: Metadata = {
  title: 'Contato | Unfold Growth',
  description:
    'Fale com a Unfold Growth. Estruturamos sistemas de crescimento que conectam marketing, vendas, CRM e automação. Deixe seus dados e nosso time entra em contato.',
}

export default function ContatoPage() {
  return (
    <main className="min-h-screen">
      <section className="relative isolate overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,hsl(218_94%_78%/0.08),transparent_55%)]" />
        <div className="max-w-2xl mx-auto px-6 lg:px-8">
          <ContatoForm />
        </div>
      </section>
    </main>
  )
}
