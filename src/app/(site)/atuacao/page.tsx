import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AtuacaoTabs } from '@/components/atuacao/AtuacaoTabs'
import { getSiteTexts } from '@/lib/site-texts'
import { renderHighlight } from '@/lib/render-highlight'

export const metadata: Metadata = {
  title: 'Atuação: setores de vendas complexas',
  description:
    'A Unfold atua onde a venda é complexa: construção civil, agronegócio, tecnologia, automotivo, indústria e serviços. Conheça a abordagem por segmento.',
  alternates: { canonical: '/atuacao' },
}

export default async function AtuacaoPage() {
  const { atuacao } = await getSiteTexts()
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden pt-32 pb-24 md:pt-40 md:pb-28">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/videos/atuacao-poster.jpg"
          className="absolute inset-0 h-full w-full object-cover -z-20"
        >
          <source src="/videos/atuacao.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background/95 via-background/85 to-background/55" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,hsl(158_92%_70%/0.10),transparent_55%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 -z-10 bg-gradient-to-b from-transparent to-background pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-6">
              {atuacao.eyebrow}
            </p>
            <h1 className="font-display font-bold tracking-tight text-5xl md:text-6xl lg:text-7xl leading-[1.05]">
              {renderHighlight(atuacao.title)}
            </h1>
            <p className="mt-7 text-lg md:text-xl text-foreground/75 max-w-xl leading-relaxed">
              {atuacao.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <AtuacaoTabs />

      {/* Banner — Não achou seu segmento */}
      <section className="bg-background border-y border-border py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 px-8 py-10 md:px-14 md:py-12 grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-4">
                Seu segmento não está listado?
              </p>
              <h2 className="font-display font-bold tracking-tight text-2xl md:text-3xl leading-[1.1] mb-4">
                Não achou seu segmento de mercado?{' '}
                <span className="text-primary">Você pode ser nosso primeiro case de sucesso.</span>
              </h2>
              <p className="text-foreground/85 leading-relaxed max-w-2xl">
                Possuímos cases validados em cada um dos segmentos citados, mas eles não nasceram
                prontos. Faça como nossos clientes e se transforme no nosso próximo case de
                crescimento em vendas complexas.
              </p>
            </div>
            <div className="lg:col-span-4 lg:flex lg:justify-end">
              <Button asChild size="lg" className="h-12 px-6 group">
                <Link href="/diagnostico">
                  Agende um diagnóstico
                  <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona a parceria */}
      <section className="bg-background py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-5">
            Como atuamos
          </p>
          <h2 className="font-display font-bold tracking-tight text-3xl md:text-4xl lg:text-5xl leading-[1.1] max-w-2xl mb-16">
            Modelos de engajamento.
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                n: '01',
                title: 'Estrutura de Crescimento',
                desc: 'Diagnóstico completo, construção do sistema de crescimento e handoff para o time interno. Ideal para quem quer internalizar o UGS.',
              },
              {
                n: '02',
                title: 'Assessoria Contínua',
                desc: 'Operamos junto com seu time em ciclos mensais. Reuniões semanais, dashboards em tempo real, execução tática e revisão estratégica trimestral.',
              },
              {
                n: '03',
                title: 'Projetos Personalizados',
                desc: 'Do lançamento de novos produtos até a estruturação de processos comerciais. Seu desafio de crescimento, nossa paixão.',
              },
            ].map((m) => (
              <div
                key={m.n}
                className="relative rounded-xl border border-border bg-card/40 p-7 hover:bg-card hover:border-primary/30 transition-all"
              >
                <span className="font-mono text-sm text-primary">{m.n}.</span>
                <h3 className="font-display font-bold text-xl mt-2 mb-3">{m.title}</h3>
                <p className="text-sm text-foreground/70 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-[#E7E7E7] text-[#001E29] py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8">
              <h2 className="font-display font-bold tracking-tight text-3xl md:text-4xl lg:text-5xl leading-[1.05] max-w-3xl">
                Sua vertical. Seu desafio. Nossa metodologia.
              </h2>
              <p className="mt-6 text-base md:text-lg text-[#001E29]/70 max-w-2xl leading-relaxed">
                Solicite um diagnóstico e veja como o UGS se aplica à sua operação específica.
              </p>
            </div>
            <div className="lg:col-span-4 lg:flex lg:justify-end">
              <Button
                asChild
                size="lg"
                className="h-14 px-7 text-base group bg-[#001E29] text-[#6DF9C6] hover:bg-[#001E29]/90"
              >
                <Link href="/diagnostico">
                  Solicite um orçamento
                  <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
