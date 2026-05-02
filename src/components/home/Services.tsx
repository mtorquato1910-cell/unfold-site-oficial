import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

const SERVICES = [
  {
    n: '01',
    title: 'Geração de Demanda B2B',
    desc: 'Leads qualificados com tráfego pago e automação orientada ao pipeline.',
    bullets: [
      'Estratégia de mídia paga (Meta, Google, LinkedIn)',
      'Automação de nutrição e qualificação',
      'Lead scoring e SLA com vendas',
      'Otimização contínua de CPL e CAC',
    ],
  },
  {
    n: '02',
    title: 'Conteúdo & Autoridade',
    desc: 'Produção de conteúdo B2B que gera awareness, confiança e conversão.',
    bullets: [
      'Planejamento editorial orientado a funil',
      'Produção de conteúdo (vídeo, artigos, copy)',
      'SEO técnico e topic clusters',
      'Relatórios de impacto e attribution',
    ],
  },
  {
    n: '03',
    title: 'CRM & Automação',
    desc: 'Implementação e operação de CRM alinhada ao ciclo de vendas complexas.',
    bullets: [
      'Implantação e configuração de CRM',
      'Automações de follow-up e cadências',
      'Integração marketing-vendas',
      'Dashboards de pipeline e forecast',
    ],
  },
  {
    n: '04',
    title: 'Consultoria de Growth',
    desc: 'Diagnóstico estratégico e construção do sistema de crescimento.',
    bullets: [
      'Diagnóstico e plano de crescimento',
      'Arquitetura do stack mar-tech',
      'Processos de revenue operations',
      'Treinamento e mentoria de times',
    ],
  },
]

export function Services() {
  return (
    <section className="bg-[#E7E7E7] text-[#001E29] py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#0a8a5f] mb-5">
          Como atuamos
        </p>
        <h2 className="font-display font-bold tracking-tight text-3xl md:text-4xl lg:text-5xl leading-[1.1] max-w-3xl mb-14">
          Crescimento como sistema, não como projeto.
        </h2>

        <div className="space-y-4">
          {SERVICES.map((s) => (
            <article
              key={s.n}
              className="group bg-white border border-[#001E29]/10 rounded-xl p-7 md:p-9 hover:border-[#001E29]/30 transition-colors"
            >
              <div className="grid md:grid-cols-12 gap-6 md:gap-10">
                <div className="md:col-span-4">
                  <span className="font-mono text-sm text-[#0a8a5f]">{s.n}.</span>
                  <h3 className="font-display font-bold text-2xl mt-2">{s.title}</h3>
                  <p className="text-sm text-[#001E29]/65 mt-2 leading-relaxed">{s.desc}</p>
                </div>
                <div className="md:col-span-6">
                  <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex gap-2 text-[#001E29]/80">
                        <span className="text-[#0a8a5f] mt-1">→</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:col-span-2 flex md:justify-end md:items-end">
                  <Link
                    href="/atuacao"
                    className="inline-flex items-center gap-1 text-sm font-medium border-b border-[#001E29]/30 hover:border-[#001E29] pb-0.5 transition-colors"
                  >
                    Ver mais
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
