import type { GlobalConfig } from 'payload'
import { ICON_OPTIONS } from '../lib/icons-map'

const ICON_SELECT_OPTIONS = ICON_OPTIONS.map((name) => ({ label: name, value: name }))

const HomeSettings: GlobalConfig = {
  slug: 'home-settings',
  label: 'Home — Hero, Stats & Logos',
  admin: {
    group: 'Configurações',
    description: 'Conteúdos editáveis da página inicial',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ── Hero ──────────────────────────────────────────────────
        {
          label: 'Hero',
          fields: [
            {
              name: 'hero_eyebrow',
              type: 'text',
              label: 'Tagline pequena (mono uppercase)',
              defaultValue: 'Growth Intelligence · Geração de demanda',
              admin: { description: 'Texto pequeno acima do título principal' },
            },
            {
              name: 'hero_title',
              type: 'textarea',
              label: 'Título principal',
              defaultValue: 'Organizamos crescimento digital em operações com vendas complexas.',
              required: true,
              admin: { description: 'Use {{primary}}...{{/primary}} para destacar trecho em mint' },
            },
            {
              name: 'hero_subtitle',
              type: 'textarea',
              label: 'Subtítulo / descrição',
              defaultValue:
                'Estruturamos sistemas de crescimento que conectam marketing, vendas, CRM e automação em uma lógica integrada, previsível e orientada a resultado comercial.',
              required: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'hero_cta_primary_label',
                  type: 'text',
                  label: 'CTA primário — texto',
                  defaultValue: 'Solicite um orçamento',
                  admin: { width: '50%' },
                },
                {
                  name: 'hero_cta_primary_href',
                  type: 'text',
                  label: 'CTA primário — link',
                  defaultValue: '/diagnostico',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'hero_cta_secondary_label',
                  type: 'text',
                  label: 'CTA secundário — texto',
                  defaultValue: 'Diagnóstico de growth gratuito',
                  admin: { width: '50%' },
                },
                {
                  name: 'hero_cta_secondary_href',
                  type: 'text',
                  label: 'CTA secundário — link',
                  defaultValue: '/metodo',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'hero_video_url',
              type: 'text',
              label: 'URL do vídeo de fundo (mp4)',
              admin: {
                description: 'URL pública. Deixe vazio para usar o padrão Pexels.',
              },
            },
            {
              name: 'hero_image',
              type: 'upload',
              relationTo: 'media',
              label: 'Imagem de fallback / poster',
              admin: { description: 'Mostrada antes do vídeo carregar (1600x900 recomendado)' },
            },
          ],
        },

        // ── Stats ──────────────────────────────────────────────────
        {
          label: 'Stats (números do hero)',
          fields: [
            {
              name: 'stats',
              type: 'array',
              label: 'Estatísticas',
              maxRows: 6,
              labels: { singular: 'Stat', plural: 'Stats' },
              admin: {
                description: 'Números animados no rodapé do hero',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'prefix',
                      type: 'text',
                      label: 'Prefixo',
                      defaultValue: '+R$ ',
                      admin: { width: '25%', description: 'Ex: +R$ ' },
                    },
                    {
                      name: 'value',
                      type: 'number',
                      label: 'Valor',
                      required: true,
                      admin: { width: '25%', description: 'Número (animado)' },
                    },
                    {
                      name: 'suffix',
                      type: 'text',
                      label: 'Sufixo',
                      defaultValue: 'MM',
                      admin: { width: '25%', description: 'Ex: MM, k, %' },
                    },
                    {
                      name: 'label',
                      type: 'text',
                      label: 'Descrição',
                      required: true,
                      admin: { width: '25%' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'stats_extra_text',
              type: 'text',
              label: 'Texto extra no final',
              defaultValue: 'Parceiros RD Station, Meta, Kommo',
              admin: { description: 'Texto solto após os stats numéricos' },
            },
          ],
        },

        // ── Logos de clientes (apenas título; lista vive na collection Clients) ──
        {
          label: 'Logos de clientes',
          fields: [
            {
              name: 'client_logos_title',
              type: 'text',
              label: 'Título da seção',
              defaultValue: 'Empresas que confiam na Unfold',
              admin: {
                description:
                  'Para gerenciar a lista de empresas, use a collection "Empresas que confiam na Unfold" no menu lateral.',
              },
            },
          ],
        },

        // ── Seção Método (apresentação na home) ────────────────────
        {
          label: 'Seção Método',
          fields: [
            {
              name: 'method_title',
              type: 'textarea',
              label: 'Título da seção',
              defaultValue: 'Um sistema de crescimento, não mais uma série de ações isoladas.',
            },
            {
              name: 'method_description',
              type: 'textarea',
              label: 'Descrição',
              defaultValue:
                'O Unfold Growth System (UGS) conecta as quatro alavancas do crescimento — Diagnosticar, Estruturar, Operar e Evoluir — em uma operação integrada, previsível e orientada a resultado comercial.',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'method_cta_label',
                  type: 'text',
                  label: 'CTA — texto',
                  defaultValue: 'Conheça o método UGS',
                  admin: { width: '50%' },
                },
                {
                  name: 'method_cta_href',
                  type: 'text',
                  label: 'CTA — link',
                  defaultValue: '/metodo',
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },

        // ── CTA Final ──────────────────────────────────────────────
        {
          label: 'CTA Final',
          fields: [
            {
              name: 'final_cta_title',
              type: 'textarea',
              label: 'Título principal',
              defaultValue:
                'Você já tem marketing e vendas. Falta o sistema que conecta tudo.',
            },
            {
              name: 'final_cta_description',
              type: 'textarea',
              label: 'Descrição',
              defaultValue:
                'Solicite um diagnóstico gratuito. Em até 24h alguém da equipe entra em contato com uma análise inicial da sua operação de crescimento.',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'final_cta_button_label',
                  type: 'text',
                  label: 'Botão — texto',
                  defaultValue: 'Solicite um orçamento',
                  admin: { width: '50%' },
                },
                {
                  name: 'final_cta_button_href',
                  type: 'text',
                  label: 'Botão — link',
                  defaultValue: '/diagnostico',
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },

        // ── Soluções (home — "Para empresas que precisam") ─────────
        {
          label: 'Soluções',
          fields: [
            {
              name: 'solutions_eyebrow',
              type: 'text',
              label: 'Tagline pequena',
              defaultValue: 'Para empresas que precisam',
            },
            {
              name: 'solutions_title',
              type: 'textarea',
              label: 'Título da seção',
              defaultValue: 'Resolvemos os desafios que travam seu crescimento.',
            },
            {
              name: 'solutions',
              type: 'array',
              label: 'Cards de solução',
              maxRows: 12,
              labels: { singular: 'Solução', plural: 'Soluções' },
              admin: { description: 'Recomendado: 8 cards para grid 4×2' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'icon',
                      type: 'select',
                      label: 'Ícone',
                      options: ICON_SELECT_OPTIONS,
                      defaultValue: 'Target',
                      admin: { width: '30%' },
                    },
                    { name: 'title', type: 'text', label: 'Título', required: true, admin: { width: '70%' } },
                  ],
                },
                { name: 'desc', type: 'textarea', label: 'Descrição', required: true },
              ],
            },
          ],
        },

        // ── Serviços (home — "Como atuamos") ───────────────────────
        {
          label: 'Serviços',
          fields: [
            {
              name: 'services_eyebrow',
              type: 'text',
              label: 'Tagline pequena',
              defaultValue: 'Como atuamos',
            },
            {
              name: 'services_title',
              type: 'textarea',
              label: 'Título da seção',
              defaultValue: 'Crescimento como sistema, não como projeto.',
            },
            {
              name: 'services',
              type: 'array',
              label: 'Serviços',
              maxRows: 6,
              labels: { singular: 'Serviço', plural: 'Serviços' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'numero', type: 'text', label: 'Número', defaultValue: '01', admin: { width: '15%' } },
                    { name: 'title', type: 'text', label: 'Título', required: true, admin: { width: '85%' } },
                  ],
                },
                { name: 'desc', type: 'textarea', label: 'Descrição curta', required: true },
                {
                  name: 'bullets',
                  type: 'array',
                  label: 'Bullets / itens entregues',
                  maxRows: 8,
                  fields: [{ name: 'text', type: 'text', required: true }],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'cta_label',
                      type: 'text',
                      label: 'CTA — texto',
                      defaultValue: 'Ver mais',
                      admin: { width: '50%' },
                    },
                    {
                      name: 'cta_href',
                      type: 'text',
                      label: 'CTA — link',
                      defaultValue: '/atuacao',
                      admin: { width: '50%' },
                    },
                  ],
                },
              ],
            },
          ],
        },

        // ── Ferramentas (home — "Diagnósticos gratuitos") ──────────
        {
          label: 'Ferramentas',
          fields: [
            {
              name: 'tools_eyebrow',
              type: 'text',
              label: 'Tagline pequena',
              defaultValue: 'Ferramentas',
            },
            {
              name: 'tools_title',
              type: 'textarea',
              label: 'Título da seção',
              defaultValue: 'Diagnósticos gratuitos para destravar seu crescimento.',
            },
            {
              name: 'tools',
              type: 'array',
              label: 'Cards de ferramentas',
              maxRows: 6,
              labels: { singular: 'Ferramenta', plural: 'Ferramentas' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'icon',
                      type: 'select',
                      label: 'Ícone',
                      options: ICON_SELECT_OPTIONS,
                      defaultValue: 'Calculator',
                      admin: { width: '30%' },
                    },
                    { name: 'title', type: 'text', label: 'Título', required: true, admin: { width: '70%' } },
                  ],
                },
                { name: 'desc', type: 'textarea', label: 'Descrição', required: true },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'cta',
                      type: 'text',
                      label: 'CTA — texto',
                      defaultValue: 'Saiba mais',
                      admin: { width: '40%' },
                    },
                    {
                      name: 'href',
                      type: 'text',
                      label: 'CTA — link',
                      required: true,
                      admin: { width: '40%' },
                    },
                    {
                      name: 'ai',
                      type: 'checkbox',
                      label: 'AI Powered',
                      defaultValue: false,
                      admin: { width: '20%', description: 'Mostra badge "AI Powered"' },
                    },
                  ],
                },
              ],
            },
          ],
        },

        // ── Depoimentos (toggle global) ────────────────────────────
        {
          label: 'Depoimentos',
          fields: [
            {
              name: 'ocultar_depoimentos',
              type: 'checkbox',
              label: 'Ocultar seção de depoimentos no site',
              defaultValue: false,
              admin: {
                description:
                  'Marque para esconder completamente a seção de depoimentos da home. Útil enquanto você ainda não cadastrou depoimentos reais.',
              },
            },
            {
              name: 'testimonials_eyebrow',
              type: 'text',
              label: 'Tagline pequena',
              defaultValue: 'Depoimentos',
              admin: { description: 'Texto pequeno acima do título da seção' },
            },
            {
              name: 'testimonials_title',
              type: 'textarea',
              label: 'Título da seção',
              defaultValue: 'O que dizem os clientes que organizaram o crescimento com a Unfold.',
            },
          ],
        },

        // ── Logos de parceiros ─────────────────────────────────────
        {
          label: 'Parceiros',
          fields: [
            {
              name: 'partners_eyebrow',
              type: 'text',
              label: 'Pílula pequena (acima dos logos)',
              defaultValue: 'Parceiros e certificações',
            },
            {
              name: 'partners_title',
              type: 'text',
              label: 'Título da seção (não usado na home, fica para outras páginas)',
              defaultValue: 'Parceiros oficiais',
            },
            {
              name: 'partners_footer_text',
              type: 'textarea',
              label: 'Texto em itálico abaixo dos logos',
              defaultValue:
                'Não achou sua ferramenta ou tecnologia? Possuímos um setor interno de tecnologia pronto para se adaptar à realidade do seu negócio.',
            },
            {
              name: 'partner_logos',
              type: 'array',
              label: 'Parceiros',
              maxRows: 12,
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'name', type: 'text', label: 'Nome', required: true, admin: { width: '40%' } },
                    { name: 'logo', type: 'upload', relationTo: 'media', label: 'Logo', admin: { width: '40%' } },
                    { name: 'website', type: 'text', label: 'Site', admin: { width: '20%' } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

export default HomeSettings
