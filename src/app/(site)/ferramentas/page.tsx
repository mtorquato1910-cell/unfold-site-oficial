import { ArrowRight, Calculator, ClipboardList, Radar } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getSiteTexts } from '@/lib/site-texts'
import { renderHighlight } from '@/lib/render-highlight'

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
  {
    icon: Radar,
    tag: 'Gratuito',
    title: 'Radar de Comitê de Compra',
    desc: 'Monte o ICP estrutural do seu negócio e o mapa do comitê de compra — com o ângulo certo para falar com cada decisor. Mapa de ICP em ~4 minutos.',
    cta: 'Montar meu mapa',
    href: '/ferramentas/mapa-icp',
    accent: 'text-primary',
    border: 'hover:border-primary/30',
  },
]

export default async function FerramentasPage() {
  const { ferramentas } = await getSiteTexts()
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative isolate overflow-hidden pt-32 pb-24 md:pt-40 md:pb-28">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/videos/ferramentas-poster.jpg"
          className="absolute inset-0 h-full w-full object-cover -z-20"
        >
          <source src="/videos/ferramentas.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background/95 via-background/85 to-background/55" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,hsl(158_92%_70%/0.10),transparent_55%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 -z-10 bg-gradient-to-b from-transparent to-background pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-6">
              {ferramentas.eyebrow}
            </p>
            <h1 className="font-display font-bold tracking-tight text-4xl md:text-5xl lg:text-6xl leading-[1.05]">
              {renderHighlight(ferramentas.title)}
            </h1>
            <p className="mt-7 text-lg md:text-xl text-foreground/70 max-w-xl leading-relaxed">
              {ferramentas.subtitle}
            </p>
          </div>
        </div>
      </section>

      <section className="relative pb-28">
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
