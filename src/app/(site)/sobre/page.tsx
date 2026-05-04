import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Award, Target, Eye, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AmbientOrb } from '@/components/ui/AmbientOrb'
import { UnfoldSymbol } from '@/components/brand/UnfoldSymbol'
import { BrazilMap } from '@/components/about/BrazilMap'

export const metadata: Metadata = {
  title: 'Sobre | Unfold Growth',
  description:
    'Conheça a Unfold Growth — organizamos crescimento digital em operações com vendas complexas por meio do método UGS.',
}

const VALUES = [
  {
    icon: Target,
    title: 'Resultado antes de processo',
    desc: 'Metodologia serve o negócio, não o contrário. Cada entrega é medida pelo impacto comercial real.',
  },
  {
    icon: Eye,
    title: 'Clareza acima de tudo',
    desc: 'Complexidade não impressiona. O que impressiona é fazer o difícil parecer simples — e funcionar.',
  },
  {
    icon: Zap,
    title: 'Velocidade com consistência',
    desc: 'Não existe crescimento sustentável sem ritmo. Estruturamos sistemas que aceleram e mantêm a operação.',
  },
]

const STATS = [
  { value: '+R$ 75MM', label: 'gerados em pipeline' },
  { value: '+R$ 850k', label: 'gerenciados em mídia online' },
  { value: 'RD Station, Meta, Kommo', label: 'Parceiros' },
  { value: 'ABRADI & ASSESPRO', label: 'Associados' },
]

const CERTIFICATIONS = [
  'HubSpot Revenue Operations',
  'RD Station Partner',
  'Google Analytics 4',
  'Meta Blueprint',
  'LinkedIn Marketing Solutions',
]

export default function SobrePage() {
  return (
    <main>
      {/* 1. Hero */}
      <section className="relative isolate overflow-hidden pt-32 pb-20 md:pt-40 md:pb-24">
        {/* Ambient glow */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,hsl(158_92%_70%/0.09),transparent_55%),radial-gradient(ellipse_at_bottom_right,hsl(218_94%_78%/0.06),transparent_50%)]" />
        <AmbientOrb color="mint" size={600} opacity={0.045} className="-top-28 -right-36" duration={15} />
        <AmbientOrb color="blue" size={450} opacity={0.03} className="-bottom-16 left-8" duration={11} style={{ animationName: 'orb-float-alt' }} />

        {/* Logo ring — decorative backdrop */}
        <div className="absolute inset-0 -z-10 flex items-center justify-end pointer-events-none" aria-hidden="true">
          <UnfoldSymbol
            size={480}
            className="opacity-[0.04] translate-x-24 -translate-y-8"
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-6">
            Sobre a Unfold Growth
          </p>
          <h1 className="font-display font-bold tracking-tight text-5xl md:text-6xl lg:text-7xl leading-[1.05] max-w-4xl">
            Crescimento organizado,{' '}
            <span className="text-primary">resultado previsível.</span>
          </h1>
          <p className="mt-7 text-lg md:text-xl text-foreground/75 max-w-2xl leading-relaxed">
            Somos uma consultoria especializada em estruturar sistemas de crescimento para empresas
            com vendas complexas — conectando marketing, vendas, CRM e automação em uma operação
            integrada e orientada a resultado.
          </p>
        </div>
      </section>

      {/* 2. Stats */}
      <section className="border-t border-border py-14">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card/40 p-6">
                <p className="font-display font-bold text-xl md:text-2xl text-primary mb-1">{s.value}</p>
                <p className="text-sm text-foreground/55">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Por que existe */}
      <section className="py-20 md:py-28 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-4">
                Nossa origem
              </p>
              <h2 className="font-display font-bold tracking-tight text-3xl md:text-4xl leading-tight">
                Por que a Unfold existe
              </h2>
            </div>
            <div className="space-y-5 text-foreground/75 leading-relaxed text-base md:text-lg">
              <p>
                A maioria das empresas com vendas complexas cresce apesar dos seus processos, não
                por causa deles. Marketing gera leads que vendas não consegue aproveitar. CRM vira
                cemitério de oportunidades. E o crescimento fica refém da intuição de um ou dois
                vendedores excepcionais.
              </p>
              <p>
                A Unfold foi criada para resolver exatamente esse problema. Desenvolvemos o método
                UGS — Unfold Growth System — para diagnosticar, estruturar e operar sistemas de
                crescimento que funcionam de forma integrada, previsível e escalável.
              </p>
              <p>
                Não somos uma agência de marketing. Não somos consultoria de vendas. Somos a ponte
                entre estratégia e operação — o elo que faltava para o crescimento virar resultado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. No que acreditamos */}
      <section className="py-20 md:py-28 bg-card/40 border-y border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-12">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-4">
              Princípios
            </p>
            <h2 className="font-display font-bold tracking-tight text-3xl md:text-4xl leading-tight">
              No que acreditamos
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-2xl border border-border bg-card p-8">
                <v.icon className="h-8 w-8 text-primary mb-5" strokeWidth={1.5} />
                <h3 className="font-display font-bold text-lg mb-3">{v.title}</h3>
                <p className="text-foreground/65 leading-relaxed text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Certificações */}
      <section className="py-20 md:py-24 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-16">
            <div className="shrink-0">
              <Award className="h-8 w-8 text-primary mb-3" strokeWidth={1.5} />
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-2">
                Certificações
              </p>
              <h2 className="font-display font-bold text-2xl md:text-3xl leading-tight max-w-xs">
                Metodologia validada
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {CERTIFICATIONS.map((cert) => (
                <span
                  key={cert}
                  className="inline-flex items-center gap-2 font-mono text-xs px-4 py-2 rounded-full border border-border bg-card text-foreground/70"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Onde Estamos — Brazil Map */}
      <section className="py-20 md:py-28 border-b border-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-5">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-5">
                Onde estamos
              </p>
              <h2 className="font-display font-bold tracking-tight text-3xl md:text-4xl leading-tight mb-6">
                Maceió, AL · São Paulo, SP
              </h2>
              <p className="text-foreground/65 leading-relaxed mb-8">
                Atendemos a todo o Brasil. Presença confirmada em 10 estados, com escritórios
                em Maceió e São Paulo.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Alagoas','Bahia','Minas Gerais','Santa Catarina','São Paulo','Mato Grosso','Mato Grosso do Sul','Goiás','Pernambuco','Paraná'].map((e) => (
                  <span
                    key={e}
                    className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>
            <div className="lg:col-span-7 flex justify-center lg:justify-end">
              <BrazilMap className="w-full max-w-sm lg:max-w-md" />
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA Diagnóstico */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-6">
            Próximo passo
          </p>
          <h2 className="font-display font-bold tracking-tight text-4xl md:text-5xl lg:text-6xl leading-[1.05] max-w-3xl mx-auto">
            Vamos organizar o crescimento da sua operação?
          </h2>
          <p className="mt-6 text-lg text-foreground/65 max-w-xl mx-auto leading-relaxed">
            O Diagnóstico UGS mapeia os gargalos do seu sistema de geração de demanda e entrega um
            plano de ação personalizado — em menos de 20 minutos.
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
              <Link href="/metodo">Conhecer o método UGS</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
