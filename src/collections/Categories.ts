import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'nome',
    group: 'Blog',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'nome', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    {
      name: 'pilar',
      type: 'select',
      options: [
        { label: 'Diagnosticar', value: 'diagnosticar' },
        { label: 'Estruturar', value: 'estruturar' },
        { label: 'Operar', value: 'operar' },
        { label: 'Evoluir', value: 'evoluir' },
        { label: 'Geral', value: 'geral' },
      ],
      defaultValue: 'geral',
    },
    { name: 'descricao', type: 'textarea' },
    // Página /blog/categoria/<slug> (relatório de SEO 06/11/2026 — Tarefa 3).
    {
      name: 'intro',
      type: 'textarea',
      admin: { description: 'Texto de abertura da página da categoria (preenchido por SEO).' },
    },
    {
      name: 'meta_description',
      type: 'textarea',
      label: 'Resumo de busca (SEO)',
      admin: { description: 'Vazio = usa o início da intro. Ideal até 155 caracteres.' },
    },
    {
      name: 'ordem',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Ordem nos filtros do blog (menor primeiro).' },
    },
  ],
}

export default Categories
