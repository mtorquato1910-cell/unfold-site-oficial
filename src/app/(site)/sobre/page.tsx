import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, MapPin, Award, Target, Eye, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Sobre | Unfold Growth',
  description:
    'Conheça a Unfold Growth — a empresa que organiza crescimento em operações com vendas complexas por meio do método UGS.',
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

const TEAM = [
  { name: 'Ana Costa', role: 'Estratégia de Growth', initials: 'AC' },
  { name: 'Bruno Lima', role: 'Revenue Operations', initials: 'BL' },
  { name: 'Carla Mendes', role: 'CRM & Automação', initials: 'CM' },
  { name: 'Diego Rocha', role: 'Inteligência Comercial', initials: 'DR' },
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
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,hsl(158_92%_70%/0.08),transparent_55%)]" />
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

      {/* 2. Por que existe */}
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

      {/* 3. No que acreditamos */}
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

      {/* 4. Liderança (placeholder) */}
      <section className="py-20 md:py-28 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-12">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-4">
              Liderança
            </p>
            <h2 className="font-display font-bold tracking-tight text-3xl md:text-4xl leading-tight">
              Quem lidera o método
            </h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-4xl">
            {/* Silhueta placeholder */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden aspect-square max-w-xs flex items-center justify-center">
              <svg
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-3/4 h-3/4 opacity-20"
              >
                <circle cx="100" cy="70" r="38" fill="currentColor" />
                <path
                  d="M20 180 C20 140 60 120 100 120 C140 120 180 140 180 180"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-2">
                Fundador & Estrategista
              </p>
              <h3 className="font-display font-bold text-2xl md:text-3xl mb-4">Gabriel [Sobrenome]</h3>
              <p className="text-foreground/65 leading-relaxed mb-6">
                Liderança técnica do método UGS. [Foto e bio profissional a ser inserida pelo
                cliente.]
              </p>
              <div className="flex flex-wrap gap-2">
                {['Revenue Operations', 'Vendas B2B', 'CRM Strategy', 'Growth Systems'].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="font-mono text-xs px-3 py-1 rounded-full border border-border text-foreground/60"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Time */}
      <section className="py-20 md:py-28 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-12">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-4">
              Equipe
            </p>
            <h2 className="font-display font-bold tracking-tight text-3xl md:text-4xl leading-tight">
              O time por trás do sistema
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="rounded-2xl border border-border bg-card p-6 flex flex-col items-center text-center"
              >
                <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <span className="font-mono font-bold text-primary text-sm">{member.initials}</span>
                </div>
                <p className="font-display font-semibold text-base">{member.name}</p>
                <p className="text-foreground/55 text-sm mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Certificações */}
      <section className="py-20 md:py-24 border-b border-border bg-card/30">
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

      {/* 7. Localização */}
      <section className="py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <MapPin className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/50 mb-1">
                Onde estamos
              </p>
              <p className="font-display font-semibold text-lg">
                São Paulo, SP — Atendimento remoto e presencial em todo o Brasil
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CTA Diagnóstico */}
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
