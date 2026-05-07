import type { CollectionConfig } from 'payload'

export const Clients: CollectionConfig = {
  slug: 'clients',
  labels: {
    singular: 'Cliente',
    plural: 'Empresas que confiam na Unfold',
  },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'website', 'ativo', 'ordem'],
    group: 'Conteúdo',
    description:
      'Empresas exibidas na seção "Empresas que confiam na Unfold" da home. Use logo (recomendado) ou apenas o nome.',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'super-admin',
  },
  fields: [
    {
      name: 'nome',
      type: 'text',
      required: true,
      label: 'Nome do cliente',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo (opcional)',
      admin: {
        description: 'PNG/SVG com fundo transparente, ~200x80px. Se não houver logo, exibe o nome em texto.',
      },
    },
    {
      name: 'website',
      type: 'text',
      label: 'Site (opcional)',
      admin: { description: 'URL completa, ex: https://exemplo.com.br' },
    },
    {
      name: 'ativo',
      type: 'checkbox',
      label: 'Ativo',
      defaultValue: true,
      admin: { description: 'Desmarque para ocultar sem excluir.' },
    },
    {
      name: 'ordem',
      type: 'number',
      label: 'Ordem de exibição',
      defaultValue: 0,
      admin: { description: 'Número menor = aparece primeiro. Use 0, 1, 2…' },
    },
  ],
  timestamps: true,
}

export default Clients
