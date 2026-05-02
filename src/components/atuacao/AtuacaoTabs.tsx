'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const VERTICALS = [
  {
    id: 'construcao',
    label: 'Construção Civil',
    micro: 'Ciclos longos, múltiplos stakeholders, margem apertada.',
    tagline: 'Da especificação ao fechamento: growth para quem vende B2B na construção.',
    desc: 'Empresas de materiais, sistemas construtivos, software para obras e serviços para construtoras enfrentam um desafio específico: influenciadores técnicos, compradores financeiros e decisores de prazo no mesmo processo de venda. O UGS mapeia essa jornada e cria fluxos de marketing e vendas alinhados a cada stakeholder.',
    dores: [
      'Ciclo de vendas acima de 90 dias',
      'Múltiplos decisores (engenheiro, diretor, financeiro)',
      'Dificuldade em gerar demanda digital no setor',
      'Representantes sem suporte de marketing',
    ],
    abordagem: [
      'Segmentação por porte e tipo de obra',
      'Conteúdo técnico para engenheiros e arquitetos',
      'CRM com multi-stakeholder e ciclo longo',
      'Campanhas LinkedIn + Google para construtoras',
    ],
    cta: 'Ver cases de construção',
    href: '/cases',
  },
  {
    id: 'agro',
    label: 'Agronegócio',
    micro: 'Safra como calendário. Confiança como moeda.',
    tagline: 'Growth B2B para agtechs, cooperativas e fornecedores do agronegócio.',
    desc: 'O agronegócio tem ritmos próprios: sazonalidade de safra, relações baseadas em confiança e tomadores de decisão que valorizam provas locais antes de qualquer adoção. Aplicamos o UGS com foco em autoridade técnica, eventos regionais e ABM para contas estratégicas.',
    dores: [
      'Sazonalidade intensa (janelas de compra curtas)',
      'Produtor exige prova de conceito local',
      'Equipe de vendas no campo sem apoio digital',
      'Baixa maturidade digital do comprador',
    ],
    abordagem: [
      'Calendário editorial alinhado à safra',
      'Cases e provas de resultado por região',
      'ABM para cooperativas e integradoras',
      'Materiais de apoio ao vendedor de campo',
    ],
    cta: 'Ver cases de agro',
    href: '/cases',
  },
  {
    id: 'tech',
    label: 'Tech B2B',
    micro: 'Produto bom. Pipeline ruim.',
    tagline: 'Do PLG à operação enterprise: growth para SaaS e tech B2B.',
    desc: 'Empresas de software e tecnologia B2B frequentemente têm produto excelente mas pipeline imprevisível. O desafio: escalar além do network do fundador, criar demanda outbound qualificada e reduzir churn com CS estruturado. O UGS foi calibrado para ciclos de SaaS, do trial ao expansion.',
    dores: [
      'Pipeline concentrado no network do fundador',
      'CAC alto para clientes enterprise',
      'Ciclo de vendas consultivo mal estruturado',
      'Marketing focado em brand, não em pipeline',
    ],
    abordagem: [
      'Estratégia de ICP e segmentação enterprise',
      'Conteúdo de autoridade + SEO de fundo de funil',
      'Outbound estruturado com sequências por persona',
      'Alinhamento CS + AE para redução de churn',
    ],
    cta: 'Ver cases de tech',
    href: '/cases',
  },
  {
    id: 'automotivo',
    label: 'Automotivo',
    micro: 'Volume alto, margem sob pressão.',
    tagline: 'Growth para fornecedores, distribuidores e serviços B2B no setor automotivo.',
    desc: 'O mercado automotivo B2B envolve montadoras, distribuidores, frotas, oficinas e fintechs de crédito veicular. A complexidade está nos múltiplos canais, nas negociações de volume e nas aprovações de crédito longas. O UGS estrutura fluxos de demanda e CRM para cada camada dessa cadeia.',
    dores: [
      'Negociação por volume com margens baixas',
      'Processo de homologação e crédito lento',
      'Dependência de relacionamento pessoal do vendedor',
      'Dificuldade em diferenciar produto/serviço',
    ],
    abordagem: [
      'Segmentação por tipo de conta (frota, dist., OEM)',
      'Conteúdo de diferenciação técnica e ROI',
      'CRM com aprovação de crédito integrada',
      'Programas de fidelização B2B para distribuidores',
    ],
    cta: 'Ver cases de automotivo',
    href: '/cases',
  },
]

export function AtuacaoTabs() {
  const [active, setActive] = useState(VERTICALS[0].id)
  const vertical = VERTICALS.find((v) => v.id === active)!

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Tab nav */}
        <div className="flex flex-wrap gap-2 mb-12 border-b border-border pb-0">
          {VERTICALS.map((v) => (
            <button
              key={v.id}
              onClick={() => setActive(v.id)}
              className={cn(
                'px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
                active === v.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-foreground/60 hover:text-foreground'
              )}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14">
          <div className="lg:col-span-5">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-4">
              {vertical.micro}
            </p>
            <h2 className="font-display font-bold tracking-tight text-3xl md:text-4xl leading-[1.1] mb-5">
              {vertical.tagline}
            </h2>
            <p className="text-base text-foreground/70 leading-relaxed mb-8">{vertical.desc}</p>
            <Link
              href={vertical.href}
              className="inline-flex items-center gap-2 text-primary font-medium text-sm group"
            >
              {vertical.cta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-5">
            <div className="rounded-xl border border-border bg-card/40 p-6">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-foreground/50 mb-4">
                Dores típicas
              </p>
              <ul className="space-y-2.5">
                {vertical.dores.map((d) => (
                  <li key={d} className="flex items-start gap-2 text-sm text-foreground/70">
                    <span className="text-foreground/30 mt-0.5">—</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-primary mb-4">
                Nossa abordagem
              </p>
              <ul className="space-y-2.5">
                {vertical.abordagem.map((a) => (
                  <li key={a} className="flex items-start gap-2 text-sm text-foreground/80">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
