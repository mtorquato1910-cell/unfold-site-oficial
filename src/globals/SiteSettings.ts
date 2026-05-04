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
        {
          label: 'Identidade',
          fields: [
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
        {
          label: 'Contato',
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
              name: 'whatsapp',
              type: 'text',
              label: 'WhatsApp (com DDI)',
              admin: { description: 'Ex: +5511999999999' },
            },
            {
              name: 'linkedin',
              type: 'text',
              label: 'URL LinkedIn',
            },
            {
              name: 'instagram',
              type: 'text',
              label: 'URL Instagram',
            },
          ],
        },
        {
          label: 'Calendário',
          fields: [
            {
              name: 'calendar_embed_url',
              type: 'text',
              label: 'URL do calendário de agendamento',
              admin: { description: 'Exibido após o diagnóstico — substituir NEXT_PUBLIC_CALENDAR_EMBED_URL' },
            },
            {
              name: 'calendar_label',
              type: 'text',
              label: 'Texto do botão de agendamento',
              defaultValue: 'Agendar diagnóstico gratuito',
            },
          ],
        },
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
            },
            {
              name: 'endereco',
              type: 'textarea',
              label: 'Endereço',
            },
          ],
        },
      ],
    },
  ],
}

export default SiteSettings
