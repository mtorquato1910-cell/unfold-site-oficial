import { ArrowRight, Calculator, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ferramentas Gratuitas — Unfold Growth',
  description:
    'Ferramentas gratuitas para diagnosticar e escalar sua operação de crescimento. Calculadora de tráfego e diagnóstico de growth sem compromisso.',
}

const TOOLS = [
  {
    icon: Calculator,
    tag: 'Gratuito',
    title: 'Calculadora de Tráfego',
    desc: 'Descubra quantos leads, oportunidades e clientes você pode gerar com o seu investimento em mídia paga. Projeção personalizada em menos de 5 minutos.',
    cta: 'Calcular agora',
    href: '/ferramentas/calculadora-trafego',
    accent: 'text-primary',
    border: 'hover:border-primary/30',
  },
  {
    icon: ClipboardList,
    tag: 'Gratuito',
    title: 'Diagnóstico de Growth',
    desc: 'Responda 12 perguntas sobre sua operação de marketing e vendas e receba um diagnóstico personalizado dos seus principais gargalos de crescimento.',
    cta: 'Fazer diagnóstico',
    href: '/diagnostico',
    accent: 'text-secondary',
    border: 'hover:border-secondary/30',
  },
]

export default function FerramentasPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="pt-36 pb-20 md:pt-44 md:pb-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-6">
            Ferramentas gratuitas
          </p>
          <h1 className="font-display font-bold tracking-tight text-4xl md:text-5xl lg:text-6xl leading-[1.05] max-w-4xl">
            Ferramentas para diagnosticar e{' '}
            <span className="text-primary">escalar sua operação.</span>
          </h1>
          <p className="mt-7 text-lg md:text-xl text-foreground/70 max-w-2xl leading-relaxed">
            Projeções e diagnósticos práticos para entender onde sua operação de crescimento
            está e o que está travando — sem compromisso.
          </p>
        </div>
      </section>

      <section className="pb-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {TOOLS.map((tool) => {
              const Icon = tool.icon
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className={`group relative flex flex-col justify-between bg-card border border-border rounded-2xl p-10 transition-all duration-300 ${tool.border} hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]`}
                >
                  <div>
                    <div className="flex items-start justify-between mb-8">
                      <div className={`p-3 rounded-xl bg-foreground/5 ${tool.accent}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/35 border border-foreground/10 rounded-full px-3 py-1">
                        {tool.tag}
                      </span>
                    </div>
                    <h2 className="font-display font-bold text-2xl md:text-3xl mb-4">
                      {tool.title}
                    </h2>
                    <p className="text-foreground/65 leading-relaxed">{tool.desc}</p>
                  </div>
                  <div className="mt-10 flex items-center gap-2 font-medium text-sm">
                    <span className={tool.accent}>{tool.cta}</span>
                    <ArrowRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${tool.accent}`} />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

    </main>
  )
}
