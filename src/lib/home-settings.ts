import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'

export type HomeStat = {
  prefix?: string
  value: number
  suffix?: string
  label: string
}

export type HomeClientLogo = {
  name: string
  logoUrl?: string
  website?: string
}

export type HomeSolution = {
  icon: string
  title: string
  desc: string
}

export type HomeService = {
  numero: string
  title: string
  desc: string
  bullets: string[]
  cta_label: string
  cta_href: string
}

export type HomeTool = {
  icon: string
  title: string
  desc: string
  cta: string
  href: string
  ai: boolean
}

export type HomeSettingsData = {
  hero_eyebrow: string
  hero_title: string
  hero_subtitle: string
  hero_cta_primary_label: string
  hero_cta_primary_href: string
  hero_cta_secondary_label: string
  hero_cta_secondary_href: string
  hero_video_url: string | null
  hero_image_url: string | null
  stats: HomeStat[]
  stats_extra_text: string
  client_logos_title: string
  // Soluções
  solutions_eyebrow: string
  solutions_title: string
  solutions: HomeSolution[]
  // Serviços
  services_eyebrow: string
  services_title: string
  services: HomeService[]
  // Ferramentas
  tools_eyebrow: string
  tools_title: string
  tools: HomeTool[]
  // Parceiros
  partners_eyebrow: string
  partners_title: string
  partners_footer_text: string
  partner_logos: HomeClientLogo[]
  // Método
  method_eyebrow: string
  method_title: string
  method_description: string
  method_cta_label: string
  method_cta_href: string
  // CTA Final
  final_cta_title: string
  final_cta_description: string
  final_cta_button_label: string
  final_cta_button_href: string
}

const DEFAULTS: HomeSettingsData = {
  hero_eyebrow: 'Growth Intelligence · Geração de demanda',
  hero_title: 'Organizamos crescimento digital em operações com vendas complexas.',
  hero_subtitle:
    'Estruturamos sistemas de crescimento que conectam marketing, vendas, CRM e automação em uma lógica integrada, previsível e orientada a resultado comercial.',
  hero_cta_primary_label: 'Solicite um Diagnóstico',
  hero_cta_primary_href: '/diagnostico',
  hero_cta_secondary_label: 'Conhecer o método',
  hero_cta_secondary_href: '/metodo',
  hero_video_url: null,
  hero_image_url: null,
  stats: [
    { prefix: '+R$ ', value: 75, suffix: 'MM', label: 'gerados em pipeline' },
    { prefix: '+R$ ', value: 850, suffix: 'k', label: 'gerenciados em mídia online' },
    { prefix: '+', value: 25, suffix: 'k', label: 'conteúdos produzidos' },
  ],
  stats_extra_text: 'Parceiros RD Station, Meta, Kommo',
  client_logos_title: 'Empresas que confiam na Unfold',
  // Soluções
  solutions_eyebrow: 'Para empresas que precisam',
  solutions_title: 'Resolvemos os desafios que travam seu crescimento.',
  solutions: [
    { icon: 'Target', title: 'Gerar mais leads', desc: 'Aumentamos o fluxo de visitas qualificadas e geramos contatos para sua empresa captar mais clientes B2B.' },
    { icon: 'TrendingUp', title: 'Aumentar vendas', desc: 'Estruturamos operações de demanda previsível para que marketing e vendas trabalhem com a mesma lógica.' },
    { icon: 'Sparkles', title: 'Melhorar a experiência', desc: 'Eliminamos a fricção no crescimento com websites, blogs e touchpoints de alta performance.' },
    { icon: 'BarChart3', title: 'Otimizar resultados', desc: 'Otimizamos sua presença online para que cada real investido gere mais retorno mensurável.' },
    { icon: 'Users', title: 'Reduzir CAC', desc: 'Reduzimos o custo de aquisição, encurtamos o ciclo de vendas e aumentamos o LTV dos seus clientes.' },
    { icon: 'Rocket', title: 'Escalar aquisição', desc: 'Construímos máquinas de aquisição previsíveis, escaláveis e integradas ao seu processo comercial.' },
    { icon: 'Workflow', title: 'Integrar marketing e vendas', desc: 'Alinhamos times com metodologia, CRM e processos validados de revenue operations.' },
    { icon: 'Zap', title: 'Acelerar o crescimento', desc: 'Aceleramos o crescimento usando dados, processos, tecnologia e cultura de alto impacto.' },
  ],
  // Serviços
  services_eyebrow: 'Como atuamos',
  services_title: 'Crescimento como sistema, não como projeto.',
  services: [
    {
      numero: '01',
      title: 'Consultoria de Growth',
      desc: 'Diagnóstico estratégico e construção do sistema de crescimento.',
      bullets: [
        'Diagnóstico e plano de crescimento',
        'Arquitetura do stack mar-tech',
        'Processos de revenue operations',
        'Treinamento e mentoria de times',
      ],
      cta_label: 'Ver mais',
      cta_href: '/atuacao',
    },
    {
      numero: '02',
      title: 'Geração de Demanda Digital',
      desc: 'Leads qualificados com tráfego pago e automação orientada ao pipeline.',
      bullets: [
        'Estratégia de mídia paga (Meta, Google, LinkedIn)',
        'Automação de nutrição e qualificação',
        'Lead scoring e SLA com vendas',
        'Otimização contínua de CPL e CAC',
      ],
      cta_label: 'Ver mais',
      cta_href: '/atuacao',
    },
    {
      numero: '03',
      title: 'CRM & Automação',
      desc: 'Implementação e operação de CRM alinhada ao ciclo de vendas complexas.',
      bullets: [
        'Implantação e configuração de CRM',
        'Automações de follow-up e cadências',
        'Integração marketing-vendas',
        'Dashboards de pipeline e forecast',
      ],
      cta_label: 'Ver mais',
      cta_href: '/atuacao',
    },
  ],
  // Ferramentas
  tools_eyebrow: 'Ferramentas',
  tools_title: 'Diagnósticos gratuitos para destravar seu crescimento.',
  tools: [
    {
      icon: 'Calculator',
      title: 'Calculadora de Tráfego × Receita',
      desc: 'Descubra quanto investir em tráfego pago para atingir sua meta de faturamento, com benchmarks reais do seu segmento.',
      cta: 'Calcular agora',
      href: '/ferramentas/calculadora-trafego',
      ai: true,
    },
    {
      icon: 'ClipboardCheck',
      title: 'Diagnóstico de Growth',
      desc: 'Avalie em 5 minutos a maturidade da sua operação de crescimento B2B e receba um plano de evolução personalizado.',
      cta: 'Iniciar diagnóstico',
      href: '/diagnostico',
      ai: false,
    },
  ],
  // Parceiros
  partners_eyebrow: 'Parceiros e certificações',
  partners_title: 'Parceiros oficiais',
  partners_footer_text:
    'Não achou sua ferramenta ou tecnologia? Possuímos um setor interno de tecnologia pronto para se adaptar à realidade do seu negócio.',
  partner_logos: [
    { name: 'RD STATION' },
    { name: 'META BUSINESS' },
    { name: 'ASSESPRO ALAGOAS' },
    { name: 'KOMMO' },
    { name: 'ABRADI ALAGOAS' },
  ],
  method_eyebrow: 'Método Unfold',
  method_title: 'Um sistema de crescimento, não mais uma série de ações isoladas.',
  method_description:
    'O Unfold Growth System (UGS) conecta as quatro alavancas do crescimento — Diagnosticar, Estruturar, Operar e Evoluir — em uma operação integrada, previsível e orientada a resultado comercial.',
  method_cta_label: 'Conheça o método UGS',
  method_cta_href: '/metodo',
  final_cta_title: 'Você já tem marketing e vendas. Falta o sistema que conecta tudo.',
  final_cta_description:
    'Solicite um diagnóstico gratuito. Em até 24h alguém da equipe entra em contato com uma análise inicial da sua operação de crescimento.',
  final_cta_button_label: 'Solicite um Diagnóstico',
  final_cta_button_href: '/diagnostico',
}

function mediaUrl(field: any): string | null {
  if (!field) return null
  if (typeof field === 'string') return null
  return field.url || null
}

function logosFromArray(arr: any[]): HomeClientLogo[] {
  if (!Array.isArray(arr) || arr.length === 0) return []
  return arr
    .map((row) => ({
      name: row.name || '',
      logoUrl: mediaUrl(row.logo) || undefined,
      website: row.website || undefined,
    }))
    .filter((r) => r.name)
}

async function fetchHomeSettings(): Promise<HomeSettingsData> {
  try {
    const payload = await getPayload({ config })
    const settings: any = await payload.findGlobal({ slug: 'home-settings', depth: 2 })
    const stats: HomeStat[] = Array.isArray(settings?.stats) && settings.stats.length > 0
      ? settings.stats.map((s: any) => ({
          prefix: s.prefix || '',
          value: s.value || 0,
          suffix: s.suffix || '',
          label: s.label || '',
        }))
      : DEFAULTS.stats
    const partnerLogos = logosFromArray(settings?.partner_logos)

    const solutions: HomeSolution[] =
      Array.isArray(settings?.solutions) && settings.solutions.length > 0
        ? settings.solutions.map((s: any) => ({
            icon: s.icon || 'Sparkles',
            title: s.title || '',
            desc: s.desc || '',
          }))
        : DEFAULTS.solutions

    const services: HomeService[] =
      Array.isArray(settings?.services) && settings.services.length > 0
        ? settings.services.map((s: any) => ({
            numero: s.numero || '',
            title: s.title || '',
            desc: s.desc || '',
            bullets: Array.isArray(s.bullets) ? s.bullets.map((b: any) => b.text || b).filter(Boolean) : [],
            cta_label: s.cta_label || 'Ver mais',
            cta_href: s.cta_href || '/atuacao',
          }))
        : DEFAULTS.services

    const tools: HomeTool[] =
      Array.isArray(settings?.tools) && settings.tools.length > 0
        ? settings.tools.map((t: any) => ({
            icon: t.icon || 'Sparkles',
            title: t.title || '',
            desc: t.desc || '',
            cta: t.cta || 'Saiba mais',
            href: t.href || '#',
            ai: Boolean(t.ai),
          }))
        : DEFAULTS.tools

    return {
      hero_eyebrow: settings?.hero_eyebrow || DEFAULTS.hero_eyebrow,
      hero_title: settings?.hero_title || DEFAULTS.hero_title,
      hero_subtitle: settings?.hero_subtitle || DEFAULTS.hero_subtitle,
      hero_cta_primary_label: settings?.hero_cta_primary_label || DEFAULTS.hero_cta_primary_label,
      hero_cta_primary_href: settings?.hero_cta_primary_href || DEFAULTS.hero_cta_primary_href,
      hero_cta_secondary_label: settings?.hero_cta_secondary_label || DEFAULTS.hero_cta_secondary_label,
      hero_cta_secondary_href: settings?.hero_cta_secondary_href || DEFAULTS.hero_cta_secondary_href,
      hero_video_url: settings?.hero_video_url || null,
      hero_image_url: mediaUrl(settings?.hero_image),
      stats,
      stats_extra_text: settings?.stats_extra_text || DEFAULTS.stats_extra_text,
      client_logos_title: settings?.client_logos_title || DEFAULTS.client_logos_title,
      solutions_eyebrow: settings?.solutions_eyebrow || DEFAULTS.solutions_eyebrow,
      solutions_title: settings?.solutions_title || DEFAULTS.solutions_title,
      solutions,
      services_eyebrow: settings?.services_eyebrow || DEFAULTS.services_eyebrow,
      services_title: settings?.services_title || DEFAULTS.services_title,
      services,
      tools_eyebrow: settings?.tools_eyebrow || DEFAULTS.tools_eyebrow,
      tools_title: settings?.tools_title || DEFAULTS.tools_title,
      tools,
      partners_eyebrow: settings?.partners_eyebrow || DEFAULTS.partners_eyebrow,
      partners_title: settings?.partners_title || DEFAULTS.partners_title,
      partners_footer_text: settings?.partners_footer_text || DEFAULTS.partners_footer_text,
      partner_logos: partnerLogos.length > 0 ? partnerLogos : DEFAULTS.partner_logos,
      method_eyebrow: settings?.method_eyebrow || DEFAULTS.method_eyebrow,
      method_title: settings?.method_title || DEFAULTS.method_title,
      method_description: settings?.method_description || DEFAULTS.method_description,
      method_cta_label: settings?.method_cta_label || DEFAULTS.method_cta_label,
      method_cta_href: settings?.method_cta_href || DEFAULTS.method_cta_href,
      final_cta_title: settings?.final_cta_title || DEFAULTS.final_cta_title,
      final_cta_description: settings?.final_cta_description || DEFAULTS.final_cta_description,
      final_cta_button_label: settings?.final_cta_button_label || DEFAULTS.final_cta_button_label,
      final_cta_button_href: settings?.final_cta_button_href || DEFAULTS.final_cta_button_href,
    }
  } catch {
    return DEFAULTS
  }
}

export const getHomeSettings = unstable_cache(fetchHomeSettings, ['home-settings'], {
  tags: ['home-settings'],
  revalidate: 60,
})
