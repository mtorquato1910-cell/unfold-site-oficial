import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'categoria', 'status', 'publicado_em'],
    group: 'Blog',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'titulo', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'URL amigável — use apenas letras minúsculas, números e hífens' },
    },
    {
      name: 'resumo',
      type: 'textarea',
      required: true,
      admin: { description: 'Resumo para cards e meta description (max 160 chars)' },
    },
    {
      name: 'categoria',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
    },
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
    {
      name: 'imagem_destaque',
      type: 'upload',
      relationTo: 'media',
      label: 'Imagem de destaque',
      admin: { description: 'Imagem OG e card (1200x630 recomendado)' },
    },
    { name: 'conteudo', type: 'richText', required: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Rascunho', value: 'draft' },
        { label: 'Aguardando Revisão', value: 'pending_review' },
        { label: 'Publicado', value: 'published' },
      ],
      defaultValue: 'draft',
      admin: {
        description: 'Rascunho → Aguardando Revisão (enviado pelo autor) → Publicado (aprovado pelo admin)',
      },
    },
    { name: 'publicado_em', type: 'date' },
    { name: 'autor', type: 'text', defaultValue: 'Equipe Unfold Growth' },
    {
      name: 'tempo_leitura',
      type: 'number',
      min: 1,
      admin: { description: 'Tempo de leitura estimado em minutos' },
    },
    { name: 'tags', type: 'array', fields: [{ name: 'tag', type: 'text' }] },

    // ── Destaque na Home ──────────────────────────────────────────
    {
      name: 'destaque_home',
      type: 'checkbox',
      label: 'Exibir nos Insights da Home',
      defaultValue: false,
      index: true,
      admin: {
        description:
          'Marque para que este post apareça na seção "Insights" da página inicial. A home exibe até 6 posts marcados (ordenados pelo campo abaixo).',
      },
    },
    {
      name: 'ordem_home',
      type: 'number',
      label: 'Ordem na Home',
      defaultValue: 0,
      admin: {
        description: 'Número menor aparece primeiro. Usado apenas quando "Exibir nos Insights da Home" está marcado.',
      },
    },

    // ── Submissão externa (S8 Workflow Editorial) ─────────────────
    {
      name: 'isExternalSubmission',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: { description: 'Marcado quando o post veio do formulário público /blog/submit' },
    },
    {
      name: 'submittedByName',
      type: 'text',
      admin: { description: 'Nome do autor externo (apenas se isExternalSubmission=true)' },
    },
    {
      name: 'submittedByEmail',
      type: 'email',
      admin: { description: 'Email do autor externo' },
    },
    {
      name: 'submittedByCompany',
      type: 'text',
      admin: { description: 'Empresa do autor externo' },
    },
    {
      name: 'rejectionReason',
      type: 'textarea',
      admin: { description: 'Motivo da rejeição (se aplicável)' },
    },
    {
      name: 'reviewedBy',
      type: 'text',
      admin: { description: 'ID do admin que aprovou/rejeitou (Supabase user id)' },
    },
    {
      name: 'reviewedAt',
      type: 'date',
      admin: { description: 'Quando foi aprovado/rejeitado' },
    },
  ],
  timestamps: true,
}

export default Posts
