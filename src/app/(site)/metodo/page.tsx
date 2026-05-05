import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HeroVideoBackground } from '@/components/ui/HeroVideoBackground'

export const metadata: Metadata = {
  title: 'O Método UGS',
  description:
    'O Unfold Growth System — um sistema de crescimento para operações com vendas complexas, composto por 4 pilares: Diagnosticar, Estruturar, Operar e Evoluir.',
}

const PILLARS = [
  {
    n: '01',
    name: 'Diagnosticar',
    slug: 'diagnosticar',
    tagline: 'Enxergue antes de agir.',
    desc: 'Mapeamos a operação de crescimento atual — canais, stack, time, processos e dados — para identificar os gargalos reais que impedem a previsibilidade.',
    outputs: [
      'Diagnóstico de maturidade de growth',
      'Mapa de gargalos e oportunidades',
      'Benchmark do segmento',
      'Plano de crescimento 90 dias',
    ],
  },
  {
    n: '02',
    name: 'Estruturar',
    slug: 'estruturar',
    tagline: 'Construa o sistema certo.',
    desc: 'Desenhamos a arquitetura de crescimento: posicionamento, ICP, jornada de compra, funil, stack mar-tech e processos de revenue operations.',
    outputs: [
      'ICP e segmentação de clientes',
      'Jornada de compra mapeada',
      'Stack mar-tech configurado',
      'Processos de Rev Ops documentados',
    ],
  },
  {
    n: '03',
    name: 'Operar',
    slug: 'operar',
    tagline: 'Execute com método e dados.',
    desc: 'Operamos a máquina de crescimento com cadência, métricas e ritmo de melhoria contínua — geração de demanda, nutrição, CRM e fechamento.',
    outputs: [
      'Campanhas de geração de demanda',
      'Cadências de nutrição ativas',
      'CRM operando com pipeline limpo',
      'Dashboards de acompanhamento semanal',
    ],
  },
  {
    n: '04',
    name: 'Evoluir',
    slug: 'evoluir',
    tagline: 'Aprenda, escale, repita.',
    desc: 'Transformamos dados em decisões. Ciclos curtos de aprendizado, testes e otimização garantem que o sistema melhore a cada sprint.',
    outputs: [
      'Relatórios de performance mensais',
      'Hipóteses testadas e documentadas',
      'Plano de escala por canal',
      'Revisão trimestral de estratégia',
    ],
  },
]

const DIFFERENTIALS = [
  {
    title: 'Integração real entre marketing e vendas',
    desc: 'Não tratamos marketing e vendas como departamentos separados. O sistema conecta os dois em uma lógica de pipeline compartilhada.',
  },
  {
    title: 'Foco em vendas complexas',
    desc: 'Nosso método é calibrado para ciclos longos de vendas (60-180 dias), múltiplos decisores e ticket médio alto — não para e-commerce ou PLG.',
  },
  {
    title: 'Operação, não entrega de deck',
    desc: 'Não entregamos estratégia sem execução. Operamos junto com seu time ou sozinhos, dependendo do estágio da sua operação.',
  },
  {
    title: 'Dados como cultura, não como relatório',
    desc: 'Cada decisão é ancorada em dados. Construímos dashboards operacionais, não apenas relatórios bonitos para reunião de diretoria.',
  },
]

export default function MetodoPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden min-h-screen pt-32 pb-20 md:pt-40 md:pb-20">
        <HeroVideoBackground
          videoSrc="/videos/metodo.mp4"
          posterSrc="/videos/metodo-poster.jpg"
          videoFilter="saturate(0.8) brightness(0.82)"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-6">
              Método Unfold
            </p>
            <h1 className="font-display font-bold tracking-tight text-5xl md:text-6xl lg:text-7xl leading-[1.05]">
              O Unfold Growth System.
            </h1>
            <p className="mt-7 text-lg md:text-xl text-foreground/75 max-w-xl leading-relaxed">
              Um framework de crescimento estruturado para operações com vendas complexas.
              Quatro pilares, uma lógica integrada.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="h-12 px-6 group">
                <Link href="/diagnostico">
                  Iniciar diagnóstico gratuito
                  <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* UGS Overview */}
      <section className="bg-[#E7E7E7] text-[#001E29] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#0a8a5f] mb-5">
                O que é o UGS
              </p>
              <h2 className="font-display font-bold tracking-tight text-3xl md:text-4xl leading-[1.1]">
                Um sistema, não uma série de ações.
              </h2>
              <p className="mt-6 text-base text-[#001E29]/75 leading-relaxed">
                A maioria das empresas com vendas complexas tem marketing fazendo ações, vendas
                fazendo abordagem e os dois times falando línguas diferentes. O resultado é pipeline
                imprevisível, CAC alto e ciclos longos.
              </p>
              <p className="mt-4 text-base text-[#001E29]/75 leading-relaxed">
                O Unfold Growth System (UGS) conecta essas quatro etapas em uma operação única,
                com dados, processos e cadência alinhados para gerar crescimento previsível.
              </p>
            </div>
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-[#001E29]/10 bg-white p-6 md:p-8 overflow-hidden">
                <svg
                  viewBox="0 0 440 360"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-auto"
                  aria-label="Diagrama UGS — ciclo de crescimento"
                >
                  <defs>
                    <linearGradient id="ugs-arc" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6DF9C6" stopOpacity="0.9"/>
                      <stop offset="50%" stopColor="#4BB8D5" stopOpacity="0.7"/>
                      <stop offset="100%" stopColor="#0a8a5f" stopOpacity="0.5"/>
                    </linearGradient>
                    <linearGradient id="ugs-arrow-1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6DF9C6"/>
                      <stop offset="100%" stopColor="#4BB8D5"/>
                    </linearGradient>
                    <linearGradient id="ugs-arrow-2" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#4BB8D5"/>
                      <stop offset="100%" stopColor="#0a8a5f"/>
                    </linearGradient>
                    <linearGradient id="ugs-arrow-3" x1="100%" y1="0%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#0a8a5f"/>
                      <stop offset="100%" stopColor="#4BB8D5"/>
                    </linearGradient>
                    <linearGradient id="ugs-arrow-4" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#6DF9C6"/>
                      <stop offset="100%" stopColor="#4BB8D5"/>
                    </linearGradient>
                    <marker id="arr1" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <path d="M0 0 L6 3 L0 6 Z" fill="#4BB8D5" opacity="0.8"/>
                    </marker>
                    <marker id="arr2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <path d="M0 0 L6 3 L0 6 Z" fill="#0a8a5f" opacity="0.8"/>
                    </marker>
                    <marker id="arr3" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <path d="M0 0 L6 3 L0 6 Z" fill="#4BB8D5" opacity="0.8"/>
                    </marker>
                    <marker id="arr4" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <path d="M0 0 L6 3 L0 6 Z" fill="#6DF9C6" opacity="0.8"/>
                    </marker>
                  </defs>

                  {/* Center circle */}
                  <circle cx="220" cy="180" r="44" fill="#001E29" opacity="0.06"/>
                  <circle cx="220" cy="180" r="44" stroke="url(#ugs-arc)" strokeWidth="1.5" fill="none"/>
                  <text x="220" y="175" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontSize="11" fontWeight="700" fill="#001E29" opacity="0.5" letterSpacing="2">UGS</text>
                  <text x="220" y="191" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontSize="7.5" fill="#0a8a5f" opacity="0.7" letterSpacing="1">SISTEMA</text>

                  {/* Connecting lines (curved arcs between nodes) */}
                  {/* Diagnosticar → Estruturar (top → right) */}
                  <path d="M 280 68 Q 340 80 352 138" stroke="url(#ugs-arrow-1)" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arr1)" opacity="0.7"/>
                  {/* Estruturar → Operar (right → bottom) */}
                  <path d="M 352 222 Q 340 280 280 292" stroke="url(#ugs-arrow-2)" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arr2)" opacity="0.7"/>
                  {/* Operar → Evoluir (bottom → left) */}
                  <path d="M 160 292 Q 100 280 88 222" stroke="url(#ugs-arrow-3)" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arr3)" opacity="0.7"/>
                  {/* Evoluir → Diagnosticar (left → top) */}
                  <path d="M 88 138 Q 100 80 160 68" stroke="url(#ugs-arrow-4)" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arr4)" opacity="0.7"/>

                  {/* Node 01: Diagnosticar — top */}
                  <rect x="130" y="20" width="180" height="72" rx="10" fill="white" stroke="#001E29" strokeOpacity="0.08" strokeWidth="1"/>
                  <rect x="130" y="20" width="4" height="72" rx="2" fill="#6DF9C6"/>
                  <text x="146" y="42" fontFamily="'IBM Plex Mono', monospace" fontSize="9" fill="#0a8a5f" fontWeight="600">01.</text>
                  <text x="146" y="58" fontFamily="'Space Grotesk', sans-serif" fontSize="15" fontWeight="700" fill="#001E29">Diagnosticar</text>
                  <text x="146" y="74" fontFamily="'Inter', sans-serif" fontSize="10" fill="#001E29" opacity="0.5">Enxergue antes de agir.</text>

                  {/* Node 02: Estruturar — right */}
                  <rect x="300" y="144" width="132" height="72" rx="10" fill="white" stroke="#001E29" strokeOpacity="0.08" strokeWidth="1"/>
                  <rect x="300" y="144" width="4" height="72" rx="2" fill="#4BB8D5"/>
                  <text x="316" y="166" fontFamily="'IBM Plex Mono', monospace" fontSize="9" fill="#0a8a5f" fontWeight="600">02.</text>
                  <text x="316" y="182" fontFamily="'Space Grotesk', sans-serif" fontSize="15" fontWeight="700" fill="#001E29">Estruturar</text>
                  <text x="316" y="198" fontFamily="'Inter', sans-serif" fontSize="10" fill="#001E29" opacity="0.5">Construa o sistema.</text>

                  {/* Node 03: Operar — bottom */}
                  <rect x="130" y="268" width="180" height="72" rx="10" fill="white" stroke="#001E29" strokeOpacity="0.08" strokeWidth="1"/>
                  <rect x="130" y="268" width="4" height="72" rx="2" fill="#0a8a5f"/>
                  <text x="146" y="290" fontFamily="'IBM Plex Mono', monospace" fontSize="9" fill="#0a8a5f" fontWeight="600">03.</text>
                  <text x="146" y="306" fontFamily="'Space Grotesk', sans-serif" fontSize="15" fontWeight="700" fill="#001E29">Operar</text>
                  <text x="146" y="322" fontFamily="'Inter', sans-serif" fontSize="10" fill="#001E29" opacity="0.5">Execute com método e dados.</text>

                  {/* Node 04: Evoluir — left */}
                  <rect x="8" y="144" width="122" height="72" rx="10" fill="white" stroke="#001E29" strokeOpacity="0.08" strokeWidth="1"/>
                  <rect x="8" y="144" width="4" height="72" rx="2" fill="#6DF9C6"/>
                  <text x="24" y="166" fontFamily="'IBM Plex Mono', monospace" fontSize="9" fill="#0a8a5f" fontWeight="600">04.</text>
                  <text x="24" y="182" fontFamily="'Space Grotesk', sans-serif" fontSize="15" fontWeight="700" fill="#001E29">Evoluir</text>
                  <text x="24" y="198" fontFamily="'Inter', sans-serif" fontSize="10" fill="#001E29" opacity="0.5">Aprenda, escale, repita.</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars — detailed */}
      <section className="bg-background py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-5">
            Os 4 pilares
          </p>
          <h2 className="font-display font-bold tracking-tight text-3xl md:text-4xl lg:text-5xl leading-[1.1] max-w-2xl mb-16">
            Como o sistema funciona na prática.
          </h2>
          <div className="space-y-5">
            {PILLARS.map((p) => (
              <article
                key={p.n}
                className="group border border-border rounded-xl p-7 md:p-10 bg-card/40 hover:bg-card hover:border-primary/30 transition-all"
              >
                <div className="grid md:grid-cols-12 gap-6 md:gap-10">
                  <div className="md:col-span-5">
                    <div className="flex items-baseline gap-3 mb-3">
                      <span className="font-mono text-primary text-sm">{p.n}.</span>
                      <h3 className="font-display font-bold text-2xl md:text-3xl">{p.name}</h3>
                    </div>
                    <p className="text-sm text-primary/70 font-mono mb-4">{p.tagline}</p>
                    <p className="text-base text-foreground/70 leading-relaxed">{p.desc}</p>
                  </div>
                  <div className="md:col-span-7">
                    <p className="font-mono text-xs uppercase tracking-[0.15em] text-foreground/50 mb-4">
                      Entregáveis
                    </p>
                    <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
                      {p.outputs.map((o) => (
                        <li key={o} className="flex items-start gap-2 text-sm text-foreground/75">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>{o}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Differentials */}
      <section className="bg-[#E7E7E7] text-[#001E29] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#0a8a5f] mb-5">
            Por que funciona
          </p>
          <h2 className="font-display font-bold tracking-tight text-3xl md:text-4xl lg:text-5xl leading-[1.1] max-w-2xl mb-14">
            O que diferencia o UGS.
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {DIFFERENTIALS.map((d, i) => (
              <div
                key={i}
                className="rounded-xl border border-[#001E29]/10 bg-white p-7 hover:border-[#001E29]/25 transition-colors"
              >
                <span className="font-mono text-xs text-[#0a8a5f]">0{i + 1}.</span>
                <h3 className="font-display font-bold text-xl mt-2 mb-3">{d.title}</h3>
                <p className="text-sm text-[#001E29]/70 leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Para quem */}
      <section className="bg-background py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-5">
                Para quem é o UGS
              </p>
              <h2 className="font-display font-bold tracking-tight text-3xl md:text-4xl leading-[1.1]">
                Feito para empresas com vendas complexas.
              </h2>
              <p className="mt-6 text-base text-foreground/70 leading-relaxed">
                O UGS foi desenvolvido para empresas com vendas complexas — ticket médio alto,
                múltiplos decisores e ciclos de negociação entre 60 e 180 dias.
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  'Faturamento entre R$ 5MM e R$ 500MM/ano',
                  'Time comercial estruturado (SDR, AE, CS)',
                  'Produto ou serviço complexo (não commoditizado)',
                  'Ciclo de vendas acima de 30 dias',
                  'Necessidade de previsibilidade de receita',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-foreground/75">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-8 md:p-10">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-6">
                Verticais que atendemos
              </p>
              <div className="grid grid-cols-2 gap-3">
                {['Construção Civil', 'Agronegócio', 'Tecnologia', 'Automotivo', 'Indústrias', 'Serviços'].map(
                  (v) => (
                    <div
                      key={v}
                      className="rounded-lg border border-border bg-background/50 px-4 py-3 text-sm font-medium"
                    >
                      {v}
                    </div>
                  )
                )}
              </div>
              <Link
                href="/atuacao"
                className="mt-8 inline-flex items-center gap-2 text-primary text-sm font-medium group"
              >
                Ver detalhes por vertical
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Processo de engajamento */}
      <section className="bg-[#E7E7E7] text-[#001E29] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#0a8a5f] mb-5">
            Como começar
          </p>
          <h2 className="font-display font-bold tracking-tight text-3xl md:text-4xl leading-[1.1] max-w-xl mb-14">
            Do diagnóstico à operação em 4 semanas.
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: '01', label: 'Diagnóstico', desc: 'Avaliamos sua operação em 5 minutos via formulário.' },
              { step: '02', label: 'Apresentação', desc: 'Reunião de alinhamento com análise inicial e proposta.' },
              { step: '03', label: 'Kick-off', desc: 'Mapeamento completo e construção do plano de 90 dias.' },
              { step: '04', label: 'Operação', desc: 'Execução com cadência semanal e dashboards em tempo real.' },
            ].map((s) => (
              <div key={s.step} className="rounded-xl bg-white border border-[#001E29]/10 p-6">
                <span className="font-mono text-3xl font-bold text-[#0a8a5f]/30">{s.step}</span>
                <h3 className="font-display font-bold text-xl mt-3 mb-2">{s.label}</h3>
                <p className="text-sm text-[#001E29]/65 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-background py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_50%,hsl(158_92%_70%/0.15),transparent_45%)]" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8">
              <h2 className="font-display font-bold tracking-tight text-3xl md:text-4xl lg:text-5xl leading-[1.05] max-w-3xl">
                Pronto para estruturar seu sistema de crescimento?
              </h2>
              <p className="mt-6 text-base md:text-lg text-foreground/70 max-w-2xl leading-relaxed">
                Comece pelo diagnóstico gratuito. Em 5 minutos você sabe onde sua operação está
                e o que travar está travando.
              </p>
            </div>
            <div className="lg:col-span-4 lg:flex lg:justify-end">
              <Button asChild size="lg" className="h-14 px-7 text-base group">
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
