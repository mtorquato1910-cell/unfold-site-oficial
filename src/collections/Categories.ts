import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'nome',
    group: 'Blog',
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
  ],
}

export default Categories
