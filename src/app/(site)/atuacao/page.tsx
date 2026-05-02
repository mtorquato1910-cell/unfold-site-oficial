import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AtuacaoTabs } from '@/components/atuacao/AtuacaoTabs'

export const metadata: Metadata = {
  title: 'Atuação',
  description:
    'A Unfold Growth atua em 4 verticais de vendas complexas B2B: Construção Civil, Agronegócio, Tech B2B e Automotivo. Conheça nossa abordagem por segmento.',
}

export default function AtuacaoPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden pt-32 pb-20 md:pt-44 md:pb-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,hsl(218_94%_78%/0.08),transparent_55%)]" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-6">
            Atuação
          </p>
          <h1 className="font-display font-bold tracking-tight text-5xl md:text-6xl lg:text-7xl leading-[1.05] max-w-4xl">
            Verticais onde o UGS opera.
          </h1>
          <p className="mt-7 text-lg md:text-xl text-foreground/75 max-w-2xl leading-relaxed">
            Cada setor tem suas próprias dinâmicas de compra, vocabulário e gargalos. Aplicamos
            o Unfold Growth System com micro-ângulos específicos por vertical.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <AtuacaoTabs />

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
                title: 'Assessoria Contínua',
                desc: 'Operamos junto com seu time em ciclos mensais. Reuniões semanais, dashboards em tempo real, execução tática e revisão estratégica trimestral.',
                tag: 'Mais comum',
              },
              {
                n: '02',
                title: 'Projeto Estruturante',
                desc: 'Diagnóstico completo, construção do sistema de crescimento e handoff para o time interno. Ideal para quem quer internalizar o UGS.',
                tag: null,
              },
              {
                n: '03',
                title: 'Sprint de Demanda',
                desc: 'Execução focada em geração de pipeline por 90 dias. Objetivo claro: leads qualificados para o time de vendas fechar.',
                tag: null,
              },
            ].map((m) => (
              <div
                key={m.n}
                className="relative rounded-xl border border-border bg-card/40 p-7 hover:bg-card hover:border-primary/30 transition-all"
              >
                {m.tag && (
                  <span className="absolute top-5 right-5 font-mono text-[10px] uppercase tracking-wider text-primary border border-primary/30 rounded-full px-2 py-0.5 bg-primary/5">
                    {m.tag}
                  </span>
                )}
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
                  Solicite um Diagnóstico
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
