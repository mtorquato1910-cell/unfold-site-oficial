import type { CollectionConfig } from 'payload'

/**
 * Banners internos — peças clicáveis exibidas dentro dos posts do blog para
 * levar o leitor às ferramentas/diagnóstico/cases (mantém o usuário no site).
 *
 * Gerenciados pela aba "Banners" do painel: imagem, texto, link e ordem.
 * Apenas banners com `ativo = true` aparecem no site.
 */
export const Banners: CollectionConfig = {
  slug: 'banners',
  labels: { singular: 'Banner', plural: 'Banners' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'tag', 'ativo', 'ordem'],
    group: 'Blog',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'titulo', type: 'text', required: true, label: 'Título' },
    {
      name: 'tag',
      type: 'text',
      label: 'Etiqueta (ex: Ferramenta, Diagnóstico, Case)',
      admin: { description: 'Texto pequeno exibido acima do título' },
    },
    {
      name: 'descricao',
      type: 'textarea',
      label: 'Descrição',
      admin: { description: 'Frase curta de apoio (opcional)' },
    },
    {
      name: 'cta_label',
      type: 'text',
      label: 'Texto do botão',
      defaultValue: 'Saiba mais',
    },
    {
      name: 'link',
      type: 'text',
      required: true,
      label: 'Link de destino',
      admin: { description: 'Ex: /diagnostico, /calculadora, /cases ou uma URL completa' },
    },
    {
      name: 'imagem',
      type: 'upload',
      relationTo: 'media',
      label: 'Imagem do banner',
      admin: { description: 'Imagem de fundo/ilustração do banner (recomendado 800x600)' },
    },
    {
      name: 'ativo',
      type: 'checkbox',
      label: 'Ativo',
      defaultValue: true,
      index: true,
      admin: { description: 'Somente banners ativos aparecem nos posts do blog' },
    },
    {
      name: 'ordem',
      type: 'number',
      label: 'Ordem',
      defaultValue: 0,
      admin: { description: 'Número menor aparece primeiro' },
    },
  ],
  timestamps: true,
}

export default Banners
