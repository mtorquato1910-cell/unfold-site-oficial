'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const VERTICALS = [
  {
    id: 'construcao',
    label: 'Construção Civil',
    micro: 'Ciclos longos, múltiplos decisores, margem apertada.',
    tagline: 'Da especificação ao fechamento: growth para quem vende na construção.',
    desc: 'Empresas de materiais, sistemas construtivos, software para obras e serviços para construtoras operam em um ambiente de alta complexidade: influenciadores técnicos, compradores financeiros e decisores de prazo no mesmo processo de venda. O UGS mapeia essa jornada e cria fluxos de marketing e vendas alinhados a cada stakeholder.',
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
    tagline: 'Growth para agtechs, cooperativas e fornecedores do agronegócio.',
    desc: 'O agronegócio tem ritmos próprios: sazonalidade de safra, relações baseadas em confiança e tomadores de decisão que valorizam provas locais antes de qualquer adoção. Aplicamos o UGS com foco em autoridade técnica, eventos regionais e ABM para contas estratégicas.',
    dores: [
      'Sazonalidade intensa — janelas de compra curtas',
      'Comprador exige prova de conceito local',
      'Equipe de vendas no campo sem apoio digital',
      'Baixa maturidade digital nos processos de compra',
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
    label: 'Tecnologia',
    micro: 'Produto bom. Pipeline imprevisível.',
    tagline: 'Do crescimento orgânico à operação escalável: growth para empresas de tecnologia.',
    desc: 'Empresas de software, plataformas e serviços de tecnologia frequentemente têm produto excelente mas pipeline concentrado no network dos fundadores. O desafio é escalar para além das indicações, criar demanda qualificada e estruturar uma operação comercial que cresce sem depender de uma pessoa. O UGS foi calibrado para ciclos de tecnologia, do primeiro cliente ao expansion.',
    dores: [
      'Pipeline concentrado no network do fundador',
      'CAC alto para clientes enterprise e mid-market',
      'Ciclo de vendas consultivo mal estruturado',
      'Marketing focado em brand, não em pipeline',
    ],
    abordagem: [
      'Estratégia de ICP e segmentação por perfil de cliente',
      'Conteúdo de autoridade + SEO de fundo de funil',
      'Outbound estruturado com sequências por persona',
      'Alinhamento CS + AE para expansão e retenção',
    ],
    cta: 'Ver cases de tecnologia',
    href: '/cases',
  },
  {
    id: 'automotivo',
    label: 'Automotivo',
    micro: 'Volume alto, margem sob pressão.',
    tagline: 'Growth para concessionárias, distribuidores, frotas e consórcios automotivos.',
    desc: 'O mercado automotivo é diverso: concessionárias, distribuidores, frotas corporativas, fintechs de crédito veicular, seguradoras e consórcios operam com dinâmicas muito distintas. A complexidade está nos múltiplos canais, nas aprovações de crédito longas e nas negociações por volume. O UGS estrutura fluxos de demanda e CRM para cada camada dessa cadeia.',
    dores: [
      'Negociação por volume com margens apertadas',
      'Processo de homologação e crédito lento',
      'Dependência de relacionamento pessoal do vendedor',
      'Dificuldade em diferenciar produto ou serviço',
    ],
    abordagem: [
      'Segmentação por tipo de conta (frota, distribuidor, consórcio)',
      'Conteúdo de diferenciação técnica e ROI',
      'CRM com aprovação de crédito e pipeline integrado',
      'Campanhas de captação para consórcio e financiamento',
    ],
    cta: 'Ver cases de automotivo',
    href: '/cases',
  },
  {
    id: 'industrias',
    label: 'Indústrias',
    micro: 'Relacionamento, spec-in e ciclos longos.',
    tagline: 'Growth para indústrias que vendem para distribuidores, varejistas e grandes contas.',
    desc: 'Indústrias de diferentes segmentos — alimentícia, química, plásticos, equipamentos, saúde — enfrentam o desafio de crescer sem depender de um canal único. Seja para ganhar novos distribuidores, estruturar um canal direto ou gerar especificações técnicas junto a clientes finais, o UGS é calibrado para a realidade industrial.',
    dores: [
      'Dependência de poucos distribuidores ou grandes contas',
      'Processo de especificação técnica longo',
      'Equipe comercial sem suporte de marketing estruturado',
      'Baixo aproveitamento de dados para tomada de decisão',
    ],
    abordagem: [
      'Estratégia de canal: distribuidor, varejo e direto',
      'Conteúdo técnico para spec-in e aprovação',
      'CRM segmentado por canal e perfil de cliente',
      'Campanhas de geração de demanda industrial',
    ],
    cta: 'Ver cases de indústria',
    href: '/cases',
  },
  {
    id: 'servicos',
    label: 'Serviços',
    micro: 'Intangível difícil de vender. Relacionamento é tudo.',
    tagline: 'Growth para consultorias, escritórios e empresas de serviços especializados.',
    desc: 'Empresas de serviços — consultorias, escritórios de advocacia, contabilidade, engenharia, saúde empresarial, RH e treinamentos — vendem confiança antes de vender o serviço. O ciclo é longo, o ticket alto e a decisão envolve múltiplos influenciadores. O UGS estrutura a jornada de venda para que marketing e relacionamento gerem crescimento previsível.',
    dores: [
      'Novo negócio depende quase exclusivamente de indicação',
      'Dificuldade em demonstrar valor antes do contrato',
      'Time de vendas reativo, sem cadência de prospecção',
      'Falta de diferenciação percebida no mercado',
    ],
    abordagem: [
      'Posicionamento e narrativa de autoridade no mercado',
      'Conteúdo que demonstra expertise e gera credibilidade',
      'Prospecção ativa com abordagem consultiva',
      'CRM com pipeline de relacionamento estruturado',
    ],
    cta: 'Ver cases de serviços',
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
                  : 'border-transparent text-foreground/80 hover:text-foreground'
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
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-foreground/75 mb-4">
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
