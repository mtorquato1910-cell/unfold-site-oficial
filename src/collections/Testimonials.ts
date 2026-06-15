import type { CollectionConfig } from 'payload'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: {
    singular: 'Depoimento',
    plural: 'Depoimentos',
  },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'empresa', 'destaque', 'ativo', 'ordem'],
    group: 'Conteúdo',
    description: 'Gerencie os depoimentos exibidos no site. Marque como "Destaque" para aparecer na home.',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'nome',
      type: 'text',
      required: true,
      label: 'Nome do cliente',
    },
    {
      name: 'cargo',
      type: 'text',
      label: 'Cargo',
      admin: { description: 'Ex: CEO, Diretor Comercial, Gerente de Marketing' },
    },
    {
      name: 'empresa',
      type: 'text',
      required: true,
      label: 'Empresa',
    },
    {
      name: 'depoimento',
      type: 'textarea',
      required: true,
      label: 'Depoimento',
      admin: { description: 'Texto do depoimento. Recomendado: 80–180 caracteres para melhor exibição.' },
    },
    {
      name: 'depoimento_html',
      type: 'textarea',
      label: 'Depoimento (formatado)',
      admin: {
        description: 'Versão com formatação básica (negrito/itálico/link) do editor. Quando preenchido, é usada no site.',
      },
    },
    {
      name: 'foto',
      type: 'upload',
      relationTo: 'media',
      label: 'Foto do cliente',
      admin: { description: 'Foto quadrada, 200x200px mínimo. Será exibida como avatar circular.' },
    },
    {
      name: 'logo_empresa',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo da empresa',
      admin: {
        description:
          'Logo da empresa do cliente. Aparece como segundo círculo ao lado da foto. Recomendado: 200x200px com fundo transparente.',
      },
    },
    {
      name: 'avaliacao',
      type: 'number',
      label: 'Avaliação (1–5 estrelas)',
      defaultValue: 5,
      min: 1,
      max: 5,
    },
    {
      name: 'vertical',
      type: 'select',
      label: 'Setor / Vertical',
      options: [
        { label: 'Construção Civil', value: 'construcao' },
        { label: 'Agronegócio', value: 'agro' },
        { label: 'Tecnologia', value: 'tech' },
        { label: 'Automotivo', value: 'automotivo' },
        { label: 'Indústrias', value: 'industrias' },
        { label: 'Serviços', value: 'servicos' },
        { label: 'Outro', value: 'outro' },
      ],
    },
    {
      name: 'destaque',
      type: 'checkbox',
      label: 'Exibir na Home',
      defaultValue: false,
      admin: { description: 'Marque para exibir este depoimento na seção de depoimentos da página inicial.' },
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

export default Testimonials
