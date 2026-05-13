import type { GlobalConfig } from 'payload'

const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Configurações do Site',
  admin: {
    group: 'Configurações',
    description: 'Configurações globais do site Unfold Growth',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ── Identidade ────────────────────────────────────────────────
        {
          label: 'Identidade',
          fields: [
            {
              name: 'tagline',
              type: 'textarea',
              label: 'Tagline (descrição curta)',
              defaultValue: 'Assessoria de growth para empresas com vendas complexas.',
              admin: { description: 'Frase curta exibida no rodapé abaixo do logo' },
            },
            {
              name: 'cidade',
              type: 'text',
              label: 'Cidade & atuação',
              defaultValue: 'Maceió – AL · Brasil · Atuação nacional',
              admin: { description: 'Linha exibida no rodapé acima do email' },
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              label: 'Logo principal',
            },
            {
              name: 'logo_dark',
              type: 'upload',
              relationTo: 'media',
              label: 'Logo versão clara (fundo escuro)',
            },
            {
              name: 'favicon',
              type: 'upload',
              relationTo: 'media',
              label: 'Favicon (32x32 PNG)',
            },
            {
              name: 'og_image_padrao',
              type: 'upload',
              relationTo: 'media',
              label: 'Imagem OG padrão (1200x630)',
              admin: { description: 'Usada em páginas sem imagem própria' },
            },
          ],
        },

        // ── Contato & Redes Sociais ───────────────────────────────────
        {
          label: 'Contato & Redes Sociais',
          fields: [
            {
              name: 'email_contato',
              type: 'email',
              label: 'Email de contato visível',
              admin: { description: 'Exibido no site e links mailto:' },
            },
            {
              name: 'email_notificacoes',
              type: 'email',
              label: 'Email para notificações internas',
              admin: { description: 'Recebe cópias de leads, diagnósticos, etc.' },
            },
            {
              name: 'email_dpo',
              type: 'email',
              label: 'Email do DPO (LGPD)',
              admin: { description: 'Responsável pelo tratamento de dados pessoais' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'telefone',
                  type: 'text',
                  label: 'Telefone',
                  admin: { description: 'Ex: +55 (11) 99999-9999', width: '50%' },
                },
                {
                  name: 'whatsapp',
                  type: 'text',
                  label: 'WhatsApp (com DDI)',
                  admin: { description: 'Ex: +5511999999999', width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'linkedin',
                  type: 'text',
                  label: 'URL LinkedIn',
                  admin: { description: 'https://linkedin.com/company/unfold-growth', width: '50%' },
                },
                {
                  name: 'instagram',
                  type: 'text',
                  label: 'URL Instagram',
                  admin: { description: 'https://instagram.com/unfoldgrowth', width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'youtube',
                  type: 'text',
                  label: 'URL YouTube',
                  admin: { description: 'https://youtube.com/@unfoldgrowth', width: '33%' },
                },
                {
                  name: 'facebook',
                  type: 'text',
                  label: 'URL Facebook',
                  admin: { description: 'https://facebook.com/unfoldgrowth', width: '33%' },
                },
                {
                  name: 'twitter',
                  type: 'text',
                  label: 'URL Twitter / X',
                  admin: { description: 'https://x.com/unfoldgrowth', width: '34%' },
                },
              ],
            },
          ],
        },

        // ── Calendário ────────────────────────────────────────────────
        {
          label: 'Calendário',
          fields: [
            {
              name: 'calendar_embed_url',
              type: 'text',
              label: 'URL do calendário (genérico)',
              admin: { description: 'Calendário fallback. Diagnóstico v2 prefere as URLs por faixa abaixo.' },
            },
            {
              name: 'calendar_label',
              type: 'text',
              label: 'Texto do botão de agendamento',
              defaultValue: 'Agendar diagnóstico gratuito',
            },
            {
              type: 'collapsible',
              label: 'URLs Calendly por faixa de Fit (Diagnóstico v2)',
              admin: {
                description: 'URLs Calendly específicas usadas no CTA do resultado do diagnóstico. Preencher quando as URLs forem entregues.',
              },
              fields: [
                {
                  name: 'calendly_url_fit_alto',
                  type: 'text',
                  label: 'Fit Alto (slot 45 minutos)',
                  admin: { description: 'Ex: https://calendly.com/unfold/diagnostico-alto-fit' },
                },
                {
                  name: 'calendly_url_fit_medio',
                  type: 'text',
                  label: 'Fit Médio (slot 30 minutos)',
                  admin: { description: 'Ex: https://calendly.com/unfold/diagnostico-medio-fit' },
                },
                {
                  name: 'calendly_url_fit_baixo_desfit',
                  type: 'text',
                  label: 'Fit Baixo / Desfit (slot 20 minutos)',
                  admin: { description: 'URL única para Fit Baixo e Desfit.' },
                },
              ],
            },
          ],
        },

        // ── SEO ───────────────────────────────────────────────────────
        {
          label: 'SEO',
          fields: [
            {
              name: 'site_name',
              type: 'text',
              label: 'Nome do site',
              defaultValue: 'Unfold Growth',
            },
            {
              name: 'meta_descricao_padrao',
              type: 'textarea',
              label: 'Meta description padrão',
              admin: { description: 'Máximo 160 caracteres' },
            },
            {
              name: 'keywords_padrao',
              type: 'text',
              label: 'Keywords padrão',
            },
          ],
        },

        // ── Rodapé ────────────────────────────────────────────────────
        {
          label: 'Rodapé',
          fields: [
            {
              name: 'rodape_texto',
              type: 'textarea',
              label: 'Texto do rodapé',
            },
            {
              name: 'cnpj',
              type: 'text',
              label: 'CNPJ',
              admin: { description: 'Ex: 00.000.000/0001-00' },
            },
            {
              name: 'endereco',
              type: 'textarea',
              label: 'Endereço completo',
              admin: { description: 'Exibido no rodapé e páginas legais' },
            },
          ],
        },

        // ── Legal ─────────────────────────────────────────────────────
        {
          label: 'Legal',
          fields: [
            {
              name: 'politica_privacidade',
              type: 'richText',
              label: 'Política de Privacidade',
              admin: {
                description: 'Texto completo da Política de Privacidade. Usado na página /politica-privacidade.',
              },
            },
            {
              name: 'termos_de_uso',
              type: 'richText',
              label: 'Termos de Uso',
              admin: {
                description: 'Texto completo dos Termos de Uso. Usado na página /termos-de-uso.',
              },
            },
            {
              name: 'lgpd_aviso_cookies',
              type: 'textarea',
              label: 'Aviso de Cookies (banner)',
              defaultValue: 'Usamos cookies para melhorar sua experiência. Ao continuar, você concorda com nossa Política de Privacidade.',
              admin: { description: 'Texto exibido no banner de consentimento de cookies' },
            },
          ],
        },

        // ── Insights (Homepage) ───────────────────────────────────────
        {
          label: 'Insights (Homepage)',
          fields: [
            {
              name: 'insights_titulo',
              type: 'text',
              label: 'Título da seção Insights',
              defaultValue: 'Insights de crescimento',
              admin: { description: 'Título exibido acima dos artigos em destaque na home' },
            },
            {
              name: 'insights_subtitulo',
              type: 'textarea',
              label: 'Subtítulo da seção Insights',
              defaultValue: 'Diagnóstico, estrutura e operação — os três pilares do método UGS em forma de conhecimento aplicado.',
              admin: { description: 'Texto de apoio abaixo do título' },
            },
            {
              name: 'insights_cta_texto',
              type: 'text',
              label: 'Texto do CTA da seção',
              defaultValue: 'Ver todos os artigos',
              admin: { description: 'Texto do botão "Ver mais"' },
            },
            {
              name: 'insights_posts_destaque',
              type: 'relationship',
              relationTo: 'posts',
              hasMany: true,
              label: 'Posts em destaque na Home',
              admin: {
                description: 'Selecione até 3 posts para exibir na seção Insights da homepage. Se vazio, exibe os mais recentes.',
              },
            },
          ],
        },
      ],
    },
  ],
}

export default SiteSettings
