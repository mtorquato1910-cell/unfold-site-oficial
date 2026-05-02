import type { CollectionConfig } from 'payload'

const Cases: CollectionConfig = {
  slug: 'cases',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'client', 'vertical', 'destacar_na_home', 'status'],
    description: 'Cases de sucesso da Unfold Growth',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Título do case',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug (URL)',
      admin: {
        description: 'URL amigável. Ex: construtora-demo-pipeline-b2b',
      },
    },
    {
      name: 'client',
      type: 'text',
      required: true,
      label: 'Nome do cliente',
    },
    {
      name: 'vertical',
      type: 'select',
      required: true,
      label: 'Vertical',
      options: [
        { label: 'Construção Civil', value: 'construcao' },
        { label: 'Agronegócio', value: 'agro' },
        { label: 'B2B / SaaS', value: 'b2b-saas' },
        { label: 'Indústria', value: 'industria' },
        { label: 'Varejo', value: 'varejo' },
        { label: 'Serviços Profissionais', value: 'servicos' },
      ],
    },
    {
      name: 'tagline',
      type: 'text',
      label: 'Tagline (frase de impacto)',
      admin: {
        description: 'Ex: Pipeline de R$6MM em vendas complexas B2B',
      },
    },
    {
      name: 'highlights',
      type: 'array',
      label: 'Métricas destaque',
      maxRows: 4,
      admin: {
        description: 'Até 4 métricas exibidas em cards de destaque',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Rótulo',
        },
        {
          name: 'value',
          type: 'text',
          required: true,
          label: 'Valor',
        },
      ],
    },
    {
      name: 'challenge',
      type: 'textarea',
      label: 'Desafio',
      admin: {
        description: 'Contexto e problema que o cliente enfrentava',
      },
    },
    {
      name: 'solution',
      type: 'textarea',
      label: 'Solução aplicada',
      admin: {
        description: 'Como a Unfold estruturou a solução',
      },
    },
    {
      name: 'pillars',
      type: 'array',
      label: 'Pilares UGS aplicados',
      fields: [
        {
          name: 'pilar',
          type: 'select',
          required: true,
          label: 'Pilar',
          options: [
            { label: 'Diagnosticar', value: 'diagnosticar' },
            { label: 'Estruturar', value: 'estruturar' },
            { label: 'Operar', value: 'operar' },
          ],
        },
        {
          name: 'descricao',
          type: 'text',
          label: 'Descrição',
        },
        {
          name: 'acoes',
          type: 'array',
          label: 'Ações executadas',
          fields: [
            {
              name: 'acao',
              type: 'text',
              required: true,
              label: 'Ação',
            },
          ],
        },
      ],
    },
    {
      name: 'results',
      type: 'array',
      label: 'Resultados detalhados',
      fields: [
        {
          name: 'metrica',
          type: 'text',
          required: true,
          label: 'Métrica',
        },
        {
          name: 'valor',
          type: 'text',
          required: true,
          label: 'Valor alcançado',
        },
        {
          name: 'contexto',
          type: 'text',
          label: 'Contexto adicional',
        },
      ],
    },
    {
      name: 'destacar_na_home',
      type: 'checkbox',
      label: 'Destacar na Home',
      defaultValue: false,
      admin: {
        description: 'Exibe este case no bloco "Case em destaque" da Home',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'rascunho',
      label: 'Status',
      options: [
        { label: 'Rascunho', value: 'rascunho' },
        { label: 'Publicado', value: 'publicado' },
      ],
    },
    {
      name: 'published_at',
      type: 'date',
      label: 'Data de publicação',
    },
  ],
  timestamps: true,
}

export default Cases
