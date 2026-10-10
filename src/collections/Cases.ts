import type { CollectionConfig } from 'payload'
import { computeContentUpdatedAt } from '../lib/content-date'

const Cases: CollectionConfig = {
  slug: 'cases',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'client', 'vertical', 'destacar_na_home', 'status'],
    description: 'Cases de sucesso da Unfold Growth',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
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
      name: 'imagem_destaque',
      type: 'upload',
      relationTo: 'media',
      label: 'Imagem de destaque',
      admin: {
        description: 'Imagem principal do case (usada no card e no topo da página)',
      },
    },
    {
      name: 'tagline',
      type: 'text',
      label: 'Tagline (frase de impacto)',
      admin: {
        description: 'Ex: Pipeline de R$6MM em vendas complexas B2B',
      },
    },
    // ── Publicação no padrão dos posts (S10 — épico seo-tecnico-2026-10) ──
    // Pedido do cliente (10/10/2026): publicar case "da mesma forma dos posts" —
    // texto corrido num editor só + resumo + campos de busca + FAQ.
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Resumo',
      admin: { description: 'Resumo do case (cards da listagem e da home; fallback do resumo de busca).' },
    },
    {
      name: 'conteudo_html',
      type: 'textarea',
      label: 'Conteúdo (HTML do editor)',
      admin: { description: 'Texto corrido do case, escrito no editor do painel. Fonte da página.' },
    },
    { name: 'meta_title', type: 'text', label: 'Título de busca (SEO)' },
    { name: 'meta_description', type: 'textarea', label: 'Resumo de busca (SEO)' },
    { name: 'faq', type: 'json', label: 'Perguntas frequentes (FAQ)' },
    {
      // Mesma regra dos posts (S01): só muda com título ou corpo; scripts usam
      // context.technicalEdit. Alimenta o lastmod do sitemap.
      name: 'content_updated_at',
      type: 'date',
      label: 'Conteúdo atualizado em',
      admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'highlights',
      type: 'array',
      label: 'Números do case',
      maxRows: 4,
      admin: {
        description: 'Até 4 números de destaque (ex.: "Leads" / "+180%") exibidos em cartões no case e na home.',
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
    // ── Campos ANTIGOS (antes da S10): ocultos; mantidos no banco até a migração para
    // `conteudo_html` ser validada. O site usa conteudo_html e cai neles só como fallback.
    {
      name: 'challenge',
      type: 'textarea',
      label: 'Desafio',
      admin: {
        description: 'Contexto e problema que o cliente enfrentava (texto puro / fallback)',
      },
    },
    {
      name: 'challenge_html',
      type: 'textarea',
      label: 'Desafio (rico)',
      admin: {
        description: 'Versão formatada do desafio (editor do painel). Quando preenchido, é usada no site.',
      },
    },
    {
      name: 'solution',
      type: 'textarea',
      label: 'Solução aplicada',
      admin: {
        description: 'Como a Unfold estruturou a solução (texto puro / fallback)',
      },
    },
    {
      name: 'solution_html',
      type: 'textarea',
      label: 'Solução (rico)',
      admin: {
        description: 'Versão formatada da solução (editor do painel). Quando preenchido, é usada no site.',
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
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        // Carimba published_at na primeira vez que o case vira "publicado".
        if (data?.status === 'publicado' && !data.published_at && !originalDoc?.published_at) {
          data.published_at = new Date().toISOString()
        }
        return data
      },
      // S10: data de atualização editorial, igual aos posts (roda após o published_at).
      ({ data, originalDoc, operation, req }) => {
        if (!data || (operation !== 'create' && operation !== 'update')) return data
        delete data.content_updated_at
        const next = computeContentUpdatedAt({
          operation,
          data,
          originalDoc,
          context: req?.context,
          titleField: 'title',
          htmlField: 'conteudo_html',
          publishedField: 'published_at',
        })
        if (next) data.content_updated_at = next
        return data
      },
    ],
  },
  timestamps: true,
}

export default Cases
