import type { GlobalConfig } from 'payload'

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
                  defaultValue: 'Solicite um Diagnóstico',
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
                  defaultValue: 'Conhecer o método',
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

        // ── Logos de clientes ──────────────────────────────────────
        {
          label: 'Logos de clientes',
          fields: [
            {
              name: 'client_logos_title',
              type: 'text',
              label: 'Título da seção',
              defaultValue: 'Empresas que confiam na Unfold',
            },
            {
              name: 'client_logos',
              type: 'array',
              label: 'Logos / nomes',
              maxRows: 24,
              labels: { singular: 'Cliente', plural: 'Clientes' },
              admin: {
                description: 'Pode usar nome (texto) ou imagem. Imagem tem prioridade.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'name',
                      type: 'text',
                      label: 'Nome do cliente',
                      required: true,
                      admin: { width: '40%' },
                    },
                    {
                      name: 'logo',
                      type: 'upload',
                      relationTo: 'media',
                      label: 'Logo (opcional)',
                      admin: { width: '40%' },
                    },
                    {
                      name: 'website',
                      type: 'text',
                      label: 'Site (opcional)',
                      admin: { width: '20%', description: 'URL completa' },
                    },
                  ],
                },
              ],
            },
          ],
        },

        // ── Seção Método (apresentação na home) ────────────────────
        {
          label: 'Seção Método',
          fields: [
            {
              name: 'method_eyebrow',
              type: 'text',
              label: 'Tagline pequena',
              defaultValue: 'Método Unfold',
            },
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
                  defaultValue: 'Solicite um Diagnóstico',
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

        // ── Logos de parceiros ─────────────────────────────────────
        {
          label: 'Parceiros',
          fields: [
            {
              name: 'partners_title',
              type: 'text',
              label: 'Título da seção de parceiros',
              defaultValue: 'Parceiros oficiais',
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
