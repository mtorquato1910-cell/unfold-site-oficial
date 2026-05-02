import {
  Target,
  TrendingUp,
  Sparkles,
  BarChart3,
  Users,
  Rocket,
  Workflow,
  Zap,
} from 'lucide-react'

const ITEMS = [
  {
    icon: Target,
    title: 'Gerar mais leads',
    desc: 'Aumentamos o fluxo de visitas qualificadas e geramos contatos para sua empresa captar mais clientes B2B.',
  },
  {
    icon: TrendingUp,
    title: 'Aumentar vendas',
    desc: 'Estruturamos operações de demanda previsível para que marketing e vendas trabalhem com a mesma lógica.',
  },
  {
    icon: Sparkles,
    title: 'Melhorar a experiência',
    desc: 'Eliminamos a fricção no crescimento com websites, blogs e touchpoints de alta performance.',
  },
  {
    icon: BarChart3,
    title: 'Otimizar resultados',
    desc: 'Otimizamos sua presença online para que cada real investido gere mais retorno mensurável.',
  },
  {
    icon: Users,
    title: 'Reduzir CAC',
    desc: 'Reduzimos o custo de aquisição, encurtamos o ciclo de vendas e aumentamos o LTV dos seus clientes.',
  },
  {
    icon: Rocket,
    title: 'Escalar aquisição',
    desc: 'Construímos máquinas de aquisição previsíveis, escaláveis e integradas ao seu processo comercial.',
  },
  {
    icon: Workflow,
    title: 'Integrar marketing e vendas',
    desc: 'Alinhamos times com metodologia, CRM e processos validados de revenue operations.',
  },
  {
    icon: Zap,
    title: 'Acelerar o crescimento',
    desc: 'Aceleramos o crescimento usando dados, processos, tecnologia e cultura de alto impacto.',
  },
]

export function Solutions() {
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-5">
            Para empresas que precisam
          </p>
          <h2 className="font-display font-bold tracking-tight text-3xl md:text-4xl lg:text-5xl leading-[1.1]">
            Resolvemos os desafios que travam seu crescimento.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {ITEMS.map(({ icon: Icon, title, desc }) => (
            <article
              key={title}
              className="group p-7 rounded-xl border border-border bg-card/40 hover:bg-card hover:border-primary/40 transition-all"
            >
              <Icon className="h-7 w-7 text-primary mb-6" strokeWidth={1.6} />
              <h3 className="font-sans font-semibold text-lg mb-2">{title}</h3>
              <p className="text-sm text-foreground/65 leading-relaxed">{desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
