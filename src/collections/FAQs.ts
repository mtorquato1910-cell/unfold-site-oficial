import type { CollectionConfig } from 'payload'

export const FAQs: CollectionConfig = {
  slug: 'faqs',
  labels: { singular: 'FAQ', plural: 'FAQs' },
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'category', 'order', 'published'],
    group: 'Conteúdo',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'question', type: 'text', required: true, label: 'Pergunta' },
    { name: 'answer', type: 'richText', required: true, label: 'Resposta' },
    {
      name: 'category',
      type: 'select',
      label: 'Categoria',
      defaultValue: 'geral',
      options: [
        { label: 'Geral', value: 'geral' },
        { label: 'Diagnóstico', value: 'diagnostico' },
        { label: 'Método UGS', value: 'metodo' },
        { label: 'Cases', value: 'cases' },
        { label: 'Comercial', value: 'comercial' },
      ],
    },
    {
      name: 'order',
      type: 'number',
      label: 'Ordem',
      defaultValue: 0,
      admin: { description: 'Menor número aparece primeiro' },
    },
    {
      name: 'published',
      type: 'checkbox',
      label: 'Publicado no site',
      defaultValue: true,
      index: true,
    },
  ],
  timestamps: true,
}

export default FAQs
